import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Columns3,
  List,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AcademicTask, Priority, TaskStatus } from '../types';

interface TaskManagerSectionProps {
  tasks: AcademicTask[];
  globalSearch: string;
  onAddTask: (task: Omit<AcademicTask, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
  onFocusTask: (task: AcademicTask) => void;
}

const PRIORITY_STYLES: Record<Priority, { label: string; text: string }> = {
  high: { label: 'High priority', text: 'text-[#BA1A1A] dark:text-[#FCA5A5]' },
  medium: { label: 'Medium priority', text: 'text-[#B45309] dark:text-[#FCD34D]' },
  low: { label: 'Low priority', text: 'text-[#574146] dark:text-[#B5A8B2]' },
};

export const TaskManagerSection: React.FC<TaskManagerSectionProps> = ({
  tasks,
  globalSearch,
  onAddTask,
  onToggleTask,
  onUpdateStatus,
  onDeleteTask,
  onFocusTask,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Task Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Organic Chemistry');
  const [dueDate, setDueDate] = useState('2026-11-26');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedBlocks, setEstimatedBlocks] = useState(2);
  const [notes, setNotes] = useState('');

  const effectiveSearch = (localSearch || globalSearch).trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (
        effectiveSearch &&
        !t.title.toLowerCase().includes(effectiveSearch) &&
        !t.subject.toLowerCase().includes(effectiveSearch)
      ) {
        return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, effectiveSearch]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    }),
    [tasks]
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const formattedDue = dueDate
      ? new Date(`${dueDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Upcoming';
    onAddTask({
      title: title.trim(),
      subject: subject.trim() || 'General',
      dueDate: dueDate || '2026-11-26',
      dueLabel: `Due ${formattedDue}`,
      priority,
      status: 'todo',
      estimatedBlocks,
      completedBlocks: 0,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Task Manager
          </h1>
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1 tabular-nums">
            {counts.todo + counts.inProgress} active assignments · {counts.done} completed
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#F3E7EE] dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#2E2738] text-[#1F1A1E] dark:text-[#F5EFF3] shadow-xs'
                  : 'text-[#574146] dark:text-[#B5A8B2]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-[#2E2738] text-[#1F1A1E] dark:text-[#F5EFF3] shadow-xs'
                  : 'text-[#574146] dark:text-[#B5A8B2]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Board
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:hover:bg-[#FF7AA9] dark:text-[#1A0814] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8A7177] mr-2 shrink-0" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter tasks by title or course..."
            className="w-full bg-transparent text-xs text-[#1F1A1E] dark:text-[#F5EFF3] placeholder:text-[#8A7177] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E]">
            {(
              [
                { id: 'all', label: `All (${counts.all})` },
                { id: 'todo', label: `To Do (${counts.todo})` },
                { id: 'in-progress', label: `Active (${counts.inProgress})` },
                { id: 'done', label: `Done (${counts.done})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-[#312A3C] text-[#1F1A1E] dark:text-[#F5EFF3] font-semibold shadow-xs'
                    : 'text-[#574146] dark:text-[#B5A8B2]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
            aria-label="Filter by priority"
            className="bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl px-3 py-2 text-xs font-medium text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* View Content */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <p className="font-display text-lg font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]">
            No matching tasks found
          </p>
          <p className="text-xs text-[#8A7177] dark:text-[#9D8F99] max-w-sm">
            Try clearing your search filter or add a new assignment to plan your next study block.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setLocalSearch('');
              setShowAddModal(true);
            }}
            className="mt-1 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
          >
            Add New Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#2E2837] rounded-2xl divide-y divide-[#F0E5EB] dark:divide-[#2B2533] overflow-hidden">
          {filteredTasks.map((task) => {
            const done = task.status === 'done';
            return (
              <div
                key={task.id}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FCF1F6]/50 dark:hover:bg-[#221D2A]/60 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors border cursor-pointer ${
                      done
                        ? 'bg-[#006948] border-[#006948] text-white dark:bg-[#58CD9B] dark:border-[#58CD9B] dark:text-[#072116]'
                        : 'border-[#C9B8C2] dark:border-[#4A4154] hover:border-[#A3265B]'
                    }`}
                  >
                    {done && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        done
                          ? 'line-through text-[#8A7177] dark:text-[#7D717C]'
                          : 'text-[#1F1A1E] dark:text-[#F5EFF3]'
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.notes && (
                      <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-0.5 line-clamp-1">
                        {task.notes}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8A7177] dark:text-[#9D8F99] mt-1.5">
                      <span className="font-medium text-[#006782] dark:text-[#7DD3FC]">{task.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3" />
                        {task.dueLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${PRIORITY_STYLES[task.priority].text}`}>
                        {PRIORITY_STYLES[task.priority].label}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {task.completedBlocks}/{task.estimatedBlocks} blocks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                    aria-label="Task status"
                    className="bg-[#FCF1F6] dark:bg-[#25202D] border border-[#EAE0E5] dark:border-[#363041] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>

                  {!done && (
                    <button
                      type="button"
                      onClick={() => onFocusTask(task)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#006948] hover:bg-[#00573B] text-white dark:bg-[#58CD9B] dark:text-[#072116] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Focus
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label="Delete task"
                    className="p-1.5 rounded-lg text-[#8A7177] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 dark:hover:bg-[#4A1C22] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(
            [
              { id: 'todo' as TaskStatus, label: 'To Do', accent: 'text-[#574146] dark:text-[#B5A8B2]' },
              { id: 'in-progress' as TaskStatus, label: 'In Progress', accent: 'text-[#A3265B] dark:text-[#FFB1C6]' },
              { id: 'done' as TaskStatus, label: 'Completed', accent: 'text-[#006948] dark:text-[#6EE7B7]' },
            ]
          ).map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-[#FCF1F6] dark:bg-[#17141C] border border-[#EAE0E5] dark:border-[#2B2533] rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className={`font-display text-sm font-bold ${col.accent}`}>{col.label}</h3>
                  <span className="text-xs font-mono tabular-nums text-[#8A7177] dark:text-[#9D8F99]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-[#1F1B26] border border-[#EAE0E5] dark:border-[#312B3A] rounded-xl p-4 flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#006782] dark:text-[#7DD3FC]">
                          {task.subject}
                        </span>
                        <span className={`text-[11px] font-semibold capitalize ${PRIORITY_STYLES[task.priority].text}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] leading-snug">
                        {task.title}
                      </div>
                      <div className="text-xs text-[#8A7177] dark:text-[#9D8F99] tabular-nums">
                        {task.dueLabel} · {task.completedBlocks}/{task.estimatedBlocks} blocks
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533]">
                        <div className="flex items-center gap-1.5">
                          {col.id !== 'done' && (
                            <button
                              type="button"
                              onClick={() => onFocusTask(task)}
                              className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] hover:underline cursor-pointer"
                            >
                              Focus
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {col.id === 'todo' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(task.id, 'in-progress')}
                              className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer"
                            >
                              Start →
                            </button>
                          )}
                          {col.id === 'in-progress' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(task.id, 'done')}
                              className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7] hover:underline cursor-pointer"
                            >
                              Complete ✓
                            </button>
                          )}
                          {col.id === 'done' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(task.id, 'todo')}
                              className="text-xs font-medium text-[#8A7177] hover:underline cursor-pointer"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-xs text-center text-[#8A7177] dark:text-[#847782] py-6">
                      No tasks in {col.label}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1823] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                New Academic Task
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-[#8A7177] hover:bg-[#F3E7EE] dark:hover:bg-[#2A2432] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Lab Report #5"
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3.5 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none focus:border-[#A3265B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none focus:border-[#A3265B]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none focus:border-[#A3265B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none cursor-pointer"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                    Est. Focus Blocks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={estimatedBlocks}
                    onChange={(e) => setEstimatedBlocks(Number(e.target.value))}
                    className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key chapters, rubric notes, or room location..."
                  className="bg-[#FCF1F6] dark:bg-[#241F2D] border border-[#EAE0E5] dark:border-[#363041] rounded-xl px-3 py-2 text-sm text-[#1F1A1E] dark:text-[#F5EFF3] outline-none resize-none focus:border-[#A3265B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F3E7EE] dark:bg-[#26212E] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
