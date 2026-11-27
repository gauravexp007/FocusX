import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Headphones,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AcademicTask, FocusSessionLog, SoundscapeId } from '../types';
import {
  AudioWaveBars,
  FLOW_SPRING,
  flowItem,
  staggerContainer,
} from './MotionPrimitives';

interface FocusModeSectionProps {
  timerSecondsLeft: number;
  timerTotalSeconds: number;
  timerRunning: boolean;
  timerMode: 'focus' | 'break';
  timerSubject: string;
  linkedTaskId: string | null;
  soundscape: SoundscapeId;
  volume: number;
  tasks: AcademicTask[];
  focusLogs: FocusSessionLog[];
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onSetPreset: (minutes: number, mode: 'focus' | 'break') => void;
  onSelectSubject: (subject: string) => void;
  onSelectLinkedTask: (taskId: string | null) => void;
  onSelectSoundscape: (sound: SoundscapeId) => void;
  onChangeVolume: (vol: number) => void;
  onLogCurrentSession: () => void;
}

const PRESETS: Array<{ id: string; label: string; minutes: number; mode: 'focus' | 'break' }> = [
  { id: '15-focus', label: 'Quick Sprint (15m)', minutes: 15, mode: 'focus' },
  { id: '25-focus', label: 'Pomodoro (25m)', minutes: 25, mode: 'focus' },
  { id: '50-focus', label: 'Deep Flow (50m)', minutes: 50, mode: 'focus' },
  { id: '5-break', label: 'Short Break (5m)', minutes: 5, mode: 'break' },
  { id: '15-break', label: 'Long Break (15m)', minutes: 15, mode: 'break' },
];

const SOUNDS: Array<{ id: SoundscapeId; label: string; desc: string }> = [
  { id: 'rain', label: 'Library Rain', desc: 'Gentle filtered rain cadence' },
  { id: 'brown', label: 'Warm Brown Noise', desc: 'Deep acoustic masking' },
  { id: 'binaural', label: '40Hz Binaural Focus', desc: 'Gamma wave sine harmony' },
  { id: 'cafe', label: 'Quiet Study Room', desc: 'Soft ambient room warmth' },
  { id: 'muted', label: 'Audio Muted', desc: 'Complete silence' },
];

