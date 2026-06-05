import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Clock, Flame, Target, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatCard, ProgressBar, Badge } from '../components/ui';
import { getGreeting, formatDate, getStudyStreak } from '../utils/dateUtils';
import { format, isToday, parseISO } from 'date-fns';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { tasks, weeklyGoals, focusSessions, notes } = state;
  const name = state.settings.profile?.name || 'Student';

  // Stats
  const todayTasks = tasks.filter(t => isToday(parseISO(t.createdAt)));
  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalTasks = tasks.filter(t => t.completed).length;
  const streak = getStudyStreak(focusSessions);
  const totalFocusSeconds = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalFocusHours = Math.round((totalFocusSeconds / 3600) * 10) / 10;
  const activeGoals = weeklyGoals.filter(g => !g.completed).length;
  const completedGoals = weeklyGoals.filter(g => g.completed).length;
  const goalPct = weeklyGoals.length ? Math.round((completedGoals / weeklyGoals.length) * 100) : 0;

  const recentTasks = tasks.slice(0, 5);
  const recentNotes = notes.slice(0, 4);

  const navigate = (page) => dispatch({ type: 'SET_PAGE', payload: page });

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-xl font-semibold text-surface-900 dark:text-surface-50">
            {getGreeting()}, {name.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's your overview
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Study Hours" value={`${totalFocusHours}h`} icon={Clock} color="accent" />
          <StatCard label="Tasks Done" value={totalTasks} icon={CheckCircle2} color="green" />
          <StatCard label="Day Streak" value={`${streak}🔥`} icon={Flame} color="amber" />
          <StatCard label="Active Goals" value={activeGoals} icon={Target} color="purple" />
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Today's Tasks */}
          <motion.div variants={itemVariants} className="lg:col-span-2 card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Today's Tasks</h3>
              <button onClick={() => navigate('study-planner')} className="text-xs text-accent-500 hover:text-accent-600 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            </div>

            {recentTasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-surface-400">No tasks yet. Add some in Study Planner.</p>
                <button onClick={() => navigate('study-planner')} className="btn-primary mt-3 text-xs">
                  Add Task
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <div className={`w-4 h-4 mt-0.5 rounded-full flex-shrink-0 border-2 transition-colors ${task.completed ? 'bg-accent-500 border-accent-500' : 'border-surface-300 dark:border-surface-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-surface-400' : 'text-surface-800 dark:text-surface-200'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">{formatDate(task.createdAt)}</p>
                    </div>
                    {task.priority && (
                      <Badge variant={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'default'}>
                        {task.priority}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Weekly Goals */}
          <motion.div variants={itemVariants} className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Weekly Goals</h3>
              <span className="text-xs text-surface-400">{goalPct}%</span>
            </div>
            <ProgressBar value={goalPct} className="mb-4" />

            {weeklyGoals.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">No goals set yet.</p>
            ) : (
              <div className="space-y-2.5">
                {weeklyGoals.slice(0, 4).map(goal => (
                  <div key={goal.id} className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${goal.completed ? 'bg-accent-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
                    <p className={`text-sm truncate flex-1 ${goal.completed ? 'line-through text-surface-400' : 'text-surface-700 dark:text-surface-300'}`}>
                      {goal.title}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate('study-planner')} className="btn-secondary w-full mt-4 text-xs">
              Manage Goals
            </button>
          </motion.div>
        </div>

        {/* Quick Actions + Recent Notes */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="card p-4">
            <h3 className="section-title mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Ask AI Assistant', page: 'ai-assistant', icon: '✨' },
                { label: 'Start Focus Session', page: 'focus-mode', icon: '⏱' },
                { label: 'Create Note', page: 'smart-notes', icon: '📝' },
                { label: 'View Roadmap', page: 'career-roadmap', icon: '🗺' },
              ].map(({ label, page, icon }) => (
                <button
                  key={page}
                  onClick={() => navigate(page)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left group"
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-100 transition-colors">{label}</span>
                  <ArrowRight size={12} className="ml-auto text-surface-300 dark:text-surface-600 group-hover:text-surface-500 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Recent Notes */}
          <motion.div variants={itemVariants} className="lg:col-span-2 card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Recent Notes</h3>
              <button onClick={() => navigate('smart-notes')} className="text-xs text-accent-500 hover:text-accent-600 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            </div>

            {recentNotes.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-surface-400">No notes yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {recentNotes.map((note, i) => (
                  <motion.button
                    key={note.id}
                    onClick={() => navigate('smart-notes')}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-left p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                  >
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{note.title || 'Untitled'}</p>
                    <p className="text-xs text-surface-400 mt-1 line-clamp-2">{note.content?.replace(/[#*`]/g, '') || 'Empty note'}</p>
                    <p className="text-xs text-surface-300 dark:text-surface-600 mt-2">{formatDate(note.updatedAt)}</p>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Productivity Chart placeholder */}
        <motion.div variants={itemVariants} className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">This Week's Activity</h3>
            <Badge variant="accent">Last 7 days</Badge>
          </div>
          <WeeklyActivityChart focusSessions={focusSessions} tasks={tasks} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function WeeklyActivityChart({ focusSessions, tasks }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === dateStr).length;
    const dayFocus = focusSessions
      .filter(s => s.date && format(parseISO(s.date), 'yyyy-MM-dd') === dateStr)
      .reduce((acc, s) => acc + (s.duration || 0), 0);
    days.push({ label: format(d, 'EEE'), tasks: dayTasks, focusHours: Math.round((dayFocus / 3600) * 10) / 10 });
  }

  const maxTasks = Math.max(...days.map(d => d.tasks), 1);

  return (
    <div className="flex items-end gap-2 h-24">
      {days.map((day, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col items-center justify-end flex-1">
            <motion.div
              className="w-full bg-accent-500/80 rounded-t-lg"
              initial={{ height: 0 }}
              animate={{ height: `${day.tasks > 0 ? Math.max(8, (day.tasks / maxTasks) * 80) : 4}px` }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
              style={{ minHeight: day.tasks > 0 ? '8px' : '4px' }}
            />
          </div>
          <span className="text-xs text-surface-400">{day.label}</span>
        </div>
      ))}
    </div>
  );
}