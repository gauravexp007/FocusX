import React, { useMemo, useState } from 'react';
import {
  Award,
  Bookmark,
  BookmarkCheck,
  Copy,
  Download,
  FolderOpen,
  Grid,
  List,
  PenTool,
  Plus,
  Search,
  Star,
  ThumbsUp,
  Upload,
  X,
} from 'lucide-react';
import { NoteField, NoteFormat, StudyNote } from '../types';
import { NotePreviewArt, ScholarAvatar } from './BookCoverArt';

interface NotesExplorerSectionProps {
  notes: StudyNote[];
  globalSearch: string;
  onToggleSave: (noteId: string) => void;
  onToggleUpvote: (noteId: string) => void;
  onAddNote: (note: Omit<StudyNote, 'id'>) => void;
  onSendToHandwriting: (note: StudyNote) => void;
  onNotify: (msg: string) => void;
}

const FIELDS: Array<'All' | NoteField> = ['All', 'STEM', 'Medicine & Bio', 'CS & AI', 'Economics', 'Humanities'];
const FORMATS: Array<'All' | NoteFormat> = ['All', 'Cornell Format', 'Quick Ref', 'Mind Map', 'Lecture Synthesis'];

const TOP_CONTRIBUTORS = [
  { name: 'Siddharth Rao', meta: "MIT '25 · 8 Notes", karma: '+1.4k', tone: 'emerald' as const },
  { name: 'Clara Oswald', meta: "Oxford '24 · 5 Notes", karma: '+980', tone: 'sky' as const },
  { name: 'Devon Vance', meta: "Yale '26 · 4 Notes", karma: '+840', tone: 'amber' as const },
];

