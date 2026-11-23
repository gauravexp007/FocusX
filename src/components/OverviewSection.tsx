import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  FileText,
  Flame,
  Headphones,
  Pause,
  PenTool,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AcademicTask,
  BookItem,
  FocusSessionLog,
  HandwritingArtifact,
  SectionId,
  SoundscapeId,
  StudyNote,
  UserPreferences,
} from '../types';

interface OverviewSectionProps {
  preferences: UserPreferences;
  tasks: AcademicTask[];
  books: BookItem[];
  notes: StudyNote[];
  focusLogs: FocusSessionLog[];
  artifacts: HandwritingArtifact[];
  streakDays: number;
  todayHours: number;
  weeklyChartData: Array<{ day: string; hours: number; isToday?: boolean }>;
  onNavigate: (section: SectionId) => void;
  onToggleTask: (id: string) => void;
  onOpenArtifact: (artifact: HandwritingArtifact) => void;
  // Shared live timer state
  timerSecondsLeft: number;
  timerTotalSeconds: number;
  timerRunning: boolean;
  timerMode: 'focus' | 'break';
  timerSubject: string;
  soundscape: SoundscapeId;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onSelectSubject: (subject: string) => void;
  onSelectSoundscape: (sound: SoundscapeId) => void;
  onStartQuickPomodoro: () => void;
}

