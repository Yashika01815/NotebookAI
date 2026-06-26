import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api.js';
import { motion } from 'framer-motion';

// Custom node component
const MindMapNode = ({ data, selected }) => {
  const colors = {
    root: 'from-brand-600 to-purple-600',
    level1: 'from-cyan-600 to-blue-600',
    level2: 'from-emerald-600 to-teal-600',
    level3: 'from-amber-500 to-orange-500',
  };
  const gradient = colors[data.level] || colors.level3;

  return (
    <div className={`px-4 py-2.5 rounded-xl border-2 shadow-lg ${
      selected ? 'border-brand-400' : 'border-white/10'
    } bg-gradient-to-br ${gradient} text-white`}>
      <Handle type="target" position={Position.Left} className="!bg-white/30 !border-0 !w-2 !h-2" />
      <p className={`font-medium whitespace-nowrap ${data.level === 'root' ? 'text-sm' : 'text-xs'}`}>
        {data.label}
      </p>
      <Handle type="source" position={Position.Right} className="!bg-white/30 !border-0 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = { mindmap: MindMapNode };

// Convert hierarchical JSON to React Flow nodes/edges
const convertToFlow = (tree, parentId = null, level = 'root', x = 0, y = 0, xOffset = 300, ySpacing = 80) => {
  const nodes = [];
  const edges = [];
  const id = `node-${Math.random().toString(36).substr(2, 9)}`;

  nodes.push({
    id,
    type: 'mindmap',
    position: { x, y },
    data: { label: tree.title, level },
  });

  if (parentId) {
    edges.push({
      id: `edge-${parentId}-${id}`,
      source: parentId,
      target: id,
      style: { stroke: 'rgba(99,102,241,0.4)', strokeWidth: 2 },
      animated: level === 'level1',
    });
  }

  const children = tree.children || [];
  const totalHeight = children.length * ySpacing;
  const startY = y - totalHeight / 2;

  children.forEach((child, i) => {
    const childLevel = level === 'root' ? 'level1' : level === 'level1' ? 'level2' : 'level3';
    const { nodes: childNodes, edges: childEdges } = convertToFlow(
      child, id, childLevel,
      x + xOffset, startY + i * ySpacing,
      xOffset * 0.8, ySpacing * 0.7
    );
    nodes.push(...childNodes);
    edges.push(...childEdges);
  });

  return { nodes, edges };
};

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
      const { nodes: n, edges: e } = convertToFlow(data.mindMap, null, 'root', 50, 300);
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
        fitViewOptions={{ padding: 0.2 }}
        className="bg-surface-950/50"
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
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
