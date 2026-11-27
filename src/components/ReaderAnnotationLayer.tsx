import React, { useMemo, useRef, useState } from 'react';
import {
  DrawingStroke,
  NormalizedPoint,
  PageAnnotationData,
  PdfTextLineBox,
  ReaderShape,
  ReaderSticker,
  ReaderTool,
  ShapeKind,
  StickerKind,
  TextHighlightRect,
} from '../types';
import { gsap, prefersReducedMotion } from '../utils/gsapMotion';

export const STICKER_CATALOG: Array<{
  kind: StickerKind;
  label: string;
  bg: string;
  accent: string;
  shortText: string;
}> = [
  { kind: 'star', label: 'Key Insight', bg: '#FEF3C7', accent: '#D97706', shortText: 'KEY' },
  { kind: 'aha', label: 'Aha Moment', bg: '#DCFCE7', accent: '#047857', shortText: 'AHA!' },
  { kind: 'exam', label: 'Exam Alert', bg: '#FFE4E6', accent: '#BE123C', shortText: 'EXAM' },
  { kind: 'brain', label: 'Deep Concept', bg: '#EDE9FE', accent: '#6D28D9', shortText: 'MIND' },
  { kind: 'flag', label: 'Revisit', bg: '#E0F2FE', accent: '#0369A1', shortText: 'FLAG' },
  { kind: 'question', label: 'Clarify', bg: '#FFEDD5', accent: '#C2410C', shortText: '???' },
  { kind: 'heart', label: 'Favorite Quote', bg: '#FCE7F3', accent: '#BE185D', shortText: 'LOVE' },
  { kind: 'fire', label: 'High Yield', bg: '#FEF2F2', accent: '#DC2626', shortText: 'HOT' },
  { kind: 'check', label: 'Mastered', bg: '#D1FAE5', accent: '#059669', shortText: 'DONE' },
  { kind: 'coffee', label: 'Break Spot', bg: '#F5F5F4', accent: '#78350F', shortText: 'PAUSE' },
  { kind: 'note', label: 'Sticky Note', bg: '#FEF9C3', accent: '#854D0E', shortText: 'NOTE' },
];

