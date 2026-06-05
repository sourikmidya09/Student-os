import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, BookOpen, FileText,
  Timer, Map, Settings, ChevronLeft, ChevronRight,
  GraduationCap, X
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare },
  { id: 'study-planner', label: 'Study Planner', icon: BookOpen },
  { id: 'smart-notes', label: 'Smart Notes', icon: FileText },
  { id: 'focus-mode', label: 'Focus Mode', icon: Timer },
  { id: 'career-roadmap', label: 'Career Roadmap', icon: Map },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { state, dispatch } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navigate = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          flex flex-col bg-white dark:bg-surface-900
          border-r border-surface-100 dark:border-surface-800
          transition-all duration-300 h-screen
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-64'}
        `}
        layout
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-surface-100 dark:border-surface-800 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-display font-semibold text-surface-900 dark:text-surface-50 text-[15px]">
              Student OS
            </span>
          )}
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="ml-auto p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden"
          >
            <X size={16} className="text-surface-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => navigate(id)}
              whileTap={{ scale: 0.97 }}
              className={`sidebar-item w-full ${state.activePage === id ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {!collapsed && state.activePage === id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 bg-accent-500 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Bottom: Settings + Collapse */}
        <div className="px-3 py-4 border-t border-surface-100 dark:border-surface-800 space-y-0.5">
          <button
            onClick={() => navigate('settings')}
            className={`sidebar-item w-full ${state.activePage === 'settings' ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`sidebar-item w-full hidden lg:flex ${collapsed ? 'justify-center px-2' : ''}`}
          >
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}