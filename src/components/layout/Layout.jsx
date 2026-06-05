import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../store/AppContext';

// Pages
import Dashboard from '../../pages/Dashboard';
import AIAssistant from '../../pages/AIAssistant';
import StudyPlanner from '../../pages/StudyPlanner';
import SmartNotes from '../../pages/SmartNotes';
import FocusMode from '../../pages/FocusMode';
import CareerRoadmap from '../../pages/CareerRoadmap';
import SettingsPage from '../../pages/Settings';

const PAGES = {
  dashboard: Dashboard,
  'ai-assistant': AIAssistant,
  'study-planner': StudyPlanner,
  'smart-notes': SmartNotes,
  'focus-mode': FocusMode,
  'career-roadmap': CareerRoadmap,
  settings: SettingsPage,
};

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function Layout() {
  const { state } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const PageComponent = PAGES[state.activePage] || Dashboard;

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activePage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}