const DEFAULT_SUBJECTS = [
  'Organic Chemistry',
  'Calculus II',
  'Cognitive Psych',
  'Algorithms',
  'Neurobiology',
  'Macroeconomics',
];

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const FocusModeSection: React.FC<FocusModeSectionProps> = ({
  timerSecondsLeft,
  timerTotalSeconds,
  timerRunning,
  timerMode,
  timerSubject,
  linkedTaskId,
  soundscape,
  volume,
  tasks,
  focusLogs,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onSetPreset,
  onSelectSubject,
  onSelectLinkedTask,
  onSelectSoundscape,
  onChangeVolume,
  onLogCurrentSession,
}) => {
  const [customSubjects, setCustomSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [newSubject, setNewSubject] = useState('');
  const [zenMode, setZenMode] = useState(false);

  const circumference = 2 * Math.PI * 44;
  const elapsedFraction = timerTotalSeconds > 0 ? 1 - timerSecondsLeft / timerTotalSeconds : 0;
  const ringOffset = Math.max(0, Math.min(circumference, elapsedFraction * circumference));

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const linkedTask = tasks.find((t) => t.id === linkedTaskId) || null;

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubject.trim();
    if (!trimmed) return;
    if (!customSubjects.includes(trimmed)) {
      setCustomSubjects((prev) => [...prev, trimmed]);
    }
    onSelectSubject(trimmed);
    setNewSubject('');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={
        zenMode
          ? 'fixed inset-0 z-50 focusx-canvas p-6 lg:p-12 overflow-y-auto flex flex-col justify-center gap-6'
          : 'flex flex-col gap-6'
      }
    >
      {/* Header */}
      <motion.div variants={flowItem} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Focus Mode Studio
          </h1>
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1">
            Structured deep work sessions with synthesized ambient soundscapes and automatic analytics logging.
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setZenMode((z) => !z)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold fx-card text-[#1F1A1E] dark:text-[#F5EFF3] hover:border-[#A3265B]/50 transition-colors cursor-pointer whitespace-nowrap"
        >
          {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{zenMode ? 'Exit Zen View' : 'Zen Distraction-Free'}</span>
        </motion.button>
      </motion.div>

      {/* Main Split */}
      <motion.div variants={flowItem} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left/Center Timer Instrument (7 cols) */}
        <section className="xl:col-span-7 fx-surface-tinted rounded-3xl p-6 lg:p-8 flex flex-col items-center gap-6">
          {/* Preset Mode Switcher with shared layoutId */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-[#221D2A]/80 border border-[#EAE0E5] dark:border-[#322C3C]">
            {PRESETS.map((preset) => {
              const isCurrent =
                timerMode === preset.mode && Math.round(timerTotalSeconds / 60) === preset.minutes;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSetPreset(preset.minutes, preset.mode)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#3B1837] dark:text-[#1A0814]'
                      : 'text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white'
                  }`}
                >
                  {isCurrent && (
                    <motion.span
                      layoutId="focus-preset-pill"
                      transition={FLOW_SPRING}
                      className="absolute inset-0 rounded-xl bg-[#FFB9F9] dark:bg-[#F56498] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Big Animated Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-1">
            {timerRunning && (
              <motion.div
                animate={{ scale: [1, 1.07, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute inset-0 rounded-full blur-2xl pointer-events-none ${
                  timerMode === 'focus'
                    ? 'bg-[#F56498]/35 dark:bg-[#F56498]/25'
                    : 'bg-[#006948]/35 dark:bg-[#58CD9B]/25'
                }`}
              />
            )}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#342D3E] flex items-center justify-center shadow-md">
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-3" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-[#F0E5EB] dark:text-[#332C3D]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  className={`transition-all duration-700 ease-linear ${
                    timerMode === 'focus'
                      ? 'text-[#F56498] dark:text-[#FFB1C6]'
                      : 'text-[#006948] dark:text-[#6EE7B7]'
                  }`}
                />
              </svg>
              <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">
                <span className="text-xs font-semibold text-[#8A7177] dark:text-[#9D8F99] mb-1">
                  {timerMode === 'focus' ? timerSubject : 'Break Interval'}
                </span>
                <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                  {formatClock(timerSecondsLeft)}
                </span>
                {linkedTask && (
                  <span className="text-xs text-[#006948] dark:text-[#6EE7B7] font-medium mt-2 line-clamp-1 max-w-[190px]">
                    {linkedTask.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <motion.button
              type="button"
              whileHover={{ rotate: -25 }}
              whileTap={{ scale: 0.9 }}
              onClick={onResetTimer}
              className="w-11 h-11 rounded-full bg-white dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#363041] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onToggleTimer}
              className="min-w-[180px] flex items-center justify-center gap-2 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] font-semibold text-sm py-3 px-6 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{timerRunning ? 'Pause Session' : timerMode === 'focus' ? 'Start Focus' : 'Start Break'}</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={onSkipTimer}
              className="w-11 h-11 rounded-full bg-white dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#363041] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Switch to next mode"
            >
              <SkipForward className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onLogCurrentSession}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#00573B] text-white dark:bg-[#58CD9B] dark:hover:bg-[#6EE7B7] dark:text-[#072116] transition-colors cursor-pointer whitespace-nowrap"
              title="Complete and record this focus block to your analytics"
            >
              <CheckCircle2 className="w-4 h-4" />
              Log Completed Block
            </motion.button>
          </div>

          {/* Custom Duration Slider */}
          <div className="w-full max-w-md pt-3 border-t border-[#EAE0E5] dark:border-[#2E2837] flex items-center justify-between gap-4">
            <label htmlFor="custom-focus-slider" className="text-xs font-medium text-[#574146] dark:text-[#B5A8B2] whitespace-nowrap">
              Custom Duration
            </label>
            <input
              id="custom-focus-slider"
              type="range"
              min={5}
              max={90}
              step={5}
              value={Math.max(5, Math.round(timerTotalSeconds / 60))}
              onChange={(e) => onSetPreset(Number(e.target.value), timerMode)}
              className="flex-1 accent-[#A3265B] dark:accent-[#F56498] cursor-pointer"
            />
            <span className="font-mono text-xs font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums w-12 text-right">
              {Math.round(timerTotalSeconds / 60)} min
            </span>
          </div>
        </section>

        {/* Right Controls: Subject, Linked Task, Soundscapes, Recent Logs (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          {/* Coursework Subject & Linked Task */}
          <section className="fx-card rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Session Context
            </h2>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#8A7177] dark:text-[#9D8F99]">
                Active Coursework Subject
              </span>
              <div className="flex flex-wrap gap-1.5">
                {customSubjects.map((subj) => {
                  const active = timerSubject === subj;
                  return (
                    <motion.button
                      key={subj}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onSelectSubject(subj)}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'text-white dark:text-[#072116] font-semibold'
                          : 'bg-[#FCF1F6] dark:bg-[#25202D] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="focus-subject-chip"
                          transition={FLOW_SPRING}
                          className="absolute inset-0 rounded-lg bg-[#006948] dark:bg-[#58CD9B]"
                        />
                      )}
                      <span className="relative z-10">{subj}</span>
                    </motion.button>
                  );
                })}
              </div>

              <form onSubmit={handleAddSubject} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add custom subject..."
                  className="flex-1 bg-[#FCF1F6] dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-3 py-1.5 text-xs text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] outline-none focus:border-[#A3265B]"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F3E7EE] dark:bg-[#2A2432] text-[#1F1A1E] dark:text-[#F5EFF3] hover:bg-[#EAE0E5] dark:hover:bg-[#352E3F] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </motion.button>
              </form>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533]">
              <label htmlFor="linked-task-select" className="text-xs font-medium text-[#8A7177] dark:text-[#9D8F99]">
                Link to Academic Task
              </label>
              <select
                id="linked-task-select"
                value={linkedTaskId || ''}
                onChange={(e) => onSelectLinkedTask(e.target.value || null)}
                className="w-full bg-[#FCF1F6] dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3 py-2 text-xs font-medium text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
              >
                <option value="">No specific task linked</option>
                {openTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.subject})
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Ambient Soundscapes with live wave bars */}
          <section className="fx-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3] flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#006782] dark:text-[#7DD3FC]" />
                Ambient Soundscapes
              </h2>
              <span className="text-xs text-[#8A7177] dark:text-[#9D8F99]">Web Audio Synth</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOUNDS.map((s) => {
                const active = soundscape === s.id;
                const playing = active && s.id !== 'muted';
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectSoundscape(s.id)}
                    className={`text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                      active
                        ? 'bg-[#FCF1F6] dark:bg-[#291E2D] border-[#A3265B] dark:border-[#F56498]'
                        : 'bg-transparent border-[#EAE0E5] dark:border-[#312B3A] hover:bg-[#FCF1F6]/60 dark:hover:bg-[#221D2A]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
                        {s.label}
                      </div>
                      <div className="text-[11px] text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
                        {s.desc}
                      </div>
                    </div>
                    <AudioWaveBars active={playing} className="mt-1 shrink-0" />
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-1">
              {soundscape === 'muted' || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-[#8A7177]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#006948] dark:text-[#6EE7B7]" />
              )}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                aria-label="Ambient volume"
                className="flex-1 accent-[#006948] dark:accent-[#58CD9B] cursor-pointer"
              />
              <span className="text-xs font-mono tabular-nums text-[#574146] dark:text-[#B5A8B2] w-9 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </section>

          {/* Recent Completed Sessions */}
          {!zenMode && (
            <section className="fx-card rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                  Recent Sessions
                </h2>
                <span className="text-xs font-mono tabular-nums text-[#8A7177] dark:text-[#9D8F99]">
                  {focusLogs.length} total
                </span>
              </div>
              <div className="flex flex-col divide-y divide-[#F0E5EB] dark:divide-[#2B2533] max-h-48 overflow-y-auto">
                {focusLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] truncate">
                        {log.subject}
                      </div>
                      <div className="text-[#8A7177] dark:text-[#9D8F99] truncate">
                        {log.taskTitle ? `${log.taskTitle} · ` : ''}
                        {log.completedAt}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#006948] dark:text-[#6EE7B7] tabular-nums shrink-0">
                      <Clock className="w-3 h-3" />
                      {log.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
