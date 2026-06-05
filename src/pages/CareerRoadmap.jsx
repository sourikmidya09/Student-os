import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, FileText, Tag, Clock, Bold, Italic, Code, List, Heading2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EmptyState } from '../components/ui';
import { formatDateTime } from '../utils/dateUtils';

const TAG_COLORS = [
  'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
];

function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash += tag.charCodeAt(i);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

// Minimal markdown toolbar
function EditorToolbar({ onInsert }) {
  const tools = [
    { icon: Bold, label: 'Bold', insert: '**text**', offset: 2, len: 4 },
    { icon: Italic, label: 'Italic', insert: '_text_', offset: 1, len: 4 },
    { icon: Code, label: 'Code', insert: '`code`', offset: 1, len: 4 },
    { icon: Heading2, label: 'Heading', insert: '## Heading', offset: 3, len: 7 },
    { icon: List, label: 'List', insert: '- Item', offset: 2, len: 4 },
  ];

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-surface-100 dark:border-surface-800">
      {tools.map(({ icon: Icon, label, insert }) => (
        <button
          key={label}
          onClick={() => onInsert(insert)}
          title={label}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

export default function SmartNotes() {
  const { state, dispatch } = useApp();
  const { notes } = state;
  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id || null);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [preview, setPreview] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // All unique tags
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

  // Filtered notes
  const filtered = notes.filter(n => {
    const matchSearch = !search || (n.title + n.content).toLowerCase().includes(search.toLowerCase());
    const matchTag = !tagFilter || (n.tags || []).includes(tagFilter);
    return matchSearch && matchTag;
  });

  const newNote = () => {
    dispatch({ type: 'ADD_NOTE', payload: { title: 'Untitled Note', content: '', tags: [] } });
    // After adding, select the newest note
    setTimeout(() => {
      const newest = state.notes[0];
      if (newest) setActiveNoteId(newest.id);
    }, 50);
  };

  const updateNote = useCallback((field, value) => {
    if (!activeNoteId) return;
    dispatch({ type: 'UPDATE_NOTE', payload: { id: activeNoteId, [field]: value } });
  }, [activeNoteId, dispatch]);

  const deleteNote = (id) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveNoteId(remaining[0]?.id || null);
    }
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById('note-editor');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = (activeNote?.content || '').substring(0, start);
    const after = (activeNote?.content || '').substring(end);
    const newContent = before + syntax + after;
    updateNote('content', newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntax.length, start + syntax.length);
    }, 10);
  };

  // Update active note when notes change (e.g. new note created)
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  return (
    <div className="flex h-full">
      {/* Notes List Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 flex flex-col">
        {/* Search + New */}
        <div className="p-3 space-y-2 border-b border-surface-100 dark:border-surface-800">
          <button onClick={newNote} className="btn-primary w-full flex items-center justify-center gap-2 text-xs">
            <Plus size={13} /> New Note
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              className="input pl-8 text-xs py-2"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="px-3 py-2 flex flex-wrap gap-1 border-b border-surface-100 dark:border-surface-800">
            <button
              onClick={() => setTagFilter('')}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!tagFilter ? 'bg-accent-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-500'}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${tagFilter === tag ? 'bg-accent-500 text-white' : getTagColor(tag)}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Note list */}
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-surface-400">No notes found</p>
            </div>
          ) : (
            filtered.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full text-left px-3 py-3 border-b border-surface-50 dark:border-surface-800/50 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800 ${
                  note.id === activeNoteId ? 'bg-accent-50 dark:bg-accent-500/5 border-l-2 border-l-accent-400' : ''
                }`}
              >
                <p className={`text-xs font-medium truncate ${note.id === activeNoteId ? 'text-accent-600 dark:text-accent-400' : 'text-surface-800 dark:text-surface-200'}`}>
                  {note.title || 'Untitled'}
                </p>
                <p className="text-xs text-surface-400 mt-0.5 truncate">
                  {note.content?.replace(/[#*`_]/g, '').slice(0, 60) || 'Empty'}
                </p>
                <p className="text-xs text-surface-300 dark:text-surface-600 mt-1">
                  {formatDateTime(note.updatedAt)}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-surface-100 dark:border-surface-800">
          <p className="text-xs text-surface-400 text-center">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface-900">
        {!activeNote ? (
          <EmptyState
            icon={FileText}
            title="No note selected"
            description="Select a note from the sidebar or create a new one."
            action={<button onClick={newNote} className="btn-primary text-xs">Create Note</button>}
          />
        ) : (
          <>
            {/* Note Header */}
            <div className="px-6 pt-5 pb-2 border-b border-surface-100 dark:border-surface-800">
              <input
                className="w-full bg-transparent outline-none font-display text-xl font-semibold text-surface-900 dark:text-surface-50 placeholder:text-surface-300 dark:placeholder:text-surface-600"
                placeholder="Note title..."
                value={activeNote.title}
                onChange={e => updateNote('title', e.target.value)}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 flex items-center gap-1">
                    <Clock size={11} />
                    {formatDateTime(activeNote.updatedAt)}
                  </span>
                  {/* Tags input */}
                  <TagEditor
                    tags={activeNote.tags || []}
                    onChange={tags => updateNote('tags', tags)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreview(!preview)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${preview ? 'bg-accent-500 text-white' : 'btn-ghost'}`}
                  >
                    {preview ? 'Edit' : 'Preview'}
                  </button>
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-1.5 text-surface-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            {!preview && <EditorToolbar onInsert={insertMarkdown} />}

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {preview ? (
                <div className="px-6 py-4 prose-student max-w-none">
                  <MarkdownPreview content={activeNote.content} />
                </div>
              ) : (
                <textarea
                  id="note-editor"
                  className="w-full h-full px-6 py-4 bg-transparent outline-none resize-none font-mono text-sm text-surface-800 dark:text-surface-200 placeholder:text-surface-300 dark:placeholder:text-surface-600 leading-relaxed"
                  placeholder="Start writing... Markdown is supported."
                  value={activeNote.content}
                  onChange={e => updateNote('content', e.target.value)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TagEditor({ tags, onChange }) {
  const [inputting, setInputting] = useState(false);
  const [val, setVal] = useState('');

  const addTag = () => {
    const t = val.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setVal('');
    setInputting(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tags.map(tag => (
        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getTagColor(tag)}`}>
          {tag}
          <button onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:opacity-70">×</button>
        </span>
      ))}
      {inputting ? (
        <input
          className="text-xs border border-surface-200 dark:border-surface-700 rounded-full px-2 py-0.5 outline-none bg-transparent w-20"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setInputting(false); }}
          onBlur={addTag}
          autoFocus
          placeholder="tag..."
        />
      ) : (
        <button onClick={() => setInputting(true)} className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-0.5">
          <Tag size={10} /> Add tag
        </button>
      )}
    </div>
  );
}

function MarkdownPreview({ content }) {
  // Very simple markdown rendering for preview
  if (!content) return <p className="text-surface-400">Nothing to preview.</p>;

  return (
    <div dangerouslySetInnerHTML={{
      __html: content
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br/>')
    }} />
  );
}