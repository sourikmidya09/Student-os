import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ─── Initial State ───────────────────────────────────────────
const initialState = {
  // Theme
  theme: localStorage.getItem('sos-theme') || 'light',

  // Navigation
  activePage: 'dashboard',

  // Settings
  settings: {
    apiKey: localStorage.getItem('sos-api-key') || '',
    profile: JSON.parse(localStorage.getItem('sos-profile') || '{"name":"Student","major":"","university":"","year":""}'),
  },

  // AI Chat
  conversations: JSON.parse(localStorage.getItem('sos-conversations') || '[]'),
  activeConversationId: null,

  // Study Planner
  tasks: JSON.parse(localStorage.getItem('sos-tasks') || '[]'),
  weeklyGoals: JSON.parse(localStorage.getItem('sos-goals') || '[]'),

  // Notes
  notes: JSON.parse(localStorage.getItem('sos-notes') || '[]'),

  // Focus Sessions
  focusSessions: JSON.parse(localStorage.getItem('sos-focus-sessions') || '[]'),

  // Career Roadmap
  roadmaps: JSON.parse(localStorage.getItem('sos-roadmaps') || '[]'),
};

// ─── Reducer ─────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    // Theme
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    // Navigation
    case 'SET_PAGE':
      return { ...state, activePage: action.payload };

    // Settings
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // Conversations
    case 'NEW_CONVERSATION': {
      const conv = { id: uuidv4(), title: 'New Chat', messages: [], createdAt: new Date().toISOString() };
      return { ...state, conversations: [conv, ...state.conversations], activeConversationId: conv.id };
    }
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };
    case 'ADD_MESSAGE': {
      const convs = state.conversations.map(c =>
        c.id === action.payload.conversationId
          ? {
              ...c,
              messages: [...c.messages, action.payload.message],
              title: c.messages.length === 0 ? action.payload.message.content.slice(0, 40) + '...' : c.title,
            }
          : c
      );
      return { ...state, conversations: convs };
    }
    case 'DELETE_CONVERSATION': {
      const filtered = state.conversations.filter(c => c.id !== action.payload);
      return {
        ...state,
        conversations: filtered,
        activeConversationId: filtered.length ? filtered[0].id : null,
      };
    }
    case 'UPDATE_CONVERSATION_TITLE': {
      const convs = state.conversations.map(c =>
        c.id === action.payload.id ? { ...c, title: action.payload.title } : c
      );
      return { ...state, conversations: convs };
    }

    // Tasks
    case 'ADD_TASK': {
      const task = { id: uuidv4(), createdAt: new Date().toISOString(), completed: false, ...action.payload };
      return { ...state, tasks: [task, ...state.tasks] };
    }
    case 'UPDATE_TASK': {
      const tasks = state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t);
      return { ...state, tasks };
    }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'TOGGLE_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.payload ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t
      );
      return { ...state, tasks };
    }

    // Goals
    case 'ADD_GOAL': {
      const goal = { id: uuidv4(), createdAt: new Date().toISOString(), completed: false, progress: 0, ...action.payload };
      return { ...state, weeklyGoals: [goal, ...state.weeklyGoals] };
    }
    case 'UPDATE_GOAL': {
      const weeklyGoals = state.weeklyGoals.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g);
      return { ...state, weeklyGoals };
    }
    case 'DELETE_GOAL':
      return { ...state, weeklyGoals: state.weeklyGoals.filter(g => g.id !== action.payload) };

    // Notes
    case 'ADD_NOTE': {
      const note = { id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...action.payload };
      return { ...state, notes: [note, ...state.notes] };
    }
    case 'UPDATE_NOTE': {
      const notes = state.notes.map(n =>
        n.id === action.payload.id ? { ...n, ...action.payload, updatedAt: new Date().toISOString() } : n
      );
      return { ...state, notes };
    }
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };

    // Focus Sessions
    case 'ADD_FOCUS_SESSION': {
      const session = { id: uuidv4(), ...action.payload };
      return { ...state, focusSessions: [session, ...state.focusSessions] };
    }

    // Roadmaps
    case 'ADD_ROADMAP': {
      const roadmap = { id: uuidv4(), createdAt: new Date().toISOString(), ...action.payload };
      return { ...state, roadmaps: [roadmap, ...state.roadmaps] };
    }
    case 'UPDATE_ROADMAP': {
      const roadmaps = state.roadmaps.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r);
      return { ...state, roadmaps };
    }
    case 'DELETE_ROADMAP':
      return { ...state, roadmaps: state.roadmaps.filter(r => r.id !== action.payload) };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('sos-theme', state.theme);
    localStorage.setItem('sos-api-key', state.settings.apiKey);
    localStorage.setItem('sos-profile', JSON.stringify(state.settings.profile));
    localStorage.setItem('sos-conversations', JSON.stringify(state.conversations));
    localStorage.setItem('sos-tasks', JSON.stringify(state.tasks));
    localStorage.setItem('sos-goals', JSON.stringify(state.weeklyGoals));
    localStorage.setItem('sos-notes', JSON.stringify(state.notes));
    localStorage.setItem('sos-focus-sessions', JSON.stringify(state.focusSessions));
    localStorage.setItem('sos-roadmaps', JSON.stringify(state.roadmaps));
  }, [state]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}