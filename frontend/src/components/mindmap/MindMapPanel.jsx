import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api.js';

// Custom node component. Branches fan out both left and right from the root
// (like XMind/MindMeister), so every non-root node knows which side it's on
// and mirrors its connection handles accordingly. Sized to data.width so the
// layout's reserved space always matches what's actually rendered.
const MindMapNode = ({ data, selected }) => {
  const gradients = {
    root: 'from-brand-600 to-purple-600',
    level1: 'from-cyan-600 to-blue-600',
    level2: 'from-emerald-600 to-teal-600',
    level3: 'from-amber-500 to-orange-500',
  };
  const textSizes = {
    root: 'text-base',
    level1: 'text-sm',
    level2: 'text-xs',
    level3: 'text-xs',
  };
  const gradient = gradients[data.level] || gradients.level3;
  const isLeft = data.direction === 'left';

  return (
    <div
      style={{ width: data.width }}
      className={`px-4 py-3 rounded-xl border-2 shadow-lg ${
        selected ? 'border-brand-400 ring-2 ring-brand-400/30' : 'border-white/10'
      } bg-gradient-to-br ${gradient} text-white`}
    >
      {data.level !== 'root' && (
        <Handle
          type="target"
          position={isLeft ? Position.Right : Position.Left}
          className="!bg-white/30 !border-0 !w-2 !h-2"
        />
      )}

      <p className={`font-medium leading-snug break-words ${textSizes[data.level] || 'text-xs'}`}>
        {data.label}
      </p>

      {data.level === 'root' ? (
        <>
          <Handle type="source" position={Position.Right} id="right" className="!bg-white/30 !border-0 !w-2 !h-2" />
          <Handle type="source" position={Position.Left} id="left" className="!bg-white/30 !border-0 !w-2 !h-2" />
        </>
      ) : (
        <Handle
          type="source"
          position={isLeft ? Position.Left : Position.Right}
          className="!bg-white/30 !border-0 !w-2 !h-2"
        />
      )}
    </div>
  );
};

const nodeTypes = { mindmap: MindMapNode };

// Comfortably-sized boxes per level — a touch bigger than before, since text
// legibility at default zoom matters more than shaving off pixels.
const SIZE_BY_LEVEL = {
  root:   { maxWidth: 240, minWidth: 150, charWidth: 8.4, basePadY: 42 },
  level1: { maxWidth: 210, minWidth: 120, charWidth: 7.6, basePadY: 36 },
  level2: { maxWidth: 190, minWidth: 110, charWidth: 6.9, basePadY: 34 },
  level3: { maxWidth: 180, minWidth: 105, charWidth: 6.7, basePadY: 34 },
};

function estimateNodeSize(label = '', level = 'level3') {
  const cfg = SIZE_BY_LEVEL[level] || SIZE_BY_LEVEL.level3;
  const paddingX = 34;
  const lineHeight = 18;
  const singleLineWidth = Math.ceil(label.length * cfg.charWidth + paddingX);

  if (singleLineWidth <= cfg.maxWidth) {
    return { width: Math.max(cfg.minWidth, singleLineWidth), height: cfg.basePadY + lineHeight };
  }

  const maxCharsPerLine = Math.max(1, Math.floor((cfg.maxWidth - paddingX) / cfg.charWidth));
  const lines = Math.ceil(label.length / maxCharsPerLine);
  return { width: cfg.maxWidth, height: cfg.basePadY + lines * lineHeight };
}

function countDescendants(node) {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, c) => sum + countDescendants(c), 0);
}

function countAllNodes(node) {
  return 1 + (node.children || []).reduce((sum, c) => sum + countAllNodes(c), 0);
}

// Spacing tightens automatically as the map grows, instead of one fixed gap
// that's cramped for big maps and wastefully loose for small ones.
function computeSpacing(totalNodes) {
  const nodesep = Math.round(Math.max(26, Math.min(50, 56 - totalNodes * 0.6)));
  const ranksep = Math.round(Math.max(70, Math.min(110, 120 - totalNodes * 0.8)));
  return { nodesep, ranksep };
}

// Balance top-level branches across left/right using a greedy partition on
// subtree size, so neither side ends up much taller than the other.
function splitBranches(children) {
  const weighted = children
    .map(c => ({ node: c, weight: countDescendants(c) }))
    .sort((a, b) => b.weight - a.weight);

  let leftWeight = 0, rightWeight = 0;
  const left = [], right = [];
  weighted.forEach(({ node, weight }) => {
    if (rightWeight <= leftWeight) { right.push(node); rightWeight += weight; }
    else { left.push(node); leftWeight += weight; }
  });
  return { left, right };
}

