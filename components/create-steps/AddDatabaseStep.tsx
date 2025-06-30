"use client";
import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Connection,
  Position,
  Handle,
  HandleProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Link2, Trash2 } from "lucide-react";

const DATA_TYPES = [
  "string",
  "int",
  "uuid",
  "boolean",
  "date",
  "float",
  "json",
  "text",
];

interface Field {
  id: string;
  name: string;
  type: string;
  isPrimary?: boolean;
}

interface TableData {
  id: string;
  name: string;
  fields: Field[];
}

interface TableNodeData extends TableData {
  onFieldChange: any;
  onFieldDelete: any;
  onAddField: any;
  onNameChange: any;
  onFieldTypeChange: any;
  onPrimaryToggle: any;
}

function TableNode({ id, data }: { id: string; data: TableNodeData }) {
  // Custom handle for target with highlight
  const TargetHandle = (props: HandleProps) => (
    <Handle
      {...props}
      style={{
        ...props.style,
        top: '50%',
        background: props.isConnectable ? '#f472b6' : '#e11d48',
        boxShadow: props.isConnectable ? '0 0 0 4px #f472b6aa' : undefined,
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '2px solid #fff',
        left: -10,
        zIndex: 10,
        transition: 'box-shadow 0.2s, background 0.2s',
      }}
    />
  );
  return (
    <div className="bg-[#181e29] border border-white/10 rounded-lg p-3 min-w-[220px] relative">
      <Input
        value={data.name}
        onChange={e => data.onNameChange(data.id, e.target.value)}
        className="mb-2 text-base font-bold bg-black/30 border-white/10 text-white"
        placeholder="Table name"
      />
      <div className="mb-2">
        {data.fields.map((field, idx) => {
          return (
            <div
              key={field.id}
              className={`flex items-center gap-2 mb-1 rounded transition ${field.isPrimary ? 'bg-yellow-900/30 ring-2 ring-yellow-400' : ''}`}
            >
              <input
                type="checkbox"
                checked={!!field.isPrimary}
                onChange={() => data.onPrimaryToggle(data.id, field.id)}
                className="accent-yellow-400 h-4 w-4 cursor-pointer"
                title="Primary Key"
              />
              <span className={`text-xs font-mono ${field.isPrimary ? 'font-bold text-yellow-300' : 'text-white'}`}>{field.isPrimary ? 'PK' : ''}</span>
              <Input
                value={field.name}
                onChange={e => data.onFieldChange(data.id, field.id, "name", e.target.value)}
                className="text-xs bg-black/30 border-white/10 text-white"
                placeholder="field"
              />
              <select
                value={field.type}
                onChange={e => data.onFieldTypeChange(data.id, field.id, e.target.value)}
                className="w-20 text-xs bg-black/30 border-white/10 text-white rounded"
              >
                <option value="">type</option>
                {DATA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <Button size="icon" variant="ghost" className="text-xs px-1 py-0.5" onClick={() => data.onFieldDelete(data.id, field.id)} title="Delete column">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
      <Button size="sm" variant="outline" className="w-full text-xs flex items-center gap-1" onClick={() => data.onAddField(data.id)}>
        <Plus className="h-3 w-3" /> Add Column
      </Button>
      {/* Relationship handle (plus button, drag only) */}
      <Handle
        type="source"
        position={Position.Right}
        id="rel"
        style={{
          top: '50%',
          background: '#e11d48',
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '2px solid #fff',
          right: -12,
          zIndex: 10,
          boxShadow: '0 0 0 2px #e11d48',
          cursor: 'crosshair',
          display: 'block',
        }}
        title="Drag to another table to create a relationship"
        onMouseDown={e => e.stopPropagation()}
        data-plus-handle
      />
      {/* Plus icon overlay for visual cue */}
      <span
        className="pointer-events-none absolute"
        style={{
          top: '50%',
          right: '-2px',
          transform: 'translateY(-50%)',
          zIndex: 20,
        }}
        aria-hidden
      >
        <Plus className="h-4 w-4 text-white drop-shadow" />
      </span>
      <TargetHandle
        type="target"
        position={Position.Left}
        id="rel"
      />
    </div>
  );
}

const initialTables: TableData[] = [
  {
    id: "table-1",
    name: "users",
    fields: [
      { id: "field-1", name: "id", type: "uuid" },
      { id: "field-2", name: "email", type: "string" },
    ],
  },
];

const initialNodes: Node[] = [
  {
    id: "table-1",
    type: "tableNode",
    position: { x: 100, y: 100 },
    data: {},
  },
];

export default function AddDatabaseStep({ onNext, onBack, setData }: { onNext: () => void; onBack: () => void; setData?: (data: any) => void }) {
  const [tables, setTables] = useState<TableData[]>(initialTables);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [pendingEdge, setPendingEdge] = useState<Edge | null>(null);
  const [pendingRelType, setPendingRelType] = useState<'1:1' | '1:n' | 'n:m'>('1:1');
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingRelType, setEditingRelType] = useState<'1:1' | '1:n' | 'n:m'>('1:1');

  // Keep node positions stable on table/field edit
  React.useEffect(() => {
    setNodes(nodes =>
      nodes.map(node => {
        const table = tables.find(t => t.id === node.id);
        if (!table) return node;
        return {
          ...node,
          data: {
            ...table,
            onFieldChange: handleFieldChange,
            onFieldDelete: handleFieldDelete,
            onAddField: handleAddField,
            onNameChange: handleTableNameChange,
            onFieldTypeChange: handleFieldTypeChange,
            onPrimaryToggle: handlePrimaryToggle,
          },
        };
      })
    );
    // eslint-disable-next-line
  }, [tables]);

  // Table CRUD
  function handleAddTable() {
    const newId = `table-${Date.now()}`;
    setTables(tables => [
      ...tables,
      {
        id: newId,
        name: "new_table",
        fields: [
          { id: `field-${Date.now()}`, name: "id", type: "uuid" },
        ],
      },
    ]);
    setNodes(nodes => [
      ...nodes,
      {
        id: newId,
        type: "tableNode",
        position: { x: 200 + nodes.length * 180, y: 120 },
        data: {},
      },
    ]);
  }
  function handleDeleteTable(id: string) {
    setTables(tables => tables.filter(t => t.id !== id));
    setNodes(nodes => nodes.filter(n => n.id !== id));
    setEdges(edges => edges.filter(e => e.source !== id && e.target !== id));
  }
  function handleTableNameChange(tableId: string, name: string) {
    setTables(tables => tables.map(t => t.id === tableId ? { ...t, name } : t));
  }
  // Field CRUD
  function handleAddField(tableId: string) {
    setTables(tables => tables.map(t => t.id === tableId ? {
      ...t,
      fields: [...t.fields, { id: `field-${Date.now()}`, name: "", type: "", isPrimary: false }],
    } : t));
  }
  function handleFieldChange(tableId: string, fieldId: string, key: "name" | "type", value: string) {
    setTables(tables => tables.map(t => t.id === tableId ? {
      ...t,
      fields: t.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f),
    } : t));
  }
  function handleFieldTypeChange(tableId: string, fieldId: string, value: string) {
    setTables(tables => tables.map(t => t.id === tableId ? {
      ...t,
      fields: t.fields.map(f => f.id === fieldId ? { ...f, type: value } : f),
    } : t));
  }
  function handlePrimaryToggle(tableId: string, fieldId: string) {
    setTables(tables => tables.map(t => t.id === tableId ? {
      ...t,
      fields: t.fields.map(f => f.id === fieldId ? { ...f, isPrimary: !f.isPrimary } : f),
    } : t));
  }
  function handleFieldDelete(tableId: string, fieldId: string) {
    setTables(tables => tables.map(t => t.id === tableId ? {
      ...t,
      fields: t.fields.filter(f => f.id !== fieldId),
    } : t));
  }

  // Relationship (edge) creation
  const onConnect = useCallback((params: Edge | Connection) => {
    setPendingEdge({
      ...params,
      id: `rel-${params.source}-${params.target}-${Date.now()}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#e11d48', strokeWidth: 2 },
      label: '1:1',
      data: { relType: '1:1' },
    } as Edge);
    setPendingRelType('1:1');
  }, []);

  // When pendingEdge is set, show a floating dropdown to select relationship type
  function handleRelTypeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pendingEdge) {
      setEdges(eds => [
        ...eds,
        { ...pendingEdge, label: pendingRelType, data: { relType: pendingRelType } }
      ]);
      setPendingEdge(null);
    }
  }

  // Edge click: edit relationship type
  function handleEdgeClick(event: React.MouseEvent, edge: Edge) {
    event.stopPropagation();
    setEditingEdgeId(edge.id);
    setEditingRelType(edge.data?.relType || '1:1');
  }
  function handleEditRelTypeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEdges(eds => eds.map(edge =>
      edge.id === editingEdgeId
        ? { ...edge, label: editingRelType, data: { relType: editingRelType } }
        : edge
    ));
    setEditingEdgeId(null);
  }

  // Custom node type
  const nodeTypes = React.useMemo(() => ({
    tableNode: (props: any) => <TableNode {...props} />
  }), []);

  const handleContinue = () => {
    setData?.({ tables, edges })
    onNext()
  }

  return (
    <div className="w-full max-w-5xl mx-auto h-[600px] flex flex-col">
      <h2 className="text-2xl font-semibold mb-4">Database Schema</h2>
      <div className="flex gap-2 mb-4">
        <Button onClick={handleAddTable} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Table</Button>
      </div>
      <div className="relative w-full h-full">
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            data: {
              ...tables.find(t => t.id === node.id),
              onFieldChange: handleFieldChange,
              onFieldDelete: handleFieldDelete,
              onAddField: handleAddField,
              onNameChange: handleTableNameChange,
              onFieldTypeChange: handleFieldTypeChange,
              onPrimaryToggle: handlePrimaryToggle,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable
          onEdgeClick={handleEdgeClick}
        >
          <Background gap={16} color="#222" />
        </ReactFlow>
        {/* Floating relationship type dropdown for new edge */}
        {pendingEdge && (
          <form
            onSubmit={handleRelTypeSubmit}
            className="absolute left-1/2 top-1/2 z-50 bg-[#181e29] border border-white/10 rounded-lg p-4 flex gap-2 items-center shadow-xl"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <Label htmlFor="rel-type" className="text-white text-sm mr-2">Relationship type:</Label>
            <select
              id="rel-type"
              value={pendingRelType}
              onChange={e => setPendingRelType(e.target.value as '1:1' | '1:n' | 'n:m')}
              className="bg-black/30 border-white/10 text-white text-sm rounded px-2 py-1"
              autoFocus
            >
              <option value="1:1">1:1</option>
              <option value="1:n">1:n</option>
              <option value="n:m">n:m</option>
            </select>
            <Button type="submit" size="sm" className="ml-2">Add</Button>
          </form>
        )}
        {/* Floating relationship type dropdown for editing edge */}
        {editingEdgeId && (
          <form
            onSubmit={handleEditRelTypeSubmit}
            className="absolute left-1/2 top-1/2 z-50 bg-[#181e29] border border-white/10 rounded-lg p-4 flex gap-2 items-center shadow-xl"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <Label htmlFor="edit-rel-type" className="text-white text-sm mr-2">Edit relationship type:</Label>
            <select
              id="edit-rel-type"
              value={editingRelType}
              onChange={e => setEditingRelType(e.target.value as '1:1' | '1:n' | 'n:m')}
              className="bg-black/30 border-white/10 text-white text-sm rounded px-2 py-1"
              autoFocus
            >
              <option value="1:1">1:1</option>
              <option value="1:n">1:n</option>
              <option value="n:m">n:m</option>
            </select>
            <Button type="submit" size="sm" className="ml-2">Save</Button>
          </form>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
} 