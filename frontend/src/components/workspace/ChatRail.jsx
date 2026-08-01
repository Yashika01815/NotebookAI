import React from 'react';
import { ChatBubbleLeftRightIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '../../store/index.js';

export default function ChatRail() {
  const { toggleFocusMode } = useUIStore();

  return (
    <button
      onClick={toggleFocusMode}
      title="Show chat"
      className="h-full w-16 flex flex-col items-center justify-between py-6 border-r border-white/5 bg-surface-900/50 hover:bg-white/5 transition-colors group"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:scale-105 transition-transform">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
        </div>
        <span
          className="text-[11px] font-medium text-slate-400 group-hover:text-white tracking-wide transition-colors"
          style={{ writingMode: 'vertical-rl' }}
        >
          Chat
        </span>
      </div>
      <ArrowsPointingInIcon className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />
    </button>
  );
}