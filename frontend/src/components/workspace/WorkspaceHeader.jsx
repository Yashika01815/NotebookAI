import React from 'react';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useDocumentStore } from '../../store/index.js';

export default function WorkspaceHeader({ workspace }) {
  const { documents } = useDocumentStore();
  const indexed = documents.filter(d => d.isIndexed).length;

  if (!workspace) return null;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: workspace.color || '#6366f1' }}
        />
        <div>
          <h1 className="text-white font-semibold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-slate-500 text-xs">{workspace.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <DocumentTextIcon className="w-3.5 h-3.5" />
          <span>{documents.length} doc{documents.length !== 1 ? 's' : ''}</span>
        </div>
        {indexed > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{indexed} indexed</span>
          </div>
        )}
      </div>
    </header>
  );
}
