import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api.js';

export default function FlashcardPanel({ workspaceId }) {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await aiAPI.getFlashcards(workspaceId);
      setCards(data.flashcards);
      setCurrent(0);
      setFlipped(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const next = () => { setCurrent(c => (c + 1) % cards.length); setFlipped(false); };
  const prev = () => { setCurrent(c => (c - 1 + cards.length) % cards.length); setFlipped(false); };

  if (!cards.length) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-400">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Flashcards</h3>
          <p className="text-xs text-slate-400 mb-4">Generate study flashcards from your documents</p>
          <button onClick={generate} disabled={loading} className="btn-primary">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              : <><SparklesIcon className="w-4 h-4" />Generate Flashcards</>
            }
          </button>
        </div>
      </div>
    );
  }

  const card = cards[current];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Flashcards</h3>
        <button onClick={generate} disabled={loading} className="btn-ghost text-xs py-1.5 px-2.5">
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          New Set
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${((current + 1) / cards.length) * 100}%` }}
          />
        </div>
        <span>{current + 1}/{cards.length}</span>
      </div>

      {/* Card */}
      <div className="relative h-48 cursor-pointer" onClick={() => setFlipped(f => !f)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current}-${flipped}`}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-5 text-center ${
              flipped
                ? 'bg-brand-600/10 border-brand-500/20'
                : 'bg-surface-800 border-white/5'
            }`}
          >
            <p className={`text-xs font-medium mb-3 ${flipped ? 'text-brand-400' : 'text-slate-500'}`}>
              {flipped ? 'ANSWER' : 'QUESTION'}
            </p>
            <p className={`text-sm leading-relaxed ${flipped ? 'text-slate-200' : 'text-white font-medium'}`}>
              {flipped ? card.back : card.front}
            </p>
            {card.category && (
              <span className="badge badge-purple mt-4">{card.category}</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-slate-500">Click card to flip</p>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prev} className="btn-ghost p-2.5">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setFlipped(f => !f)}
          className="btn-primary px-6 py-2 text-sm"
        >
          {flipped ? 'Show Question' : 'Reveal Answer'}
        </button>
        <button onClick={next} className="btn-ghost p-2.5">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* All cards overview */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setFlipped(false); }}
            className={`w-6 h-1.5 rounded-full transition-all ${
              i === current ? 'bg-brand-500' : 'bg-white/10 hover:bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
