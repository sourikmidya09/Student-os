import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Flag, Calendar, Target, CheckCircle2, Circle, Edit2, X, Check } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Checkbox, Badge, ProgressBar, EmptyState, Modal } from '../components/ui';
import { formatDate } from '../utils/dateUtils';
import { format } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { low: 'default', medium: 'amber', high: 'red' };
const SUBJECTS = ['Math', 'Science', 'English', 'History', 'CS', 'Art', 'PE', 'Other'];

function TaskForm({ onSave, onClose, initial = {} }) {
  const [title, setTitle] = useState(initial.title || '');
  const [subject, setSubject] = useState(initial.subject || '');
  const [priority, setPriority] = useState(initial.priority || 'medium');
  const [dueDate, setDueDate] = useState(initial.dueDate || '');
  const [notes, setNotes] = useState(initial.notes || '');

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), subject, priority, dueDate, notes });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Task Title *</label>
        <input className="input" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Subject</label>
          <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
            <option value="">None</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Due Date</label>
        <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={2} placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={save} className="btn-primary flex-1" disabled={!title.trim()}>Save Task</button>
      </div>
    </div>
  );
}

function GoalForm({ onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description });
    onClose();
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Goal Title *</label>
        <input className="input" placeholder="e.g. Complete 5 chapters" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={2} placeholder="Details..." value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={save} className="btn-primary flex-1" disabled={!title.trim()}>Add Goal</button>
      </div>
    </div>
  );
}

export default function StudyPlanner() {
  const { state, dispatch } = useApp();
  const { tasks, weeklyGoals } = state;
  const [tab, setTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Study Planner</h2>
          <p className="text-sm text-surface-500 mt-0.5">{tasks.filter(t => !t.completed).length} tasks pending</p>
        </div>
        <button
          onClick={() => tab === 'tasks' ? setShowTaskModal(true) : setShowGoalModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={14} />
          {tab === 'tasks' ? 'Add Task' : 'Add Goal'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: tasks.length, color: 'text-surface-700 dark:text-surface-300' },
          { label: 'Completed', value: completedCount, color: 'text-green-600 dark:text-green-400' },
          { label: 'Completion', value: `${completionRate}%`, color: 'text-accent-600 dark:text-accent-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <p className={`text-2xl font-display font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-surface-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1 w-fit gap-1">
        {['tasks', 'goals'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t
                ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex gap-2">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? 'bg-accent-500 text-white' : 'btn-ghost'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
              description={filter === 'all' ? 'Add your first task to get started.' : undefined}
              action={filter === 'all' && <button onClick={() => setShowTaskModal(true)} className="btn-primary text-xs">Add Task</button>}
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredTasks.map((task, i) => (
                  <TaskCard key={task.id} task={task} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {tab === 'goals' && (
        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Weekly Progress</span>
              <span className="text-sm font-semibold text-accent-500">
                {weeklyGoals.filter(g => g.completed).length}/{weeklyGoals.length}
              </span>
            </div>
            <ProgressBar value={weeklyGoals.filter(g => g.completed).length} max={Math.max(weeklyGoals.length, 1)} color="accent" />
          </div>

          {weeklyGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals set"
              description="Set weekly goals to stay on track with your studies."
              action={<button onClick={() => setShowGoalModal(true)} className="btn-primary text-xs">Add Goal</button>}
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {weeklyGoals.map((goal, i) => (
                  <GoalCard key={goal.id} goal={goal} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add New Task">
        <TaskForm
          onSave={data => dispatch({ type: 'ADD_TASK', payload: data })}
          onClose={() => setShowTaskModal(false)}
        />
      </Modal>
      <Modal open={showGoalModal} onClose={() => setShowGoalModal(false)} title="Add Weekly Goal">
        <GoalForm
          onSave={data => dispatch({ type: 'ADD_GOAL', payload: data })}
          onClose={() => setShowGoalModal(false)}
        />
      </Modal>
    </div>
  );
}

function TaskCard({ task, index }) {
  const { dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const saveEdit = () => {
    if (title.trim()) dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, title: title.trim() } });
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.03 }}
      className="card-hover p-3.5 flex items-start gap-3"
    >
      <Checkbox
        checked={task.completed}
        onChange={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input
              className="input py-1 text-sm flex-1"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <button onClick={saveEdit} className="text-green-500"><Check size={14} /></button>
            <button onClick={() => setEditing(false)} className="text-surface-400"><X size={14} /></button>
          </div>
        ) : (
          <p className={`text-sm font-medium ${task.completed ? 'line-through text-surface-400' : 'text-surface-800 dark:text-surface-200'}`}>
            {task.title}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.subject && <span className="text-xs text-surface-400">{task.subject}</span>}
          {task.dueDate && (
            <span className="text-xs text-surface-400 flex items-center gap-0.5">
              <Calendar size={10} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.notes && <span className="text-xs text-surface-400 truncate max-w-[180px]">{task.notes}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {task.priority && <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>}
        <button onClick={() => setEditing(true)} className="p-1 text-surface-300 hover:text-surface-500 transition-colors">
          <Edit2 size={12} />
        </button>
        <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="p-1 text-surface-300 hover:text-red-400 transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

function GoalCard({ goal, index }) {
  const { dispatch } = useApp();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.03 }}
      className="card-hover p-3.5 flex items-start gap-3"
    >
      <Checkbox
        checked={goal.completed}
        onChange={() => dispatch({ type: 'UPDATE_GOAL', payload: { id: goal.id, completed: !goal.completed } })}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${goal.completed ? 'line-through text-surface-400' : 'text-surface-800 dark:text-surface-200'}`}>
          {goal.title}
        </p>
        {goal.description && <p className="text-xs text-surface-400 mt-0.5">{goal.description}</p>}
        <p className="text-xs text-surface-400 mt-1">{formatDate(goal.createdAt)}</p>
      </div>
      <button onClick={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })} className="p-1 text-surface-300 hover:text-red-400 transition-colors">
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}