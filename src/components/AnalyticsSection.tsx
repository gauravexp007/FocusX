import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, Clock, Flame, TrendingUp } from 'lucide-react';
import { CONSISTENCY_HEATMAP, WEEKLY_TREND_DATA } from '../data/initialData';
import { FocusSessionLog, UserPreferences } from '../types';

interface AnalyticsSectionProps {
  focusLogs: FocusSessionLog[];
  weeklyChartData: Array<{ day: string; hours: number; isToday?: boolean }>;
  preferences: UserPreferences;
  streakDays: number;
  todayHours: number;
}

const SUBJECT_COLORS = ['#006948', '#F56498', '#006782', '#D97706', '#7C3AED', '#0D9488'];

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  focusLogs,
  weeklyChartData,
  preferences,
  streakDays,
  todayHours,
}) => {
  const [chartWindow, setChartWindow] = useState<'week' | 'fortnight'>('week');
  const [hoveredHeatDay, setHoveredHeatDay] = useState<{ date: string; hours: number } | null>(null);

  const weeklyTotal = weeklyChartData.reduce((acc, d) => acc + d.hours, 0);
  const activeDays = weeklyChartData.filter((d) => d.hours > 0).length || 1;
  const dailyAverage = weeklyTotal / activeDays;

  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, { minutes: number; sessions: number }>();
    focusLogs.forEach((log) => {
      const prev = map.get(log.subject) || { minutes: 0, sessions: 0 };
      map.set(log.subject, {
        minutes: prev.minutes + log.durationMinutes,
        sessions: prev.sessions + 1,
      });
    });
    const totalMinutes = Array.from(map.values()).reduce((a, b) => a + b.minutes, 0) || 1;
    return Array.from(map.entries())
      .map(([name, val], idx) => ({
        name,
        hours: Number((val.minutes / 60).toFixed(1)),
        sessions: val.sessions,
        share: Math.round((val.minutes / totalMinutes) * 100),
        color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [focusLogs]);

  const trendSeries = useMemo(() => {
    const updated = WEEKLY_TREND_DATA.map((pt, i) =>
      i === WEEKLY_TREND_DATA.length - 1 ? { ...pt, hours: Number(todayHours.toFixed(1)) } : pt
    );
    return chartWindow === 'week' ? updated.slice(-7) : updated;
  }, [chartWindow, todayHours]);

  const heatmapData = useMemo(() => {
    return CONSISTENCY_HEATMAP.map((item, idx) =>
      idx === CONSISTENCY_HEATMAP.length - 1 ? { ...item, hours: Number(todayHours.toFixed(1)) } : item
    );
  }, [todayHours]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Study Analytics
          </h1>
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1">
            Daily & weekly study rhythm, subject balance, and focus efficiency trends.
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl bg-[#F3E7EE] dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C]">
          <button
            type="button"
            onClick={() => setChartWindow('week')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartWindow === 'week'
                ? 'bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814]'
                : 'text-[#574146] dark:text-[#B5A8B2] hover:text-[#1F1A1E] dark:hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setChartWindow('fortnight')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartWindow === 'fortnight'
                ? 'bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814]'
                : 'text-[#574146] dark:text-[#B5A8B2] hover:text-[#1F1A1E] dark:hover:text-white'
            }`}
          >
            Last 14 Days
          </button>
        </div>
      </div>

      {/* 4-Column Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Weekly Total',
            value: `${weeklyTotal.toFixed(1)}h`,
            sub: `Goal: ${(preferences.dailyGoalHours * 5).toFixed(0)}h / wk`,
            icon: Clock,
            tone: 'text-[#006948] dark:text-[#6EE7B7]',
          },
          {
            label: 'Daily Average',
            value: `${dailyAverage.toFixed(1)}h`,
            sub: `Across ${activeDays} active days`,
            icon: TrendingUp,
            tone: 'text-[#A3265B] dark:text-[#FFB1C6]',
          },
          {
            label: 'Focus Consistency',
            value: `${streakDays} days`,
            sub: 'Longest streak: 19 days',
            icon: Flame,
            tone: 'text-[#B45309] dark:text-[#FCD34D]',
          },
          {
            label: 'Sessions Logged',
            value: `${focusLogs.length}`,
            sub: '91% avg focus efficiency',
            icon: Award,
            tone: 'text-[#006782] dark:text-[#7DD3FC]',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-5 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between text-xs font-medium text-[#574146] dark:text-[#B5A8B2]">
                <span>{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.tone}`} />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                {kpi.value}
              </div>
              <div className="text-xs text-[#8A7177] dark:text-[#9D8F99]">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Study Time Bar Chart (7 cols) */}
        <section className="lg:col-span-7 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Weekly Study Hours vs Daily Goal
              </h2>
              <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
                Dashed line marks your {preferences.dailyGoalHours.toFixed(1)}h daily target
              </p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(138,113,119,0.18)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A7177' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A7177' }} unit="h" />
                <Tooltip
                  cursor={{ fill: 'rgba(245, 100, 152, 0.08)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EAE0E5', fontSize: '12px' }}
                  formatter={(v) => [`${Number(v ?? 0).toFixed(1)} hrs`, 'Logged']}
                />
                <ReferenceLine
                  y={preferences.dailyGoalHours}
                  stroke="#F56498"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Bar dataKey="hours" radius={[8, 8, 4, 4]} maxBarSize={42}>
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

        {/* Subject Distribution Donut + List (5 cols) */}
        <section className="lg:col-span-5 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Subject Allocation
            </h2>
            <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
              Distribution across active coursework modules
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
            <div className="w-44 h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectBreakdown}
                    dataKey="hours"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {subjectBreakdown.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #EAE0E5', fontSize: '12px' }}
                    formatter={(v) => [`${Number(v ?? 0)} hrs`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full flex flex-col gap-2.5">
              {subjectBreakdown.map((sub) => (
                <div key={sub.name} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="font-medium text-[#1F1A1E] dark:text-[#F5EFF3] truncate">
                      {sub.name}
                    </span>
                  </div>
                  <div className="font-mono tabular-nums text-[#574146] dark:text-[#B5A8B2] shrink-0">
                    {sub.hours}h · {sub.share}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Productivity Trend Area Chart + 28-Day Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Productivity Trend */}
        <section className="lg:col-span-7 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Focus Hours & Efficiency Trend
            </h2>
            <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
              Smooth momentum curve comparing study duration and deep-focus score
            </p>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="efficiencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006782" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#006782" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F56498" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F56498" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(138,113,119,0.16)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A7177' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A7177' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EAE0E5', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  name="Hours Studied"
                  stroke="#F56498"
                  strokeWidth={2.5}
                  fill="url(#hoursGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 28-Day Consistency Heatmap */}
        <section className="lg:col-span-5 bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                28-Day Study Consistency
              </h2>
              <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] mt-0.5">
                {hoveredHeatDay
                  ? `${hoveredHeatDay.date}: ${hoveredHeatDay.hours.toFixed(1)} hrs logged`
                  : 'Hover any day tile to inspect logged hours'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span
                key={`${d}-${i}`}
                className="text-center text-[11px] font-semibold text-[#8A7177] dark:text-[#9D8F99]"
              >
                {d}
              </span>
            ))}
            {heatmapData.map((cell) => {
              const intensity =
                cell.hours >= 5
                  ? 'bg-[#006948] text-white dark:bg-[#58CD9B] dark:text-[#072116]'
                  : cell.hours >= 3.5
                    ? 'bg-[#2EAA7B]/75 text-white dark:bg-[#2EAA7B]/80 dark:text-[#072116]'
                    : cell.hours >= 2
                      ? 'bg-[#85F8C3]/70 text-[#003724] dark:bg-[#1A4D3B] dark:text-[#A7F3D0]'
                      : 'bg-[#F3E7EE] text-[#8A7177] dark:bg-[#26212E] dark:text-[#9D8F99]';

              return (
                <button
                  key={cell.date}
                  type="button"
                  onMouseEnter={() => setHoveredHeatDay(cell)}
                  onFocus={() => setHoveredHeatDay(cell)}
                  onMouseLeave={() => setHoveredHeatDay(null)}
                  className={`aspect-square rounded-lg text-[11px] font-mono font-semibold tabular-nums flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${intensity}`}
                  title={`${cell.date}: ${cell.hours}h`}
                >
                  {cell.hours.toFixed(0)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8A7177] dark:text-[#9D8F99] pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533]">
            <span>Less focus</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#F3E7EE] dark:bg-[#26212E]" />
              <span className="w-3 h-3 rounded-xs bg-[#85F8C3]/70 dark:bg-[#1A4D3B]" />
              <span className="w-3 h-3 rounded-xs bg-[#2EAA7B]/75" />
              <span className="w-3 h-3 rounded-xs bg-[#006948] dark:bg-[#58CD9B]" />
            </div>
            <span>5h+ deep day</span>
          </div>
        </section>
      </div>
    </div>
  );
};
