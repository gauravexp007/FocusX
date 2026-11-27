import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Command, Flame, Menu, Moon, Search, Sun, Timer } from 'lucide-react';
import { SectionId } from '../types';
import { ScholarAvatar } from './BookCoverArt';
import { FLOW_EASE, FLOW_SPRING, FocusXMark } from './MotionPrimitives';

interface TopBarProps {
  studentName: string;
  streakDays: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleMobileMenu: () => void;
  onQuickFocus: () => void;
  onOpenProfile: () => void;
  onOpenCommandPalette: () => void;
  onGoHome: () => void;
  globalSearch: string;
  onGlobalSearchChange: (q: string) => void;
  activeSection: SectionId;
  timerRunning: boolean;
  timerFormatted: string;
}

const SECTION_TITLES: Record<SectionId, string> = {
  overview: 'Overview',
  focus: 'Focus Mode',
  analytics: 'Study Analytics',
  tasks: 'Task Manager',
  reading: 'Reading Tracker',
  notes: 'Notes Explorer',
  handwriting: 'Text to Handwriting',
  games: 'Mind & Logic Games',
  profile: 'Profile & Preferences',
};

export const TopBar: React.FC<TopBarProps> = ({
  studentName,
  streakDays,
  isDark,
  onToggleTheme,
  onToggleSidebar,
  onToggleMobileMenu,
  onQuickFocus,
  onOpenProfile,
  onOpenCommandPalette,
  onGoHome,
  globalSearch,
  onGlobalSearchChange,
  activeSection,
  timerRunning,
  timerFormatted,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#FFF8FB]/85 dark:bg-[#110E15]/85 backdrop-blur-xl border-b border-[#EAE0E5]/90 dark:border-[#2B2533]/90">
      <div className="h-full w-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Menu + FocusX Emblem & Animated Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="hidden lg:flex w-9 h-9 rounded-xl items-center justify-center text-[#574146] hover:text-[#1F1A1E] hover:bg-[#F3E7EE] dark:text-[#C4B7C1] dark:hover:text-[#F5EFF3] dark:hover:bg-[#26212C] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={onToggleMobileMenu}
            aria-label="Open navigation menu"
            className="flex lg:hidden w-9 h-9 rounded-xl items-center justify-center text-[#574146] hover:text-[#1F1A1E] hover:bg-[#F3E7EE] dark:text-[#C4B7C1] dark:hover:text-[#F5EFF3] dark:hover:bg-[#26212C] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          <button
            type="button"
            onClick={onGoHome}
            className="group flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3265B] rounded-lg"
          >
            <motion.span whileHover={{ rotate: -6, scale: 1.05 }} transition={FLOW_SPRING}>
              <FocusXMark className="w-7 h-7" />
            </motion.span>
            <span className="font-display text-lg font-bold tracking-tight text-[#1F1A1E] dark:text-[#F5EFF3]">
              Focus<span className="text-[#006948] dark:text-[#6EE7B7]">X</span>
            </span>
          </button>

          <span className="hidden sm:inline text-[#D2C2CD] dark:text-[#3A3344]" aria-hidden="true">
            /
          </span>

          <div className="hidden sm:flex items-center overflow-hidden h-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: FLOW_EASE }}
                className="text-sm font-medium text-[#574146] dark:text-[#B5A8B2] whitespace-nowrap"
              >
                {SECTION_TITLES[activeSection]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Zone 2: Interactive Search & Command Palette Launcher */}
        <div className="flex-1 max-w-md hidden md:flex items-center">
          <div className="w-full flex items-center bg-[#FCF1F6]/90 dark:bg-[#1E1A24]/90 border border-[#EAE0E5] dark:border-[#312B3A] px-3.5 py-2 rounded-xl focus-within:border-[#A3265B] dark:focus-within:border-[#F56498] focus-within:shadow-[0_0_0_3px_rgba(245,100,152,0.12)] transition-all">
            <Search className="w-4 h-4 text-[#8A7177] dark:text-[#9D8F99] mr-2.5 shrink-0" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              placeholder="Search tasks, books, notes..."
              aria-label="Search workspace"
              className="w-full bg-transparent border-0 outline-none text-sm text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] dark:placeholder:text-[#847782]"
            />
            {globalSearch ? (
              <button
                type="button"
                onClick={() => onGlobalSearchChange('')}
                className="text-xs text-[#8A7177] hover:text-[#1F1A1E] dark:hover:text-white ml-2 cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                title="Open Quick Command Palette"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A7177] hover:text-[#1F1A1E] dark:text-[#9D8F99] dark:hover:text-white bg-white dark:bg-[#282233] border border-[#EAE0E5] dark:border-[#383145] px-1.5 py-0.5 rounded-md cursor-pointer shrink-0 transition-colors"
              >
                <Command className="w-3 h-3" />
                <span>K</span>
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Streak + Animated Theme Switch + Focus CTA + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#92400E] dark:text-[#FCD34D] tabular-nums whitespace-nowrap"
            title="Active study streak"
          >
            <Flame className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />
            <span>{streakDays}d streak</span>
          </div>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open quick command palette"
            className="flex md:hidden w-9 h-9 rounded-xl items-center justify-center text-[#574146] hover:bg-[#F3E7EE] dark:text-[#C4B7C1] dark:hover:bg-[#26212C] transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#574146] hover:text-[#1F1A1E] hover:bg-[#F3E7EE] dark:text-[#C4B7C1] dark:hover:text-[#F5EFF3] dark:hover:bg-[#26212C] transition-colors cursor-pointer overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.16, ease: FLOW_EASE }}
                className="flex items-center justify-center"
              >
                {isDark ? <Sun className="w-[18px] h-[18px] text-amber-300" /> : <Moon className="w-[18px] h-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onQuickFocus}
            className="flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            <Timer className="w-4 h-4 shrink-0" />
            <span className="tabular-nums">
              {timerRunning ? `Focus · ${timerFormatted}` : 'Start Focus'}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenProfile}
            aria-label="Open profile and preferences"
            className="rounded-full ring-2 ring-transparent hover:ring-[#F56498]/50 transition-all cursor-pointer shrink-0"
          >
            <ScholarAvatar name={studentName} size="md" tone="rose" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
