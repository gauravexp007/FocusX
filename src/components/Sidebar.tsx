import React from 'react';
import {
  BarChart3,
  BookOpen,
  Brain,
  CheckSquare,
  Compass,
  LayoutDashboard,
  PenTool,
  SlidersHorizontal,
  Timer,
  X,
} from 'lucide-react';
import { SectionId, UserPreferences } from '../types';

interface SidebarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  preferences: UserPreferences;
  pendingTaskCount: number;
  timerRunning: boolean;
}

const NAV_ITEMS: Array<{
  id: SectionId;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { id: 'focus', label: 'Focus Mode', shortLabel: 'Focus', icon: Timer },
  { id: 'analytics', label: 'Study Analytics', shortLabel: 'Analytics', icon: BarChart3 },
  { id: 'tasks', label: 'Task Manager', shortLabel: 'Tasks', icon: CheckSquare },
  { id: 'reading', label: 'Reading Tracker', shortLabel: 'Reading', icon: BookOpen },
  { id: 'notes', label: 'Notes Explorer', shortLabel: 'Notes', icon: Compass },
  { id: 'handwriting', label: 'Text to Handwriting', shortLabel: 'Handwriting', icon: PenTool },
  { id: 'games', label: 'Mind & Logic Games', shortLabel: 'Mind Games', icon: Brain },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  collapsed,
  mobileOpen,
  onCloseMobile,
  preferences,
  pendingTaskCount,
  timerRunning,
}) => {
  const termPct = Math.min(100, Math.round((preferences.termWeek / preferences.termTotalWeeks) * 100));

  const renderNavContent = (isCompact: boolean) => (
    <div className="flex flex-col justify-between h-full py-5 px-3">
      <div className="flex flex-col gap-1">
        {!isCompact && (
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#8A7177] dark:text-[#9D8F99]">
            Workspace
          </div>
        )}
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                title={isCompact ? item.label : undefined}
                className={`group flex items-center ${
                  isCompact ? 'justify-center px-2' : 'justify-between px-3.5'
                } py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3265B] ${
                  active
                    ? 'bg-[#FFB9F9] text-[#3B1837] font-semibold shadow-xs dark:bg-[#F56498] dark:text-[#1A0814]'
                    : 'text-[#574146] hover:bg-[#F3E7EE] hover:text-[#1F1A1E] dark:text-[#C4B7C1] dark:hover:bg-[#26212C] dark:hover:text-[#F5EFF3]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-transform duration-150 ${
                      active ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  />
                  {!isCompact && <span className="truncate">{item.label}</span>}
                </span>

                {!isCompact && item.id === 'tasks' && pendingTaskCount > 0 && (
                  <span
                    className={`text-[11px] font-mono tabular-nums font-semibold ${
                      active ? 'text-[#3B1837] dark:text-[#1A0814]' : 'text-[#8A7177] dark:text-[#9D8F99]'
                    }`}
                  >
                    {pendingTaskCount}
                  </span>
                )}
                {!isCompact && item.id === 'focus' && timerRunning && (
                  <span className="text-[11px] font-mono font-semibold text-[#006948] dark:text-[#6EE7B7]">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Term Progress + Preferences */}
      <div className="flex flex-col gap-3 pt-4 border-t border-[#EAE0E5] dark:border-[#2C2634]">
        {!isCompact && (
          <div className="bg-white dark:bg-[#1E1A24] border border-[#EAE0E5] dark:border-[#312B3A] p-3.5 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A7177] dark:text-[#9D8F99] font-medium">Semester Term</span>
              <span className="font-mono font-semibold text-[#006948] dark:text-[#6EE7B7]">
                {preferences.termLabel}
              </span>
            </div>
            <div className="w-full bg-[#F0E5EB] dark:bg-[#2E2836] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#006948] dark:bg-[#58CD9B] h-full rounded-full transition-all duration-500"
                style={{ width: `${termPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs tabular-nums">
              <span className="text-[#574146] dark:text-[#B5A8B2]">
                Week {preferences.termWeek} of {preferences.termTotalWeeks}
              </span>
              <span className="font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">{termPct}%</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            onSelectSection('profile');
            onCloseMobile();
          }}
          title={isCompact ? 'Profile & Preferences' : undefined}
          className={`flex items-center ${
            isCompact ? 'justify-center px-2' : 'gap-2.5 px-3.5'
          } py-2.5 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'profile'
              ? 'bg-[#F3E7EE] text-[#1F1A1E] font-semibold dark:bg-[#2A2432] dark:text-[#F5EFF3]'
              : 'text-[#574146] hover:bg-[#F3E7EE] hover:text-[#1F1A1E] dark:text-[#B5A8B2] dark:hover:bg-[#26212C] dark:hover:text-[#F5EFF3]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          {!isCompact && <span>Preferences</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-30 bg-[#FCF1F6] dark:bg-[#17141C] border-r border-[#EAE0E5] dark:border-[#2B2533] transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderNavContent(collapsed)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#FCF1F6] dark:bg-[#17141C] border-r border-[#EAE0E5] dark:border-[#2B2533] flex flex-col shadow-xl z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#EAE0E5] dark:border-[#2B2533]">
              <span className="font-display text-lg font-bold text-[#006948] dark:text-[#6EE7B7] tracking-tight">
                ScholarPulse
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#574146] dark:text-[#C4B7C1] hover:bg-[#F0E5EB] dark:hover:bg-[#26212C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderNavContent(false)}</div>
          </aside>
        </div>
      )}
    </>
  );
};
