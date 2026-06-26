import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PlusIcon, TrashIcon, BookOpenIcon, Cog6ToothIcon,
  ArrowRightOnRectangleIcon, ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, useWorkspaceStore, useChatStore } from '../../store/index.js';
import { workspaceAPI } from '../../services/api.js';
import Logo from '../ui/Logo.jsx';
import CreateWorkspaceModal from '../workspace/CreateWorkspaceModal.jsx';

const WORKSPACE_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];

export default function Sidebar() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { user, logout } = useAuthStore();
  const { workspaces, removeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { clearChat } = useChatStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectWorkspace = (ws) => {
    setActiveWorkspace(ws);
    clearChat();
    navigate(`/dashboard/workspace/${ws._id}`);
  };

  const handleDelete = async (e, ws) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${ws.name}"? This cannot be undone.`)) return;
    setDeletingId(ws._id);
    try {
      await workspaceAPI.delete(ws._id);
      removeWorkspace(ws._id);
      toast.success('Workspace deleted');
      if (workspaceId === ws._id) navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col bg-surface-900 border-r border-white/5 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          {!collapsed && <Logo size="sm" />}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="btn-ghost p-1.5 ml-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronDoubleRightIcon className="w-4 h-4" />
              : <ChevronDoubleLeftIcon className="w-4 h-4" />
            }
          </button>
        </div>

        {/* New Workspace */}
        <div className="p-3 border-b border-white/5">
          <button
            onClick={() => setShowCreate(true)}
            className={`btn-primary w-full ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <PlusIcon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>New Workspace</span>}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                className="input pl-8 py-2 text-xs"
                placeholder="Search workspaces..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Workspaces List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {!collapsed && (
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider px-2 py-1 mb-2">
              Workspaces ({filtered.length})
            </p>
          )}

          <AnimatePresence>
            {filtered.map((ws) => (
              <motion.div
                key={ws._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => handleSelectWorkspace(ws)}
                className={`sidebar-item group relative ${workspaceId === ws._id ? 'sidebar-item-active' : ''}`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ws.color || '#6366f1' }}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{ws.name}</span>
                    <button
                      onClick={(e) => handleDelete(e, ws)}
                      disabled={deletingId === ws._id}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                    >
                      {deletingId === ws._id
                        ? <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                        : <TrashIcon className="w-3 h-3" />
                      }
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !collapsed && (
            <div className="text-center py-8">
              <BookOpenIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-xs">No workspaces yet</p>
              <button onClick={() => setShowCreate(true)} className="text-brand-400 text-xs mt-1 hover:underline">
                Create your first one
              </button>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-white/5">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="btn-ghost p-1.5" title="Logout">
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn-ghost w-full justify-center p-2" title="Logout">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.aside>

      <CreateWorkspaceModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
