import React from 'react';
import { Moon, RotateCcw, Save, Sun } from 'lucide-react';
import { UserPreferences } from '../types';
import { ScholarAvatar } from './BookCoverArt';

interface ProfileSectionProps {
  preferences: UserPreferences;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  totalNotes: number;
  totalHours: number;
  streakDays: number;
  totalPulse: number;
  onResetAllData: () => void;
  onNotify: (msg: string) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  preferences,
  onUpdatePreferences,
  isDark,
  onToggleTheme,
  totalNotes,
  totalHours,
  streakDays,
  totalPulse,
  onResetAllData,
  onNotify,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Top Identity Dossier */}
      <section className="relative overflow-hidden bg-[#FCF1F6] dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 lg:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <ScholarAvatar name={preferences.studentName} size="lg" tone="rose" />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                {preferences.studentName}
              </h1>
              <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-0.5">
                <span className="font-semibold text-[#A3265B] dark:text-[#FFB1C6]">
                  {preferences.handle}
                </span>
                {' · '}
                {preferences.institution}
                {' · '}
                {preferences.major}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#342D3E] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#A3265B]" />}
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#EAE0E5] dark:border-[#2E2837]">
          {[
            { label: 'Focus Logged', value: `${totalHours.toFixed(0)}h` },
            { label: 'Study Notes', value: `${totalNotes}` },
            { label: 'Cognitive Pulse', value: `${totalPulse.toLocaleString()}` },
            { label: 'Active Streak', value: `${streakDays} days` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#322C3C] rounded-xl p-3.5"
            >
              <div className="font-display text-xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Academic Profile
          </h2>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-[#574146] dark:text-[#C4B7C1]">Display Name</span>
              <input
                type="text"
                value={preferences.studentName}
                onChange={(e) => onUpdatePreferences({ studentName: e.target.value })}
                className="bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-[#574146] dark:text-[#C4B7C1]">Major / Program</span>
              <input
                type="text"
                value={preferences.major}
                onChange={(e) => onUpdatePreferences({ major: e.target.value })}
                className="bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-[#574146] dark:text-[#C4B7C1]">Institution</span>
              <input
                type="text"
                value={preferences.institution}
                onChange={(e) => onUpdatePreferences({ institution: e.target.value })}
                className="bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none"
              />
            </label>
          </div>
        </section>

        {/* Study Rhythm Settings */}
        <section className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Study Rhythm Targets
          </h2>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between bg-[#FCF1F6] dark:bg-[#231E2B] px-4 py-2.5 rounded-xl text-xs">
              <span className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">Daily Focus Goal</span>
              <select
                value={preferences.dailyGoalHours}
                onChange={(e) => onUpdatePreferences({ dailyGoalHours: Number(e.target.value) })}
                className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-2.5 py-1 font-mono font-semibold outline-none cursor-pointer"
              >
                {[3, 4, 5, 6, 8].map((h) => (
                  <option key={h} value={h}>
                    {h}.0 hrs
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between bg-[#FCF1F6] dark:bg-[#231E2B] px-4 py-2.5 rounded-xl text-xs">
              <span className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">Default Pomodoro Block</span>
              <select
                value={preferences.defaultFocusMinutes}
                onChange={(e) => onUpdatePreferences({ defaultFocusMinutes: Number(e.target.value) })}
                className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-2.5 py-1 font-mono font-semibold outline-none cursor-pointer"
              >
                {[15, 25, 45, 50].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between bg-[#FCF1F6] dark:bg-[#231E2B] px-4 py-2.5 rounded-xl text-xs">
              <span className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">Annual Reading Goal</span>
              <select
                value={preferences.readingGoalBooks}
                onChange={(e) => onUpdatePreferences({ readingGoalBooks: Number(e.target.value) })}
                className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#342D3E] rounded-lg px-2.5 py-1 font-mono font-semibold outline-none cursor-pointer"
              >
                {[12, 18, 24, 36, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} books
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#1F1A1E] dark:text-[#F5EFF3] font-medium">
                  Auto-save Handwriting Studio drafts
                </span>
                <input
                  type="checkbox"
                  checked={preferences.autoSyncOcr}
                  onChange={(e) => onUpdatePreferences({ autoSyncOcr: e.target.checked })}
                  className="accent-[#006948] w-4 h-4 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#1F1A1E] dark:text-[#F5EFF3] font-medium">
                  Weekly study summary digest
                </span>
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigest}
                  onChange={(e) => onUpdatePreferences({ weeklyDigest: e.target.checked })}
                  className="accent-[#006948] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onResetAllData}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FFDAD6]/70 hover:bg-[#FFDAD6] text-[#93000A] dark:bg-[#4A1C22] dark:text-[#FCA5A5] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Sample Workspace Data
        </button>

        <button
          type="button"
          onClick={() => onNotify('Academic profile & study targets saved.')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#00573B] text-white dark:bg-[#58CD9B] dark:text-[#072116] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
};
