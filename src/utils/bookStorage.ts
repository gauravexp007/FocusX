import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { BookAnnotationStore, BookContentPage } from '../types';

// Wire local Vite-bundled PDF.js worker so PDF parsing works offline and in sandboxed previews
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const DB_NAME = 'focusx_reading_studio_v1';
const DB_VERSION = 1;
const STORE_BOOKS = 'uploaded_books';
const STORE_ANNOTATIONS = 'book_annotations';

export interface StoredUploadedBook {
  bookId: string;
  sourceType: 'pdf' | 'text' | 'markdown';
  fileName: string;
  totalPages: number;
  pdfBuffer?: ArrayBuffer;
  pages?: BookContentPage[];
  coverImageUrl?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'bookId' });
      }
      if (!db.objectStoreNames.contains(STORE_ANNOTATIONS)) {
        db.createObjectStore(STORE_ANNOTATIONS, { keyPath: 'bookId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUploadedBookData(record: StoredUploadedBook): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readwrite');
      tx.objectStore(STORE_BOOKS).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Graceful no-op if IndexedDB is restricted
  }
}

export async function loadUploadedBookData(bookId: string): Promise<StoredUploadedBook | null> {
  try {
    const db = await openDB();
    return await new Promise<StoredUploadedBook | null>((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readonly');
      const req = tx.objectStore(STORE_BOOKS).get(bookId);
      req.onsuccess = () => resolve((req.result as StoredUploadedBook) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveBookAnnotations(bookId: string, data: BookAnnotationStore): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ANNOTATIONS, 'readwrite');
      tx.objectStore(STORE_ANNOTATIONS).put({ bookId, data });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      window.localStorage.setItem(`focusx_annot_${bookId}`, JSON.stringify(data));
    } catch {
      // ignore quota
    }
  }
}

export async function loadBookAnnotations(bookId: string): Promise<BookAnnotationStore> {
  const empty: BookAnnotationStore = { pages: {}, bookmarks: {} };
  try {
    const db = await openDB();
    const rec = await new Promise<{ bookId: string; data: BookAnnotationStore } | null>((resolve, reject) => {
      const tx = db.transaction(STORE_ANNOTATIONS, 'readonly');
      const req = tx.objectStore(STORE_ANNOTATIONS).get(bookId);
      req.onsuccess = () => resolve((req.result as { bookId: string; data: BookAnnotationStore }) || null);
      req.onerror = () => reject(req.error);
    });
    if (rec?.data) return rec.data;
  } catch {
    // fallback below
  }
  try {
    const raw = window.localStorage.getItem(`focusx_annot_${bookId}`);
    if (raw) return JSON.parse(raw) as BookAnnotationStore;
  } catch {
    // ignore
  }
  return empty;
}

/**
 * Paginate raw text or markdown into well-proportioned reading pages.
 */
export function paginateTextIntoBookPages(rawText: string, bookTitle: string): BookContentPage[] {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .trim();

  const blocks = cleaned
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return [
      {
        pageNumber: 1,
        chapter: bookTitle,
        heading: 'Uploaded Document',
        paragraphs: ['This file was uploaded cleanly, though it contains no readable text paragraphs yet.'],
      },
    ];
  }

  const pages: BookContentPage[] = [];
  let currentParagraphs: string[] = [];
  let currentChars = 0;
  let currentChapter = bookTitle;
  let currentHeading: string | undefined = undefined;
  const TARGET_CHARS_PER_PAGE = 980;

  const flushPage = () => {
    if (currentParagraphs.length === 0 && !currentHeading) return;
    pages.push({
      pageNumber: pages.length + 1,
      chapter: currentChapter,
      heading: currentHeading,
      paragraphs: currentParagraphs,
    });
    currentParagraphs = [];
    currentChars = 0;
    currentHeading = undefined;
  };

  for (const block of blocks) {
    const isHeading =
      /^#{1,3}\s+/.test(block) ||
      (/^(chapter|part|section)\s+\d+/i.test(block) && block.length < 90);

    if (isHeading) {
      const cleanHeading = block.replace(/^#{1,3}\s+/, '').trim();
      if (currentParagraphs.length > 0) {
        flushPage();
      }
      currentChapter = cleanHeading;
      currentHeading = cleanHeading;
      continue;
    }

    // Split overly long single paragraphs gracefully
    const subChunks: string[] = [];
    if (block.length > 680) {
      const sentences = block.match(/[^.!?]+[.!?]+(\s|$)/g) || [block];
      let acc = '';
      for (const s of sentences) {
        if ((acc + s).length > 480 && acc.trim()) {
          subChunks.push(acc.trim());
          acc = s;
        } else {
          acc += s;
        }
      }
      if (acc.trim()) subChunks.push(acc.trim());
    } else {
      subChunks.push(block);
    }

    for (const chunk of subChunks) {
      if (currentChars + chunk.length > TARGET_CHARS_PER_PAGE && currentParagraphs.length >= 2) {
        flushPage();
      }
      currentParagraphs.push(chunk);
      currentChars += chunk.length;
    }
  }

  flushPage();
  return pages.length > 0 ? pages : [{ pageNumber: 1, chapter: bookTitle, paragraphs: [cleaned.slice(0, 900)] }];
}

export interface ParsedBookUploadResult {
  title: string;
  author: string;
  sourceType: 'pdf' | 'text' | 'markdown';
  fileName: string;
  totalPages: number;
  pdfBuffer?: ArrayBuffer;
  pages?: BookContentPage[];
  coverImageUrl?: string;
}

/**
 * Parse an uploaded PDF, TXT, Markdown, or HTML file into a FocusX readable book.
 */
export async function parseUploadedBookFile(file: File): Promise<ParsedBookUploadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const baseName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanTitle = baseName || 'Untitled Volume';

  if (ext === 'pdf' || file.type === 'application/pdf') {
    const buffer = await file.arrayBuffer();
    // Pass a copy to PDF.js because getDocument transfers/detaches the buffer to the worker
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const totalPages = Math.max(1, pdfDoc.numPages);

    let metaTitle = cleanTitle;
    let metaAuthor = 'Uploaded PDF';
    try {
      const meta = await pdfDoc.getMetadata();
      const info = meta?.info as Record<string, unknown> | undefined;
      if (info && typeof info.Title === 'string' && info.Title.trim().length > 2) {
        metaTitle = info.Title.trim();
      }
      if (info && typeof info.Author === 'string' && info.Author.trim().length > 1) {
        metaAuthor = info.Author.trim();
      }
    } catch {
      // keep fallback title/author
    }

    let coverImageUrl: string | undefined;
    try {
      const firstPage = await pdfDoc.getPage(1);
      const viewport = firstPage.getViewport({ scale: 0.72 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await firstPage.render({ canvasContext: ctx, viewport, canvas }).promise;
        coverImageUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch {
      coverImageUrl = undefined;
    }

    await pdfDoc.cleanup();

    return {
      title: metaTitle,
      author: metaAuthor,
      sourceType: 'pdf',
      fileName: file.name,
      totalPages,
      pdfBuffer: buffer,
      coverImageUrl,
    };
  }

  // Plain text, Markdown, or HTML
  const text = await file.text();
  const pages = paginateTextIntoBookPages(text, cleanTitle);
  const sourceType = ext === 'md' || ext === 'markdown' ? 'markdown' : 'text';

  return {
    title: cleanTitle,
    author: sourceType === 'markdown' ? 'Markdown Manuscript' : 'Uploaded Volume',
    sourceType,
    fileName: file.name,
    totalPages: pages.length,
    pages,
  };
}

/**
 * Render a specific page (1-indexed) of a loaded PDF document to a crisp data URL.
 */
export async function renderPdfPageToDataUrl(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 1.45
): Promise<string> {
  const clamped = Math.max(1, Math.min(pdfDoc.numPages, pageNumber));
  const page = await pdfDoc.getPage(clamped);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas.toDataURL('image/jpeg', 0.9);
}

export async function openPdfDocumentFromBuffer(buffer: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
  return await loadingTask.promise;
}

/**
 * Extract normalized (0..1) horizontal text line bounding boxes from a PDF page
 * so the straight-line text-only highlighter snaps strictly onto actual PDF text.
 */
export async function extractPdfPageTextLines(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
): Promise<Array<{ x: number; y: number; width: number; height: number }>> {
  try {
    const clamped = Math.max(1, Math.min(pdfDoc.numPages, pageNumber));
    const page = await pdfDoc.getPage(clamped);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const vw = viewport.width || 1;
    const vh = viewport.height || 1;

    interface RawBox {
      x: number;
      y: number;
      right: number;
      height: number;
    }

    const rawBoxes: RawBox[] = [];
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str || !item.str.trim()) continue;
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const fontHeight = Math.hypot(tx[2], tx[3]) || Math.abs(tx[0]) || 12;
      const x = Math.max(0, Math.min(1, tx[4] / vw));
      const y = Math.max(0, Math.min(1, (tx[5] - fontHeight * 0.88) / vh));
      const width = Math.max(0.005, Math.min(1 - x, (item.width || fontHeight * item.str.length * 0.45) / vw));
      const height = Math.max(0.012, Math.min(0.08, (fontHeight * 1.18) / vh));
      rawBoxes.push({ x, y, right: Math.min(1, x + width), height });
    }

    if (rawBoxes.length === 0) return [];

    // Group adjacent text items on the same horizontal visual baseline into crisp straight line boxes
    rawBoxes.sort((a, b) => (Math.abs(a.y - b.y) < 0.012 ? a.x - b.x : a.y - b.y));
    const lines: Array<{ x: number; y: number; width: number; height: number }> = [];
    let current: RawBox | null = null;

    for (const box of rawBoxes) {
      if (
        current &&
        Math.abs(box.y - current.y) < Math.max(0.014, current.height * 0.65) &&
        box.x - current.right < 0.08
      ) {
        current.x = Math.min(current.x, box.x);
        current.right = Math.max(current.right, box.right);
        current.y = Math.min(current.y, box.y);
        current.height = Math.max(current.height, box.height);
      } else {
        if (current) {
          lines.push({
            x: current.x,
            y: current.y,
            width: Math.max(0.01, current.right - current.x),
            height: current.height,
          });
        }
        current = { ...box };
      }
    }
    if (current) {
      lines.push({
        x: current.x,
        y: current.y,
        width: Math.max(0.01, current.right - current.x),
        height: current.height,
      });
    }

    return lines;
  } catch {
    return [];
  }
}

