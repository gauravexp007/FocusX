/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import {
  DEFAULT_HANDWRITING_TEXT,
  INITIAL_ARTIFACTS,
  INITIAL_BOOKS,
  INITIAL_FOCUS_LOGS,
  INITIAL_GAME_SCORES,
  INITIAL_HIGHLIGHTS,
  INITIAL_NOTES,
  INITIAL_PREFERENCES,
  INITIAL_TASKS,
} from './data/initialData';
import {
  AcademicTask,
  BookHighlight,
  BookItem,
  BookShelf,
  FocusSessionLog,
  GameScores,
  HandwritingArtifact,
  HandwritingFontId,
  InkColorId,
  PaperStyleId,
  SectionId,
  SoundscapeId,
  StudyNote,
  TaskStatus,
  UserPreferences,
} from './types';
import { ambientAudio } from './utils/ambientAudio';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewSection } from './components/OverviewSection';
import { FocusModeSection } from './components/FocusModeSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { TaskManagerSection } from './components/TaskManagerSection';
import { ReadingTrackerSection } from './components/ReadingTrackerSection';
import { NotesExplorerSection } from './components/NotesExplorerSection';
import { HandwritingStudioSection } from './components/HandwritingStudioSection';
import { BrainGamesSection } from './components/BrainGamesSection';
import { ProfileSection } from './components/ProfileSection';

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [key, state]);

  return [state, setState];
}

function formatShortClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDark, setIsDark] = usePersistentState<boolean>('sp_theme_dark', false);

  // Persisted Student Workspace State
  const [preferences, setPreferences] = usePersistentState<UserPreferences>('sp_prefs', INITIAL_PREFERENCES);
  const [tasks, setTasks] = usePersistentState<AcademicTask[]>('sp_tasks', INITIAL_TASKS);
  const [books, setBooks] = usePersistentState<BookItem[]>('sp_books', INITIAL_BOOKS);
  const [highlights, setHighlights] = usePersistentState<BookHighlight[]>('sp_highlights', INITIAL_HIGHLIGHTS);
  const [notes, setNotes] = usePersistentState<StudyNote[]>('sp_notes', INITIAL_NOTES);
  const [focusLogs, setFocusLogs] = usePersistentState<FocusSessionLog[]>('sp_focus_logs', INITIAL_FOCUS_LOGS);
  const [artifacts, setArtifacts] = usePersistentState<HandwritingArtifact[]>('sp_artifacts', INITIAL_ARTIFACTS);
  const [gameScores, setGameScores] = usePersistentState<GameScores>('sp_game_scores', INITIAL_GAME_SCORES);

  // Handwriting Studio live state
  const [hwText, setHwText] = useState<string>(DEFAULT_HANDWRITING_TEXT);
  const [hwFont, setHwFont] = useState<HandwritingFontId>('caveat');
  const [hwPaper, setHwPaper] = useState<PaperStyleId>('ruled');
  const [hwInk, setHwInk] = useState<InkColorId>('royal');

  // Shared Global Focus Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(preferences.defaultFocusMinutes * 60);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(preferences.defaultFocusMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSubject, setTimerSubject] = useState('Organic Chemistry');
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>('task-1');
  const [soundscape, setSoundscape] = useState<SoundscapeId>('muted');
  const [audioVolume, setAudioVolume] = useState(0.35);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Ambient Web Audio lifecycle
  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  const handleSelectSoundscape = useCallback(
    (nextSound: SoundscapeId) => {
      setSoundscape(nextSound);
      ambientAudio.play(nextSound, audioVolume);
    },
    [audioVolume]
  );

  const handleChangeVolume = useCallback((vol: number) => {
    setAudioVolume(vol);
    ambientAudio.setVolume(vol);
  }, []);

  // Complete a Focus Session & record into analytics
  const recordFocusBlock = useCallback(
    (minutesLogged: number) => {
      const mins = Math.max(5, Math.round(minutesLogged));
      const linkedTask = tasks.find((t) => t.id === linkedTaskId);
      const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog: FocusSessionLog = {
        id: `f-${Date.now()}`,
        subject: timerSubject,
        durationMinutes: mins,
        completedAt: `Thu · ${nowLabel}`,
        dayShort: 'Thu',
        taskTitle: linkedTask?.title,
      };
      setFocusLogs((prev) => [newLog, ...prev]);

      if (linkedTask) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === linkedTask.id
              ? { ...t, completedBlocks: Math.min(t.estimatedBlocks + 2, t.completedBlocks + 1) }
              : t
          )
        );
      }
      showToast(`Logged ${mins} min focus session in ${timerSubject}.`);
    },
    [linkedTaskId, setFocusLogs, setTasks, showToast, tasks, timerSubject]
  );

  // Global Timer Countdown Tick
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          if (timerMode === 'focus') {
            recordFocusBlock(Math.round(timerTotalSeconds / 60));
            const breakSecs = preferences.defaultBreakMinutes * 60;
            setTimerMode('break');
            setTimerTotalSeconds(breakSecs);
            return breakSecs;
          } else {
            const focusSecs = preferences.defaultFocusMinutes * 60;
            setTimerMode('focus');
            setTimerTotalSeconds(focusSecs);
            showToast('Break complete — ready for your next deep work block.');
            return focusSecs;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [
    preferences.defaultBreakMinutes,
    preferences.defaultFocusMinutes,
    recordFocusBlock,
    showToast,
    timerMode,
    timerRunning,
    timerTotalSeconds,
  ]);

  // Derived Weekly Chart Data & Today Hours
  const weeklyChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => {
      const mins = focusLogs
        .filter((l) => l.dayShort === day)
        .reduce((sum, l) => sum + l.durationMinutes, 0);
      return {
        day,
        hours: Number((mins / 60).toFixed(1)),
        isToday: day === 'Thu',
      };
    });
  }, [focusLogs]);

  const todayHours = useMemo(() => {
    const thu = weeklyChartData.find((d) => d.day === 'Thu');
    return thu ? thu.hours : 0;
  }, [weeklyChartData]);

  const totalLoggedHours = useMemo(() => {
    const mins = focusLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
    return 122 + mins / 60;
  }, [focusLogs]);

  // Handlers
  const handleToggleTimer = () => setTimerRunning((r) => !r);

  const handleResetTimer = () => {
    setTimerRunning(false);
    const secs =
      timerMode === 'focus'
        ? preferences.defaultFocusMinutes * 60
        : preferences.defaultBreakMinutes * 60;
    setTimerTotalSeconds(secs);
    setTimerSecondsLeft(secs);
  };

  const handleSkipTimer = () => {
    setTimerRunning(false);
    if (timerMode === 'focus') {
      const breakSecs = preferences.defaultBreakMinutes * 60;
      setTimerMode('break');
      setTimerTotalSeconds(breakSecs);
      setTimerSecondsLeft(breakSecs);
    } else {
      const focusSecs = preferences.defaultFocusMinutes * 60;
      setTimerMode('focus');
      setTimerTotalSeconds(focusSecs);
      setTimerSecondsLeft(focusSecs);
    }
  };

  const handleSetPreset = (minutes: number, mode: 'focus' | 'break') => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerTotalSeconds(minutes * 60);
    setTimerSecondsLeft(minutes * 60);
  };

  const handleStartQuickPomodoro = () => {
    const secs = preferences.defaultFocusMinutes * 60;
    setTimerMode('focus');
    setTimerTotalSeconds(secs);
    setTimerSecondsLeft(secs);
    setTimerRunning(true);
    setActiveSection('focus');
    showToast(`Started ${preferences.defaultFocusMinutes}-minute Pomodoro session.`);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
      )
    );
  };

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handleAddTask = (newTask: Omit<AcademicTask, 'id'>) => {
    setTasks((prev) => [{ ...newTask, id: `task-${Date.now()}` }, ...prev]);
    showToast(`Added "${newTask.title}" to your task list.`);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task removed.');
  };

  const handleFocusOnTask = (task: AcademicTask) => {
    setLinkedTaskId(task.id);
    setTimerSubject(task.subject);
    setTimerMode('focus');
    const secs = preferences.defaultFocusMinutes * 60;
    setTimerTotalSeconds(secs);
    setTimerSecondsLeft(secs);
    setTimerRunning(true);
    setActiveSection('focus');
    showToast(`Focusing on: ${task.title}`);
  };

  const handleLogPages = (bookId: string, delta: number) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        const nextPage = Math.min(b.totalPages, b.currentPage + delta);
        const completedNow = nextPage >= b.totalPages;
        showToast(
          completedNow
            ? `Finished "${b.title}"! Moved to Finished shelf.`
            : `Logged +${delta} pages in "${b.title}" (${nextPage}/${b.totalPages}).`
        );
        return {
          ...b,
          currentPage: nextPage,
          shelf: completedNow ? 'finished' : b.shelf,
          lastRead: 'Just now',
        };
      })
    );
  };

  const handleChangeBookShelf = (bookId: string, shelf: BookShelf) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, shelf, currentPage: shelf === 'finished' ? b.totalPages : b.currentPage }
          : b
      )
    );
  };

  const handleAddBook = (newBook: Omit<BookItem, 'id'>) => {
    setBooks((prev) => [{ ...newBook, id: `book-${Date.now()}` }, ...prev]);
    showToast(`Added "${newBook.title}" to your bookshelf.`);
  };

  const handleAddHighlight = (newHl: Omit<BookHighlight, 'id'>) => {
    setHighlights((prev) => [{ ...newHl, id: `hl-${Date.now()}` }, ...prev]);
    showToast('Highlight saved to reading notes.');
  };

  const handleStartReadingSession = (bookTitle: string) => {
    setTimerSubject(`Reading: ${bookTitle.slice(0, 22)}`);
    setTimerMode('focus');
    setTimerTotalSeconds(30 * 60);
    setTimerSecondsLeft(30 * 60);
    setTimerRunning(true);
    setActiveSection('focus');
    showToast(`Started 30m reading focus block for "${bookTitle}".`);
  };

  const handleToggleSaveNote = (noteId: string) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, saved: !n.saved } : n)));
  };

  const handleToggleUpvoteNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, upvoted: !n.upvoted, upvotes: n.upvoted ? n.upvotes - 1 : n.upvotes + 1 }
          : n
      )
    );
  };

  const handleAddNote = (newNote: Omit<StudyNote, 'id'>) => {
    setNotes((prev) => [{ ...newNote, id: `note-${Date.now()}` }, ...prev]);
    showToast(`Published "${newNote.title}" to Notes Explorer.`);
  };

  const handleSendNoteToHandwriting = (note: StudyNote) => {
    setHwText(note.content);
    setActiveSection('handwriting');
    showToast(`Loaded "${note.title}" into Text to Handwriting Studio.`);
  };

  const handleOpenArtifact = (art: HandwritingArtifact) => {
    setHwText(art.text);
    setHwFont(art.font);
    setHwPaper(art.paper);
    setHwInk(art.ink);
    setActiveSection('handwriting');
  };

  const handleSaveArtifact = (title: string, subject: string) => {
    const pages = Math.max(1, Math.ceil(hwText.length / 750));
    const newArt: HandwritingArtifact = {
      id: `art-${Date.now()}`,
      title,
      subject,
      updatedAt: 'Just now',
      pages,
      text: hwText,
      font: hwFont,
      paper: hwPaper,
      ink: hwInk,
    };
    setArtifacts((prev) => [newArt, ...prev.slice(0, 7)]);
    showToast(`Saved "${title}" to your Handwriting Studio sheets.`);
  };

  const handleResetAllData = () => {
    setPreferences(INITIAL_PREFERENCES);
    setTasks(INITIAL_TASKS);
    setBooks(INITIAL_BOOKS);
    setHighlights(INITIAL_HIGHLIGHTS);
    setNotes(INITIAL_NOTES);
    setFocusLogs(INITIAL_FOCUS_LOGS);
    setArtifacts(INITIAL_ARTIFACTS);
    setGameScores(INITIAL_GAME_SCORES);
    setHwText(DEFAULT_HANDWRITING_TEXT);
    showToast('Workspace reset to default sample academic data.');
  };

  const pendingTaskCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className="min-h-screen bg-[#FFF8FB] dark:bg-[#121016] text-[#1F1A1E] dark:text-[#F5EFF3] transition-colors duration-200">
      <TopBar
        studentName={preferences.studentName}
        streakDays={14}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        onQuickFocus={() => setActiveSection('focus')}
        onOpenProfile={() => setActiveSection('profile')}
        globalSearch={globalSearch}
        onGlobalSearchChange={(q) => {
          setGlobalSearch(q);
          if (q.trim() && activeSection === 'overview') {
            setActiveSection('notes');
          }
        }}
        activeSection={activeSection}
        timerRunning={timerRunning}
        timerFormatted={formatShortClock(timerSecondsLeft)}
      />

      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        preferences={preferences}
        pendingTaskCount={pendingTaskCount}
        timerRunning={timerRunning}
      />

      {/* Main Content Canvas */}
      <div
        className={`pt-16 transition-[padding] duration-200 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <main className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'overview' && (
                <OverviewSection
                  preferences={preferences}
                  tasks={tasks}
                  books={books}
                  notes={notes}
                  focusLogs={focusLogs}
                  artifacts={artifacts}
                  streakDays={14}
                  todayHours={todayHours}
                  weeklyChartData={weeklyChartData}
                  onNavigate={setActiveSection}
                  onToggleTask={handleToggleTask}
                  onOpenArtifact={handleOpenArtifact}
                  timerSecondsLeft={timerSecondsLeft}
                  timerTotalSeconds={timerTotalSeconds}
                  timerRunning={timerRunning}
                  timerMode={timerMode}
                  timerSubject={timerSubject}
                  soundscape={soundscape}
                  onToggleTimer={handleToggleTimer}
                  onResetTimer={handleResetTimer}
                  onSkipTimer={handleSkipTimer}
                  onSelectSubject={setTimerSubject}
                  onSelectSoundscape={handleSelectSoundscape}
                  onStartQuickPomodoro={handleStartQuickPomodoro}
                />
              )}

              {activeSection === 'focus' && (
                <FocusModeSection
                  timerSecondsLeft={timerSecondsLeft}
                  timerTotalSeconds={timerTotalSeconds}
                  timerRunning={timerRunning}
                  timerMode={timerMode}
                  timerSubject={timerSubject}
                  linkedTaskId={linkedTaskId}
                  soundscape={soundscape}
                  volume={audioVolume}
                  tasks={tasks}
                  focusLogs={focusLogs}
                  onToggleTimer={handleToggleTimer}
                  onResetTimer={handleResetTimer}
                  onSkipTimer={handleSkipTimer}
                  onSetPreset={handleSetPreset}
                  onSelectSubject={setTimerSubject}
                  onSelectLinkedTask={setLinkedTaskId}
                  onSelectSoundscape={handleSelectSoundscape}
                  onChangeVolume={handleChangeVolume}
                  onLogCurrentSession={() => {
                    const elapsedMins = Math.max(
                      5,
                      Math.round((timerTotalSeconds - timerSecondsLeft) / 60) ||
                        Math.round(timerTotalSeconds / 60)
                    );
                    recordFocusBlock(elapsedMins);
                    handleResetTimer();
                  }}
                />
              )}

              {activeSection === 'analytics' && (
                <AnalyticsSection
                  focusLogs={focusLogs}
                  weeklyChartData={weeklyChartData}
                  preferences={preferences}
                  streakDays={14}
                  todayHours={todayHours}
                />
              )}

              {activeSection === 'tasks' && (
                <TaskManagerSection
                  tasks={tasks}
                  globalSearch={globalSearch}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  onFocusTask={handleFocusOnTask}
                />
              )}

              {activeSection === 'reading' && (
                <ReadingTrackerSection
                  books={books}
                  highlights={highlights}
                  preferences={preferences}
                  globalSearch={globalSearch}
                  streakDays={14}
                  onLogPages={handleLogPages}
                  onChangeShelf={handleChangeBookShelf}
                  onAddBook={handleAddBook}
                  onAddHighlight={handleAddHighlight}
                  onStartReadingSession={handleStartReadingSession}
                />
              )}

              {activeSection === 'notes' && (
                <NotesExplorerSection
                  notes={notes}
                  globalSearch={globalSearch}
                  onToggleSave={handleToggleSaveNote}
                  onToggleUpvote={handleToggleUpvoteNote}
                  onAddNote={handleAddNote}
                  onSendToHandwriting={handleSendNoteToHandwriting}
                  onNotify={showToast}
                />
              )}

              {activeSection === 'handwriting' && (
                <HandwritingStudioSection
                  text={hwText}
                  onChangeText={setHwText}
                  font={hwFont}
                  onChangeFont={setHwFont}
                  paper={hwPaper}
                  onChangePaper={setHwPaper}
                  ink={hwInk}
                  onChangeInk={setHwInk}
                  artifacts={artifacts}
                  onLoadArtifact={handleOpenArtifact}
                  onSaveArtifact={handleSaveArtifact}
                  onNotify={showToast}
                />
              )}

              {activeSection === 'games' && (
                <BrainGamesSection
                  scores={gameScores}
                  onUpdateScores={setGameScores}
                  onNotify={showToast}
                />
              )}

              {activeSection === 'profile' && (
                <ProfileSection
                  preferences={preferences}
                  onUpdatePreferences={(patch) => setPreferences((p) => ({ ...p, ...patch }))}
                  isDark={isDark}
                  onToggleTheme={() => setIsDark((d) => !d)}
                  totalNotes={notes.length + artifacts.length}
                  totalHours={totalLoggedHours}
                  streakDays={14}
                  totalPulse={gameScores.totalPulse}
                  onResetAllData={handleResetAllData}
                  onNotify={showToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Subtle Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-5 right-5 z-50 bg-[#1F1A1E] dark:bg-[#F5EFF3] text-[#FFF8FB] dark:text-[#1F1A1E] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium max-w-sm"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="w-4 h-4 text-[#6EE7B7] dark:text-[#006948] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
