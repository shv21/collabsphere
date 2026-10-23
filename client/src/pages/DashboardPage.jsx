import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Users, 
  Lock, 
  Globe, 
  Filter,
  ChevronDown,
  X
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner, ProjectCardSkeleton } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'owner' | 'member'

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/projects');
      setProjects(res.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'owner') return p.currentUserRole === 'owner';
    if (roleFilter === 'member') return p.currentUserRole === 'member' || p.currentUserRole === 'admin';
    if (roleFilter === 'public') return p.isPublic;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 animate-fade-in-up">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2532] mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Projects Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Organize repositories, technical notes, shared files, and AI assistance.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="sm"
          onClick={() => navigate('/projects/new')}
          className="self-start sm:self-auto shrink-0"
        >
          Create Project
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Controls: Search and Filters with unified heights and transitions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search projects by name, description, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            className="pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0 select-none">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filter:
          </span>
          <div className="relative w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-[#12161f] border border-[#262d3a] hover:border-[#384357] text-xs font-medium text-slate-200 rounded-lg pl-3 pr-8 py-2 h-9 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/80 cursor-pointer"
            >
              <option value="all">All Projects</option>
              <option value="owner">Owned by me</option>
              <option value="member">Shared with me</option>
              <option value="public">Public Projects</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Project list, Skeleton Loading, or Empty states */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Create your first developer workspace to start writing technical notes, uploading files, and collaborating."
          actionLabel="Create Project"
          actionIcon={Plus}
          onAction={() => navigate('/projects/new')}
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching projects"
          description={`No projects found matching "${searchQuery}". Try a different search term or filter.`}
          actionLabel="Clear filter"
          onAction={() => {
            setSearchQuery('');
            setRoleFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              hoverable
              onClick={() => navigate(`/projects/${project._id}`)}
              className="group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate flex-1 leading-snug">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant={
                        project.currentUserRole === 'owner'
                          ? 'primary'
                          : project.currentUserRole === 'admin'
                          ? 'warning'
                          : project.currentUserRole === 'viewer'
                          ? 'outline'
                          : 'default'
                      }
                      size="xs"
                    >
                      {project.currentUserRole || 'member'}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed h-8">
                  {project.description || 'No project description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1e2432] flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5" title="Members">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.membersCount || project.members?.length || 1}</span>
                  </span>
                  <span className="flex items-center gap-1.5" title={project.isPublic ? 'Public Project' : 'Private Project'}>
                    {project.isPublic ? (
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{project.isPublic ? 'Public' : 'Private'}</span>
                  </span>
                  {project.owner?.name && project.currentUserRole !== 'owner' && (
                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={`Created by ${project.owner.name}`}>
                      by {project.owner.name}
                    </span>
                  )}
                </div>

                <span className="font-mono text-slate-400 text-[11px]">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : ''}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
