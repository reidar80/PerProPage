import React, { useState } from 'react';

interface SimpleTooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ text, children, position = 'top', className = '' }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={`absolute z-[999] px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-75 ${
          position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' :
          position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' :
          position === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' :
          'left-full ml-2 top-1/2 -translate-y-1/2'
        }`}>
          {text}
          {/* Small arrow */}
          <div className={`absolute w-2 h-2 bg-slate-800 rotate-45 ${
             position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' :
             position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' :
             position === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' :
             'right-full -mr-1 top-1/2 -translate-y-1/2'
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default SimpleTooltip;