import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  FileUp,
  Headphones,
  Loader2,
  MessageSquareQuote,
  Play,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { BookHighlight, BookItem, BookShelf, RibbonColorId, UserPreferences } from '../types';
import { BookOpenRequest, InteractiveBookCover } from './InteractiveBookCover';
import { BookReaderModal } from './BookReaderModal';
import {
  AnimatedModal,
  FLOW_EASE,
  FLOW_SPRING,
  flowItem,
  SegmentedControl,
  staggerContainer,
} from './MotionPrimitives';
import {
  gsap,
  GsapMagneticButton,
  GsapSplitHeading,
  prefersReducedMotion,
} from '../utils/gsapMotion';
import { parseUploadedBookFile, saveUploadedBookData } from '../utils/bookStorage';

interface ReadingTrackerSectionProps {
  books: BookItem[];
  highlights: BookHighlight[];
  preferences: UserPreferences;
  globalSearch: string;
  streakDays: number;
  onLogPages: (bookId: string, delta: number) => void;
  onChangeShelf: (bookId: string, shelf: BookShelf) => void;
  onAddBook: (book: BookItem) => void;
  onSyncBookState: (
    bookId: string,
    patch: { currentPage: number; bookmarkedPages: number[]; ribbonColor?: RibbonColorId }
  ) => void;
  onAddHighlight: (hl: Omit<BookHighlight, 'id'>) => void;
  onStartReadingSession: (bookTitle: string) => void;
  onNotify: (msg: string) => void;
}

const SHELF_TABS: Array<{ id: BookShelf; label: string }> = [
  { id: 'reading', label: 'Currently Reading' },
  { id: 'want', label: 'Want to Read' },
  { id: 'finished', label: 'Finished' },
  { id: 'textbook', label: 'Academic Textbooks' },
];

const RIBBON_CYCLE: RibbonColorId[] = ['crimson', 'emerald', 'gold', 'royal', 'plum'];

function formatExactPct(value: number): string {
  const clamped = Math.max(0, Math.min(100, value));
  if (clamped === 0 || clamped === 100) return `${Math.round(clamped)}%`;
  const rounded = Number(clamped.toFixed(1));
  return `${rounded}%`;
}

function getAccurateReadingStats(book: BookItem) {
  const totalPages = Math.max(1, book.totalPages);
  const pagesRead = Math.max(0, Math.min(totalPages, book.currentPage || 0));
  const remaining = Math.max(0, totalPages - pagesRead);
  const readFrac = pagesRead / totalPages;
  const remFrac = remaining / totalPages;
  const readPct = readFrac * 100;
  const remPct = remFrac * 100;

  // Dynamic chapter progress derived directly from pagesRead so it never drifts or double-counts
  const chapterSize = Math.max(10, book.activeChapterPages || Math.ceil(totalPages / 12));
  const totalChapters = Math.max(1, Math.ceil(totalPages / chapterSize));
  const currentChapter =
    pagesRead === 0 ? 1 : Math.min(totalChapters, Math.floor((pagesRead - 1) / chapterSize) + 1);
  const chapterStart = (currentChapter - 1) * chapterSize;
  const chapterEnd = Math.min(totalPages, currentChapter * chapterSize);
  const chapterLen = Math.max(1, chapterEnd - chapterStart);
  const chapterPagesRead = Math.max(0, Math.min(chapterLen, pagesRead - chapterStart));

  return {
    totalPages,
    pagesRead,
    remaining,
    readFrac,
    remFrac,
    readPct,
    remPct,
    readPctLabel: formatExactPct(readPct),
    remPctLabel: formatExactPct(remPct),
    currentChapter,
    totalChapters,
    chapterPagesRead,
    chapterLen,
  };
}

