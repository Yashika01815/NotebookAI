import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../ui/Logo.jsx';

const FEATURES = [
  { icon: '🧠', title: 'RAG-Powered Chat', desc: 'Chat with your documents using Retrieval-Augmented Generation backed by Google Gemini.' },
  { icon: '🗺️', title: 'Mind Maps', desc: 'Automatically visualize document structure as interactive, explorable mind maps.' },
  { icon: '📊', title: 'Knowledge Graph', desc: 'Extract entities and relationships into a dynamic graph visualization.' },
  { icon: '🃏', title: 'Flashcards', desc: 'Generate study flashcards from any document with a single click.' },
  { icon: '📝', title: 'AI Summaries', desc: 'Get quick overviews, detailed breakdowns, or key insights instantly.' },
  { icon: '🎯', title: 'Smart Quizzes', desc: 'Test comprehension with AI-generated multiple choice quizzes.' },
];

const STACK = ['Google Gemini', 'LangChain', 'ChromaDB', 'React Flow', 'MongoDB', 'Node.js'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/8 blur-[100px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Powered by Google Gemini + ChromaDB RAG
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Your AI knowledge
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              workspace
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your documents. Chat with them, generate mind maps, build knowledge graphs,
            create flashcards and quizzes — all powered by AI and vector search.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-lg shadow-brand-500/20">
              Start for free →
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-3">
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* App screenshot mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-800/80 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="flex-1 mx-4 h-5 bg-surface-700/60 rounded-md" />
            </div>
            {/* Layout preview */}
            <div className="flex h-64">
              <div className="w-48 bg-surface-900 border-r border-white/5 p-3 space-y-2">
                <div className="h-3 bg-white/10 rounded w-24" />
                {['Research', 'Study Notes', 'Projects'].map(n => (
                  <div key={n} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <div className="h-2.5 bg-white/15 rounded flex-1" />
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4 space-y-3">
                <div className="flex justify-end">
                  <div className="bg-brand-600/30 border border-brand-500/20 rounded-xl rounded-tr-sm px-4 py-2 max-w-xs">
                    <div className="h-2 bg-white/20 rounded w-48" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex-shrink-0" />
                  <div className="bg-surface-800 border border-white/5 rounded-xl rounded-tl-sm px-4 py-3 flex-1 space-y-1.5">
                    <div className="h-2 bg-white/15 rounded w-full" />
                    <div className="h-2 bg-white/10 rounded w-4/5" />
                    <div className="h-2 bg-white/10 rounded w-3/5" />
                  </div>
                </div>
              </div>
              <div className="w-72 border-l border-white/5 bg-surface-900/50 p-3 space-y-2">
                <div className="flex gap-1">
                  {['Sources','Summary','Mind Map'].map(t => (
                    <div key={t} className="px-2 py-1 text-xs bg-white/5 rounded text-slate-500">{t}</div>
                  ))}
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="bg-surface-800 rounded-xl p-3 border border-white/5 space-y-1">
                    <div className="h-2 bg-white/15 rounded w-3/4" />
                    <div className="h-1.5 bg-white/8 rounded" />
                    <div className="h-1.5 bg-white/8 rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow under screenshot */}
          <div className="absolute inset-x-10 bottom-0 h-20 bg-brand-600/20 blur-2xl" />
        </motion.div>
      </div>

      {/* Features grid */}
      <div className="relative max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need</h2>
          <p className="text-slate-400">Powerful AI tools to transform how you learn and work with documents</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-5 hover:border-brand-500/20 hover:bg-surface-800/50 transition-all"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="relative border-t border-white/5 py-12">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-slate-500 text-sm mb-6">Built with</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {STACK.map(tech => (
              <span key={tech} className="px-4 py-2 bg-white/5 border border-white/8 rounded-full text-slate-300 text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative max-w-3xl mx-auto px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to unlock your documents?</h2>
        <p className="text-slate-400 mb-8">Join and start turning documents into interactive knowledge.</p>
        <Link to="/register" className="btn-primary text-base px-10 py-3 shadow-xl shadow-brand-500/20">
          Create free account →
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <div className="flex justify-center mb-4">
          <Logo size="sm" />
        </div>
        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} NotebookAI · Built with React, Node.js, LangChain, ChromaDB & Google Gemini
        </p>
      </footer>
    </div>
  );
}
