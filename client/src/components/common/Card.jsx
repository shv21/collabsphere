import React from 'react';

export const Card = ({
  children,
  className = '',
  header,
  footer,
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#12161f] border border-[#232936] rounded-xl overflow-hidden text-slate-200 transition-all duration-200 ease-out shadow-card ${
        hoverable
          ? 'hover:border-[#384357] hover:bg-[#141924] hover:-translate-y-0.5 hover:shadow-cardHover active:translate-y-0 active:scale-[0.995] cursor-pointer'
          : ''
      } ${className}`}
    >
      {header && (
        <div className="px-5 py-3.5 border-b border-[#1e2430] bg-[#141822]/60">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-[#1e2430] bg-[#10131b]/60 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
