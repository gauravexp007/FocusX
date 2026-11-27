import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
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
import {
  AudioWaveBars,
  FLOW_EASE,
  FLOW_SPRING,
  flowItem,
  SegmentedControl,
  staggerContainer,
} from './MotionPrimitives';
import { GsapMagneticButton, GsapSplitHeading } from '../utils/gsapMotion';

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 lg:gap-8"
    >
      {/* 1. Personalized Welcome Banner & Daily Focus Goal */}
      <motion.section
        variants={flowItem}
        className="relative overflow-hidden rounded-3xl fx-surface-tinted p-6 lg:p-8"
      >
        <div className="absolute -right-14 -top-16 w-72 h-72 rounded-full bg-[#FFB9F9]/25 dark:bg-[#F56498]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-44 -bottom-24 w-64 h-64 rounded-full bg-[#BAE8FF]/30 dark:bg-[#38BDF8]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#574146] dark:text-[#B5A8B2]">
              <span className="inline-flex items-center gap-1 font-semibold text-[#92400E] dark:text-[#FCD34D]">
                <Flame className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" />
                {streakDays}-Day Study Streak
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Term {preferences.termLabel} · Week {preferences.termWeek}
              </span>
            </div>

            <GsapSplitHeading
              as="h1"
              text={`Welcome back, ${firstName}`}
              highlightLastWord
              className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tracking-tight leading-tight"
            />
            <p className="text-sm text-[#574146] dark:text-[#C4B7C1] leading-relaxed">
              You have completed{' '}
              <strong className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                {dailyPct}%
              </strong>{' '}
              of today’s focus goal with{' '}
              <strong className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                {activeTasks.length}
              </strong>{' '}
              academic tasks on deck in FocusX.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <GsapMagneticButton
                type="button"
                onClick={onStartQuickPomodoro}
                className="inline-flex items-center gap-2 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Pomodoro ({preferences.defaultFocusMinutes}m)
              </GsapMagneticButton>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-2 bg-white/90 dark:bg-[#25202D] hover:bg-[#F6EBF1] dark:hover:bg-[#2F2939] text-[#1F1A1E] dark:text-[#F5EFF3] border border-[#EAE0E5] dark:border-[#363041] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Review Task Queue
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Animated Radial Target Dial */}
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('analytics')}
            className="text-left flex items-center gap-5 bg-white/95 dark:bg-[#221D2A]/95 border border-[#EAE0E5] dark:border-[#322C3C] p-4 rounded-2xl self-start lg:self-center shadow-xs hover:border-[#F56498]/50 transition-colors cursor-pointer"
          >
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
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={radialCircumference}
                  initial={{ strokeDashoffset: radialCircumference }}
                  animate={{ strokeDashoffset: radialOffset }}
                  transition={{ duration: 0.9, ease: FLOW_EASE }}
                  className="text-[#F56498] dark:text-[#FFB1C6]"
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
          </motion.button>
        </div>
      </motion.section>

      {/* 2. Academic Vitals (7 cols) + Quick Actions (5 cols) */}
      <motion.div variants={flowItem} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Academic Vitals 2x2 */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Academic Vitals
            </h2>
            <SegmentedControl
              layoutId="overview-vitals-range"
              variant="rose"
              value={vitalsRange}
              onChange={setVitalsRange}
              options={[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              {
                label: 'Study Time',
                value: studyTimeValue,
                sub: '+14% vs prior period',
                cta: 'View full analytics',
                icon: Clock,
                accent: 'text-[#006948] dark:text-[#6EE7B7]',
                hoverBorder: 'hover:border-[#006948]/50 dark:hover:border-[#6EE7B7]/40',
                target: 'analytics' as SectionId,
                animKey: `${vitalsRange}-${studyTimeValue}`,
              },
              {
                label: 'Study Notes',
                value: `${notes.length + artifacts.length} files`,
                sub: `${notes.filter((n) => n.saved).length} saved guides · ${artifacts.length} sheets`,
                cta: 'Browse library',
                icon: FileText,
                accent: 'text-[#006782] dark:text-[#7DD3FC]',
                hoverBorder: 'hover:border-[#006782]/50 dark:hover:border-[#7DD3FC]/40',
                target: 'notes' as SectionId,
                animKey: `notes-${notes.length + artifacts.length}`,
              },
              {
                label: 'Reading Bookshelf',
                value: `${finishedBooksCount} finished`,
                sub: `${readingBooks.length} currently reading`,
                cta: `Goal: ${preferences.readingGoalBooks} books/yr`,
                icon: BookOpen,
                accent: 'text-[#B45309] dark:text-[#FBBF24]',
                hoverBorder: 'hover:border-[#B45309]/50 dark:hover:border-[#FBBF24]/40',
                target: 'reading' as SectionId,
                animKey: `books-${finishedBooksCount}`,
              },
              {
                label: 'Task Completion',
                value: `${completedTasks.length} / ${tasks.length}`,
                sub: `${activeTasks.filter((t) => t.priority === 'high').length} high-priority open`,
                cta: 'Open task board',
                icon: Sparkles,
                accent: 'text-[#A3265B] dark:text-[#F56498]',
                hoverBorder: 'hover:border-[#A3265B]/50 dark:hover:border-[#F56498]/40',
                target: 'tasks' as SectionId,
                animKey: `tasks-${completedTasks.length}`,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.label}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  transition={FLOW_SPRING}
                  onClick={() => onNavigate(card.target)}
                  className={`group text-left fx-card ${card.hoverBorder} rounded-2xl p-5 flex flex-col justify-between transition-colors cursor-pointer`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-[#574146] dark:text-[#B5A8B2]">
                    <span>{card.label}</span>
                    <Icon className={`w-4 h-4 ${card.accent} transition-transform duration-200 group-hover:scale-110`} />
                  </div>
                  <div className="my-2.5">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={card.animKey}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16, ease: FLOW_EASE }}
                        className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums"
                      >
                        {card.value}
                      </motion.div>
                    </AnimatePresence>
                    <p className={`text-xs ${card.accent} font-medium mt-1`}>{card.sub}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8A7177] dark:text-[#9D8F99] pt-2.5 border-t border-[#F0E5EB] dark:border-[#2B2533]">
                    <span>{card.cta}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions 2x2 */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Quick Actions
            </h2>
            <span className="text-xs text-[#8A7177] dark:text-[#9D8F99]">Jump to studio</span>
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
                <motion.button
                  key={action.label}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  transition={FLOW_SPRING}
                  onClick={() => onNavigate(action.target)}
                  className="group fx-card hover:border-[#A3265B]/45 dark:hover:border-[#F56498]/45 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} text-white flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-108 group-hover:-rotate-3`}
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
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 3. Interactive Live Focus Studio (5 cols) + Weekly Chart & To-Do List (7 cols) */}
      <motion.div variants={flowItem} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Live Focus Studio */}
        <section className="lg:col-span-5 fx-surface-tinted rounded-2xl p-6 flex flex-col justify-between gap-5">
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

          {/* Circular Timer Face with Active Halo */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-52 h-52 flex items-center justify-center">
              {timerRunning && (
                <motion.div
                  animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute inset-0 rounded-full blur-xl pointer-events-none ${
                    timerMode === 'focus'
                      ? 'bg-[#F56498]/30 dark:bg-[#F56498]/25'
                      : 'bg-[#006948]/30 dark:bg-[#58CD9B]/25'
                  }`}
                />
              )}
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
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-3">
              <motion.button
                type="button"
                whileHover={{ rotate: -25 }}
                whileTap={{ scale: 0.9 }}
                onClick={onResetTimer}
                aria-label="Reset timer"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#363041] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={onToggleTimer}
                className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{timerRunning ? 'Pause Focus' : 'Start Focus'}</span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={onSkipTimer}
                aria-label="Switch interval"
                title="Switch between Focus and Break"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#363041] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </motion.button>
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
                    <motion.button
                      key={subj}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onSelectSubject(subj)}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'text-white dark:text-[#072116] font-semibold'
                          : 'bg-white dark:bg-[#25202D] text-[#574146] dark:text-[#C4B7C1] border border-[#EAE0E5] dark:border-[#363041] hover:text-[#1F1A1E] dark:hover:text-white'
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="overview-subject-chip"
                          transition={FLOW_SPRING}
                          className="absolute inset-0 rounded-lg bg-[#006948] dark:bg-[#58CD9B]"
                        />
                      )}
                      <span className="relative z-10">{subj}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Soundscape chooser */}
            <div className="flex items-center justify-between bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] px-3.5 py-2.5 rounded-xl">
              <span className="flex items-center gap-2 text-xs text-[#574146] dark:text-[#C4B7C1]">
                <Headphones className="w-4 h-4 text-[#006782] dark:text-[#7DD3FC]" />
                <span>Soundscape</span>
                <AudioWaveBars active={soundscape !== 'muted'} className="ml-1" />
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
          <section className="fx-card rounded-2xl p-6 flex flex-col gap-4">
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
                    cursor={{ fill: 'rgba(245, 100, 152, 0.08)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #EAE0E5',
                      fontSize: '12px',
                      backgroundColor: 'rgba(255,255,255,0.96)',
                      color: '#1F1A1E',
                    }}
                    formatter={(val) => [`${Number(val ?? 0).toFixed(1)} hrs`, 'Study Time']}
                  />
                  <Bar dataKey="hours" radius={[8, 8, 4, 4]} maxBarSize={36} animationDuration={650}>
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
          <section className="fx-card rounded-2xl p-6 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                  Priority Study Checklist
                </h2>
                <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5 tabular-nums">
                  {activeTasks.length} pending · {completedTasks.length} completed today
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Manage Tasks
              </motion.button>
            </div>

            <div className="flex flex-col divide-y divide-[#F0E5EB] dark:divide-[#2B2533]">
              {tasks.slice(0, 4).map((task) => {
                const done = task.status === 'done';
                return (
                  <motion.div
                    layout
                    key={task.id}
                    className="py-2.5 flex items-center justify-between gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <motion.span
                        whileTap={{ scale: 0.85 }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors border ${
                          done
                            ? 'bg-[#006948] border-[#006948] text-white dark:bg-[#58CD9B] dark:border-[#58CD9B] dark:text-[#072116]'
                            : 'border-[#C9B8C2] dark:border-[#4A4154] group-hover:border-[#A3265B] dark:group-hover:border-[#F56498]'
                        }`}
                      >
                        <AnimatePresence>
                          {done && (
                            <motion.span
                              initial={{ scale: 0, rotate: -20 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={FLOW_SPRING}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-medium truncate transition-colors ${
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
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </motion.div>

      {/* 4. Bottom Split: Reading Progress (6 cols) + Upcoming Deadlines (6 cols) */}
      <motion.div variants={flowItem} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reading Progress */}
        <section className="lg:col-span-6 fx-card rounded-2xl p-6 flex flex-col gap-4">
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
              const total = Math.max(1, book.totalPages);
              const read = Math.max(0, Math.min(total, book.currentPage || 0));
              const exactFrac = read / total;
              const rawPct = exactFrac * 100;
              const pctLabel =
                rawPct === 0 || rawPct === 100 ? `${Math.round(rawPct)}%` : `${Number(rawPct.toFixed(1))}%`;
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
                      {read}/{total} p · {pctLabel}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F0E5EB] dark:bg-[#2E2836] overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: exactFrac }}
                      transition={{ duration: 0.75, ease: FLOW_EASE }}
                      style={{ transformOrigin: 'left' }}
                      className="h-full w-full rounded-full bg-[#006948] dark:bg-[#58CD9B]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Deadlines */}
        <section className="lg:col-span-6 fx-card rounded-2xl p-6 flex flex-col gap-4">
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
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate('tasks')}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-left group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] group-hover:text-[#A3265B] dark:group-hover:text-[#FFB1C6] transition-colors truncate">
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
              </button>
            ))}
          </div>
        </section>
      </motion.div>

      {/* 5. Recent Handwriting Studio Artifacts */}
      <motion.section variants={flowItem} className="fx-card rounded-2xl p-6 flex flex-col gap-4">
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
            <motion.button
              key={art.id}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              transition={FLOW_SPRING}
              onClick={() => onOpenArtifact(art)}
              className="group text-left rounded-xl border border-[#EAE0E5] dark:border-[#312B3A] overflow-hidden hover:border-[#A3265B]/50 dark:hover:border-[#F56498]/50 transition-colors cursor-pointer bg-[#FCF1F6]/50 dark:bg-[#221D2A]"
            >
              <div className="h-28 p-4 paper-ruled overflow-hidden relative border-b border-[#EAE0E5] dark:border-[#312B3A]">
                <p
                  className="text-[#1E3A8A] text-lg leading-6 line-clamp-3 select-none transition-transform duration-200 group-hover:scale-[1.02]"
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
            </motion.button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};
