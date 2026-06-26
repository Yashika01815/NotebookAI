import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { workspaceAPI } from '../../services/api.js';
import { useWorkspaceStore } from '../../store/index.js';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#f97316'];
const ICONS = ['book', 'brain', 'star', 'rocket', 'lightning', 'code', 'chart', 'globe'];

export default function CreateWorkspaceModal({ isOpen, onClose }) {
  const { addWorkspace } = useWorkspaceStore();
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0], icon: ICONS[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const data = await workspaceAPI.create(form);
      addWorkspace(data.workspace);
      toast.success('Workspace created!');
      setForm({ name: '', description: '', color: COLORS[0], icon: ICONS[0] });
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="card p-6 w-full max-w-md relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">New Workspace</h2>
              <button onClick={onClose} className="btn-ghost p-1.5">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Workspace Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Research Notes, Study Materials..."
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="What's this workspace about?"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, color }))}
                      className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'scale-125 ring-2 ring-white/50 ring-offset-1 ring-offset-surface-900' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-surface-800 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
                  <span className="text-white font-medium">{form.name || 'Workspace Name'}</span>
                </div>
                {form.description && (
                  <p className="text-slate-400 text-xs mt-1 ml-6">{form.description}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                  ) : 'Create Workspace'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
