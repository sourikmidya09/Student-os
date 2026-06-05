import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Plus, Trash2, MessageSquare, Paperclip,
  AlertCircle, Copy, Check, ChevronDown, Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useApp } from '../store/AppContext';
import { sendMessage } from '../utils/aiService';
import { formatDateTime } from '../utils/dateUtils';
import { EmptyState } from '../components/ui';

// ─── Code Block ───────────────────────────────────────────────
function CodeBlock({ language, value, isDark }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 my-2">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <span className="text-xs font-mono text-surface-500">{language || 'code'}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors">
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: isDark ? '#18181b' : '#fafafa' }}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────
function MessageBubble({ message, isDark }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser
          ? 'bg-accent-500 text-white text-xs font-semibold'
          : 'bg-surface-100 dark:bg-surface-800 text-surface-500 text-xs'
      }`}>
        {isUser ? 'U' : '✦'}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-accent-500 text-white rounded-tr-sm'
            : 'bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-sm border border-surface-100 dark:border-surface-700'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-student">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} isDark={isDark} />
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-surface-400">{formatDateTime(message.timestamp)}</span>
          {!isUser && (
            <button onClick={copy} className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1">
              {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xs flex-shrink-0">✦</div>
      <div className="bg-surface-50 dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-surface-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isDark = state.theme === 'dark';

  const activeConv = state.conversations.find(c => c.id === state.activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, loading]);

  const newConversation = () => dispatch({ type: 'NEW_CONVERSATION' });

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  };

  const submit = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (!activeConv) {
      dispatch({ type: 'NEW_CONVERSATION' });
      return;
    }

    const userMsg = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: activeConv.id, message: userMsg } });
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const apiKey = state.settings.apiKey;
      const history = [...activeConv.messages, userMsg];
      const response = await sendMessage(history, apiKey);
      const assistantMsg = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: activeConv.id, message: assistantMsg } });
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        setError('Please add your API key in Settings → API Configuration.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeConv, state.settings.apiKey, dispatch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const SUGGESTED_PROMPTS = [
    'Explain the Pomodoro technique for studying',
    'Help me outline an essay on climate change',
    'What are the best note-taking methods?',
    'Create a study schedule for finals week',
  ];

  return (
    <div className="flex h-full">
      {/* Conversation Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 flex flex-col hidden md:flex">
        <div className="p-3 border-b border-surface-100 dark:border-surface-800">
          <button onClick={newConversation} className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus size={14} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {state.conversations.length === 0 ? (
            <p className="text-xs text-surface-400 text-center py-8 px-3">Start a conversation</p>
          ) : (
            state.conversations.map(conv => (
              <motion.button
                key={conv.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id })}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors group flex items-start justify-between gap-2 ${
                  conv.id === state.activeConversationId
                    ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
                }`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <MessageSquare size={13} className="flex-shrink-0 mt-0.5" />
                  <span className="truncate text-xs leading-relaxed">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 flex-shrink-0 transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface-900">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {!activeConv ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 max-w-lg mx-auto text-center">
              <div>
                <div className="w-14 h-14 bg-accent-50 dark:bg-accent-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✦</span>
                </div>
                <h2 className="font-display text-xl font-semibold text-surface-900 dark:text-surface-50 mb-2">AI Study Assistant</h2>
                <p className="text-sm text-surface-500">Ask anything — from homework help to career advice.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { dispatch({ type: 'NEW_CONVERSATION' }); setInput(prompt); }}
                    className="text-left p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-accent-300 dark:hover:border-accent-600 hover:bg-accent-50 dark:hover:bg-accent-500/5 transition-all text-xs text-surface-600 dark:text-surface-400"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <button onClick={newConversation} className="btn-primary flex items-center gap-2">
                <Plus size={14} /> Start new conversation
              </button>
            </div>
          ) : activeConv.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 max-w-lg mx-auto text-center">
              <div className="w-10 h-10 bg-accent-50 dark:bg-accent-500/10 rounded-xl flex items-center justify-center">
                <span className="text-lg">✦</span>
              </div>
              <p className="text-sm text-surface-500">What can I help you with today?</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-left p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-accent-300 dark:hover:border-accent-600 transition-all text-xs text-surface-600 dark:text-surface-400"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeConv.messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} isDark={isDark} />
              ))}
              {loading && <TypingIndicator />}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-start p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        {(activeConv || true) && (
          <div className="p-4 border-t border-surface-100 dark:border-surface-800">
            <div className="flex gap-2 items-end bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-accent-500/20 focus-within:border-accent-400 transition-all">
              <button className="p-1 text-surface-400 hover:text-surface-600 flex-shrink-0 mb-0.5">
                <Paperclip size={16} />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeConv ? 'Ask anything… (Shift+Enter for new line)' : 'Start a new chat first'}
                disabled={!activeConv && state.conversations.length > 0}
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm text-surface-800 dark:text-surface-200 placeholder:text-surface-400 dark:placeholder:text-surface-500 max-h-32"
                style={{ lineHeight: '1.5' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              <motion.button
                onClick={!activeConv ? newConversation : submit}
                disabled={(!input.trim() && activeConv) || loading}
                whileTap={{ scale: 0.92 }}
                className={`p-1.5 rounded-xl flex-shrink-0 transition-all ${
                  input.trim() && !loading
                    ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                }`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </motion.button>
            </div>
            <p className="text-xs text-surface-400 text-center mt-2">AI can make mistakes. Verify important information.</p>
          </div>
        )}
      </div>
    </div>
  );
}