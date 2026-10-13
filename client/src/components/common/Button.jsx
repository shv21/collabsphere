import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0e12] active:scale-[0.98] active:translate-y-[0.5px] disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-sm px-4 py-2.5 gap-2.5 h-10',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-subtle border border-indigo-500/40 hover:border-indigo-400/50',
    secondary: 'bg-[#141822] hover:bg-[#1a2130] active:bg-[#121620] text-slate-200 border border-[#262d3a] hover:border-[#384357] shadow-subtle',
    outline: 'bg-transparent hover:bg-[#141822] active:bg-[#10141c] text-slate-300 hover:text-white border border-[#262d3a] hover:border-[#384357]',
    ghost: 'bg-transparent hover:bg-[#161c27] active:bg-[#121620] text-slate-400 hover:text-slate-100',
    danger: 'bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-950/80 text-rose-300 border border-rose-800/40 hover:border-rose-700/60 shadow-subtle',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 text-current shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
