import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  Files, 
  UserPlus, 
  UserMinus, 
  Sparkles, 
  Clock, 
  User,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';

export const ActivityTab = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError('');
        const [activityRes, analyticsRes] = await Promise.all([
          api.get(`/projects/${projectId}/activity`),
          api.get(`/projects/${projectId}/analytics`),
        ]);
        setActivities(activityRes.activities || []);
        setAnalytics(analyticsRes.analytics || null);
      } catch (err) {
        setError(err.message || 'Failed to load project activity data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchActivityData();
    }
  }, [projectId]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'project_created':
        return <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'note_created':
      case 'note_updated':
      case 'note_deleted':
        return <FileText className="w-3.5 h-3.5 text-indigo-300" />;
      case 'file_uploaded':
      case 'file_deleted':
        return <Files className="w-3.5 h-3.5 text-emerald-400" />;
      case 'member_added':
        return <UserPlus className="w-3.5 h-3.5 text-amber-400" />;
      case 'member_removed':
        return <UserMinus className="w-3.5 h-3.5 text-rose-400" />;
      case 'readme_saved':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="bg-[#12161f] border border-[#232936] rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Project Activity & Contribution Audit</h2>
            <p className="text-xs text-slate-400">Chronological history of recorded events and developer contributions</p>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <LoadingSpinner text="Fetching audit timeline..." />
      ) : (
        <>
          {/* Contribution Summary Cards (Real metrics per member) */}
          {analytics && analytics.memberContributions && (
            <div className="bg-[#12161f] border border-[#232936] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span>Member Contributions Summary</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  (Aggregated from real project actions)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {analytics.memberContributions.map((contrib) => (
                  <div
                    key={contrib.userId || contrib.userName}
                    className="p-3 bg-[#0e1218] border border-[#202736] rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 font-medium text-slate-200 mb-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        {contrib.userName ? contrib.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="truncate">{contrib.userName || 'Member'}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                      <div className="flex justify-between">
                        <span>Total actions:</span>
                        <span className="text-slate-200">{contrib.totalActions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Notes created/edited:</span>
                        <span className="text-indigo-300">{contrib.notesCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Files uploaded:</span>
                        <span className="text-emerald-300">{contrib.filesCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline List */}
          <div className="bg-[#12161f] border border-[#232936] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-200 mb-4">Activity Timeline</h3>

            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No activity recorded yet for this project.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#202736]">
                {activities.map((act) => (
                  <div key={act._id} className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#151a24] border border-[#273042] flex items-center justify-center shrink-0">
                      {getEventIcon(act.type)}
                    </div>

                    <div className="flex-1 bg-[#0e1218] border border-[#1e2430] p-3 rounded-lg text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-slate-200">
                          {act.actor?.name || 'A team member'}{' '}
                          <span className="font-normal text-slate-400">{act.message}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {act.metadata?.targetTitle && (
                        <p className="text-[11px] font-mono text-indigo-300 mt-1">
                          Item: {act.metadata.targetTitle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
