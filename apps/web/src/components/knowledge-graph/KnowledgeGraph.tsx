/**
 * Knowledge Graph Visualization Component
 * Interactive graph visualization using React Flow
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

export interface KnowledgeNode {
  id: string;
  type: 'Topic' | 'Source' | 'Finding' | 'Entity' | 'Concept';
  label: string;
  properties: Record<string, any>;
}

export interface KnowledgeRelationship {
  from: string;
  to: string;
  type: 'RELATES_TO' | 'CITED_IN' | 'SUPPORTS' | 'CONTRADICTS' | 'DERIVED_FROM';
  properties?: Record<string, any>;
}

interface KnowledgeGraphProps {
  researchId: string;
  onNodeClick?: (node: KnowledgeNode) => void;
  onEdgeClick?: (edge: KnowledgeRelationship) => void;
}

// Node colors by type
const NODE_COLORS = {
  Topic: '#3b82f6', // blue
  Source: '#10b981', // green
  Finding: '#f59e0b', // amber
  Entity: '#8b5cf6', // purple
  Concept: '#ec4899', // pink
};

// Edge colors by relationship type
const EDGE_COLORS = {
  RELATES_TO: '#6b7280',
  CITED_IN: '#10b981',
  SUPPORTS: '#3b82f6',
  CONTRADICTS: '#ef4444',
  DERIVED_FROM: '#f59e0b',
};

export function KnowledgeGraph({
  researchId,
  onNodeClick,
  onEdgeClick,
}: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'force' | 'hierarchical' | 'circular'>('force');

  // Fetch graph data
  useEffect(() => {
    fetchGraphData();
  }, [researchId]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch(`/api/knowledge-graph/${researchId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch graph data');
      }

      const data = await response.json();
      const { nodes: graphNodes, relationships } = data;

      // Convert to React Flow format
      const flowNodes = convertNodesToFlow(graphNodes);
      const flowEdges = convertEdgesToFlow(relationships);

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      console.error('Graph fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load graph');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert knowledge nodes to React Flow nodes
   */
  const convertNodesToFlow = (knowledgeNodes: KnowledgeNode[]): Node[] => {
    return knowledgeNodes.map((node, index) => ({
      id: node.id,
      type: 'default',
      data: {
        label: node.label,
        nodeType: node.type,
        properties: node.properties,
      },
      position: calculateNodePosition(index, knowledgeNodes.length, layout),
      style: {
        background: NODE_COLORS[node.type],
        color: 'white',
        border: '2px solid #fff',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: '500',
      },
    }));
  };

  /**
   * Convert knowledge relationships to React Flow edges
   */
  const convertEdgesToFlow = (relationships: KnowledgeRelationship[]): Edge[] => {
    return relationships.map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.from,
      target: rel.to,
      label: rel.type.replace(/_/g, ' '),
      type: 'smoothstep',
      animated: rel.type === 'RELATES_TO',
      style: {
        stroke: EDGE_COLORS[rel.type],
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: EDGE_COLORS[rel.type],
      },
      data: {
        relationshipType: rel.type,
        properties: rel.properties,
      },
    }));
  };

  /**
   * Calculate node position based on layout algorithm
   */
  const calculateNodePosition = (
    index: number,
    total: number,
    layoutType: string
  ): { x: number; y: number } => {
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    switch (layoutType) {
      case 'circular':
        const angle = (index / total) * 2 * Math.PI;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };

      case 'hierarchical':
        const levelHeight = 150;
        const level = Math.floor(index / 5);
        const posInLevel = index % 5;
        return {
          x: 100 + posInLevel * 200,
          y: 50 + level * levelHeight,
        };

      case 'force':
      default:
        // Simple grid layout (will be improved by React Flow's auto-layout)
        const cols = Math.ceil(Math.sqrt(total));
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          x: 100 + col * 200,
          y: 100 + row * 150,
        };
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.data) {
        const knowledgeNode: KnowledgeNode = {
          id: node.id,
          type: node.data.nodeType,
          label: node.data.label,
          properties: node.data.properties,
        };
        onNodeClick(knowledgeNode);
      }
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick && edge.data) {
        const relationship: KnowledgeRelationship = {
          from: edge.source,
          to: edge.target,
          type: edge.data.relationshipType,
          properties: edge.data.properties,
        };
        onEdgeClick(relationship);
      }
    },
    [onEdgeClick]
  );

  const changeLayout = (newLayout: 'force' | 'hierarchical' | 'circular') => {
    setLayout(newLayout);
    // Recalculate positions
    setNodes((nds) =>
      nds.map((node, index) => ({
        ...node,
        position: calculateNodePosition(index, nds.length, newLayout),
      }))
    );
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchGraphData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const nodeType = node.data?.nodeType as keyof typeof NODE_COLORS;
            return NODE_COLORS[nodeType] || '#gray';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

        <Panel position="top-right" className="bg-white p-4 rounded shadow-lg">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Layout</h3>
            <div className="flex gap-2">
              <button
                onClick={() => changeLayout('force')}
                className={`px-3 py-1 text-xs rounded ${
                  layout === 'force'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Force
              </button>
              <button
                onClick={() => changeLayout('hierarchical')}
                className={`px-3 py-1 text-xs rounded ${
                  layout === 'hierarchical'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Hierarchical
              </button>
              <button
                onClick={() => changeLayout('circular')}
                className={`px-3 py-1 text-xs rounded ${
                  layout === 'circular'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Circular
              </button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2">Legend</h3>
              <div className="space-y-1 text-xs">
                {Object.entries(NODE_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ background: color }}
                    ></div>
                    <span className="text-gray-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2">Stats</h3>
              <p className="text-xs text-gray-600">Nodes: {nodes.length}</p>
              <p className="text-xs text-gray-600">Edges: {edges.length}</p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
