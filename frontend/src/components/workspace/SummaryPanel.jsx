import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api.js';

const TYPES = [
  { id: 'short', label: 'Quick', desc: '2-3 sentence overview' },
  { id: 'detailed', label: 'Detailed', desc: 'Comprehensive breakdown' },
  { id: 'insights', label: 'Key Insights', desc: 'Critical takeaways' },
];

export default function SummaryPanel({ workspaceId }) {
  const [activeType, setActiveType] = useState('short');
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(false);

  const generate = async (type) => {
    if (summaries[type]) return;
    setLoading(true);
    setActiveType(type);
    try {
      const data = await aiAPI.getSummary(workspaceId, { type });
      setSummaries(p => ({ ...p, [type]: data.summary }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => generate(activeType);
  const handleRefresh = () => {
    setSummaries(p => ({ ...p, [activeType]: undefined }));
    generate(activeType);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-4 h-4 text-brand-400" />
        <h3 className="text-sm font-semibold text-white">AI Summary</h3>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-800 rounded-xl">
        {TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveType(t.id)}
            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
              activeType === t.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        {TYPES.find(t => t.id === activeType)?.desc}
      </p>

      {/* Content */}
      <AnimatePresence mode="wait">
        {summaries[activeType] ? (
          <motion.div
            key={activeType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {activeType === 'insights' ? (
              <div className="space-y-2">
                {(Array.isArray(summaries[activeType]) ? summaries[activeType] : [summaries[activeType]]).map((insight, i) => (
                  <div key={i} className="flex gap-2 bg-surface-800 rounded-xl p-3 border border-white/5">
                    <LightBulbIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-800 rounded-xl p-4 border border-white/5">
                <div className="prose-custom text-sm">
                  <ReactMarkdown>{summaries[activeType]}</ReactMarkdown>
                </div>
              </div>
            )}

            <button onClick={handleRefresh} disabled={loading} className="btn-ghost w-full justify-center text-xs py-2">
              {loading ? 'Regenerating...' : '↺ Regenerate'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <SparklesIcon className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-4">Generate an AI-powered summary</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary mx-auto"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              ) : (
                <><SparklesIcon className="w-4 h-4" />Generate {TYPES.find(t => t.id === activeType)?.label}</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
