import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'
  size = 'sm',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded-md uppercase tracking-tight select-none transition-colors';

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 leading-none',
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    default: 'bg-[#181d28] text-slate-300 border border-[#273042]',
    primary: 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/40',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/40',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-700/40',
    danger: 'bg-rose-950/60 text-rose-300 border border-rose-700/40',
    outline: 'bg-transparent text-slate-400 border border-slate-700/60',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