export const StickerGraphic: React.FC<{
  kind: StickerKind;
  text?: string;
  compact?: boolean;
}> = ({ kind, text, compact = false }) => {
  if (kind === 'note') {
    return (
      <div
        className={`${
          compact ? 'w-9 h-9 p-1 text-[8px]' : 'w-28 min-h-[72px] p-2.5 text-[11px]'
        } rounded-md bg-[#FEF08A] text-[#422006] shadow-md border border-[#FACC15]/80 flex flex-col justify-between leading-snug select-none`}
        style={{
          backgroundImage: 'linear-gradient(155deg, #FEF9C3 0%, #FEF08A 65%, #FDE047 100%)',
        }}
      >
        <div className="w-6 h-1 rounded-full bg-[#CA8A04]/40 mx-auto mb-1" />
        <span className="font-medium break-words">
          {compact ? 'Note' : text || 'Double-click to jot a note…'}
        </span>
      </div>
    );
  }

  const meta = STICKER_CATALOG.find((s) => s.kind === kind) || STICKER_CATALOG[0];
  const size = compact ? 'w-8 h-8' : 'w-14 h-14';

  return (
    <div
      className={`${size} rounded-xl shadow-md border-2 border-white flex flex-col items-center justify-center select-none`}
      style={{ backgroundColor: meta.bg, color: meta.accent }}
    >
      <svg
        viewBox="0 0 32 32"
        className={compact ? 'w-4 h-4' : 'w-7 h-7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === 'star' && (
          <polygon
            points="16,4 19.6,11.6 28,12.7 21.8,18.4 23.4,26.8 16,22.8 8.6,26.8 10.2,18.4 4,12.7 12.4,11.6"
            fill="currentColor"
            fillOpacity="0.22"
          />
        )}
        {kind === 'aha' && (
          <path
            d="M12 23h8M13 27h6M16 5a7 7 0 0 0-4.5 12.3c.9.8 1.5 1.8 1.5 2.7h6c0-.9.6-1.9 1.5-2.7A7 7 0 0 0 16 5Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
        )}
        {kind === 'exam' && (
          <>
            <path d="M16 4 28 25H4L16 4Z" fill="currentColor" fillOpacity="0.18" />
            <line x1="16" y1="12" x2="16" y2="18" />
            <circle cx="16" cy="21.5" r="1" fill="currentColor" />
          </>
        )}
        {kind === 'brain' && (
          <>
            <path d="M12 8a4 4 0 0 0-4 4 3.5 3.5 0 0 0 0 7 4 4 0 0 0 4 4h4V8h-4Z" fill="currentColor" fillOpacity="0.18" />
            <path d="M20 8a4 4 0 0 1 4 4 3.5 3.5 0 0 1 0 7 4 4 0 0 1-4 4h-4V8h4Z" fill="currentColor" fillOpacity="0.18" />
          </>
        )}
        {kind === 'flag' && (
          <>
            <line x1="8" y1="5" x2="8" y2="27" />
            <path d="M8 6h16l-3.5 5L24 16H8" fill="currentColor" fillOpacity="0.22" />
          </>
        )}
        {kind === 'question' && (
          <>
            <path d="M11.5 11.5a4.5 4.5 0 1 1 6.5 4c-1.4.8-2 1.8-2 3.2" />
            <circle cx="16" cy="23.5" r="1.2" fill="currentColor" />
          </>
        )}
        {kind === 'heart' && (
          <path
            d="M16 26s-9.5-5.8-9.5-12.6A5.4 5.4 0 0 1 16 9.8a5.4 5.4 0 0 1 9.5 3.6C25.5 20.2 16 26 16 26Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
        )}
        {kind === 'fire' && (
          <path
            d="M16 4c2.8 4.4 7 6.8 7 13a7 7 0 1 1-14 0c0-3 1.4-5.7 3.2-7.5.2 2 1.2 3.2 2.3 3.7C14.3 9.7 15 6.8 16 4Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
        )}
        {kind === 'check' && (
          <>
            <circle cx="16" cy="16" r="11" fill="currentColor" fillOpacity="0.18" />
            <path d="M11 16.5 14.5 20 21.5 12.5" />
          </>
        )}
        {kind === 'coffee' && (
          <>
            <path d="M7 13h14v7a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-7Z" fill="currentColor" fillOpacity="0.18" />
            <path d="M21 15h2.5a2.5 2.5 0 0 1 0 5H21" />
            <path d="M11 8.5c0-1.5 1.5-2 1.5-3.5M16 8.5c0-1.5 1.5-2 1.5-3.5" />
          </>
        )}
      </svg>
      {!compact && (
        <span className="text-[8.5px] font-bold tracking-wider leading-none mt-0.5">
          {meta.shortText}
        </span>
      )}
    </div>
  );
};

function pointsToSmoothSvgPath(points: NormalizedPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x * 1000} ${p.y * 1414} l 0.1 0.1`;
  }
  let d = `M ${points[0].x * 1000} ${points[0].y * 1414}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = ((points[i].x + points[i + 1].x) / 2) * 1000;
    const midY = ((points[i].y + points[i + 1].y) / 2) * 1414;
    d += ` Q ${points[i].x * 1000} ${points[i].y * 1414}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x * 1000} ${last.y * 1414}`;
  return d;
}

function buildStarPolygonPoints(cx: number, cy: number, rx: number, ry: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const factor = i % 2 === 0 ? 1 : 0.44;
    pts.push(`${cx + Math.cos(angle) * rx * factor},${cy + Math.sin(angle) * ry * factor}`);
  }
  return pts.join(' ');
}

