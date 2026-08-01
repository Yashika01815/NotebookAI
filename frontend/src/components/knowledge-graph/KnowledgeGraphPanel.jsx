import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  Handle, Position, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api.js';

const TYPE_COLORS = {
  concept: { bg: 'bg-brand-600/20', border: 'border-brand-500/40', text: 'text-brand-300', dot: '#6366f1' },
  person:  { bg: 'bg-emerald-600/20', border: 'border-emerald-500/40', text: 'text-emerald-300', dot: '#10b981' },
  organization: { bg: 'bg-amber-600/20', border: 'border-amber-500/40', text: 'text-amber-300', dot: '#f59e0b' },
  event:   { bg: 'bg-red-600/20', border: 'border-red-500/40', text: 'text-red-300', dot: '#ef4444' },
  place:   { bg: 'bg-cyan-600/20', border: 'border-cyan-500/40', text: 'text-cyan-300', dot: '#06b6d4' },
};

// Sized to its own content (data.width) so the layout's reserved space
// always matches what's actually rendered — this is what stops labels
// from overlapping neighboring nodes or edges.
const KGNode = ({ data, selected }) => {
  const colors = TYPE_COLORS[data.type] || TYPE_COLORS.concept;
  return (
    <div
      style={{ width: data.width }}
      className={`px-3.5 py-2.5 rounded-xl border ${colors.bg} ${colors.border} ${selected ? 'ring-2 ring-white/30' : ''} shadow-lg backdrop-blur-sm`}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/20 !border-0 !w-2 !h-2" />
      <div className="flex items-start gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: colors.dot }} />
        <span className={`text-xs font-semibold leading-snug break-words ${colors.text}`}>{data.label}</span>
      </div>
      {data.type && (
        <p className="text-[10px] text-slate-500 mt-1 capitalize pl-3">{data.type}</p>
      )}
      <Handle type="source" position={Position.Right} className="!bg-white/20 !border-0 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = { kgnode: KGNode };

// Estimate a comfortable box size for a label + type caption.
function estimateNodeSize(label = '') {
  const maxWidth = 220;
  const minWidth = 150;
  const charWidth = 6.6;
  const paddingX = 44; // dot + gaps
  const lineHeight = 16;
  const baseHeight = 56; // label row + type caption + vertical padding

  const singleLineWidth = Math.ceil(label.length * charWidth + paddingX);
  if (singleLineWidth <= maxWidth) {
    return { width: Math.max(minWidth, singleLineWidth), height: baseHeight };
  }

  const maxCharsPerLine = Math.max(1, Math.floor((maxWidth - paddingX) / charWidth));
  const lines = Math.ceil(label.length / maxCharsPerLine);
  return { width: maxWidth, height: baseHeight + (lines - 1) * lineHeight };
}

// Proper auto-layout with dagre instead of a fixed-radius circle (which
// overlapped badly once there were more than ~8 nodes). Falls back to a
// simple grid if the graph has no relationships to lay out against.
function layoutGraph(rawNodes, rawEdges) {
  const sized = rawNodes.map(n => ({ ...n, ...estimateNodeSize(n.label || '') }));

  if (!rawEdges || rawEdges.length === 0) {
    const cols = Math.max(1, Math.ceil(Math.sqrt(sized.length)));
    const cellW = 260, cellH = 130;
    return sized.map((n, i) => ({
      id: n.id,
      type: 'kgnode',
      position: { x: (i % cols) * cellW, y: Math.floor(i / cols) * cellH },
      data: { label: n.label, type: n.type, width: n.width },
    }));
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 70, ranksep: 160, marginx: 60, marginy: 60 });
  g.setDefaultEdgeLabel(() => ({}));
  sized.forEach(n => g.setNode(n.id, { width: n.width, height: n.height }));
  rawEdges.forEach(e => {
    if (g.hasNode(e.source) && g.hasNode(e.target)) g.setEdge(e.source, e.target);
  });
  dagre.layout(g);

  return sized.map(n => {
    const pos = g.node(n.id) || { x: 0, y: 0 };
    return {
      id: n.id,
      type: 'kgnode',
      position: { x: pos.x - n.width / 2, y: pos.y - n.height / 2 },
      data: { label: n.label, type: n.type, width: n.width },
    };
  });
}

export default function KnowledgeGraphPanel({ workspaceId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [legend, setLegend] = useState([]);

  const onConnect = useCallback((p) => setEdges(e => addEdge(p, e)), []);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await aiAPI.getKnowledgeGraph(workspaceId);
      const { nodes: rawNodes, edges: rawEdges } = data.knowledgeGraph;

      const flowNodes = layoutGraph(rawNodes, rawEdges);
      const flowEdges = rawEdges.map(e => ({
        id: `e-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        pathOptions: { borderRadius: 16 },
        labelStyle: { fill: '#cbd5e1', fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.92 },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 6,
        style: { stroke: 'rgba(99,102,241,0.35)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(99,102,241,0.5)', width: 14, height: 14 },
      }));

      // Build legend from unique types
      const types = [...new Set(rawNodes.map(n => n.type).filter(Boolean))];
      setLegend(types);

      setNodes(flowNodes);
      setEdges(flowEdges);
      setGenerated(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!generated) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-400">
              <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 12h3M14 12h3M13.4 10.4l3.2-3.4M13.4 13.6l3.2 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Knowledge Graph</h3>
          <p className="text-xs text-slate-400 mb-4">Extract entities and relationships as an interactive graph</p>
          <button onClick={generate} disabled={loading} className="btn-primary">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              : <><SparklesIcon className="w-4 h-4" />Generate Graph</>
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-96 relative flex flex-col">
      {/* Legend + Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {legend.length > 0 && (
          <div className="bg-surface-900/90 backdrop-blur-sm border border-white/10 rounded-xl p-2 space-y-1">
            {legend.map(type => {
              const c = TYPE_COLORS[type] || TYPE_COLORS.concept;
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }} />
                  <span className="text-xs text-slate-400 capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <button onClick={generate} disabled={loading} className="btn-ghost text-xs py-1.5 px-2.5 bg-surface-900/80 backdrop-blur-sm">
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          className="bg-surface-950/50"
        >
          <Background color="rgba(255,255,255,0.02)" gap={24} />
          <Controls className="!bg-surface-900 !border-white/10" />
          <MiniMap
            className="!bg-surface-900 !border-white/10"
            nodeColor={(n) => TYPE_COLORS[n.data?.type]?.dot || '#6366f1'}
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}