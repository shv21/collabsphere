import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Copy, Check, Share2, Trash2, Globe, Lock } from 'lucide-react';

// Tab subcomponents
import { OverviewTab } from '../features/projects/OverviewTab';
import { NotesTab } from '../features/notes/NotesTab';
import { FilesTab } from '../features/files/FilesTab';
import { AIToolsTab } from '../features/ai/AIToolsTab';
import { MembersTab } from '../features/projects/MembersTab';
import { ActivityTab } from '../features/activity/ActivityTab';

export const ProjectWorkspacePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [project, setProject] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.project);
      setUserRole(res.currentUserRole);
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Handle Share Toggle
  const handleToggleShare = async (enable) => {
    try {
      setShareLoading(true);
      if (enable) {
        const res = await api.post(`/projects/${projectId}/share`, {});
        setProject((prev) => ({
          ...prev,
          isPublic: true,
          shareToken: res.shareToken,
        }));
        success('Public sharing enabled!');
      } else {
        await api.delete(`/projects/${projectId}/share`);
        setProject((prev) => ({
          ...prev,
          isPublic: false,
          shareToken: null,
        }));
        success('Public sharing disabled. Link revoked.');
      }
    } catch (err) {
      toastError(err.message || 'Failed to update sharing settings');
    } finally {
      setShareLoading(false);
    }
  };

  const shareUrl = project?.shareToken
    ? `${window.location.origin}/share/${project.shareToken}`
    : '';

  const handleCopyShareLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner text="Loading workspace..." fullPage />;
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Alert variant="danger" className="mb-4">
          {error || 'Project not found or you are not authorized to view it.'}
        </Alert>
        <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar Navigation */}
      <Sidebar
        project={project}
        userRole={userRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main Tab Workspace Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            userRole={userRole}
            onProjectUpdated={fetchProject}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab
            projectId={projectId}
            userRole={userRole}
            project={project}
            onProjectUpdated={fetchProject}
          />
        )}

        {activeTab === 'files' && (
          <FilesTab
            projectId={projectId}
            userRole={userRole}
            onProjectUpdated={fetchProject}
          />
        )}

        {activeTab === 'ai' && (
          <AIToolsTab
            project={project}
            userRole={userRole}
            onProjectUpdated={fetchProject}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            projectId={projectId}
            userRole={userRole}
            project={project}
            onProjectUpdated={fetchProject}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab projectId={projectId} />
        )}
      </div>

      {/* Share Settings Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Public Sharing Settings"
        description="Share a read-only view of your project description and generated README."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0e1218] border border-[#232936]">
            <div className="flex items-center gap-3">
              {project.isPublic ? (
                <Globe className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {project.isPublic ? 'Public Sharing is Active' : 'Project is Private'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {project.isPublic
                    ? 'Anyone with the secret link can view read-only documentation.'
                    : 'Only added project members have access.'}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={project.isPublic ? 'danger' : 'primary'}
              isLoading={shareLoading}
              onClick={() => handleToggleShare(!project.isPublic)}
            >
              {project.isPublic ? 'Revoke Link' : 'Enable Link'}
            </Button>
          </div>

          {project.isPublic && project.shareToken && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-slate-300">Public Share URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-[#090c10] border border-[#232936] rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 select-all focus:outline-none"
                />
                <Button size="sm" variant="secondary" onClick={handleCopyShareLink}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                Private notes, files, internal member lists, and activity logs are never exposed.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
export default ProjectWorkspacePage;
