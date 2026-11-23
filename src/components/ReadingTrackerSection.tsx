import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Headphones,
  MessageSquareQuote,
  Play,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { BookHighlight, BookItem, BookShelf, UserPreferences } from '../types';
import { BookCoverArt } from './BookCoverArt';

interface ReadingTrackerSectionProps {
  books: BookItem[];
  highlights: BookHighlight[];
  preferences: UserPreferences;
  globalSearch: string;
  streakDays: number;
  onLogPages: (bookId: string, delta: number) => void;
  onChangeShelf: (bookId: string, shelf: BookShelf) => void;
  onAddBook: (book: Omit<BookItem, 'id'>) => void;
  onAddHighlight: (hl: Omit<BookHighlight, 'id'>) => void;
  onStartReadingSession: (bookTitle: string) => void;
}

const SHELF_TABS: Array<{ id: BookShelf; label: string }> = [
  { id: 'reading', label: 'Currently Reading' },
  { id: 'want', label: 'Want to Read' },
  { id: 'finished', label: 'Finished' },
  { id: 'textbook', label: 'Academic Textbooks' },
];

const BookDonut: React.FC<{ book: BookItem }> = ({ book }) => {
  const [hoverInfo, setHoverInfo] = useState<{ val: string; lbl: string } | null>(null);
  const pct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
  const remaining = Math.max(0, book.totalPages - book.currentPage);
  const activeChapter = Math.min(remaining, book.activeChapterPages);
  const afterChapter = Math.max(0, remaining - activeChapter);

  const r = 34;
  const c = 2 * Math.PI * r;
  const readFrac = book.currentPage / book.totalPages;
  const activeFrac = activeChapter / book.totalPages;

  const readLen = readFrac * c;
  const activeLen = activeFrac * c;

  return (
    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Remaining base */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#A7F3D0"
          strokeWidth="15"
          className="cursor-pointer dark:stroke-[#1E4538]"
          onMouseEnter={() => setHoverInfo({ val: `${afterChapter}p`, lbl: 'Remaining' })}
          onMouseLeave={() => setHoverInfo(null)}
        />
        {/* Active Chapter segment */}
        {activeLen > 0 && (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#10B981"
            strokeWidth="15"
            strokeDasharray={`${activeLen} ${c - activeLen}`}
            strokeDashoffset={-readLen}
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoverInfo({ val: `${activeChapter}p`, lbl: 'Active Ch.' })}
            onMouseLeave={() => setHoverInfo(null)}
          />
        )}
        {/* Read segment */}
        {readLen > 0 && (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#065F46"
            strokeWidth="15"
            strokeDasharray={`${readLen} ${c - readLen}`}
            strokeDashoffset={0}
            className="cursor-pointer transition-all duration-300 dark:stroke-[#34D399]"
            onMouseEnter={() => setHoverInfo({ val: `${book.currentPage}p`, lbl: 'Read' })}
            onMouseLeave={() => setHoverInfo(null)}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <span className="font-mono text-sm font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums leading-none">
          {hoverInfo ? hoverInfo.val : `${pct}%`}
        </span>
        <span className="text-[10px] text-[#8A7177] dark:text-[#9D8F99] mt-0.5 font-medium">
          {hoverInfo ? hoverInfo.lbl : `${book.currentPage} pgs`}
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
  onAddHighlight,
  onStartReadingSession,
}) => {
  const [activeShelf, setActiveShelf] = useState<BookShelf>('reading');
  const [localSearch, setLocalSearch] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddHighlight, setShowAddHighlight] = useState(false);

  // Add Book Form
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Cognitive Science');
  const [newPages, setNewPages] = useState(320);
  const [newShelf, setNewShelf] = useState<BookShelf>('reading');

  // Add Highlight Form
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

  const finishedCount = books.filter((b) => b.shelf === 'finished').length + 16; // includes earlier year volumes
  const goalPct = Math.min(100, Math.round((finishedCount / preferences.readingGoalBooks) * 100));

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const variants: BookItem['coverVariant'][] = ['kahneman', 'kleppmann', 'newport', 'neuro', 'algorithms', 'macro', 'atomic', 'design'];
    onAddBook({
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Academic Press',
      category: newCategory.trim() || 'General',
      shelf: newShelf,
      currentPage: newShelf === 'finished' ? newPages : 0,
      totalPages: Math.max(20, newPages),
      activeChapterPages: 30,
      coverVariant: variants[books.length % variants.length],
      lastRead: 'Just added',
    });
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
    <div className="flex flex-col gap-6">
      {/* Header & Shelf Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Reading Tracker
          </h1>
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1 tabular-nums">
            Personal digital bookshelf · {finishedCount} of {preferences.readingGoalBooks} annual reading goal ({goalPct}%)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddBookModal(true)}
          className="inline-flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Shelf Filter + Search Card */}
      <div className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3.5 py-2">
          <Search className="w-4 h-4 text-[#8A7177] mr-2 shrink-0" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter current shelf by title, author, or field..."
            className="w-full bg-transparent text-xs text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SHELF_TABS.map((tab) => {
            const count = books.filter((b) => b.shelf === tab.id).length;
            const active = activeShelf === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveShelf(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? 'bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] shadow-xs'
                    : 'bg-[#FCF1F6] dark:bg-[#231E2B] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[11px] opacity-80 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Bookshelf (8 cols) + Streak & Highlights Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Book Cards */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {filteredBooks.length === 0 ? (
            <div className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-10 text-center flex flex-col items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#8A7177]" />
              <p className="font-display text-base font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
                No books on this shelf yet
              </p>
              <button
                type="button"
                onClick={() => setShowAddBookModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
              >
                Add a Volume
              </button>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const pct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
              const remaining = Math.max(0, book.totalPages - book.currentPage);
              return (
                <article
                  key={book.id}
                  className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-shadow hover:shadow-sm"
                >
                  <BookCoverArt
                    variant={book.coverVariant}
                    title={book.title}
                    author={book.author}
                    className="w-24 h-36 sm:w-28 sm:h-40"
                  />

                  <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-[#8A7177] dark:text-[#9D8F99]">
                          {book.category} · Last read {book.lastRead}
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5 truncate">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#574146] dark:text-[#B5A8B2]">{book.author}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#006948] dark:text-[#6EE7B7] tabular-nums shrink-0">
                        {pct}% complete
                      </span>
                    </div>

                    {/* Interactive Donut & Breakdown */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FCF1F6] dark:bg-[#231E2B] rounded-xl p-3.5">
                      <BookDonut book={book} />
                      <div className="flex flex-col gap-1.5 flex-1 text-xs">
                        <div className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] font-mono tabular-nums">
                          {book.currentPage} / {book.totalPages} pages
                        </div>
                        <div className="flex items-center gap-2 text-[#574146] dark:text-[#B5A8B2]">
                          <span className="w-2 h-2 rounded-full bg-[#065F46] dark:bg-[#34D399]" />
                          <span>Read · {book.currentPage} pgs</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#574146] dark:text-[#B5A8B2]">
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                          <span>Active Chapter · {Math.min(remaining, book.activeChapterPages)} pgs</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#574146] dark:text-[#B5A8B2]">
                          <span className="w-2 h-2 rounded-full bg-[#A7F3D0] dark:bg-[#1E4538]" />
                          <span>Remaining · {remaining} pgs left</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {book.shelf !== 'finished' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onLogPages(book.id, 10)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F3E7EE] hover:bg-[#EAE0E5] text-[#1F1A1E] dark:bg-[#2B2534] dark:hover:bg-[#362E42] dark:text-[#F5EFF3] transition-colors cursor-pointer"
                            >
                              +10 Pages
                            </button>
                            <button
                              type="button"
                              onClick={() => onLogPages(book.id, 25)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] transition-all active:scale-95 cursor-pointer"
                            >
                              +25 Pages
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onStartReadingSession(book.title)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] hover:bg-[#D1FAE5]/40 dark:hover:bg-[#133A2E] transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Read Focus
                        </button>
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

        {/* Right Sidebar: Reading Streak + Highlights + Evening Session */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          {/* Reading Streak Calendar */}
          <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-5 flex flex-col gap-3">
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
                <span
                  key={item.d}
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
                </span>
              ))}
            </div>
          </section>

          {/* Recent Highlights */}
          <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-5 flex flex-col gap-3">
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

            {showAddHighlight && (
              <form
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
              </form>
            )}

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
          <section className="bg-[#FCF1F6] dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-5 flex flex-col gap-3">
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
            <button
              type="button"
              onClick={() => onStartReadingSession(books[1]?.title || 'Evening Reading')}
              className="w-full py-2.5 rounded-xl bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Reading Focus Session
            </button>
          </section>
        </aside>
      </div>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1823] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
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
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
