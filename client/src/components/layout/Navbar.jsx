import React from 'react';
import { Terminal, Plus, LogOut, FolderGit2 } from 'lucide-react';
import { Link as RouterLink, useNavigate as useRouterNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useRouterNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#202634] bg-[#0c0e12]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <RouterLink to="/dashboard" className="flex items-center gap-2.5 group select-none">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400/50 group-hover:bg-indigo-600/15 transition-all duration-150">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-1.5">
                CollabSphere
                <span className="text-[10px] font-mono font-normal uppercase px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/40 text-indigo-300">
                  v1.0
                </span>
              </span>
            </div>
          </RouterLink>

          {user && (
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <RouterLink
                to="/dashboard"
                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#161b26] transition-all duration-150 flex items-center gap-1.5 font-medium"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                Projects
              </RouterLink>
            </nav>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => navigate('/projects/new')}
                className="hidden sm:inline-flex text-xs"
              >
                New Project
              </Button>

              {/* User profile capsule */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#202634]">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#12161f] border border-[#222938] shadow-subtle">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-300 font-mono text-[11px] flex items-center justify-center font-semibold shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs text-slate-300 max-w-[120px] truncate hidden md:inline-block font-medium">
                    {user.name}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="text-slate-400 hover:text-rose-400 p-1.5 h-8 w-8 rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <RouterLink
                to="/login"
                className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg transition-colors font-medium"
              >
                Sign in
              </RouterLink>
              <RouterLink
                to="/register"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all duration-150 font-medium shadow-subtle border border-indigo-500/40 active:scale-[0.98]"
              >
                Get Started
              </RouterLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
