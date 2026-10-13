import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#161a24] border border-[#232938] flex items-center justify-center text-slate-400 mb-4 font-mono text-sm font-bold">
        404
      </div>
      <h1 className="text-xl font-semibold text-slate-100 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        The requested resource, project, or route could not be found. Check the URL or return to your dashboard.
      </p>
      <Link to="/dashboard">
        <Button variant="secondary" icon={ArrowLeft} size="sm">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
export default NotFoundPage;
