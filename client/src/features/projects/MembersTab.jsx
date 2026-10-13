import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Shield, Mail, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const MembersTab = ({ projectId, userRole, project, onProjectUpdated }) => {
  const { success, error: toastError } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null);

  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      await api.post(`/projects/${projectId}/members`, {
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      });

      success(`Added ${inviteEmail} to project`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'Failed to add member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId, memberEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${memberEmail || 'this member'} from the project?`)) {
      return;
    }

    try {
      setRemoveLoading(memberUserId);
      await api.delete(`/projects/${projectId}/members/${memberUserId}`);
      success('Member removed');
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      toastError(err.message || 'Failed to remove member');
    } finally {
      setRemoveLoading(null);
    }
  };

  const roleBadges = {
    owner: 'primary',
    admin: 'warning',
    member: 'default',
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header Bar */}
      <div className="bg-[#12161f] border border-[#232936] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Project Members & Collaborators</h2>
            <p className="text-xs text-slate-400">Manage developer access and permissions</p>
          </div>
        </div>

        {canManageMembers && (
          <Button
            size="sm"
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Add Member
          </Button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-[#12161f] border border-[#232936] rounded-xl overflow-hidden">
        <div className="p-3.5 bg-[#141822] border-b border-[#1f2532] text-xs font-semibold text-slate-300">
          Members ({project.members?.length || 0})
        </div>

        <div className="divide-y divide-[#1e2430]">
          {project.members?.map((m) => {
            const memberUser = m.user;
            const isSelf = memberUser?._id === project.currentUserId;
            const isOwnerMember = m.role === 'owner';

            return (
              <div
                key={m._id || memberUser?._id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#141924]/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                    {memberUser?.name ? memberUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-100 flex items-center gap-2 truncate">
                      <span>{memberUser?.name || 'User'}</span>
                      {isSelf && (
                        <span className="text-[10px] text-slate-400 font-mono bg-[#1a2130] px-1.5 py-0.2 rounded">
                          you
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3" />
                      {memberUser?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={roleBadges[m.role] || 'default'} size="xs">
                    {m.role}
                  </Badge>

                  {canManageMembers && !isOwnerMember && !isSelf && (
                    <Button
                      size="sm"
                      variant="danger"
                      className="p-1.5 h-7 w-7 text-xs"
                      title="Remove member"
                      isLoading={removeLoading === memberUser?._id}
                      onClick={() => handleRemoveMember(memberUser?._id, memberUser?.email)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Add Project Member"
        description="Add a registered CollabSphere user to this workspace using their account email."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="User Email Address"
            type="email"
            placeholder="teammate@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Assign Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-[#12161f] border border-[#262d3a] rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="member">Member (Can create & edit notes, upload files)</option>
              <option value="admin">Admin (Can manage project metadata & members)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2532]">
            <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={inviteLoading}>
              Add to Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
