import React from 'react';
import { Flame, Menu, Moon, Search, Sun, Timer } from 'lucide-react';
import { SectionId } from '../types';
import { ScholarAvatar } from './BookCoverArt';

interface TopBarProps {
  studentName: string;
  streakDays: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleMobileMenu: () => void;
  onQuickFocus: () => void;
  onOpenProfile: () => void;
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
  globalSearch,
  onGlobalSearchChange,
  activeSection,
  timerRunning,
  timerFormatted,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#FFF8FB]/90 dark:bg-[#121016]/90 backdrop-blur-xl border-b border-[#EAE0E5] dark:border-[#2B2533]">
      <div className="h-full w-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Menu + Single-line Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="hidden lg:flex w-9 h-9 rounded-lg items-center justify-center text-[#574146] hover:text-[#1F1A1E] hover:bg-[#F3E7EE] dark:text-[#C4B7C1] dark:hover:text-[#F5EFF3] dark:hover:bg-[#26212C] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open navigation menu"
            className="flex lg:hidden w-9 h-9 rounded-lg items-center justify-center text-[#574146] hover:text-[#1F1A1E] hover:bg-[#F3E7EE] dark:text-[#C4B7C1] dark:hover:text-[#F5EFF3] dark:hover:bg-[#26212C] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-lg font-bold tracking-tight text-[#006948] dark:text-[#6EE7B7] whitespace-nowrap shrink-0">
            ScholarPulse
          </span>
          <span className="hidden sm:inline text-[#D2C2CD] dark:text-[#3A3344]" aria-hidden="true">
            /
          </span>
          <span className="hidden sm:inline text-sm font-medium text-[#574146] dark:text-[#B5A8B2] whitespace-nowrap">
            {SECTION_TITLES[activeSection]}
          </span>
        </div>

        {/* Zone 2: Search Input */}
        <div className="flex-1 max-w-md hidden md:flex items-center">
          <div className="w-full flex items-center bg-[#FCF1F6] dark:bg-[#1E1A24] border border-[#EAE0E5] dark:border-[#312B3A] px-3.5 py-2 rounded-xl focus-within:border-[#A3265B] dark:focus-within:border-[#F56498] transition-colors">
            <Search className="w-4 h-4 text-[#8A7177] dark:text-[#9D8F99] mr-2.5 shrink-0" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              placeholder="Search tasks, books, notes..."
              aria-label="Search workspace"
              className="w-full bg-transparent border-0 outline-none text-sm text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] dark:placeholder:text-[#847782]"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => onGlobalSearchChange('')}
                className="text-xs text-[#8A7177] hover:text-[#1F1A1E] dark:hover:text-white ml-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Streak + Theme Switch + Focus Action + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#92400E] dark:text-[#FCD34D] tabular-nums whitespace-nowrap"
            title="Active study streak"
          >
            <Flame className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />
            <span>{streakDays}d streak</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#574146] hover:text-[#1F1A1E] hover:bg-[#F3E7EE] dark:text-[#C4B7C1] dark:hover:text-[#F5EFF3] dark:hover:bg-[#26212C] transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <button
            type="button"
            onClick={onQuickFocus}
            className="flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-3.5 py-2 rounded-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            <Timer className="w-4 h-4 shrink-0" />
            <span className="tabular-nums">
              {timerRunning ? `Focus · ${timerFormatted}` : 'Start Focus'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile and preferences"
            className="rounded-full ring-2 ring-transparent hover:ring-[#F56498]/50 transition-all cursor-pointer shrink-0"
          >
            <ScholarAvatar name={studentName} size="md" tone="rose" />
          </button>
        </div>
      </div>
    </header>
  );
};
