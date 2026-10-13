import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Files, 
  Sparkles, 
  Users, 
  Activity, 
  ArrowLeft,
  Share2,
  Lock,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';

export const Sidebar = ({ 
  project, 
  userRole, 
  activeTab, 
  onTabChange,
  onOpenShareModal,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: FileText, count: project?.notesCount },
    { id: 'files', label: 'Files & Code', icon: Files, count: project?.filesCount },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles, badge: 'Gemini' },
    { id: 'members', label: 'Members', icon: Users, count: project?.members?.length },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  const roleColors = {
    owner: 'primary',
    admin: 'warning',
    member: 'default',
  };

  return (
    <aside className="w-full md:w-64 bg-[#0f131a] border-r border-[#1e2432] flex flex-col shrink-0 select-none">
      {/* Project Meta Header */}
      <div className="p-4 border-b border-[#1e2432]">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors duration-150 mb-3 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all projects
        </Link>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-100 truncate tracking-tight" title={project?.name}>
              {project?.name || 'Project'}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {userRole && (
                <Badge variant={roleColors[userRole] || 'default'} size="xs">
                  {userRole}
                </Badge>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                {project?.isPublic ? (
                  <>
                    <Globe className="w-3 h-3 text-emerald-400" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-slate-400" />
                    Private
                  </>
                )}
              </span>
            </div>
          </div>

          {userRole === 'owner' && (
            <button
              onClick={onOpenShareModal}
              title="Share Settings"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#19202c] rounded-lg transition-all duration-150 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ease-out active:scale-[0.99] ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-subtle'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161c27] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/40 text-indigo-300">
                  {item.badge}
                </span>
              )}
              {typeof item.count === 'number' && (
                <span className="text-[11px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#161b24] border border-[#202736]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1e2432] text-[11px] text-slate-400 bg-[#0c1017]">
        <div className="truncate flex items-center justify-between">
          <span>Created:</span>
          <span className="font-mono text-slate-400">
            {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
