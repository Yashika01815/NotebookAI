import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useWorkspaceStore, useDocumentStore, useUIStore } from '../../store/index.js';
import { workspaceAPI, documentAPI } from '../../services/api.js';
import ChatInterface from '../chat/ChatInterface.jsx';
import RightPanel from './RightPanel.jsx';
import WorkspaceHeader from './WorkspaceHeader.jsx';
import toast from 'react-hot-toast';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const { workspaces, setActiveWorkspace, activeWorkspace } = useWorkspaceStore();
  const { setDocuments, setLoading } = useDocumentStore();

  useEffect(() => {
    if (!workspaceId) return;

    const ws = workspaces.find(w => w._id === workspaceId);
    if (ws) setActiveWorkspace(ws);

    const loadDocs = async () => {
      setLoading(true);
      try {
        const data = await documentAPI.getAll(workspaceId);
        setDocuments(data.documents);
      } catch {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    loadDocs();

    // Poll for indexing status
    const interval = setInterval(async () => {
      try {
        const data = await documentAPI.getAll(workspaceId);
        setDocuments(data.documents);
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [workspaceId]);

  if (!workspaceId) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader workspace={activeWorkspace} />
      <div className="flex flex-1 overflow-hidden">
        <ChatInterface workspaceId={workspaceId} />
        <RightPanel workspaceId={workspaceId} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
          <BookOpenIcon className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Select a Workspace</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Choose a workspace from the sidebar or create a new one to start organizing your knowledge with AI.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <SparklesIcon className="w-4 h-4 text-brand-400" />
          <span>Powered by Google Gemini + RAG</span>
        </div>
      </motion.div>
    </div>
  );
}