function distToSegment(p: NormalizedPoint, a: NormalizedPoint, b: NormalizedPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * Inspect actual DOM text nodes inside `[data-book-text-scope]` on the page surface
 * and extract exact normalized (0..1) straight visual line boxes for every rendered line of text.
 */
function measureDomTextLineBoxes(layerEl: HTMLDivElement): PdfTextLineBox[] {
  const pageRoot = layerEl.parentElement;
  if (!pageRoot) return [];
  const textScope = pageRoot.querySelector<HTMLElement>('[data-book-text-scope]');
  if (!textScope) return [];

  const layerRect = layerEl.getBoundingClientRect();
  if (layerRect.width === 0 || layerRect.height === 0) return [];

  const boxes: PdfTextLineBox[] = [];
  const walker = document.createTreeWalker(textScope, NodeFilter.SHOW_TEXT);
  const range = document.createRange();

  let node = walker.nextNode();
  while (node) {
    if (node.textContent && node.textContent.trim().length > 0) {
      range.selectNodeContents(node);
      const clientRects = Array.from(range.getClientRects());
      for (const r of clientRects) {
        if (r.width < 3 || r.height < 4) continue;
        const x = (r.left - layerRect.left) / layerRect.width;
        const y = (r.top - layerRect.top) / layerRect.height;
        const width = r.width / layerRect.width;
        const height = r.height / layerRect.height;
        if (x + width < 0 || x > 1 || y + height < 0 || y > 1) continue;
        boxes.push({
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.min(1 - Math.max(0, x), width),
          height: Math.min(1 - Math.max(0, y), height),
        });
      }
    }
    node = walker.nextNode();
  }

  // Merge fragments that lie on the same horizontal text baseline into clean continuous lines
  boxes.sort((a, b) => (Math.abs(a.y - b.y) < 0.008 ? a.x - b.x : a.y - b.y));
  const merged: PdfTextLineBox[] = [];
  for (const b of boxes) {
    const prev = merged[merged.length - 1];
    if (prev && Math.abs(b.y - prev.y) < Math.max(0.009, prev.height * 0.45)) {
      const right = Math.max(prev.x + prev.width, b.x + b.width);
      prev.x = Math.min(prev.x, b.x);
      prev.width = right - prev.x;
      prev.y = Math.min(prev.y, b.y);
      prev.height = Math.max(prev.height, b.height);
    } else {
      merged.push({ ...b });
    }
  }
  return merged;
}

/**
 * Given drag start & end normalized points and the page's exact text line boxes,
 * compute strictly text-locked, razor-straight horizontal highlight rectangles.
 * Returns empty array if dragging across blank margin / non-text whitespace!
 */
function computeStraightTextHighlights(
  start: NormalizedPoint,
  end: NormalizedPoint,
  lineBoxes: PdfTextLineBox[],
  color: string,
  opacity: number
): TextHighlightRect[] {
  if (lineBoxes.length === 0) return [];

  // Find lines near start and end (small vertical tolerance of 0.45x line height)
  const findLineIndexAt = (pt: NormalizedPoint): number => {
    for (let i = 0; i < lineBoxes.length; i++) {
      const b = lineBoxes[i];
      const vPad = b.height * 0.35;
      if (
        pt.y >= b.y - vPad &&
        pt.y <= b.y + b.height + vPad &&
        pt.x >= b.x - 0.025 &&
        pt.x <= b.x + b.width + 0.025
      ) {
        return i;
      }
    }
    return -1;
  };

  const startIdx = findLineIndexAt(start);
  if (startIdx === -1) {
    // Pointer did not begin on text -> strictly ignore blank margins!
    return [];
  }

  // Find vertical target line closest to cursor Y (clamped to lines overlapping vertical drag)
  let endIdx = findLineIndexAt(end);
  if (endIdx === -1) {
    // Allow sweeping horizontally slightly past a line's end while staying locked to text rows
    let bestIdx = startIdx;
    let bestDist = Infinity;
    for (let i = 0; i < lineBoxes.length; i++) {
      const midY = lineBoxes[i].y + lineBoxes[i].height / 2;
      const d = Math.abs(end.y - midY);
      if (d < bestDist && d < lineBoxes[i].height * 1.4) {
        bestDist = d;
        bestIdx = i;
      }
    }
    endIdx = bestIdx;
  }

  const forward = endIdx > startIdx || (endIdx === startIdx && end.x >= start.x);
  const firstIdx = Math.min(startIdx, endIdx);
  const lastIdx = Math.max(startIdx, endIdx);
  const firstPt = forward ? start : end;
  const lastPt = forward ? end : start;

  const rects: TextHighlightRect[] = [];
  const baseId = `hlr-${Date.now()}`;

  for (let i = firstIdx; i <= lastIdx; i++) {
    const line = lineBoxes[i];
    const lineLeft = line.x;
    const lineRight = line.x + line.width;

    let segLeft = lineLeft;
    let segRight = lineRight;

    if (firstIdx === lastIdx) {
      segLeft = Math.max(lineLeft, Math.min(firstPt.x, lastPt.x));
      segRight = Math.min(lineRight, Math.max(firstPt.x, lastPt.x));
    } else if (i === firstIdx) {
      segLeft = Math.max(lineLeft, Math.min(lineRight, firstPt.x));
      segRight = lineRight;
    } else if (i === lastIdx) {
      segLeft = lineLeft;
      segRight = Math.max(lineLeft, Math.min(lineRight, lastPt.x));
    }

    const width = segRight - segLeft;
    if (width >= 0.008) {
      rects.push({
        id: `${baseId}-${i}`,
        x: segLeft,
        y: line.y + line.height * 0.06,
        width,
        height: line.height * 0.88,
        color,
        opacity,
      });
    }
  }

  return rects;
}

interface ReaderAnnotationLayerProps {
  pageNumber: number;
  annotations: PageAnnotationData;
  pdfTextLines?: PdfTextLineBox[];
  activeTool: ReaderTool;
  activeColor: string;
  strokeSize: number;
  activeShapeKind: ShapeKind;
  shapeFilled: boolean;
  activeStickerKind: StickerKind;
  isDarkPaper: boolean;
  interactive?: boolean;
  onUpdatePageAnnotations: (pageNumber: number, next: PageAnnotationData) => void;
}

export const ReaderAnnotationLayer: React.FC<ReaderAnnotationLayerProps> = ({
  pageNumber,
  annotations,
  pdfTextLines,
  activeTool,
  activeColor,
  strokeSize,
  activeShapeKind,
  shapeFilled,
  activeStickerKind,
  isDarkPaper,
  interactive = true,
  onUpdatePageAnnotations,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draftStroke, setDraftStroke] = useState<DrawingStroke | null>(null);
  const [draftHighlights, setDraftHighlights] = useState<TextHighlightRect[]>([]);
  const [draftShape, setDraftShape] = useState<ReaderShape | null>(null);
  const [editingStickerId, setEditingStickerId] = useState<string | null>(null);

  const highlightDragRef = useRef<{
    active: boolean;
    startPt: NormalizedPoint;
    lineBoxes: PdfTextLineBox[];
  } | null>(null);
  const draggingStickerRef = useRef<{ id: string; pointerId: number } | null>(null);
  const pointerDownRef = useRef(false);

  const filterId = useMemo(() => `pencil-grain-${pageNumber}`, [pageNumber]);

  const getNormalizedPoint = (e: React.PointerEvent): NormalizedPoint => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0.5, y: 0.5 };
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const eraseAtPoint = (pt: NormalizedPoint) => {
    const threshold = 0.032;
    let changed = false;

    const existingHighlights = annotations.highlights || [];
    const nextHighlights = existingHighlights.filter((h) => {
      const hit =
        pt.x >= h.x - 0.01 &&
        pt.x <= h.x + h.width + 0.01 &&
        pt.y >= h.y - 0.01 &&
        pt.y <= h.y + h.height + 0.01;
      if (hit) {
        changed = true;
        return false;
      }
      return true;
    });

    const nextStrokes = annotations.strokes.filter((s) => {
      for (let i = 0; i < s.points.length; i++) {
        const a = s.points[i];
        const b = s.points[Math.min(s.points.length - 1, i + 1)];
        if (distToSegment(pt, a, b) < threshold) {
          changed = true;
          return false;
        }
      }
      return true;
    });

    const nextShapes = annotations.shapes.filter((sh) => {
      const minX = Math.min(sh.x1, sh.x2) - threshold;
      const maxX = Math.max(sh.x1, sh.x2) + threshold;
      const minY = Math.min(sh.y1, sh.y2) - threshold;
      const maxY = Math.max(sh.y1, sh.y2) + threshold;
      const hit = pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
      if (hit) {
        changed = true;
        return false;
      }
      return true;
    });

    const nextStickers = annotations.stickers.filter((st) => {
      const hit = Math.hypot(pt.x - st.x, pt.y - st.y) < 0.065;
      if (hit) {
        changed = true;
        return false;
      }
      return true;
    });

    if (changed) {
      onUpdatePageAnnotations(pageNumber, {
        strokes: nextStrokes,
        highlights: nextHighlights,
        shapes: nextShapes,
        stickers: nextStickers,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || activeTool === 'flip') return;
    e.stopPropagation();
    const pt = getNormalizedPoint(e);

    if (activeTool === 'sticker') {
      const newSticker: ReaderSticker = {
        id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: activeStickerKind,
        x: Math.max(0.08, Math.min(0.92, pt.x)),
        y: Math.max(0.08, Math.min(0.92, pt.y)),
        scale: 1,
        rotation: activeStickerKind === 'note' ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 12,
        text: activeStickerKind === 'note' ? 'Key takeaway…' : undefined,
      };
      onUpdatePageAnnotations(pageNumber, {
        ...annotations,
        stickers: [...annotations.stickers, newSticker],
      });
      if (activeStickerKind === 'note') {
        setEditingStickerId(newSticker.id);
      }
      requestAnimationFrame(() => {
        const el = containerRef.current?.querySelector(`[data-sticker-id="${newSticker.id}"]`);
        if (el && !prefersReducedMotion()) {
          gsap.fromTo(
            el,
            { scale: 0.25, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.52, ease: 'back.out(2.4)' }
          );
        }
      });
      return;
    }

    pointerDownRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (activeTool === 'eraser') {
      eraseAtPoint(pt);
      return;
    }

    // STRAIGHT TEXT-ONLY HIGHLIGHTER: locks strictly to rendered text lines!
    if (activeTool === 'highlighter') {
      const lineBoxes =
        pdfTextLines && pdfTextLines.length > 0
          ? pdfTextLines
          : containerRef.current
            ? measureDomTextLineBoxes(containerRef.current)
            : [];

      highlightDragRef.current = {
        active: true,
        startPt: pt,
        lineBoxes,
      };
      setDraftHighlights([]);
      return;
    }

    if (activeTool === 'shape') {
      setDraftShape({
        id: `sh-${Date.now()}`,
        kind: activeShapeKind,
        color: activeColor,
        strokeWidth: Math.max(2.5, strokeSize * 1.4),
        filled: shapeFilled,
        x1: pt.x,
        y1: pt.y,
        x2: pt.x,
        y2: pt.y,
      });
      return;
    }

    // Pen or Graphite Pencil
    const isPencil = activeTool === 'pencil';
    setDraftStroke({
      id: `stk-${Date.now()}`,
      tool: activeTool,
      color: activeColor,
      width: isPencil ? Math.max(2.2, strokeSize * 1.1) : Math.max(2.6, strokeSize * 1.45),
      opacity: isPencil ? 0.74 : 0.96,
      points: [pt],
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;

    if (draggingStickerRef.current) {
      e.stopPropagation();
      const pt = getNormalizedPoint(e);
      const id = draggingStickerRef.current.id;
      onUpdatePageAnnotations(pageNumber, {
        ...annotations,
        stickers: annotations.stickers.map((s) =>
          s.id === id
            ? {
                ...s,
                x: Math.max(0.06, Math.min(0.94, pt.x)),
                y: Math.max(0.06, Math.min(0.94, pt.y)),
              }
            : s
        ),
      });
      return;
    }

    if (!pointerDownRef.current) return;
    e.stopPropagation();
    const pt = getNormalizedPoint(e);

    if (activeTool === 'eraser') {
      eraseAtPoint(pt);
      return;
    }

    if (highlightDragRef.current?.active) {
      const { startPt, lineBoxes } = highlightDragRef.current;
      const rects = computeStraightTextHighlights(
        startPt,
        pt,
        lineBoxes,
        activeColor,
        isDarkPaper ? 0.42 : 0.5
      );
      setDraftHighlights(rects);
      return;
    }

    if (draftShape) {
      setDraftShape((prev) => (prev ? { ...prev, x2: pt.x, y2: pt.y } : null));
      return;
    }

    if (draftStroke) {
      setDraftStroke((prev) => {
        if (!prev) return null;
        const last = prev.points[prev.points.length - 1];
        if (last && Math.hypot(pt.x - last.x, pt.y - last.y) < 0.004) return prev;
        return { ...prev, points: [...prev.points, pt] };
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingStickerRef.current) {
      draggingStickerRef.current = null;
      return;
    }
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (highlightDragRef.current?.active) {
      highlightDragRef.current = null;
      if (draftHighlights.length > 0) {
        onUpdatePageAnnotations(pageNumber, {
          ...annotations,
          highlights: [...(annotations.highlights || []), ...draftHighlights],
        });
      }
      setDraftHighlights([]);
      return;
    }

    if (draftShape) {
      const hasArea = Math.hypot(draftShape.x2 - draftShape.x1, draftShape.y2 - draftShape.y1) > 0.02;
      if (hasArea) {
        onUpdatePageAnnotations(pageNumber, {
          ...annotations,
          shapes: [...annotations.shapes, draftShape],
        });
      }
      setDraftShape(null);
      return;
    }

    if (draftStroke) {
      onUpdatePageAnnotations(pageNumber, {
        ...annotations,
        strokes: [...annotations.strokes, draftStroke],
      });
      setDraftStroke(null);
    }
  };

  const renderShape = (sh: ReaderShape, isDraft = false) => {
    const x1 = sh.x1 * 1000;
    const y1 = sh.y1 * 1414;
    const x2 = sh.x2 * 1000;
    const y2 = sh.y2 * 1414;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const fill = sh.filled ? sh.color : 'none';
    const fillOpacity = sh.filled ? 0.16 : 0;
    const dash = isDraft ? '10 6' : undefined;

    switch (sh.kind) {
      case 'rect':
        return (
          <rect
            key={sh.id}
            x={left}
            y={top}
            width={Math.max(4, w)}
            height={Math.max(4, h)}
            rx={14}
            stroke={sh.color}
            strokeWidth={sh.strokeWidth}
            strokeDasharray={dash}
            fill={fill}
            fillOpacity={fillOpacity}
          />
        );
      case 'ellipse':
        return (
          <ellipse
            key={sh.id}
            cx={left + w / 2}
            cy={top + h / 2}
            rx={Math.max(4, w / 2)}
            ry={Math.max(4, h / 2)}
            stroke={sh.color}
            strokeWidth={sh.strokeWidth}
            strokeDasharray={dash}
            fill={fill}
            fillOpacity={fillOpacity}
          />
        );
      case 'line':
        return (
          <line
            key={sh.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={sh.color}
            strokeWidth={sh.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={dash}
          />
        );
      case 'arrow': {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = Math.max(22, sh.strokeWidth * 4.5);
        const ax1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
        const ay1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
        const ax2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
        const ay2 = y2 - headLen * Math.sin(angle + Math.PI / 6);
        return (
          <g key={sh.id} stroke={sh.color} strokeWidth={sh.strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dash} />
            <polyline points={`${ax1},${ay1} ${x2},${y2} ${ax2},${ay2}`} />
          </g>
        );
      }
      case 'star':
        return (
          <polygon
            key={sh.id}
            points={buildStarPolygonPoints(left + w / 2, top + h / 2, Math.max(8, w / 2), Math.max(8, h / 2))}
            stroke={sh.color}
            strokeWidth={sh.strokeWidth}
            strokeLinejoin="round"
            strokeDasharray={dash}
            fill={fill}
            fillOpacity={fillOpacity}
          />
        );
      case 'callout': {
        const tailX = left + w * 0.22;
        const bodyH = Math.max(16, h * 0.82);
        const d = `M ${left + 16} ${top} H ${left + w - 16} Q ${left + w} ${top} ${left + w} ${top + 16} V ${top + bodyH - 16} Q ${left + w} ${top + bodyH} ${left + w - 16} ${top + bodyH} H ${tailX + 26} L ${tailX} ${top + h} L ${tailX + 4} ${top + bodyH} H ${left + 16} Q ${left} ${top + bodyH} ${left} ${top + bodyH - 16} V ${top + 16} Q ${left} ${top} ${left + 16} ${top} Z`;
        return (
          <path
            key={sh.id}
            d={d}
            stroke={sh.color}
            strokeWidth={sh.strokeWidth}
            strokeLinejoin="round"
            strokeDasharray={dash}
            fill={fill}
            fillOpacity={fillOpacity}
          />
        );
      }
    }
  };

  const allHighlights = [...(annotations.highlights || []), ...draftHighlights];
  const allStrokes = draftStroke ? [...annotations.strokes, draftStroke] : annotations.strokes;
  const allShapes = draftShape ? [...annotations.shapes, draftShape] : annotations.shapes;

  const cursorClass =
    !interactive || activeTool === 'flip'
      ? 'pointer-events-none'
      : activeTool === 'highlighter'
        ? 'cursor-text'
        : activeTool === 'eraser'
          ? 'cursor-cell'
          : activeTool === 'sticker'
            ? 'cursor-copy'
            : 'cursor-crosshair';

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: activeTool === 'flip' ? 'auto' : 'none' }}
      className={`absolute inset-0 z-20 ${cursorClass}`}
    >
      {/* Vector Highlights, Strokes & Shapes SVG (A4 1000 x 1414 coordinate space) */}
      <svg
        viewBox="0 0 1000 1414"
        preserveAspectRatio="none"
        className="w-full h-full pointer-events-none overflow-visible"
      >
        <defs>
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8" />
          </filter>
        </defs>

        {/* Straight Text-Locked Highlighter Bands */}
        <g style={{ mixBlendMode: isDarkPaper ? 'screen' : 'multiply' }}>
          {allHighlights.map((h) => (
            <rect
              key={h.id}
              x={h.x * 1000}
              y={h.y * 1414}
              width={h.width * 1000}
              height={h.height * 1414}
              rx={5}
              ry={5}
              fill={h.color}
              fillOpacity={h.opacity}
            />
          ))}
          {/* Backwards-compatible legacy highlighter strokes if any existed */}
          {allStrokes
            .filter((s) => s.tool === 'highlighter')
            .map((s) => (
              <path
                key={s.id}
                d={pointsToSmoothSvgPath(s.points)}
                stroke={s.color}
                strokeWidth={s.width}
                strokeOpacity={s.opacity}
                strokeLinecap="square"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
        </g>

        {/* Pen & Graphite Pencil strokes */}
        {allStrokes
          .filter((s) => s.tool !== 'highlighter')
          .map((s) => (
            <path
              key={s.id}
              d={pointsToSmoothSvgPath(s.points)}
              stroke={s.color}
              strokeWidth={s.width}
              strokeOpacity={s.opacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.tool === 'pencil' ? '1.5 0.6' : undefined}
              filter={s.tool === 'pencil' ? `url(#${filterId})` : undefined}
              fill="none"
            />
          ))}

        {/* Shapes */}
        {allShapes.map((sh) => renderShape(sh, sh.id === draftShape?.id))}
      </svg>

      {/* Placed Stickers & Sticky Notes */}
      {annotations.stickers.map((st) => (
        <div
          key={st.id}
          data-sticker-id={st.id}
          style={{
            left: `${st.x * 100}%`,
            top: `${st.y * 100}%`,
            transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale})`,
          }}
          onPointerDown={(e) => {
            if (!interactive) return;
            e.stopPropagation();
            if (activeTool === 'eraser') {
              onUpdatePageAnnotations(pageNumber, {
                ...annotations,
                stickers: annotations.stickers.filter((x) => x.id !== st.id),
              });
              return;
            }
            if (activeTool === 'flip' || activeTool === 'sticker') {
              draggingStickerRef.current = { id: st.id, pointerId: e.pointerId };
            }
          }}
          onDoubleClick={(e) => {
            if (!interactive || st.kind !== 'note') return;
            e.stopPropagation();
            setEditingStickerId(st.id);
          }}
          className={`group/sticker absolute z-30 ${
            interactive ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'
          }`}
        >
          {editingStickerId === st.id && st.kind === 'note' ? (
            <textarea
              autoFocus
              rows={3}
              value={st.text || ''}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                const val = e.target.value;
                onUpdatePageAnnotations(pageNumber, {
                  ...annotations,
                  stickers: annotations.stickers.map((x) => (x.id === st.id ? { ...x, text: val } : x)),
                });
              }}
              onBlur={() => setEditingStickerId(null)}
              className="w-32 rounded-md bg-[#FEF08A] text-[#422006] text-[11px] font-medium p-2 shadow-lg border-2 border-[#CA8A04] outline-none resize-none"
            />
          ) : (
            <StickerGraphic kind={st.kind} text={st.text} />
          )}

          {interactive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePageAnnotations(pageNumber, {
                  ...annotations,
                  stickers: annotations.stickers.filter((x) => x.id !== st.id),
                });
              }}
              aria-label="Remove sticker"
              className="opacity-0 group-hover/sticker:opacity-100 transition-opacity absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1F1A1E] text-white text-[10px] font-bold flex items-center justify-center shadow cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
