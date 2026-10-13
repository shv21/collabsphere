import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Terminal, Globe, Calendar, FileText, ArrowLeft, Copy, Check } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { api } from '../services/api';

export const PublicSharePage = () => {
  const { shareToken } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPublicProject = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/public/share/${shareToken}`);
        setProject(res.project);
      } catch (err) {
        setError(err.message || 'This project is private or the share link has expired/been revoked.');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchPublicProject();
    }
  }, [shareToken]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner text="Loading shared project documentation..." fullPage />;
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto mb-4 font-mono">
          !
        </div>
        <h1 className="text-lg font-semibold text-slate-100 mb-2">Access Denied or Link Revoked</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          {error || 'This project cannot be viewed publicly. The owner may have disabled public sharing or the link has changed.'}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Sign in to CollabSphere
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
      {/* Public Header */}
      <div className="bg-[#12161f] border border-[#232936] rounded-xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2532]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-100">{project.name}</h1>
                <Badge variant="success" size="xs">
                  Public View
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">Shared project overview & technical documentation</p>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-[#181d28] hover:bg-[#202736] text-slate-300 border border-[#273042] transition-colors self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Copy Share Link'}</span>
          </button>
        </div>

        {project.description && (
          <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-[#0e1117] p-3.5 rounded-lg border border-[#1b202c]">
            {project.description}
          </p>
        )}
      </div>

      {/* Shared Readme Documentation */}
      <div className="bg-[#12161f] border border-[#232936] rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 pb-4 border-b border-[#1f2532] mb-6 text-slate-200">
          <FileText className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold">README.md Documentation</h2>
        </div>

        {project.readme ? (
          <MarkdownRenderer content={project.readme} />
        ) : (
          <div className="text-xs text-slate-400 italic py-6 text-center">
            No README documentation has been published yet for this project.
          </div>
        )}
      </div>
    </div>
  );
};
export default PublicSharePage;
