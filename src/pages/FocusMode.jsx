import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Zap, BarChart2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDuration } from '../utils/dateUtils';
import { format } from 'date-fns';
import { StatCard } from '../components/ui';

const MODES = [
  { id: 'pomodoro', label: 'Focus', duration: 25 * 60, color: 'text-accent-500', bgColor: 'bg-accent-500', icon: Brain },
  { id: 'short', label: 'Short Break', duration: 5 * 60, color: 'text-green-500', bgColor: 'bg-green-500', icon: Coffee },
  { id: 'long', label: 'Long Break', duration: 15 * 60, color: 'text-amber-500', bgColor: 'bg-amber-500', icon: Coffee },
];

// Circular progress ring
function TimerRing({ progress, color }) {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width="220" height="220" className="absolute top-0 left-0">
      <circle cx="110" cy="110" r={r} fill="none" stroke="currentColor" strokeWidth="4"
        className="text-surface-100 dark:text-surface-800" />
      <motion.circle
        cx="110" cy="110" r={r} fill="none"
        stroke="currentColor" strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 110 110)"
        className={color}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </svg>
  );
}

export default function FocusMode() {
  const { state, dispatch } = useApp();
  const { focusSessions } = state;
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [tab, setTab] = useState('timer');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const mode = MODES[modeIdx];

  const progress = ((mode.duration - timeLeft) / mode.duration) * 100;

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setRunning(false);
        clearInterval(intervalRef.current);
        if (modeIdx === 0) {
          setSessionsCompleted(s => s + 1);
          dispatch({
            type: 'ADD_FOCUS_SESSION',
            payload: {
              duration: mode.duration,
              type: mode.id,
              date: new Date().toISOString(),
            },
          });
          // Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus session complete! 🎉', { body: 'Time for a break.' });
          }
        }
        return 0;
      }
      return prev - 1;
    });
  }, [modeIdx, mode, dispatch]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  const start = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setTimeLeft(mode.duration); };
  const skip = () => { setRunning(false); const next = (modeIdx + 1) % MODES.length; setModeIdx(next); setTimeLeft(MODES[next].duration); };

  const switchMode = (idx) => {
    setRunning(false);
    setModeIdx(idx);
    setTimeLeft(MODES[idx].duration);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  // Analytics
  const totalSessions = focusSessions.filter(s => s.type === 'pomodoro').length;
  const totalSeconds = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const todaySessions = focusSessions.filter(s => s.date && format(new Date(s.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
  const todaySeconds = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Focus Mode</h2>
          <p className="text-sm text-surface-500 mt-0.5">{sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed this run</p>
        </div>
        <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1 gap-1">
          {['timer', 'analytics'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm' : 'text-surface-500'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'timer' ? (
          <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Mode Selector */}
            <div className="flex gap-2 justify-center">
              {MODES.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => switchMode(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    i === modeIdx
                      ? `${m.bgColor} text-white shadow-sm`
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Timer */}
            <div className="flex justify-center">
              <div className="relative w-[220px] h-[220px]">
                <TimerRing progress={progress} color={mode.color} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.p
                    key={`${mins}:${secs}`}
                    className="font-display text-5xl font-semibold text-surface-900 dark:text-surface-50 tabular-nums"
                    animate={{ scale: running ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 1, repeat: running ? Infinity : 0 }}
                  >
                    {mins}:{secs}
                  </motion.p>
                  <p className={`text-xs font-medium mt-1 ${mode.color}`}>{mode.label}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="p-3 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
                <RotateCcw size={18} />
              </button>
              <motion.button
                onClick={running ? pause : start}
                whileTap={{ scale: 0.94 }}
                className={`px-8 py-3 rounded-2xl font-medium text-white transition-colors flex items-center gap-2 shadow-sm ${
                  running ? 'bg-surface-700 dark:bg-surface-600' : `${mode.bgColor} hover:opacity-90`
                }`}
              >
                {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> {timeLeft === mode.duration ? 'Start' : 'Resume'}</>}
              </motion.button>
              <button onClick={skip} className="p-3 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
                <SkipForward size={18} />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < sessionsCompleted % 4 ? 'bg-accent-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
              ))}
            </div>

            {/* Tips */}
            <div className="card p-4 text-sm text-surface-600 dark:text-surface-400">
              <p className="font-medium text-surface-700 dark:text-surface-300 mb-1">💡 Focus Tips</p>
              <p>Put your phone face-down. Close unnecessary tabs. One task at a time.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Sessions" value={totalSessions} icon={Brain} color="accent" />
              <StatCard label="Total Focus Time" value={formatDuration(totalSeconds)} icon={Zap} color="green" />
              <StatCard label="Today's Sessions" value={todaySessions.length} icon={Brain} color="amber" />
              <StatCard label="Today's Focus" value={formatDuration(todaySeconds)} icon={BarChart2} color="purple" />
            </div>

            <div className="card p-4">
              <h3 className="section-title mb-4">Recent Sessions</h3>
              {focusSessions.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-4">No sessions yet. Start your first one!</p>
              ) : (
                <div className="space-y-2">
                  {focusSessions.slice(0, 10).map((session, i) => (
                    <div key={session.id} className="flex items-center justify-between py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          session.type === 'pomodoro' ? 'bg-accent-500' :
                          session.type === 'short' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        <span className="text-sm text-surface-700 dark:text-surface-300 capitalize">{session.type} session</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{formatDuration(session.duration)}</p>
                        <p className="text-xs text-surface-400">{session.date ? format(new Date(session.date), 'MMM d, h:mm a') : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}