const SUBJECTS = ['Organic Chemistry', 'Calculus II', 'Cognitive Psych', 'Algorithms'];
const SOUNDSCAPE_LABELS: Record<SoundscapeId, string> = {
  rain: 'Library Rain',
  brown: 'Warm Brown Noise',
  binaural: '40Hz Focus Hum',
  cafe: 'Quiet Study Room',
  muted: 'Audio Muted',
};

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  preferences,
  tasks,
  books,
  notes,
  focusLogs,
  artifacts,
  streakDays,
  todayHours,
  weeklyChartData,
  onNavigate,
  onToggleTask,
  onOpenArtifact,
  timerSecondsLeft,
  timerTotalSeconds,
  timerRunning,
  timerMode,
  timerSubject,
  soundscape,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onSelectSubject,
  onSelectSoundscape,
  onStartQuickPomodoro,
}) => {
  const [vitalsRange, setVitalsRange] = useState<'today' | 'week' | 'month'>('month');

  const dailyPct = Math.min(100, Math.round((todayHours / preferences.dailyGoalHours) * 100));
  const radialCircumference = 2 * Math.PI * 40;
  const radialOffset = radialCircumference * (1 - dailyPct / 100);

  const timerRingCircumference = 2 * Math.PI * 44;
  const timerFraction = timerTotalSeconds > 0 ? 1 - timerSecondsLeft / timerTotalSeconds : 0;
  const timerRingOffset = Math.max(0, Math.min(timerRingCircumference, timerFraction * timerRingCircumference));

  const weeklyTotalHours = weeklyChartData.reduce((acc, d) => acc + d.hours, 0);
  const studyTimeValue =
    vitalsRange === 'today'
      ? `${todayHours.toFixed(1)}h`
      : vitalsRange === 'week'
        ? `${weeklyTotalHours.toFixed(1)}h`
        : `${(122 + weeklyTotalHours).toFixed(0)}h`;

  const finishedBooksCount = books.filter((b) => b.shelf === 'finished').length;
  const readingBooks = books.filter((b) => b.shelf === 'reading').slice(0, 3);
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const firstName = preferences.studentName.split(' ')[0];

  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* 1. Personalized Welcome Banner & Daily Focus Goal */}
      <section className="relative overflow-hidden rounded-2xl bg-[#FCF1F6] dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] p-6 lg:p-7">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#FFB9F9]/25 dark:bg-[#F56498]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-44 -bottom-20 w-56 h-56 rounded-full bg-[#BAE8FF]/30 dark:bg-[#38BDF8]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-[#574146] dark:text-[#B5A8B2]">
              <span className="inline-flex items-center gap-1 font-semibold text-[#92400E] dark:text-[#FCD34D]">
                <Flame className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" />
                {streakDays}-Day Study Streak
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Term {preferences.termLabel} · Week {preferences.termWeek}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-[#574146] dark:text-[#C4B7C1] leading-relaxed">
              You have completed{' '}
              <strong className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                {dailyPct}%
              </strong>{' '}
              of today’s focus goal with{' '}
              <strong className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                {activeTasks.length}
              </strong>{' '}
              academic tasks on deck.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartQuickPomodoro}
                className="inline-flex items-center gap-2 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Pomodoro ({preferences.defaultFocusMinutes}m)
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-2 bg-white dark:bg-[#25202D] hover:bg-[#F6EBF1] dark:hover:bg-[#2F2939] text-[#1F1A1E] dark:text-[#F5EFF3] border border-[#EAE0E5] dark:border-[#363041] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Review Task Queue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Radial Target Dial */}
          <div className="flex items-center gap-5 bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] p-4 rounded-2xl self-start lg:self-center">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[#F0E5EB] dark:text-[#332C3D]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={radialCircumference}
                  strokeDashoffset={radialOffset}
                  className="text-[#F56498] dark:text-[#FFB1C6] transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums leading-none">
                  {dailyPct}%
                </span>
                <span className="text-[10px] text-[#8A7177] dark:text-[#9D8F99] mt-1 font-medium">
                  Daily Goal
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 pr-2">
              <span className="text-xs font-medium text-[#8A7177] dark:text-[#9D8F99]">Logged Today</span>
              <div className="flex items-baseline gap-1 tabular-nums">
                <span className="font-display text-2xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                  {todayHours.toFixed(1)}h
                </span>
                <span className="text-xs text-[#8A7177] dark:text-[#9D8F99]">
                  / {preferences.dailyGoalHours.toFixed(1)}h
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-[#006948] dark:text-[#6EE7B7] mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{focusLogs.length} sessions logged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Academic Vitals (7 cols) + Quick Actions (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Academic Vitals 2x2 */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Academic Vitals
            </h2>
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#F3E7EE] dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C]">
              {(['today', 'week', 'month'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setVitalsRange(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer capitalize ${
                    vitalsRange === r
                      ? 'bg-[#FFB9F9] text-[#3B1837] font-semibold dark:bg-[#F56498] dark:text-[#1A0814]'
                      : 'text-[#574146] hover:text-[#1F1A1E] dark:text-[#B5A8B2] dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-left bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] hover:border-[#006948]/50 dark:hover:border-[#6EE7B7]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#574146] dark:text-[#B5A8B2]">
                <span>Study Time</span>
                <Clock className="w-4 h-4 text-[#006948] dark:text-[#6EE7B7]" />
              </div>
              <div className="my-2">
                <div className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                  {studyTimeValue}
                </div>
                <p className="text-xs text-[#006948] dark:text-[#6EE7B7] font-medium mt-1">
                  +14% vs prior period
                </p>
              </div>
              <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533]">
                View full analytics →
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('notes')}
              className="text-left bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] hover:border-[#006782]/50 dark:hover:border-[#7DD3FC]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#574146] dark:text-[#B5A8B2]">
                <span>Study Notes</span>
                <FileText className="w-4 h-4 text-[#006782] dark:text-[#7DD3FC]" />
              </div>
              <div className="my-2">
                <div className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                  {notes.length + artifacts.length} files
                </div>
                <p className="text-xs text-[#006782] dark:text-[#7DD3FC] font-medium mt-1">
                  {notes.filter((n) => n.saved).length} saved guides · {artifacts.length} sheets
                </p>
              </div>
              <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533]">
                Browse library →
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('reading')}
              className="text-left bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] hover:border-[#B45309]/50 dark:hover:border-[#FBBF24]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#574146] dark:text-[#B5A8B2]">
                <span>Reading Bookshelf</span>
                <BookOpen className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24]" />
              </div>
              <div className="my-2">
                <div className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                  {finishedBooksCount} finished
                </div>
                <p className="text-xs text-[#B45309] dark:text-[#FBBF24] font-medium mt-1">
                  {readingBooks.length} currently reading
                </p>
              </div>
              <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533]">
                Goal: {preferences.readingGoalBooks} books/yr
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-left bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] hover:border-[#A3265B]/50 dark:hover:border-[#F56498]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#574146] dark:text-[#B5A8B2]">
                <span>Task Completion</span>
                <Sparkles className="w-4 h-4 text-[#A3265B] dark:text-[#F56498]" />
              </div>
              <div className="my-2">
                <div className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                  {completedTasks.length} / {tasks.length}
                </div>
                <p className="text-xs text-[#A3265B] dark:text-[#F56498] font-medium mt-1">
                  {activeTasks.filter((t) => t.priority === 'high').length} high-priority open
                </p>
              </div>
              <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533]">
                Open task board →
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions 2x2 */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Quick Actions
            </h2>
            <span className="text-xs text-[#8A7177] dark:text-[#9D8F99]">Jump to tool</span>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              {
                label: 'Read a Book',
                sub: 'Update page progress',
                icon: BookOpen,
                gradient: 'from-amber-500 via-rose-500 to-pink-500',
                target: 'reading' as SectionId,
              },
              {
                label: 'Explore Notes',
                sub: 'Search peer guides',
                icon: Compass,
                gradient: 'from-teal-600 via-emerald-500 to-cyan-500',
                target: 'notes' as SectionId,
              },
              {
                label: 'Handwritten Notes',
                sub: 'Convert typed text',
                icon: PenTool,
                gradient: 'from-indigo-500 via-violet-500 to-fuchsia-500',
                target: 'handwriting' as SectionId,
              },
              {
                label: 'Mind & Logic Games',
                sub: '24-Math & memory',
                icon: Sparkles,
                gradient: 'from-pink-500 via-fuchsia-500 to-rose-500',
                target: 'games' as SectionId,
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onNavigate(action.target)}
                  className="group bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] hover:border-[#A3265B]/40 dark:hover:border-[#F56498]/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} text-white flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] group-hover:text-[#A3265B] dark:group-hover:text-[#FFB1C6] transition-colors">
                      {action.label}
                    </div>
                    <div className="text-[11px] text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
                      {action.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Interactive Live Focus Studio (5 cols) + Weekly Chart & To-Do List (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Live Focus Studio */}
        <section className="lg:col-span-5 bg-[#FCF1F6] dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {timerRunning && (
                <span className="w-2 h-2 rounded-full bg-[#006948] dark:bg-[#6EE7B7] animate-pulse" />
              )}
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Live Focus Studio
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('focus')}
              className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer whitespace-nowrap"
            >
              Expand Studio →
            </button>
          </div>

          {/* Circular Timer Face */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-52 h-52 rounded-full bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] flex items-center justify-center shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-2" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  className="text-[#F0E5EB] dark:text-[#332C3D]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={timerRingCircumference}
                  strokeDashoffset={timerRingOffset}
                  className={`transition-all duration-700 ease-linear ${
                    timerMode === 'focus'
                      ? 'text-[#F56498] dark:text-[#FFB1C6]'
                      : 'text-[#006948] dark:text-[#6EE7B7]'
                  }`}
                />
              </svg>
              <div className="relative z-10 flex flex-col items-center select-none">
                <span className="font-mono text-4xl font-bold tracking-tight text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                  {formatClock(timerSecondsLeft)}
                </span>
                <span className="text-xs font-medium text-[#8A7177] dark:text-[#9D8F99] mt-1">
                  {timerMode === 'focus' ? 'Deep Work Block' : 'Rest & Recharge'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onResetTimer}
                aria-label="Reset timer"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#363041] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggleTimer}
                className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] font-semibold text-sm py-2.5 px-5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{timerRunning ? 'Pause Focus' : 'Start Focus'}</span>
              </button>
              <button
                type="button"
                onClick={onSkipTimer}
                aria-label="Switch interval"
                title="Switch between Focus and Break"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#363041] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Active Coursework Module */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#8A7177] dark:text-[#9D8F99]">
                Active Coursework Module
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.map((subj) => {
                  const selected = timerSubject === subj;
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => onSelectSubject(subj)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#006948] text-white dark:bg-[#58CD9B] dark:text-[#072116] font-semibold'
                          : 'bg-white dark:bg-[#25202D] text-[#574146] dark:text-[#C4B7C1] border border-[#EAE0E5] dark:border-[#363041] hover:text-[#1F1A1E] dark:hover:text-white'
                      }`}
                    >
                      {subj}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Soundscape chooser */}
            <div className="flex items-center justify-between bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] px-3.5 py-2.5 rounded-xl">
              <span className="flex items-center gap-2 text-xs text-[#574146] dark:text-[#C4B7C1]">
                <Headphones className="w-4 h-4 text-[#006782] dark:text-[#7DD3FC]" />
                Soundscape
              </span>
              <select
                value={soundscape}
                onChange={(e) => onSelectSoundscape(e.target.value as SoundscapeId)}
                aria-label="Select ambient soundscape"
                className="bg-transparent text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] outline-none cursor-pointer"
              >
                {(Object.keys(SOUNDSCAPE_LABELS) as SoundscapeId[]).map((key) => (
                  <option key={key} value={key} className="bg-white dark:bg-[#1B1722] text-[#1F1A1E] dark:text-[#F5EFF3]">
                    {SOUNDSCAPE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Right 7 Cols: Weekly Study Chart + Active To-Do List */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Weekly Study Time Recharts Bar Chart */}
          <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                  Today & Weekly Study Time
                </h2>
                <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5 tabular-nums">
                  Today: {todayHours.toFixed(1)}h · Weekly Total: {weeklyTotalHours.toFixed(1)}h
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] hover:underline cursor-pointer"
              >
                Full Report →
              </button>
            </div>

            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#8A7177' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#8A7177' }}
                    unit="h"
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(163, 38, 91, 0.06)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #EAE0E5',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${Number(val ?? 0).toFixed(1)} hrs`, 'Study Time']}
                  />
                  <Bar dataKey="hours" radius={[8, 8, 4, 4]} maxBarSize={36}>
                    {weeklyChartData.map((entry) => (
                      <Cell
                        key={entry.day}
                        fill={entry.isToday ? '#F56498' : entry.hours > 0 ? '#006948' : '#E5DCE1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Active To-Do Preview */}
          <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                  Priority Study Checklist
                </h2>
                <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5 tabular-nums">
                  {activeTasks.length} pending · {completedTasks.length} completed today
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Manage Tasks
              </button>
            </div>

            <div className="flex flex-col divide-y divide-[#F0E5EB] dark:divide-[#2B2533]">
              {tasks.slice(0, 4).map((task) => {
                const done = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className="py-2.5 flex items-center justify-between gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors border ${
                          done
                            ? 'bg-[#006948] border-[#006948] text-white dark:bg-[#58CD9B] dark:border-[#58CD9B] dark:text-[#072116]'
                            : 'border-[#C9B8C2] dark:border-[#4A4154] group-hover:border-[#A3265B] dark:group-hover:border-[#F56498]'
                        }`}
                      >
                        {done && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-medium truncate ${
                            done
                              ? 'line-through text-[#8A7177] dark:text-[#7D717C]'
                              : 'text-[#1F1A1E] dark:text-[#F5EFF3]'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] truncate">
                          {task.subject} · {task.dueLabel}
                        </div>
                      </div>
                    </button>
                    <span
                      className={`text-xs font-semibold shrink-0 capitalize ${
                        task.priority === 'high'
                          ? 'text-[#BA1A1A] dark:text-[#FCA5A5]'
                          : task.priority === 'medium'
                            ? 'text-[#B45309] dark:text-[#FCD34D]'
                            : 'text-[#8A7177] dark:text-[#9D8F99]'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* 4. Bottom Split: Reading Progress (6 cols) + Upcoming Deadlines (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reading Progress */}
        <section className="lg:col-span-6 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Reading Progress
              </h3>
              <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
                {readingBooks.length} volumes actively in progress
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reading')}
              className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer"
            >
              Open Bookshelf →
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {readingBooks.map((book) => {
              const pct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
              return (
                <div key={book.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="truncate">
                      <span className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
                        {book.title}
                      </span>
                      <span className="text-xs text-[#8A7177] dark:text-[#9D8F99]">
                        {' '}
                        · {book.author}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#006948] dark:text-[#6EE7B7] tabular-nums shrink-0">
                      {book.currentPage}/{book.totalPages} p · {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F0E5EB] dark:bg-[#2E2836] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#006948] dark:bg-[#58CD9B] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Deadlines */}
        <section className="lg:col-span-6 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Upcoming Deadlines
              </h3>
              <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
                Critical submissions & exam checkpoints
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] hover:underline cursor-pointer"
            >
              View All ({activeTasks.length}) →
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[#F0E5EB] dark:divide-[#2B2533]">
            {upcomingDeadlines.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5 truncate">
                    {item.subject} · {item.estimatedBlocks} focus blocks est.
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap shrink-0 tabular-nums ${
                    item.priority === 'high'
                      ? 'text-[#BA1A1A] dark:text-[#FCA5A5]'
                      : 'text-[#B45309] dark:text-[#FCD34D]'
                  }`}
                >
                  {item.dueLabel}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. Recent Handwriting Studio Artifacts */}
      <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Recent Handwriting Studio Sheets
            </h3>
            <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
              Click any sheet to reopen and customize in the Text-to-Handwriting studio
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('handwriting')}
            className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer whitespace-nowrap"
          >
            New Sheet →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {artifacts.slice(0, 3).map((art) => (
            <button
              key={art.id}
              type="button"
              onClick={() => onOpenArtifact(art)}
              className="group text-left rounded-xl border border-[#EAE0E5] dark:border-[#312B3A] overflow-hidden hover:border-[#A3265B]/50 dark:hover:border-[#F56498]/50 transition-all cursor-pointer bg-[#FCF1F6]/50 dark:bg-[#221D2A]"
            >
              <div className="h-28 p-4 paper-ruled overflow-hidden relative border-b border-[#EAE0E5] dark:border-[#312B3A]">
                <p
                  className="text-[#1E3A8A] text-lg leading-6 line-clamp-3 select-none"
                  style={{ fontFamily: '"Caveat", cursive' }}
                >
                  {art.text.replace(/^#\s*/, '')}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FEFDFB] to-transparent" />
              </div>
              <div className="p-3.5">
                <div className="text-sm font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] group-hover:text-[#A3265B] dark:group-hover:text-[#FFB1C6] truncate transition-colors">
                  {art.title}
                </div>
                <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
                  {art.subject} · {art.pages} {art.pages === 1 ? 'page' : 'pages'} · {art.updatedAt}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