// Lays out one side (left or right) of the tree with dagre, then shifts the
// result so the root sits at local origin (0,0) — this is what lets both
// sides be stitched together around a single shared root node afterward.
function layoutSide(rootId, rootSize, childList, direction, spacing) {
  if (!childList.length) return { nodes: [], edges: [] };

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: direction === 'right' ? 'LR' : 'RL',
    nodesep: spacing.nodesep,
    ranksep: spacing.ranksep,
    marginx: 0,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({}));
  g.setNode(rootId, { width: rootSize.width, height: rootSize.height });

  const localNodes = [];
  const localEdges = [];

  const walk = (node, parentId, level) => {
    const id = `node-${localNodes.length}-${direction}-${Math.random().toString(36).slice(2, 7)}`;
    const { width, height } = estimateNodeSize(node.title || '', level);
    localNodes.push({ id, label: node.title, level, direction, width, height });
    g.setNode(id, { width, height });
    g.setEdge(parentId, id);
    localEdges.push({ id: `edge-${parentId}-${id}`, source: parentId, target: id, level, direction });

    (node.children || []).forEach(child => {
      const childLevel = level === 'level1' ? 'level2' : 'level3';
      walk(child, id, childLevel);
    });
  };

  childList.forEach(child => walk(child, rootId, 'level1'));
  dagre.layout(g);

  const rootPos = g.node(rootId);
  const dx = -rootPos.x, dy = -rootPos.y;

  const nodes = localNodes.map(n => {
    const p = g.node(n.id);
    return { ...n, x: p.x + dx, y: p.y + dy };
  });

  return { nodes, edges: localEdges };
}

// Converts the hierarchical mind-map JSON into a balanced, two-sided React
// Flow graph: root centered, branches distributed left/right by weight.
function buildMindMapLayout(tree) {
  const rootId = 'root';
  const rootSize = estimateNodeSize(tree.title || '', 'root');
  const totalNodes = countAllNodes(tree);
  const spacing = computeSpacing(totalNodes);

  const children = tree.children || [];
  const { left: leftChildren, right: rightChildren } = splitBranches(children);

  const right = layoutSide(rootId, rootSize, rightChildren, 'right', spacing);
  const left = layoutSide(rootId, rootSize, leftChildren, 'left', spacing);

  const allNodes = [
    { id: rootId, label: tree.title, level: 'root', direction: null, width: rootSize.width, height: rootSize.height, x: 0, y: 0 },
    ...right.nodes,
    ...left.nodes,
  ];
  const allEdges = [...right.edges, ...left.edges];

  const flowNodes = allNodes.map(n => ({
    id: n.id,
    type: 'mindmap',
    position: { x: n.x - n.width / 2, y: n.y - n.height / 2 },
    data: { label: n.label, level: n.level, direction: n.direction, width: n.width },
  }));

  const flowEdges = allEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.source === rootId ? e.direction : undefined,
    type: 'smoothstep',
    pathOptions: { borderRadius: 18 },
    style: { stroke: 'rgba(99,102,241,0.4)', strokeWidth: 2 },
    animated: e.level === 'level1',
  }));

  return { nodes: flowNodes, edges: flowEdges };
}

export default function MindMapPanel({ workspaceId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const onConnect = useCallback((params) => setEdges(e => addEdge(params, e)), []);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await aiAPI.getMindMap(workspaceId);
      const { nodes: n, edges: e } = buildMindMapLayout(data.mindMap);
      setNodes(n);
      setEdges(e);
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
          <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-brand-400">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 9V3M15 12h6M12 15v6M9 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Mind Map</h3>
          <p className="text-xs text-slate-400 mb-4">Visualize document structure as an interactive mind map</p>
          <button onClick={generate} disabled={loading} className="btn-primary">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              : <><SparklesIcon className="w-4 h-4" />Generate Mind Map</>
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-96 relative">
      <div className="absolute top-3 right-3 z-10">
        <button onClick={generate} disabled={loading} className="btn-ghost text-xs py-1.5 px-2.5 bg-surface-900/80 backdrop-blur-sm">
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.15}
        maxZoom={2}
        className="bg-surface-950/50"
      >
        <Background color="rgba(255,255,255,0.03)" gap={24} />
        <Controls className="!bg-surface-900 !border-white/10" />
        <MiniMap
          className="!bg-surface-900 !border-white/10"
          nodeColor={(n) => {
            const colors = { root: '#6366f1', level1: '#06b6d4', level2: '#10b981', level3: '#f59e0b' };
            return colors[n.data?.level] || '#6366f1';
          }}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>
    </div>
  );
}