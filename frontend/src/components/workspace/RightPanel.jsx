import React from 'react';
import { useUIStore } from '../../store/index.js';
import SourcesPanel from './SourcesPanel.jsx';
import SummaryPanel from '../workspace/SummaryPanel.jsx';
import MindMapPanel from '../mindmap/MindMapPanel.jsx';
import FlashcardPanel from '../flashcard/FlashcardPanel.jsx';
import QuizPanel from '../quiz/QuizPanel.jsx';
import KnowledgeGraphPanel from '../knowledge-graph/KnowledgeGraphPanel.jsx';

const TABS = [
  { id: 'sources', label: 'Sources' },
  { id: 'summary', label: 'Summary' },
  { id: 'mindmap', label: 'Mind Map' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'graph', label: 'Knowledge Graph' },
];

export default function RightPanel({ workspaceId }) {
  const { rightPanelTab, setRightPanelTab } = useUIStore();

  const panels = {
    sources: <SourcesPanel workspaceId={workspaceId} />,
    summary: <SummaryPanel workspaceId={workspaceId} />,
    mindmap: <MindMapPanel workspaceId={workspaceId} />,
    flashcards: <FlashcardPanel workspaceId={workspaceId} />,
    quiz: <QuizPanel workspaceId={workspaceId} />,
    graph: <KnowledgeGraphPanel workspaceId={workspaceId} />,
  };

  return (
    <div className="w-80 xl:w-96 flex flex-col bg-surface-900/50 border-l border-white/5 flex-shrink-0">
      {/* Tab bar */}
      <div className="border-b border-white/5 px-2 pt-2 overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setRightPanelTab(tab.id)}
              className={`tab ${rightPanelTab === tab.id ? 'tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {panels[rightPanelTab]}
      </div>
    </div>
  );
}