export const NotesExplorerSection: React.FC<NotesExplorerSectionProps> = ({
  notes,
  globalSearch,
  onToggleSave,
  onToggleUpvote,
  onAddNote,
  onSendToHandwriting,
  onNotify,
}) => {
  const [selectedField, setSelectedField] = useState<'All' | NoteField>('All');
  const [selectedFormat, setSelectedFormat] = useState<'All' | NoteFormat>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'recent'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [activeNote, setActiveNote] = useState<StudyNote | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Note Form
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newField, setNewField] = useState<NoteField>('STEM');
  const [newFormat, setNewFormat] = useState<NoteFormat>('Cornell Format');
  const [newContent, setNewContent] = useState('');

  const effectiveSearch = (localSearch || globalSearch).trim().toLowerCase();

  const filteredNotes = useMemo(() => {
    const list = notes.filter((n) => {
      if (selectedField !== 'All' && n.field !== selectedField) return false;
      if (selectedFormat !== 'All' && n.format !== selectedFormat) return false;
      if (collectionFilter === '__saved__' && !n.saved) return false;
      if (collectionFilter && collectionFilter !== '__saved__' && n.collection !== collectionFilter) return false;
      if (
        effectiveSearch &&
        !n.title.toLowerCase().includes(effectiveSearch) &&
        !n.subtitle.toLowerCase().includes(effectiveSearch) &&
        !n.author.toLowerCase().includes(effectiveSearch)
      ) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'rating') return b.rating - a.rating || b.upvotes - a.upvotes;
      return 0;
    });
  }, [notes, selectedField, selectedFormat, sortBy, collectionFilter, effectiveSearch]);

  const handleUploadNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const previewMap: Record<NoteField, StudyNote['previewVariant']> = {
      STEM: 'chem',
      'Medicine & Bio': 'bio',
      'CS & AI': 'algo',
      Economics: 'econ',
      Humanities: 'calc',
    };
    onAddNote({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Student-authored study synthesis.',
      field: newField,
      format: newFormat,
      pages: Math.max(1, Math.ceil(newContent.length / 600)),
      author: 'Alex Vance',
      institution: 'Stanford',
      rating: 5.0,
      ratingCount: 1,
      downloads: 1,
      upvotes: 1,
      saved: true,
      collection: 'My Uploads',
      updatedAt: 'Just now',
      previewVariant: previewMap[newField],
      content: newContent.trim(),
    });
    setNewTitle('');
    setNewSubtitle('');
    setNewContent('');
    setShowUploadModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Notes Explorer
          </h1>
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1">
            Browse verified study guides, organize collections, and send any note straight to the Handwriting Studio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Upload className="w-4 h-4" />
          Upload Study Note
        </button>
      </div>

      {/* Command Search & Filter Strip */}
      <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex items-center bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3.5 py-2 flex-1">
            <Search className="w-4 h-4 text-[#8A7177] mr-2 shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search verified study notes, courses (CS161, BioChem, Econ 102)..."
              className="w-full bg-transparent text-xs text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'All' | NoteFormat)}
              aria-label="Filter by format"
              className="bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3 py-2 text-xs font-medium text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f} className="bg-white dark:bg-[#1B1722]">
                  {f === 'All' ? 'All Formats' : f}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'downloads' | 'recent')}
              aria-label="Sort notes"
              className="bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3 py-2 text-xs font-medium text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
            >
              <option value="rating" className="bg-white dark:bg-[#1B1722]">Top Rated</option>
              <option value="downloads" className="bg-white dark:bg-[#1B1722]">Most Downloaded</option>
              <option value="recent" className="bg-white dark:bg-[#1B1722]">Recently Added</option>
            </select>

            <div className="inline-flex items-center p-1 rounded-xl bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#312A3C] text-[#006948] dark:text-[#6EE7B7] shadow-xs'
                    : 'text-[#8A7177]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#312A3C] text-[#006948] dark:text-[#6EE7B7] shadow-xs'
                    : 'text-[#8A7177]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {FIELDS.map((field) => {
              const active = selectedField === field && !collectionFilter;
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => {
                    setSelectedField(field);
                    setCollectionFilter(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814]'
                      : 'bg-[#FCF1F6] dark:bg-[#231E2B] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white'
                  }`}
                >
                  {field === 'All' ? `All Fields (${notes.length})` : field}
                </button>
              );
            })}
          </div>

          {collectionFilter && (
            <button
              type="button"
              onClick={() => setCollectionFilter(null)}
              className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer"
            >
              Clear collection filter ({collectionFilter === '__saved__' ? 'Saved' : collectionFilter}) ×
            </button>
          )}
        </div>
      </section>

      {/* Main Split: Study Guides (8 cols) + Leaderboard & Collections (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Guides */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-[#8A7177] dark:text-[#9D8F99]">
            <span className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
              High-Yield Study Guides ({filteredNotes.length})
            </span>
            <span>Click any card to read or send to Handwriting Studio</span>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-10 text-center flex flex-col items-center gap-3">
              <p className="font-display text-base font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
                No notes match this filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedField('All');
                  setSelectedFormat('All');
                  setCollectionFilter(null);
                  setLocalSearch('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-3'}>
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className={`group bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] hover:border-[#A3265B]/50 dark:hover:border-[#F56498]/50 rounded-2xl overflow-hidden transition-all flex ${
                    viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row'
                  }`}
                >
                  {viewMode === 'grid' && (
                    <div
                      onClick={() => setActiveNote(note)}
                      className="cursor-pointer"
                    >
                      <NotePreviewArt variant={note.previewVariant} title={note.title} />
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#8A7177] dark:text-[#9D8F99]">
                        <span className="truncate">
                          <strong className="font-semibold text-[#006948] dark:text-[#6EE7B7]">{note.field}</strong>
                          {' · '}
                          {note.format}
                          {' · '}
                          {note.pages} pgs
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleSave(note.id)}
                          aria-label={note.saved ? 'Remove bookmark' : 'Bookmark note'}
                          className="p-1 text-[#8A7177] hover:text-[#A3265B] dark:hover:text-[#FFB1C6] cursor-pointer shrink-0"
                        >
                          {note.saved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#A3265B] dark:text-[#FFB1C6]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveNote(note)}
                        className="text-left mt-1 block w-full cursor-pointer"
                      >
                        <h3 className="font-display text-sm font-bold text-[#1F1A1E] dark:text-[#F5EFF3] group-hover:text-[#A3265B] dark:group-hover:text-[#FFB1C6] transition-colors line-clamp-1">
                          {note.title}
                        </h3>
                        <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-1 line-clamp-2">
                          {note.subtitle}
                        </p>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-[#F0E5EB] dark:border-[#2B2533] flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <ScholarAvatar name={note.author} size="sm" tone="sky" />
                        <span className="truncate font-medium text-[#1F1A1E] dark:text-[#F5EFF3]">
                          {note.author}{' '}
                          <span className="text-[#8A7177] font-normal">({note.institution})</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 font-mono tabular-nums">
                        <span className="inline-flex items-center gap-0.5 text-[#B45309] dark:text-[#FCD34D] font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {note.rating.toFixed(1)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleUpvote(note.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            note.upvoted
                              ? 'bg-[#006948] text-white dark:bg-[#58CD9B] dark:text-[#072116]'
                              : 'bg-[#FCF1F6] dark:bg-[#25202D] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E]'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {note.upvotes}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Top Contributors & Saved Collections */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          {/* Saved Collections */}
          <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#006782] dark:text-[#7DD3FC]" />
                Saved Collections
              </h2>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {[
                { key: '__saved__', label: 'All Bookmarked Guides', count: notes.filter((n) => n.saved).length },
                { key: 'Biochem Midterm II', label: 'Biochem Midterm II', count: notes.filter((n) => n.collection === 'Biochem Midterm II').length },
                { key: 'Algorithm Interviews', label: 'Algorithm Interviews', count: notes.filter((n) => n.collection === 'Algorithm Interviews').length },
              ].map((col) => {
                const active = collectionFilter === col.key;
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => setCollectionFilter(active ? null : col.key)}
                    className={`p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#FFB9F9]/50 dark:bg-[#F56498]/25 text-[#1F1A1E] dark:text-[#F5EFF3] font-semibold'
                        : 'bg-[#FCF1F6] dark:bg-[#231E2B] hover:bg-[#F3E7EE] dark:hover:bg-[#2C2536] text-[#1F1A1E] dark:text-[#F5EFF3]'
                    }`}
                  >
                    <span className="truncate font-medium">{col.label}</span>
                    <span className="font-mono text-[#8A7177] dark:text-[#9D8F99] tabular-nums shrink-0">
                      {col.count} guides
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Top Contributors */}
          <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#B45309] dark:text-[#FCD34D]" />
                Top Contributors
              </h2>
              <span className="text-xs text-[#8A7177] dark:text-[#9D8F99]">This Week</span>
            </div>

            <div className="flex flex-col divide-y divide-[#F0E5EB] dark:divide-[#2B2533]">
              {TOP_CONTRIBUTORS.map((c, idx) => (
                <div key={c.name} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono font-bold text-[#8A7177] w-4">#{idx + 1}</span>
                    <ScholarAvatar name={c.name} size="sm" tone={c.tone} />
                    <div className="min-w-0">
                      <div className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] truncate">{c.name}</div>
                      <div className="text-[11px] text-[#8A7177] dark:text-[#9D8F99] truncate">{c.meta}</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#006948] dark:text-[#6EE7B7] shrink-0">
                    {c.karma}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Note Reader Modal */}
      {activeNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1823] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#F0E5EB] dark:border-[#2B2533] flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[#8A7177] dark:text-[#9D8F99]">
                  {activeNote.field} · {activeNote.format} · By {activeNote.author} ({activeNote.institution})
                </div>
                <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-1">
                  {activeNote.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveNote(null)}
                className="p-1.5 rounded-lg text-[#8A7177] hover:bg-[#F3E7EE] dark:hover:bg-[#2A2432] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#1F1A1E] dark:text-[#EDE6EB]">
                {activeNote.content}
              </pre>
            </div>

            <div className="p-4 border-t border-[#F0E5EB] dark:border-[#2B2533] bg-[#FCF1F6] dark:bg-[#17141C] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#574146] dark:text-[#B5A8B2] font-mono">
                <Download className="w-3.5 h-3.5" />
                <span>{activeNote.downloads.toLocaleString()} downloads</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeNote.content).catch(() => {});
                    onNotify('Copied study note text to clipboard.');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#342D3E] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = activeNote;
                    setActiveNote(null);
                    onSendToHandwriting(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Open in Handwriting Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Note Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1823] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Publish Study Note
              </h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-[#8A7177] hover:bg-[#F3E7EE] dark:hover:bg-[#2A2432] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadNote} className="flex flex-col gap-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note Title (e.g., Quantum Mechanics: Wave Functions)"
                className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none"
              />
              <input
                type="text"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder="Short summary of key topics covered..."
                className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newField}
                  onChange={(e) => setNewField(e.target.value as NoteField)}
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
                >
                  {FIELDS.filter((f) => f !== 'All').map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <select
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value as NoteFormat)}
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
                >
                  {FORMATS.filter((f) => f !== 'All').map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={6}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="# Heading&#10;1. Key Concept&#10;- Bullet detail..."
                className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1F1A1E] dark:text-[#F5EFF3] outline-none resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F3E7EE] dark:bg-[#26212E] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Publish Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
