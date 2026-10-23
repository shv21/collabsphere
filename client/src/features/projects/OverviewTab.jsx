import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Files, 
  Users, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock, 
  Check, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const OverviewTab = ({ project, userRole, onProjectUpdated, onNavigateTab }) => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editName, setEditName] = useState(project.name || '');
  const [editDescription, setEditDescription] = useState(project.description || '');
  const [editIsPublic, setEditIsPublic] = useState(!!project.isPublic);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canManage = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setEditLoading(true);
      await api.patch(`/projects/${project._id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editIsPublic,
      });
      success('Project updated successfully');
      setIsEditModalOpen(false);
      onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'Failed to update project');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/projects/${project._id}`);
      success('Project deleted');
      navigate('/dashboard');
    } catch (err) {
      toastError(err.message || 'Failed to delete project');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      {/* Project Banner Card */}
      <div className="bg-[#12161f] border border-[#232936] rounded-xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1f2532]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">{project.name}</h2>
              <Badge
                variant={
                  isOwner
                    ? 'primary'
                    : userRole === 'admin'
                    ? 'warning'
                    : userRole === 'viewer'
                    ? 'outline'
                    : 'default'
                }
                size="xs"
              >
                {userRole}
              </Badge>
              <Badge variant={project.isPublic ? 'success' : 'default'} size="xs">
                {project.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {project.description || 'No description provided. Add one in project settings.'}
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="secondary"
                icon={Edit3}
                onClick={() => {
                  setEditName(project.name);
                  setEditDescription(project.description || '');
                  setEditIsPublic(!!project.isPublic);
                  setIsEditModalOpen(true);
                }}
              >
                Edit Details
              </Button>

              {isOwner && (
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => setIsDeleteModalOpen(true)}
                  aria-label="Delete project"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Workspace Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div
            onClick={() => onNavigateTab('notes')}
            className="p-3 bg-[#0e1218] border border-[#202736] rounded-lg hover:border-[#343e52] hover:-translate-y-0.5 hover:shadow-subtle cursor-pointer transition-all duration-150 ease-out active:translate-y-0 select-none"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Notes</span>
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-lg font-semibold font-mono text-slate-100">
              {project.notesCount ?? 0}
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('files')}
            className="p-3 bg-[#0e1218] border border-[#202736] rounded-lg hover:border-[#343e52] hover:-translate-y-0.5 hover:shadow-subtle cursor-pointer transition-all duration-150 ease-out active:translate-y-0 select-none"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Files & Code</span>
              <Files className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-lg font-semibold font-mono text-slate-100">
              {project.filesCount ?? 0}
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('members')}
            className="p-3 bg-[#0e1218] border border-[#202736] rounded-lg hover:border-[#343e52] hover:-translate-y-0.5 hover:shadow-subtle cursor-pointer transition-all duration-150 ease-out active:translate-y-0 select-none"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Members</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-lg font-semibold font-mono text-slate-100">
              {project.members?.length || 1}
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('ai')}
            className="p-3 bg-[#0e1218] border border-[#202736] rounded-lg hover:border-[#343e52] hover:-translate-y-0.5 hover:shadow-subtle cursor-pointer transition-all duration-150 ease-out active:translate-y-0 select-none"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>AI Tools</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-xs font-mono text-indigo-300 mt-1.5">
              README & Docs
            </p>
          </div>
        </div>
      </div>

      {/* Project README View */}
      <div className="bg-[#12161f] border border-[#232936] rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2532] mb-4">
          <div className="flex items-center gap-2 text-slate-200">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold">Project README.md</h3>
          </div>

          {canManage && (
            <Button
              size="sm"
              variant="secondary"
              icon={Sparkles}
              onClick={() => onNavigateTab('ai')}
            >
              {project.readme ? 'Regenerate / Edit' : 'Generate with AI'}
            </Button>
          )}
        </div>

        {project.readme ? (
          <div className="p-4 bg-[#0e1218] rounded-lg border border-[#1e2430]">
            <MarkdownRenderer content={project.readme} />
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            <p className="mb-3">No README documentation has been saved for this project yet.</p>
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                icon={Sparkles}
                onClick={() => onNavigateTab('ai')}
              >
                Generate structured README now
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project Details"
      >
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <Input
            label="Project Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Textarea
            label="Project Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
          />

          {/* Visibility selection in edit modal */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 select-none">Visibility Setting</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all duration-150 select-none ${
                  !editIsPublic
                    ? 'bg-indigo-950/20 border-indigo-500/50 shadow-subtle'
                    : 'bg-[#151922] border-[#232936] hover:border-[#384357]'
                }`}
              >
                <input
                  type="radio"
                  name="editVisibility"
                  checked={!editIsPublic}
                  onChange={() => setEditIsPublic(false)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500/50"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Private Project
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Only members can view.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all duration-150 select-none ${
                  editIsPublic
                    ? 'bg-indigo-950/20 border-indigo-500/50 shadow-subtle'
                    : 'bg-[#151922] border-[#232936] hover:border-[#384357]'
                }`}
              >
                <input
                  type="radio"
                  name="editVisibility"
                  checked={editIsPublic}
                  onChange={() => setEditIsPublic(true)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500/50"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Public Project
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Visible to other users.
                  </p>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2532]">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        description="This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-100">{project.name}</strong>?
            All associated notes, uploaded files, and activity history will be permanently removed.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2532]">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteLoading}
              onClick={handleDeleteProject}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
