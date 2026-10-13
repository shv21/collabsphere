import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md', fullPage = false }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-slate-400 animate-fade-in">
      <Loader2 className={`${sizeMap[size]} animate-spin text-indigo-400`} />
      {text && <p className="text-xs font-medium tracking-wide text-slate-400">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Restrained skeleton card for dashboard loading without layout shifts
export const ProjectCardSkeleton = () => {
  return (
    <div className="bg-[#12161f] border border-[#232936] rounded-xl p-5 flex flex-col justify-between h-[162px] animate-pulse-subtle">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="h-4 bg-[#1a2130] rounded w-1/2"></div>
          <div className="h-4 bg-[#1a2130] rounded w-14"></div>
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="h-3 bg-[#181e2b] rounded w-5/6"></div>
          <div className="h-3 bg-[#181e2b] rounded w-3/5"></div>
        </div>
      </div>
      <div className="pt-3 border-t border-[#1e2432] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 bg-[#181e2b] rounded w-8"></div>
          <div className="h-3 bg-[#181e2b] rounded w-12"></div>
        </div>
        <div className="h-3 bg-[#181e2b] rounded w-16"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
