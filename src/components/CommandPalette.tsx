import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckSquare,
  Compass,
  CornerDownLeft,
  LayoutDashboard,
  Moon,
  PenTool,
  Play,
  Search,
  SlidersHorizontal,
  Sun,
  Timer,
} from 'lucide-react';
import { AcademicTask, BookItem, SectionId, StudyNote } from '../types';
import { FLOW_SPRING } from './MotionPrimitives';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  timerRunning: boolean;
  tasks: AcademicTask[];
  books: BookItem[];
  notes: StudyNote[];
  onNavigate: (section: SectionId) => void;
  onToggleTheme: () => void;
  onToggleTimer: () => void;
  onFocusTask: (task: AcademicTask) => void;
  onSendNoteToHandwriting: (note: StudyNote) => void;
}

interface PaletteItem {
  id: string;
  group: 'Navigation' | 'Quick Actions' | 'Tasks' | 'Bookshelf' | 'Study Notes';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  isDark,
  timerRunning,
  tasks,
  books,
  notes,
  onNavigate,
  onToggleTheme,
  onToggleTimer,
  onFocusTask,
  onSendNoteToHandwriting,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();

    const navItems: PaletteItem[] = [
      {
        id: 'nav-overview',
        group: 'Navigation',
        title: 'Overview Dashboard',
        subtitle: 'Daily vitals, live timer & checklist',
        icon: <LayoutDashboard className="w-4 h-4" />,
        action: () => onNavigate('overview'),
      },
      {
        id: 'nav-focus',
        group: 'Navigation',
        title: 'Focus Mode Studio',
        subtitle: 'Pomodoro clock, Zen mode & Web Audio soundscapes',
        icon: <Timer className="w-4 h-4" />,
        action: () => onNavigate('focus'),
      },
      {
        id: 'nav-analytics',
        group: 'Navigation',
        title: 'Study Analytics',
        subtitle: 'Weekly trends, subject mix & 28-day heatmap',
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => onNavigate('analytics'),
      },
      {
        id: 'nav-tasks',
        group: 'Navigation',
        title: 'Task Manager',
        subtitle: 'Academic list & Kanban board',
        icon: <CheckSquare className="w-4 h-4" />,
        action: () => onNavigate('tasks'),
      },
      {
        id: 'nav-reading',
        group: 'Navigation',
        title: 'Reading Tracker',
        subtitle: 'Digital bookshelf, page progress & highlights',
        icon: <BookOpen className="w-4 h-4" />,
        action: () => onNavigate('reading'),
      },
      {
        id: 'nav-notes',
        group: 'Navigation',
        title: 'Notes Explorer',
        subtitle: 'Curated study guides & collections',
        icon: <Compass className="w-4 h-4" />,
        action: () => onNavigate('notes'),
      },
      {
        id: 'nav-handwriting',
        group: 'Navigation',
        title: 'Text to Handwriting Studio',
        subtitle: 'Realistic ink, paper textures & PNG/PDF export',
        icon: <PenTool className="w-4 h-4" />,
        action: () => onNavigate('handwriting'),
      },
      {
        id: 'nav-games',
        group: 'Navigation',
        title: 'Mind & Logic Games',
        subtitle: '24-Math Blitz, Stroop, Pattern Matrix & Deduction',
        icon: <Brain className="w-4 h-4" />,
        action: () => onNavigate('games'),
      },
      {
        id: 'nav-profile',
        group: 'Navigation',
        title: 'Profile & Preferences',
        subtitle: 'Daily goals, study rhythm & theme settings',
        icon: <SlidersHorizontal className="w-4 h-4" />,
        action: () => onNavigate('profile'),
      },
    ];

    const quickActions: PaletteItem[] = [
      {
        id: 'act-timer',
        group: 'Quick Actions',
        title: timerRunning ? 'Pause Focus Timer' : 'Start Focus Timer',
        subtitle: 'Control your active FocusX session immediately',
        icon: <Play className="w-4 h-4" />,
        action: () => {
          onToggleTimer();
          onNavigate('focus');
        },
      },
      {
        id: 'act-theme',
        group: 'Quick Actions',
        title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        subtitle: 'Toggle FocusX Academic Zen theme',
        icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        action: onToggleTheme,
      },
    ];

    const taskItems: PaletteItem[] = tasks
      .filter((t) => t.status !== 'done')
      .slice(0, 5)
      .map((task) => ({
        id: `task-${task.id}`,
        group: 'Tasks',
        title: task.title,
        subtitle: `${task.subject} · ${task.dueLabel} — Start focus block`,
        icon: <CheckSquare className="w-4 h-4" />,
        action: () => onFocusTask(task),
      }));

    const bookItems: PaletteItem[] = books.slice(0, 4).map((book) => ({
      id: `book-${book.id}`,
      group: 'Bookshelf',
      title: book.title,
      subtitle: `${book.author} · ${book.currentPage}/${book.totalPages} pgs`,
      icon: <BookOpen className="w-4 h-4" />,
      action: () => onNavigate('reading'),
    }));

    const noteItems: PaletteItem[] = notes.slice(0, 4).map((note) => ({
      id: `note-${note.id}`,
      group: 'Study Notes',
      title: note.title,
      subtitle: `${note.field} · Send to Handwriting Studio`,
      icon: <PenTool className="w-4 h-4" />,
      action: () => onSendNoteToHandwriting(note),
    }));

    const combined = [...quickActions, ...navItems, ...taskItems, ...bookItems, ...noteItems];
    if (!q) return combined.slice(0, 11);
    return combined.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [query, isDark, timerRunning, tasks, books, notes, onNavigate, onToggleTheme, onToggleTimer, onFocusTask, onSendNoteToHandwriting]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (items.length ? (i + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].action();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, items, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={FLOW_SPRING}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-[#1A1622] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            role="dialog"
            aria-label="FocusX Command Palette"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F0E5EB] dark:border-[#2C2636]">
              <Search className="w-4 h-4 text-[#A3265B] dark:text-[#FFB1C6] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a FocusX workspace, task, book, or action..."
                className="w-full bg-transparent text-sm text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-mono text-[#8A7177] hover:text-[#1F1A1E] dark:hover:text-white px-2 py-1 rounded-md bg-[#FCF1F6] dark:bg-[#262130] cursor-pointer shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[380px] overflow-y-auto p-2 flex flex-col gap-0.5">
              {items.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#8A7177] dark:text-[#9D8F99]">
                  No FocusX commands or items match “{query}”.
                </div>
              ) : (
                items.map((item, idx) => {
                  const active = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className="relative w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      {active && (
                        <motion.span
                          layoutId="focusx-cmd-highlight"
                          transition={FLOW_SPRING}
                          className="absolute inset-0 rounded-xl bg-[#FCF1F6] dark:bg-[#292233] border border-[#EAE0E5] dark:border-[#3A3248]"
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? 'bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814]'
                              : 'bg-[#F6EDF2] dark:bg-[#241E2D] text-[#574146] dark:text-[#B5A8B2]'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] truncate">
                            {item.group} · {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="relative z-10 text-[#8A7177] dark:text-[#9D8F99] shrink-0">
                        {active ? (
                          <CornerDownLeft className="w-3.5 h-3.5 text-[#A3265B] dark:text-[#FFB1C6]" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-[#F0E5EB] dark:border-[#2C2636] bg-[#FCF1F6]/70 dark:bg-[#15111C] flex items-center justify-between text-[11px] text-[#8A7177] dark:text-[#9D8F99]">
              <span>Use ↑↓ arrows and Enter to navigate FocusX</span>
              <span className="font-mono">⌘K / Ctrl+K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