const BookDonut: React.FC<{ book: BookItem }> = ({ book }) => {
  const [hoverInfo, setHoverInfo] = useState<{ val: string; lbl: string } | null>(null);
  const stats = getAccurateReadingStats(book);

  const r = 34;
  const c = 2 * Math.PI * r;
  const readLen = stats.readFrac * c;
  const remLen = Math.max(0, c - readLen);

  return (
    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-label={`${stats.readPctLabel} read`}>
        {/* Unread Remaining Track (exact remaining portion) */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#E5D9E1"
          strokeWidth="14"
          className="cursor-pointer dark:stroke-[#2D2638]"
          onMouseEnter={() => setHoverInfo({ val: `${stats.remaining}p`, lbl: `Left · ${stats.remPctLabel}` })}
          onMouseLeave={() => setHoverInfo(null)}
        />
        {/* Accurate Read Progress Arc — fills strictly from 0 up to pagesRead / totalPages */}
        {readLen > 0 && (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#065F46"
            strokeWidth="14"
            strokeLinecap={stats.readFrac >= 0.995 ? 'butt' : 'round'}
            strokeDasharray={`${readLen.toFixed(3)} ${remLen.toFixed(3)}`}
            strokeDashoffset={0}
            className="cursor-pointer transition-all duration-500 dark:stroke-[#34D399]"
            onMouseEnter={() => setHoverInfo({ val: `${stats.pagesRead}p`, lbl: `Read · ${stats.readPctLabel}` })}
            onMouseLeave={() => setHoverInfo(null)}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <span className="font-mono text-[13px] font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums leading-none">
          {hoverInfo ? hoverInfo.val : stats.readPctLabel}
        </span>
        <span className="text-[9.5px] text-[#8A7177] dark:text-[#9D8F99] mt-0.5 font-medium tabular-nums">
          {hoverInfo ? hoverInfo.lbl : `${stats.pagesRead}/${stats.totalPages}`}
        </span>
      </div>
    </div>
  );
};

export const ReadingTrackerSection: React.FC<ReadingTrackerSectionProps> = ({
  books,
  highlights,
  preferences,
  globalSearch,
  streakDays,
  onLogPages,
  onChangeShelf,
  onAddBook,
  onSyncBookState,
  onAddHighlight,
  onStartReadingSession,
  onNotify,
}) => {
  const [activeShelf, setActiveShelf] = useState<BookShelf>('reading');
  const [localSearch, setLocalSearch] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddHighlight, setShowAddHighlight] = useState(false);

  // Active Book Reader session (captures whether user clicked the cover or pulled/clicked the bookmark!)
  const [readerSession, setReaderSession] = useState<{
    bookId: string;
    mode: 'cover' | 'bookmark';
    originRect?: { left: number; top: number; width: number; height: number };
  } | null>(null);

  // Upload book state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const shelfListRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manual book form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Cognitive Science');
  const [newPages, setNewPages] = useState(320);
  const [newShelf, setNewShelf] = useState<BookShelf>('reading');

  // Highlight form state
  const [hlBook, setHlBook] = useState(books[0]?.title || 'Thinking, Fast and Slow');
  const [hlPage, setHlPage] = useState(120);
  const [hlQuote, setHlQuote] = useState('');

  const effectiveSearch = (localSearch || globalSearch).trim().toLowerCase();

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (b.shelf !== activeShelf) return false;
      if (
        effectiveSearch &&
        !b.title.toLowerCase().includes(effectiveSearch) &&
        !b.author.toLowerCase().includes(effectiveSearch) &&
        !b.category.toLowerCase().includes(effectiveSearch)
      ) {
        return false;
      }
      return true;
    });
  }, [books, activeShelf, effectiveSearch]);

  const readingBook = useMemo(
    () => (readerSession ? books.find((b) => b.id === readerSession.bookId) || null : null),
    [books, readerSession]
  );

  // GSAP.com-style kinetic staggered shelf entrance when shelf or search updates
  useEffect(() => {
    const container = shelfListRef.current;
    if (!container || prefersReducedMotion()) return;
    const cards = container.querySelectorAll<HTMLElement>('.gsap-book-card');
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 26, scale: 0.975 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.56,
          stagger: 0.065,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    }, shelfListRef);

    return () => ctx.revert();
  }, [activeShelf, effectiveSearch, filteredBooks.length]);

  const finishedCount = books.filter((b) => b.shelf === 'finished').length + 16;
  const goalPct = Math.min(100, Math.round((finishedCount / preferences.readingGoalBooks) * 100));

  const processBookFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!['pdf', 'txt', 'md', 'markdown', 'html', 'htm'].includes(ext)) {
        setUploadError('Please upload a PDF, TXT, Markdown (.md), or HTML book file.');
        return;
      }

      setIsUploading(true);
      try {
        const parsed = await parseUploadedBookFile(file);
        const bookId = `book-upload-${Date.now()}`;
        const variants: BookItem['coverVariant'][] = [
          'kahneman',
          'kleppmann',
          'newport',
          'neuro',
          'algorithms',
          'macro',
          'atomic',
          'design',
        ];

        await saveUploadedBookData({
          bookId,
          sourceType: parsed.sourceType,
          fileName: parsed.fileName,
          totalPages: parsed.totalPages,
          pdfBuffer: parsed.pdfBuffer,
          pages: parsed.pages,
          coverImageUrl: parsed.coverImageUrl,
        });

        const newBook: BookItem = {
          id: bookId,
          title: parsed.title,
          author: parsed.author,
          category: parsed.sourceType === 'pdf' ? 'Uploaded PDF' : 'Uploaded Volume',
          shelf: 'reading',
          currentPage: 1,
          totalPages: parsed.totalPages,
          activeChapterPages: Math.min(25, parsed.totalPages),
          coverVariant: variants[books.length % variants.length],
          lastRead: 'Just uploaded',
          sourceType: parsed.sourceType,
          fileName: parsed.fileName,
          coverImageUrl: parsed.coverImageUrl,
          ribbonColor: RIBBON_CYCLE[books.length % RIBBON_CYCLE.length],
          bookmarkedPages: [1],
        };

        onAddBook(newBook);
        setActiveShelf('reading');
        setShowAddBookModal(false);
        onNotify(`Uploaded "${newBook.title}" (${parsed.totalPages} pages) — opening reader.`);
        setReaderSession({ bookId, mode: 'cover' });
      } catch {
        setUploadError('Could not read that file. Please try another PDF, TXT, or Markdown file.');
      } finally {
        setIsUploading(false);
      }
    },
    [books.length, onAddBook, onNotify]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBookFile(file);
    }
    e.target.value = '';
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBookFile(file);
    }
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const variants: BookItem['coverVariant'][] = [
      'kahneman',
      'kleppmann',
      'newport',
      'neuro',
      'algorithms',
      'macro',
      'atomic',
      'design',
    ];
    const newBook: BookItem = {
      id: `book-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Academic Press',
      category: newCategory.trim() || 'General',
      shelf: newShelf,
      currentPage: newShelf === 'finished' ? newPages : 1,
      totalPages: Math.max(20, newPages),
      activeChapterPages: 30,
      coverVariant: variants[books.length % variants.length],
      lastRead: 'Just added',
      sourceType: 'builtin',
      ribbonColor: RIBBON_CYCLE[books.length % RIBBON_CYCLE.length],
    };
    onAddBook(newBook);
    setActiveShelf(newShelf);
    setNewTitle('');
    setNewAuthor('');
    setShowAddBookModal(false);
  };

  const handleCreateHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hlQuote.trim()) return;
    onAddHighlight({
      bookTitle: hlBook,
      page: hlPage,
      quote: hlQuote.trim(),
      createdAt: 'Just now',
    });
    setHlQuote('');
    setShowAddHighlight(false);
  };

  const calendarDays = [
    { d: 10, level: 0 }, { d: 11, level: 0 }, { d: 12, level: 1 }, { d: 13, level: 2 },
    { d: 14, level: 3 }, { d: 15, level: 2 }, { d: 16, level: 1 }, { d: 17, level: 2 },
    { d: 18, level: 3 }, { d: 19, level: 3 }, { d: 20, level: 2 }, { d: 21, level: 3 },
    { d: 22, level: 2 }, { d: 23, level: 3, today: true },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Hidden Global Book File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.markdown,.html,.htm,application/pdf,text/plain,text/markdown"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* GSAP Kinetic Header */}
      <motion.div variants={flowItem} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <GsapSplitHeading
            as="h1"
            text="Reading Studio"
            highlightLastWord
            className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]"
          />
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1 tabular-nums">
            Personal digital bookshelf · {finishedCount} of {preferences.readingGoalBooks} annual reading goal ({goalPct}%)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <GsapMagneticButton
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 bg-[#006948] hover:bg-[#05825A] text-white dark:bg-[#58CD9B] dark:hover:bg-[#6EE7B7] dark:text-[#072116] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-60"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? 'Parsing Book…' : 'Upload Book (PDF / TXT)'}
          </GsapMagneticButton>

          <GsapMagneticButton
            type="button"
            onClick={() => setShowAddBookModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Manually
          </GsapMagneticButton>
        </div>
      </motion.div>

      {/* Drag & Drop Book Upload Strip + Ribbon Tip */}
      <motion.div
        variants={flowItem}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={handleDropFile}
        className={`rounded-2xl border-2 border-dashed px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
          isDraggingFile
            ? 'border-[#006948] bg-[#D1FAE5]/35 dark:border-[#6EE7B7] dark:bg-[#133A2E]/45'
            : 'border-[#E6D7DF] dark:border-[#342D3E] bg-white/70 dark:bg-[#1B1722]/70'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FCF1F6] dark:bg-[#262030] border border-[#EAE0E5] dark:border-[#362E42] flex items-center justify-center shrink-0 text-[#A3265B] dark:text-[#FFB1C6]">
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Drop a PDF, TXT, or Markdown book here to read with 3D page-turning & annotation tools
            </p>
            <p className="text-[11px] text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
              Pull or click the silk bookmark hanging from any cover preview below to resume from your exact last page read.
            </p>
            {uploadError && (
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1">{uploadError}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F3E7EE] hover:bg-[#EAE0E5] text-[#1F1A1E] dark:bg-[#2B2534] dark:hover:bg-[#362E42] dark:text-[#F5EFF3] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Browse Files
        </button>
      </motion.div>

      {/* Shelf Filter + Search Card */}
      <motion.div variants={flowItem} className="fx-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3.5 py-2 focus-within:border-[#A3265B] transition-colors">
          <Search className="w-4 h-4 text-[#8A7177] mr-2 shrink-0" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter current shelf by title, author, or field..."
            className="w-full bg-transparent text-xs text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] outline-none"
          />
        </div>

        <SegmentedControl
          layoutId="reading-shelf-tabs"
          variant="rose"
          size="md"
          value={activeShelf}
          onChange={setActiveShelf}
          options={SHELF_TABS.map((t) => ({
            id: t.id,
            label: t.label,
            count: books.filter((b) => b.shelf === t.id).length,
          }))}
        />
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={flowItem} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Book Cards */}
        <div ref={shelfListRef} className="lg:col-span-8 flex flex-col gap-5">
          {filteredBooks.length === 0 ? (
            <div className="fx-card rounded-2xl p-10 text-center flex flex-col items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#8A7177]" />
              <p className="font-display text-base font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
                No books on this shelf yet
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#006948] text-white dark:bg-[#58CD9B] dark:text-[#072116] cursor-pointer"
                >
                  Upload PDF / TXT
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
                >
                  Add a Volume
                </button>
              </div>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const stats = getAccurateReadingStats(book);
              const bmCount = book.bookmarkedPages?.length || 0;

              return (
                <article
                  key={book.id}
                  className="gsap-book-card group fx-card rounded-2xl p-5 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:border-[#006948]/40 dark:hover:border-[#6EE7B7]/35 transition-colors"
                >
                  {/* Hardcover Preview with Hanging Pullable Silk Bookmark Ribbon */}
                  <InteractiveBookCover
                    book={book}
                    onOpenBook={(req: BookOpenRequest) =>
                      setReaderSession({
                        bookId: req.book.id,
                        mode: req.mode,
                        originRect: req.originRect,
                      })
                    }
                    className="w-24 h-36 sm:w-28 sm:h-40"
                  />

                  <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] tabular-nums">
                          {book.category}
                          {book.sourceType && book.sourceType !== 'builtin' ? ` · ${book.sourceType.toUpperCase()}` : ''}
                          {bmCount > 0 ? ` · ${bmCount} bookmark${bmCount > 1 ? 's' : ''}` : ''}
                          {' · '}Last read {book.lastRead}
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5 truncate">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#574146] dark:text-[#B5A8B2]">{book.author}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#006948] dark:text-[#6EE7B7] tabular-nums shrink-0">
                        {stats.readPctLabel} read
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FCF1F6] dark:bg-[#231E2B] rounded-xl p-3.5">
                      <BookDonut book={book} />
                      <div className="flex flex-col gap-1.5 flex-1 text-xs tabular-nums">
                        <div className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] font-mono">
                          {stats.pagesRead} / {stats.totalPages} pages read
                        </div>
                        <div className="flex items-center gap-2 text-[#574146] dark:text-[#B5A8B2]">
                          <span className="w-2 h-2 rounded-full bg-[#065F46] dark:bg-[#34D399]" />
                          <span>
                            Read so far · {stats.pagesRead} pgs ({stats.readPctLabel})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#574146] dark:text-[#B5A8B2]">
                          <span className="w-2 h-2 rounded-full bg-[#E5D9E1] dark:bg-[#493E59]" />
                          <span>
                            Remaining · {stats.remaining} pgs left ({stats.remPctLabel})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#8A7177] dark:text-[#9D8F99] text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-[#10B981]/60" />
                          <span>
                            Ch. {stats.currentChapter}/{stats.totalChapters} · {stats.chapterPagesRead}/{stats.chapterLen} pgs read
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <GsapMagneticButton
                          type="button"
                          strength={0.2}
                          onClick={(e) => {
                            const coverEl = document.querySelector<HTMLElement>(`[data-book-cover-id="${book.id}"]`);
                            const rect = (coverEl || e.currentTarget).getBoundingClientRect();
                            setReaderSession({
                              bookId: book.id,
                              mode: 'cover',
                              originRect: {
                                left: rect.left,
                                top: rect.top,
                                width: rect.width,
                                height: rect.height,
                              },
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#006948] hover:bg-[#05825A] text-white dark:bg-[#58CD9B] dark:hover:bg-[#6EE7B7] dark:text-[#072116] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Open p.{Math.max(1, stats.pagesRead)}
                        </GsapMagneticButton>

                        {book.shelf !== 'finished' && (
                          <>
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.94 }}
                              onClick={() => onLogPages(book.id, 10)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F3E7EE] hover:bg-[#EAE0E5] text-[#1F1A1E] dark:bg-[#2B2534] dark:hover:bg-[#362E42] dark:text-[#F5EFF3] transition-colors cursor-pointer whitespace-nowrap"
                            >
                              +10 Pages
                            </motion.button>
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.94 }}
                              onClick={() => onLogPages(book.id, 25)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] transition-colors cursor-pointer whitespace-nowrap"
                            >
                              +25 Pages
                            </motion.button>
                          </>
                        )}

                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onStartReadingSession(book.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] hover:bg-[#D1FAE5]/40 dark:hover:bg-[#133A2E] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Read Focus
                        </motion.button>
                      </div>

                      <select
                        value={book.shelf}
                        onChange={(e) => onChangeShelf(book.id, e.target.value as BookShelf)}
                        aria-label="Move book to shelf"
                        className="bg-transparent border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-2.5 py-1 text-xs text-[#574146] dark:text-[#C4B7C1] outline-none cursor-pointer"
                      >
                        <option value="reading" className="bg-white dark:bg-[#1B1722]">Currently Reading</option>
                        <option value="want" className="bg-white dark:bg-[#1B1722]">Want to Read</option>
                        <option value="finished" className="bg-white dark:bg-[#1B1722]">Finished</option>
                        <option value="textbook" className="bg-white dark:bg-[#1B1722]">Textbook</option>
                      </select>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          {/* Reading Streak Calendar */}
          <section className="fx-card rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Reading Streak
              </h2>
              <span className="text-xs font-semibold text-[#B45309] dark:text-[#FCD34D] tabular-nums">
                {streakDays} days active
              </span>
            </div>
            <div className="text-xs text-[#8A7177] dark:text-[#9D8F99]">November 2026</div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-mono tabular-nums">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={`${d}-${i}`} className="text-[#8A7177] font-semibold pb-1">
                  {d}
                </span>
              ))}
              {calendarDays.map((item) => (
                <motion.span
                  key={item.d}
                  whileHover={{ scale: 1.12 }}
                  transition={FLOW_SPRING}
                  className={`py-1.5 rounded-lg font-semibold ${
                    item.level === 3
                      ? 'bg-[#006948] text-white dark:bg-[#58CD9B] dark:text-[#072116]'
                      : item.level === 2
                        ? 'bg-[#85F8C3]/75 text-[#003724] dark:bg-[#1C4D3B] dark:text-[#A7F3D0]'
                        : item.level === 1
                          ? 'bg-[#D1FAE5]/70 text-[#065F46] dark:bg-[#14332A] dark:text-[#6EE7B7]'
                          : 'text-[#8A7177] opacity-50'
                  } ${item.today ? 'ring-2 ring-[#F56498] ring-offset-1 dark:ring-offset-[#1B1722]' : ''}`}
                >
                  {item.d}
                </motion.span>
              ))}
            </div>
          </section>

          {/* Recent Highlights */}
          <section className="fx-card rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3] flex items-center gap-1.5">
                <MessageSquareQuote className="w-4 h-4 text-[#A3265B] dark:text-[#FFB1C6]" />
                Recent Highlights
              </h2>
              <button
                type="button"
                onClick={() => setShowAddHighlight((s) => !s)}
                className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer"
              >
                {showAddHighlight ? 'Cancel' : '+ Add'}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showAddHighlight && (
                <motion.form
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: FLOW_EASE }}
                  onSubmit={handleCreateHighlight}
                  className="bg-[#FCF1F6] dark:bg-[#231E2B] rounded-xl p-3 flex flex-col gap-2.5"
                >
                  <div className="flex gap-2">
                    <select
                      value={hlBook}
                      onChange={(e) => setHlBook(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-2 py-1.5 text-xs outline-none"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.title}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={hlPage}
                      onChange={(e) => setHlPage(Number(e.target.value))}
                      className="w-20 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-2 py-1.5 text-xs font-mono outline-none"
                      placeholder="Pg"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={hlQuote}
                    onChange={(e) => setHlQuote(e.target.value)}
                    placeholder="Paste a passage or key takeaway..."
                    className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-2.5 py-1.5 text-xs outline-none resize-none"
                  />
                  <button
                    type="submit"
                    className="self-end px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#006948] text-white dark:bg-[#58CD9B] dark:text-[#072116] cursor-pointer"
                  >
                    Save Highlight
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2.5">
              {highlights.map((hl) => (
                <div
                  key={hl.id}
                  className="p-3 rounded-xl bg-[#FCF1F6] dark:bg-[#231E2B] flex flex-col gap-1"
                >
                  <div className="text-[11px] text-[#8A7177] dark:text-[#9D8F99] font-medium">
                    {hl.bookTitle} · p. {hl.page}
                  </div>
                  <p className="text-xs text-[#1F1A1E] dark:text-[#F5EFF3] italic leading-relaxed">
                    “{hl.quote}”
                  </p>
                  {hl.note && (
                    <p className="text-[11px] text-[#006948] dark:text-[#6EE7B7] mt-0.5">{hl.note}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Evening Reading Launcher */}
          <section className="fx-surface-tinted rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-[#8A7177] dark:text-[#9D8F99]">
              <span className="font-semibold">Scheduled Reading</span>
              <span className="font-mono">20:00 – 21:00</span>
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Evening Deep Reading
              </h3>
              <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-0.5">
                {books[1]?.title || 'Designing Data-Intensive Applications'} · Ch. 4
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#342D3E] px-3 py-2 rounded-xl text-xs text-[#1F1A1E] dark:text-[#F5EFF3]">
              <Headphones className="w-4 h-4 text-[#006948] dark:text-[#6EE7B7]" />
              <span>40Hz Ambient Focus Ready</span>
            </div>
            <GsapMagneticButton
              type="button"
              onClick={() => onStartReadingSession(books[1]?.title || 'Evening Reading')}
              className="w-full py-2.5 rounded-xl bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Reading Focus Session
            </GsapMagneticButton>
          </section>
        </aside>
      </motion.div>

      {/* Animated Add Book Modal (with Quick File Upload option) */}
      <AnimatedModal open={showAddBookModal} onClose={() => setShowAddBookModal(false)} maxWidthClass="max-w-md">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Add Book to Bookshelf
            </h2>
            <button
              type="button"
              onClick={() => setShowAddBookModal(false)}
              className="p-1.5 rounded-lg text-[#8A7177] hover:bg-[#F3E7EE] dark:hover:bg-[#2A2432] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct File Upload Option inside Modal */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3.5 rounded-xl border border-dashed border-[#006948]/45 dark:border-[#6EE7B7]/40 bg-[#D1FAE5]/25 dark:bg-[#133A2E]/30 hover:bg-[#D1FAE5]/40 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Or Upload a PDF, TXT, or Markdown Book File
          </button>

          <form onSubmit={handleCreateBook} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">Book Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., The Structure of Scientific Revolutions"
                className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none focus:border-[#A3265B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">Author</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Thomas S. Kuhn"
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none focus:border-[#A3265B]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">Total Pages</label>
                <input
                  type="number"
                  min={20}
                  max={2500}
                  value={newPages}
                  onChange={(e) => setNewPages(Number(e.target.value))}
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2 text-sm font-mono text-[#1F1A1E] dark:text-[#F5EFF3] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">Field</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">Shelf</label>
                <select
                  value={newShelf}
                  onChange={(e) => setNewShelf(e.target.value as BookShelf)}
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
                >
                  <option value="reading">Currently Reading</option>
                  <option value="want">Want to Read</option>
                  <option value="textbook">Academic Textbook</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F3E7EE] dark:bg-[#26212E] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
              >
                Add Book
              </motion.button>
            </div>
          </form>
        </div>
      </AnimatedModal>

      {/* Full-Screen Interactive Dual-Spread Book Reader & Annotation Studio */}
      {readingBook && readerSession && (
        <BookReaderModal
          book={readingBook}
          openMode={readerSession.mode}
          originRect={readerSession.originRect}
          onClose={() => setReaderSession(null)}
          onSyncBookState={onSyncBookState}
          onAddHighlight={onAddHighlight}
          onStartReadingSession={onStartReadingSession}
        />
      )}
    </motion.div>
  );
};
