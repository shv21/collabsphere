import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({
  variant = 'info', // 'info' | 'success' | 'warning' | 'danger'
  title,
  children,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-[#121927] border-indigo-500/30 text-indigo-200',
    success: 'bg-[#101b17] border-emerald-500/30 text-emerald-200',
    warning: 'bg-[#1b1912] border-amber-500/30 text-amber-200',
    danger: 'bg-[#1d1316] border-rose-500/30 text-rose-200',
  };

  const icons = {
    info: <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs leading-relaxed ${variantStyles[variant]} ${className}`}>
      {icons[variant]}
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
};
