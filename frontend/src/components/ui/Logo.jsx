import React from 'react';

const sizes = {
  sm: { icon: 'w-6 h-6', text: 'text-base', gap: 'gap-2' },
  md: { icon: 'w-7 h-7', text: 'text-lg', gap: 'gap-2.5' },
  lg: { icon: 'w-9 h-9', text: 'text-2xl', gap: 'gap-3' },
};

export default function Logo({ size = 'md', showText = true }) {
  const s = sizes[size];
  return (
    <div className={`flex items-center ${s.gap}`}>
      <div className={`${s.icon} rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${s.text} bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent`}>
          NotebookAI
        </span>
      )}
    </div>
  );
}
