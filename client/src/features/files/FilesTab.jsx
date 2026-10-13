import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Upload, 
  Files, 
  Trash2, 
  Download, 
  Eye, 
  Sparkles, 
  FileCode, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  AlertCircle,
  Copy,
  Clock,
  User
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const FilesTab = ({ projectId, userRole, onProjectUpdated }) => {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  // AI Explain Code Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiError, setAiError] = useState('');

  const canUpload = userRole === 'owner' || userRole === 'admin' || userRole === 'member';

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/files`);
      setFiles(res.files || []);
      if (res.files?.length > 0 && !selectedFile) {
        handleSelectFile(res.files[0]);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load project files');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleSelectFile = async (file) => {
    setSelectedFile(file);
    setFileContent('');

    // If it's a code/text file, fetch its raw content for preview
    if (file.isText) {
      try {
        setContentLoading(true);
        const res = await api.get(`/files/${file._id}`);
        setFileContent(res.content || '');
      } catch (err) {
        toastError('Failed to read file content');
      } finally {
        setContentLoading(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit client-side first (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toastError('File size exceeds maximum allowed limit of 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await api.upload(`/projects/${projectId}/files`, formData);
      const uploaded = res.file;
      setFiles((prev) => [uploaded, ...prev]);
      handleSelectFile(uploaded);
      success(`Uploaded ${file.name} successfully`);
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await api.delete(`/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      if (selectedFile?._id === fileId) {
        const remaining = files.filter((f) => f._id !== fileId);
        if (remaining.length > 0) {
          handleSelectFile(remaining[0]);
        } else {
          setSelectedFile(null);
          setFileContent('');
        }
      }
      success('File deleted');
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'Failed to delete file');
    }
  };

  // AI Explain Code
  const handleExplainCode = async () => {
    if (!selectedFile || !fileContent) return;

    setIsAiModalOpen(true);
    setAiLoading(true);
    setAiExplanation('');
    setAiError('');

    try {
      const res = await api.post('/gemini/explain', {
        code: fileContent,
        filename: selectedFile.originalName,
        language: selectedFile.extension?.replace('.', '') || 'text',
      });
      setAiExplanation(res.explanation || res.result || '');
    } catch (err) {
      setAiError(err.message || 'Failed to generate explanation. Check Gemini API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px] animate-fade-in">
      {/* Left Column: Files Explorer */}
      <div className="w-full lg:w-80 flex flex-col gap-3 bg-[#10141c] border border-[#202734] rounded-xl p-4 shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-[#1d232e]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Files className="w-4 h-4 text-indigo-400" />
            <span>Project Files</span>
            <span className="text-slate-400 font-mono">({files.length})</span>
          </div>

          {canUpload && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                variant="primary"
                icon={Upload}
                isLoading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </Button>
            </div>
          )}
        </div>

        {/* File tree/list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[500px]">
          {loading ? (
            <LoadingSpinner size="sm" text="Loading files..." />
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No files uploaded yet.
            </div>
          ) : (
            files.map((file) => {
              const isSelected = selectedFile?._id === file._id;
              const isImg = file.isImage;

              return (
                <div
                  key={file._id}
                  onClick={() => handleSelectFile(file)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-200'
                      : 'bg-[#131720] border-[#1d232f] hover:bg-[#181d28] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                    {isImg ? (
                      <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : file.isText ? (
                      <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    )}

                    <div className="truncate">
                      <p className="truncate font-medium text-slate-200">{file.originalName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {canUpload && (
                    <button
                      onClick={(e) => handleDeleteFile(file._id, e)}
                      title="Delete file"
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

      {/* Right Column: Code/File Preview */}
      <div className="flex-1 flex flex-col bg-[#12161f] border border-[#232936] rounded-xl overflow-hidden min-h-[550px]">
        {selectedFile ? (
          <div className="flex flex-col h-full flex-1">
            {/* Header / Meta Bar */}
            <div className="p-4 border-b border-[#1f2532] bg-[#141822]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 truncate flex items-center gap-2">
                  <span>{selectedFile.originalName}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#181d28] border border-[#273042] text-slate-300">
                    {selectedFile.extension || 'file'}
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                  <span>Size: {formatFileSize(selectedFile.size)}</span>
                  <span>Uploaded: {new Date(selectedFile.createdAt).toLocaleDateString()}</span>
                  {selectedFile.uploader?.name && (
                    <span>By: {selectedFile.uploader.name}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {selectedFile.isText && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Sparkles}
                    onClick={handleExplainCode}
                    disabled={!fileContent}
                    className="text-indigo-300"
                  >
                    Explain Code
                  </Button>
                )}

                <a
                  href={`/api/files/${selectedFile._id}/download`}
                  download={selectedFile.originalName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[#181d28] hover:bg-[#202736] text-slate-300 border border-[#273042] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Preview Window */}
            <div className="p-4 flex-1 overflow-y-auto">
              {contentLoading ? (
                <LoadingSpinner text="Reading file contents..." />
              ) : selectedFile.isImage ? (
                <div className="flex items-center justify-center p-8 bg-[#0a0d13] rounded-lg border border-[#1e2430]">
                  <img
                    src={selectedFile.url || `/api/files/${selectedFile._id}/download`}
                    alt={selectedFile.originalName}
                    className="max-h-[500px] max-w-full rounded object-contain"
                  />
                </div>
              ) : selectedFile.isText ? (
                <div className="rounded-lg overflow-hidden border border-[#232a39] bg-[#0c0e13]">
                  <div className="px-3.5 py-1.5 bg-[#141822] border-b border-[#1f2532] text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>Preview ({selectedFile.originalName})</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fileContent);
                        success('Code copied to clipboard');
                      }}
                      className="hover:text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[500px]">
                    <code>{fileContent}</code>
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold text-slate-300 mb-1">
                    Preview not available for this binary format
                  </p>
                  <p className="text-xs mb-4">
                    Download the file to inspect it on your local system.
                  </p>
                  <a
                    href={`/api/files/${selectedFile._id}/download`}
                    download={selectedFile.originalName}
                    className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download {selectedFile.originalName}
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon={Files}
              title="No file selected"
              description="Select a file from the explorer to preview syntax or upload code files (JS, TS, Python, JSON, Markdown, etc.)."
              actionLabel={canUpload ? 'Upload File' : undefined}
              onAction={() => fileInputRef.current?.click()}
            />
          </div>
        )}
      </div>

      {/* AI Code Explanation Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={`Gemini Code Analysis: ${selectedFile?.originalName}`}
        description="Beginner-friendly and technically accurate explanation generated by Gemini AI."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {aiLoading ? (
            <LoadingSpinner text="Analyzing code with Gemini AI..." />
          ) : aiError ? (
            <Alert variant="danger">
              <p className="font-semibold mb-1">Analysis Failed</p>
              <p>{aiError}</p>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[380px] overflow-y-auto bg-[#0a0d13] p-4 rounded-lg border border-[#202634]">
                <MarkdownRenderer content={aiExplanation} />
              </div>

              <div className="flex justify-end pt-2 border-t border-[#1f2532]">
                <Button variant="outline" size="sm" onClick={() => setIsAiModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
