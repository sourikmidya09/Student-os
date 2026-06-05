import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, X, AlertTriangle, Info, CheckCheck } from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, trend, color = 'accent' }) {
  const colorMap = {
    accent: 'bg-accent-50 dark:bg-accent-500/10 text-accent-500',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-500',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-500',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-500',
  };

  return (
    <motion.div
      className="card p-4"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-semibold text-surface-900 dark:text-surface-50 mb-0.5">{value}</p>
      <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
    </motion.div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────
export function ProgressBar({ value, max = 100, className = '', color = 'accent' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colorMap = {
    accent: 'bg-accent-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  };
  return (
    <div className={`h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${colorMap[color]} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
    accent: 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        <Icon size={24} className="text-surface-400" />
      </div>
      <h3 className="font-display font-medium text-surface-700 dark:text-surface-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-400 dark:text-surface-500 mb-4 max-w-xs">{description}</p>}
      {action && action}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────
export function Spinner({ size = 18 }) {
  return <Loader2 size={size} className="animate-spin text-surface-400" />;
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className={`relative w-full ${maxWidth} bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-800`}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
          <h3 className="font-display font-semibold text-surface-900 dark:text-surface-50 text-[15px]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────
export function Checkbox({ checked, onChange, className = '' }) {
  return (
    <button onClick={onChange} className={`flex-shrink-0 ${className}`}>
      <motion.div animate={{ scale: checked ? [1.2, 1] : 1 }} transition={{ duration: 0.15 }}>
        {checked ? (
          <CheckCircle2 size={18} className="text-accent-500" />
        ) : (
          <Circle size={18} className="text-surface-300 dark:text-surface-600 hover:text-surface-400 transition-colors" />
        )}
      </motion.div>
    </button>
  );
}

// ─── Alert ────────────────────────────────────────────────────
export function Alert({ type = 'info', title, message }) {
  const config = {
    info: { icon: Info, cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' },
    warning: { icon: AlertTriangle, cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' },
    success: { icon: CheckCheck, cls: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20' },
  };
  const { icon: Icon, cls } = config[type];
  return (
    <div className={`flex gap-3 p-3.5 rounded-xl border text-sm ${cls}`}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {message && <p className="opacity-80">{message}</p>}
      </div>
    </div>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────
export function SkeletonLine({ width = 'w-full', height = 'h-3' }) {
  return <div className={`skeleton ${width} ${height} rounded`} />;
}

export function SkeletonBlock({ height = 'h-20' }) {
  return <div className={`skeleton w-full ${height} rounded-xl`} />;
}