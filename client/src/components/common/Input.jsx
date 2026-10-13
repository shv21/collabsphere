import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  containerClassName = '',
  icon: Icon,
  required = false,
  ...props
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300 flex items-center gap-1 select-none">
          {label}
          {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full h-9 bg-[#12161f] border rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/80 disabled:opacity-50 disabled:bg-[#0d1017] ${
            Icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-rose-500/80 focus:ring-rose-500/20 focus:border-rose-500'
              : 'border-[#262d3a] hover:border-[#384357]'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-400 mt-0.5 leading-tight">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-0.5 leading-tight">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({
  label,
  error,
  helperText,
  id,
  rows = 4,
  className = '',
  containerClassName = '',
  required = false,
  ...props
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300 flex items-center gap-1 select-none">
          {label}
          {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full bg-[#12161f] border rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/80 disabled:opacity-50 disabled:bg-[#0d1017] ${
          error
            ? 'border-rose-500/80 focus:ring-rose-500/20 focus:border-rose-500'
            : 'border-[#262d3a] hover:border-[#384357]'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-rose-400 mt-0.5 leading-tight">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-0.5 leading-tight">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
