import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FolderGit2, ArrowLeft, Lock, Globe, Plus } from 'lucide-react';
import { Input, Textarea } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const NewProjectPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { success } = useToast();

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Project name is required';
    } else if (name.trim().length < 3) {
      errs.name = 'Project name must be at least 3 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/projects', {
        name: name.trim(),
        description: description.trim(),
        isPublic,
      });

      success('Project created successfully!');
      navigate(`/projects/${res.project._id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full animate-fade-in-up">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors duration-150 mb-6 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      <div className="bg-[#12161f] border border-[#232936] rounded-xl p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 pb-6 border-b border-[#1f2532] mb-6">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-100 tracking-tight">Create New Project</h1>
            <p className="text-xs text-slate-400 mt-0.5">Set up a project workspace for collaboration</p>
          </div>
        </div>

        {serverError && (
          <Alert variant="danger" className="mb-6">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Project name"
            id="name"
            placeholder="e.g. auth-gateway-service or docs-portal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            helperText="Use a concise, recognizable technical name"
            required
          />

          <Textarea
            label="Project description"
            id="description"
            rows={3}
            placeholder="High-level architecture, purpose, and key engineering objectives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText="Brief summary visible across workspace dashboards"
          />

          {/* Visibility selection with refined hover and border transitions */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 select-none">Visibility Setting</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-150 ease-out select-none ${
                  !isPublic
                    ? 'bg-indigo-950/20 border-indigo-500/50 shadow-subtle'
                    : 'bg-[#151922] border-[#232936] hover:border-[#384357]'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500/50"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Private Project
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Only explicitly added members can view or edit this project.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-150 ease-out select-none ${
                  isPublic
                    ? 'bg-indigo-950/20 border-indigo-500/50 shadow-subtle'
                    : 'bg-[#151922] border-[#232936] hover:border-[#384357]'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500/50"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Public Project
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Allows read-only public sharing via a secure token.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f2532]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={loading}
              icon={Plus}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectPage;
