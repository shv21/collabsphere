import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Edit3, 
  Save, 
  Sparkles, 
  Eye, 
  Code2, 
  Clock,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const NotesTab = ({ projectId, userRole, project, onProjectUpdated }) => {
  const { success, error: toastError } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isEditorMode, setIsEditorMode] = useState(false); // false: view, true: edit
  const [editorTab, setEditorTab] = useState('write'); // 'write' | 'preview'
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // AI Modal states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiActionType, setAiActionType] = useState('explain'); // 'explain' | 'improve' | 'summarize'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');

  const canEdit = userRole === 'owner' || userRole === 'admin' || userRole === 'member';

  // Fetch project notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/notes`);
      setNotes(res.notes || []);
      if (res.notes?.length > 0 && !selectedNote) {
        selectNote(res.notes[0]);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const selectNote = (note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content || '');
    setIsEditorMode(false);
    setEditorTab('preview');
  };

  const handleCreateNewNote = async () => {
    try {
      const res = await api.post(`/projects/${projectId}/notes`, {
        title: 'Untitled Note',
        content: '# Technical Notes\n\nDocument architectural decisions, API contracts, or ideas here...',
      });
      const newNote = res.note;
      setNotes((prev) => [newNote, ...prev]);
      selectNote(newNote);
      setIsEditorMode(true);
      setEditorTab('write');
      success('New note created');
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'Failed to create note');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    if (!editTitle.trim()) {
      toastError('Note title cannot be empty');
      return;
    }

    try {
      setSaving(true);
      const res = await api.patch(`/notes/${selectedNote._id}`, {
        title: editTitle.trim(),
        content: editContent,
      });

      const updated = res.note;
      setSelectedNote(updated);
      setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
      setLastSavedTime(new Date());
      setIsEditorMode(false);
      setEditorTab('preview');
      success('Note saved');
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      if (selectedNote?._id === noteId) {
        const remaining = notes.filter((n) => n._id !== noteId);
        if (remaining.length > 0) {
          selectNote(remaining[0]);
        } else {
          setSelectedNote(null);
        }
      }
      success('Note deleted');
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'Failed to delete note');
    }
  };

  // AI Actions Trigger
  const triggerAiAction = async (type) => {
    if (!selectedNote || !editContent) {
      toastError('Note is empty.');
      return;
    }

    setAiActionType(type);
    setIsAiModalOpen(true);
    setAiLoading(true);
    setAiResult('');
    setAiError('');

    try {
      let endpoint = '/gemini/explain';
      let body = { code: editContent, context: `Markdown Note: ${editTitle}` };

      if (type === 'improve') {
        endpoint = '/gemini/improve';
        body = { content: editContent, title: editTitle };
      } else if (type === 'summarize') {
        endpoint = '/gemini/docs';
        body = { code: editContent, language: 'markdown' };
      }

      const res = await api.post(endpoint, body);
      setAiResult(res.result || res.explanation || res.documentation || res.improvedContent || '');
    } catch (err) {
      setAiError(err.message || 'AI service unavailable or Gemini API key missing.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiChanges = () => {
    if (!aiResult) return;
    setEditContent(aiResult);
    setIsEditorMode(true);
    setEditorTab('write');
    setIsAiModalOpen(false);
    success('AI draft applied to note. Please review and save.');
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px] animate-fade-in">
      {/* Left Column: Notes List */}
      <div className="w-full lg:w-80 flex flex-col gap-3 bg-[#10141c] border border-[#202734] rounded-xl p-4 shrink-0">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1d232e]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Notes</span>
            <span className="text-slate-400 font-mono">({notes.length})</span>
          </div>

          {canEdit && (
            <Button size="sm" variant="primary" icon={Plus} onClick={handleCreateNewNote}>
              New Note
            </Button>
          )}
        </div>

        {/* Search */}
        <Input
          placeholder="Filter notes by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          className="text-xs h-8"
        />

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[500px]">
          {loading ? (
            <LoadingSpinner size="sm" text="Loading notes..." />
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No notes created yet.
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No notes matching search.
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?._id === note._id;
              return (
                <div
                  key={note._id}
                  onClick={() => selectNote(note)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-200 font-medium'
                      : 'bg-[#131720] border-[#1d232f] hover:bg-[#181d28] text-slate-300'
                  }`}
                >
                  <div className="truncate flex-1 min-w-0 pr-2">
                    <p className="truncate text-slate-200 font-medium">{note.title || 'Untitled'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      onClick={(e) => handleDeleteNote(note._id, e)}
                      title="Delete note"
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-1 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Note Content Viewer / Editor */}
      <div className="flex-1 flex flex-col bg-[#12161f] border border-[#232936] rounded-xl overflow-hidden min-h-[550px]">
        {selectedNote ? (
          <div className="flex flex-col h-full flex-1">
            {/* Header / Actions Bar */}
            <div className="p-4 border-b border-[#1f2532] bg-[#141822]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                {isEditorMode ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full bg-[#0d1017] border border-[#273042] rounded-md px-3 py-1.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-100 truncate">
                      {selectedNote.title}
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* AI Actions Dropdown/Buttons */}
                <div className="flex items-center gap-1 bg-[#181d28] border border-[#273042] rounded-md p-0.5">
                  <button
                    onClick={() => triggerAiAction('explain')}
                    className="px-2 py-1 text-[11px] text-indigo-300 hover:bg-[#202736] rounded transition-colors flex items-center gap-1"
                    title="Explain Note with Gemini"
                  >
                    <Sparkles className="w-3 h-3" />
                    Explain
                  </button>
                  <button
                    onClick={() => triggerAiAction('improve')}
                    className="px-2 py-1 text-[11px] text-indigo-300 hover:bg-[#202736] rounded transition-colors flex items-center gap-1"
                    title="Suggest improvements"
                  >
                    <Sparkles className="w-3 h-3" />
                    Improve
                  </button>
                  <button
                    onClick={() => triggerAiAction('summarize')}
                    className="px-2 py-1 text-[11px] text-indigo-300 hover:bg-[#202736] rounded transition-colors flex items-center gap-1"
                    title="Summarize Note"
                  >
                    <Sparkles className="w-3 h-3" />
                    Summarize
                  </button>
                </div>

                {canEdit && (
                  <>
                    {isEditorMode ? (
                      <>
                        <div className="flex items-center bg-[#181d28] rounded-md p-0.5 border border-[#273042] text-xs">
                          <button
                            onClick={() => setEditorTab('write')}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              editorTab === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Write
                          </button>
                          <button
                            onClick={() => setEditorTab('preview')}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              editorTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Preview
                          </button>
                        </div>

                        <Button
                          size="sm"
                          variant="primary"
                          icon={Save}
                          isLoading={saving}
                          onClick={handleSaveNote}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit3}
                        onClick={() => {
                          setIsEditorMode(true);
                          setEditorTab('write');
                        }}
                      >
                        Edit Note
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Note Body Area */}
            <div className="p-5 flex-1 overflow-y-auto">
              {isEditorMode && editorTab === 'write' ? (
                <div className="h-full flex flex-col">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Write Markdown documentation here... Supports # Headers, `code`, **bold**, lists, and tables."
                    className="w-full flex-1 min-h-[420px] bg-[#0c0e13] border border-[#232936] rounded-lg p-4 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Markdown supported</span>
                    <span>{editContent.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <MarkdownRenderer content={isEditorMode ? editContent : selectedNote.content} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon={FileText}
              title="No note selected"
              description="Select a note from the left list or create a new one to start writing documentation."
              actionLabel={canEdit ? 'Create New Note' : undefined}
              onAction={handleCreateNewNote}
            />
          </div>
        )}
      </div>

      {/* AI Assistant Modal for Note Action */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={
          aiActionType === 'explain'
            ? 'Gemini: Explain Note'
            : aiActionType === 'improve'
            ? 'Gemini: Improvement Suggestions'
            : 'Gemini: Note Summary'
        }
        description="AI output is generated as a draft. Review before applying changes to your note."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {aiLoading ? (
            <LoadingSpinner text="Consulting Gemini AI..." />
          ) : aiError ? (
            <Alert variant="danger">
              <p className="font-semibold mb-1">AI Request Failed</p>
              <p>{aiError}</p>
              <p className="mt-2 text-slate-400 text-[11px]">
                Ensure your GEMINI_API_KEY is configured in the server environment.
              </p>
            </Alert>
          ) : (
            <div className="space-y-3">
              <div className="max-h-[380px] overflow-y-auto bg-[#0a0d13] p-4 rounded-lg border border-[#202634]">
                <MarkdownRenderer content={aiResult} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1f2532]">
                <span className="text-[11px] text-slate-400">
                  {aiActionType === 'improve'
                    ? 'Applying will replace current editor buffer with suggested draft.'
                    : 'Draft generated successfully.'}
                </span>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsAiModalOpen(false)}>
                    Close
                  </Button>
                  {aiActionType === 'improve' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Check}
                      onClick={handleApplyAiChanges}
                    >
                      Apply to Note
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
