import { Sun, Moon, Menu, Bell } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { motion } from 'framer-motion';
import { getGreeting } from '../../utils/dateUtils';
import { format } from 'date-fns';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  'ai-assistant': 'AI Assistant',
  'study-planner': 'Study Planner',
  'smart-notes': 'Smart Notes',
  'focus-mode': 'Focus Mode',
  'career-roadmap': 'Career Roadmap',
  settings: 'Settings',
};

export default function Header({ onMenuToggle }) {
  const { state, dispatch } = useApp();
  const isDark = state.theme === 'dark';
  const name = state.settings.profile?.name || 'Student';

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' });
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 flex-shrink-0">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
        >
          <Menu size={18} className="text-surface-500" />
        </button>
        <div>
          <h1 className="font-display font-semibold text-surface-900 dark:text-surface-50 text-[15px] leading-none">
            {PAGE_TITLES[state.activePage]}
          </h1>
          {state.activePage === 'dashboard' && (
            <p className="text-xs text-surface-400 mt-0.5">
              {getGreeting()}, {name.split(' ')[0]} · {format(new Date(), 'EEE, MMM d')}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title="Toggle theme"
        >
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Sun size={18} className="text-surface-400" />
            ) : (
              <Moon size={18} className="text-surface-500" />
            )}
          </motion.div>
        </motion.button>

        {/* Avatar */}
        <div className="w-8 h-8 bg-accent-100 dark:bg-accent-500/20 rounded-xl flex items-center justify-center ml-1">
          <span className="text-accent-600 dark:text-accent-400 font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}