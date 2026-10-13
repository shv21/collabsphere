import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div
      className={`animate-fade-in-up flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#232936] rounded-xl bg-[#0e1117]/50 transition-all ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-[#141822] border border-[#262d3a] flex items-center justify-center text-indigo-400 mb-3 shadow-subtle transition-transform duration-200 hover:scale-105">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-100 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction} icon={actionIcon} variant="primary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
