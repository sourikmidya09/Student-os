import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, User, Palette, Shield, Trash2, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Alert } from '../components/ui';
import toast from 'react-hot-toast';

const SECTION = ({ title, icon: Icon, children }) => (
  <div className="card p-5 space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-surface-100 dark:border-surface-800">
      <div className="w-7 h-7 rounded-lg bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center">
        <Icon size={14} className="text-accent-500" />
      </div>
      <h3 className="font-display font-semibold text-surface-800 dark:text-surface-100 text-sm">{title}</h3>
    </div>
    {children}
  </div>
);

export default function Settings() {
  const { state, dispatch } = useApp();
  const { settings, theme } = state;

  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [apiSaved, setApiSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: settings.profile?.name || '',
    major: settings.profile?.major || '',
    university: settings.profile?.university || '',
    year: settings.profile?.year || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const saveApiKey = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { apiKey } });
    setApiSaved(true);
    toast.success('API key saved!');
    setTimeout(() => setApiSaved(false), 2500);
  };

  const saveProfile = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { profile } });
    setProfileSaved(true);
    toast.success('Profile saved!');
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will delete all your data permanently.')) {
      const keys = ['sos-conversations', 'sos-tasks', 'sos-goals', 'sos-notes', 'sos-focus-sessions', 'sos-roadmaps'];
      keys.forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const isKeyPlaceholder = !apiKey || apiKey === 'YOUR_API_KEY_HERE';

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
      <div className="mb-2">
        <h2 className="page-title">Settings</h2>
        <p className="text-sm text-surface-500 mt-0.5">Manage your preferences and configurations</p>
      </div>

      {/* Profile */}
      <SECTION title="Profile" icon={User}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              placeholder="Your name"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Year</label>
            <select className="input" value={profile.year} onChange={e => setProfile({ ...profile, year: e.target.value })}>
              <option value="">Select year</option>
              {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Major / Field</label>
            <input
              className="input"
              placeholder="e.g. Computer Science"
              value={profile.major}
              onChange={e => setProfile({ ...profile, major: e.target.value })}
            />
          </div>
          <div>
            <label className="label">University</label>
            <input
              className="input"
              placeholder="e.g. MIT"
              value={profile.university}
              onChange={e => setProfile({ ...profile, university: e.target.value })}
            />
          </div>
        </div>
        <button onClick={saveProfile} className="btn-primary flex items-center gap-2">
          {profileSaved ? <><Check size={14} /> Saved</> : 'Save Profile'}
        </button>
      </SECTION>

      {/* API Configuration */}
      <SECTION title="API Configuration" icon={Key}>
        {isKeyPlaceholder && (
          <Alert
            type="warning"
            title="API Key Required"
            message="Add your Anthropic API key to enable the AI Assistant and Career Roadmap generation features."
          />
        )}

        <div>
          <label className="label">Anthropic API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              className="input pr-10"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="text-xs text-surface-400 mt-1.5">
            Get your key at{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-accent-500 hover:underline">
              console.anthropic.com
            </a>
            . Your key is stored locally and never sent to any server other than Anthropic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveApiKey} className="btn-primary flex items-center gap-2">
            {apiSaved ? <><Check size={14} /> Saved!</> : <><Key size={14} /> Save API Key</>}
          </button>
          {!isKeyPlaceholder && (
            <span className="flex items-center gap-1.5 text-xs text-green-500">
              <Check size={12} /> Key configured
            </span>
          )}
        </div>
      </SECTION>

      {/* Appearance */}
      <SECTION title="Appearance" icon={Palette}>
        <div>
          <label className="label">Theme</label>
          <div className="flex gap-2 mt-1">
            {[
              { value: 'light', label: '☀️ Light', desc: 'Clean white interface' },
              { value: 'dark', label: '🌙 Dark', desc: 'Easy on the eyes' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => dispatch({ type: 'SET_THEME', payload: opt.value })}
                className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                  theme === opt.value
                    ? 'border-accent-400 bg-accent-50 dark:bg-accent-500/10'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                }`}
              >
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-surface-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </SECTION>

      {/* Data Management */}
      <SECTION title="Data & Privacy" icon={Shield}>
        <div className="space-y-2">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            All your data (tasks, notes, sessions, roadmaps) is stored locally in your browser. Nothing is sent to external servers except API calls to Anthropic.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm text-surface-500 dark:text-surface-400">
            {[
              { label: 'Tasks', value: state.tasks.length },
              { label: 'Notes', value: state.notes.length },
              { label: 'Focus Sessions', value: state.focusSessions.length },
              { label: 'Roadmaps', value: state.roadmaps.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between bg-surface-50 dark:bg-surface-800 px-3 py-2 rounded-lg">
                <span>{label}</span>
                <span className="font-medium text-surface-800 dark:text-surface-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2 border-t border-surface-100 dark:border-surface-800">
          <button
            onClick={clearAllData}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Clear All Data
          </button>
          <p className="text-xs text-surface-400 mt-1 pl-3">This action is irreversible.</p>
        </div>
      </SECTION>

      {/* About */}
      <div className="text-center py-4">
        <p className="text-xs text-surface-400">Student OS v1.0.0 · Built by Sourik Midya</p>
      </div>
    </div>
  );
}