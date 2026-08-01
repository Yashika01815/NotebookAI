import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DocumentTextIcon, SparklesIcon, Squares2X2Icon, RectangleStackIcon,
  QuestionMarkCircleIcon, ShareIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '../../store/index.js';
import SourcesPanel from './SourcesPanel.jsx';
import SummaryPanel from './SummaryPanel.jsx';
import MindMapPanel from '../mindmap/MindMapPanel.jsx';
import FlashcardPanel from '../flashcard/FlashcardPanel.jsx';
import QuizPanel from '../quiz/QuizPanel.jsx';
import KnowledgeGraphPanel from '../knowledge-graph/KnowledgeGraphPanel.jsx';

const TABS = [
  { id: 'sources', label: 'Sources', Icon: DocumentTextIcon, accent: 'slate' },
  { id: 'summary', label: 'Summary', Icon: SparklesIcon, accent: 'brand' },
  { id: 'mindmap', label: 'Mind Map', Icon: Squares2X2Icon, accent: 'cyan', fullBleed: true },
  { id: 'flashcards', label: 'Flashcards', Icon: RectangleStackIcon, accent: 'emerald' },
  { id: 'quiz', label: 'Quiz', Icon: QuestionMarkCircleIcon, accent: 'amber' },
  { id: 'graph', label: 'Knowledge Graph', Icon: ShareIcon, accent: 'fuchsia', fullBleed: true },
];

// Active-tab styling per accent, kept in the same soft glass language as the rest of the app
const ACCENT_ACTIVE = {
  slate: 'bg-white/10 text-white border-white/10',
  brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  fuchsia: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
};

export default function RightPanel({ workspaceId }) {
  const { rightPanelTab, setRightPanelTab, focusMode, toggleFocusMode } = useUIStore();

  const panels = {
    sources: <SourcesPanel workspaceId={workspaceId} />,
    summary: <SummaryPanel workspaceId={workspaceId} />,
    mindmap: <MindMapPanel workspaceId={workspaceId} />,
    flashcards: <FlashcardPanel workspaceId={workspaceId} />,
    quiz: <QuizPanel workspaceId={workspaceId} />,
    graph: <KnowledgeGraphPanel workspaceId={workspaceId} />,
  };

  const activeTab = TABS.find(t => t.id === rightPanelTab) || TABS[0];

  return (
    <div className="h-full flex flex-col bg-surface-900/50 border-l border-white/5">
      {/* Toolbar: feature switcher + focus toggle */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2.5">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = rightPanelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? ACCENT_ACTIVE[tab.accent]
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={toggleFocusMode}
          title={focusMode ? 'Show chat' : 'Focus mode — hide chat for more room'}
          className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
        >
          {focusMode
            ? <ArrowsPointingInIcon className="w-4 h-4" />
            : <ArrowsPointingOutIcon className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Panel content — spatial features (Mind Map, Knowledge Graph) use the full width,
          content-style features (Sources, Summary, Flashcards, Quiz) stay comfortably readable */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={rightPanelTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={activeTab.fullBleed ? 'h-full' : 'h-full max-w-2xl mx-auto w-full'}
          >
            {panels[rightPanelTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}