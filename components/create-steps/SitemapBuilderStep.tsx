import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Plus, Trash2, Home, FileText, GripVertical, Menu, Layout, Send } from 'lucide-react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeToolbar,
  Panel,
  Position,
} from '@xyflow/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import '@xyflow/react/dist/style.css';

// Custom Add Button Node Component
const AddButtonNode = ({ data }: { data: any }) => {
  return (
    <div className="flex items-center justify-center">
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={data.onClick}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

// Inline Edit Component for page titles and sections
const InlineEdit = ({ value, onSave, className = "" }: { 
  value: string; 
  onSave: (newValue: string) => void; 
  className?: string; 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [fixedWidth, setFixedWidth] = useState<string>('');
  const spanRef = useRef<HTMLSpanElement>(null);

  const startEditing = () => {
    if (spanRef.current) {
      // Capture the exact width of the span before switching to edit mode
      const rect = spanRef.current.getBoundingClientRect();
      setFixedWidth(`${rect.width}px`);
    }
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    if (editValue.trim() !== value && editValue.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
    setFixedWidth(''); // Reset width so it can readjust to new content
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
      setFixedWidth('');
    }
  };

  if (isEditing) {
    return (
      <input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className={`bg-transparent border-none outline-none p-0 m-0 focus:ring-1 focus:ring-blue-400 rounded px-1 ${className}`}
        style={{
          width: fixedWidth,
          minWidth: fixedWidth,
          fontSize: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
          textAlign: 'inherit',
          color: 'inherit'
        }}
        autoFocus
      />
    );
  }

  return (
    <span
      ref={spanRef}
      onClick={startEditing}
      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 ${className}`}
    >
      {value}
    </span>
  );
};

// Node types for React Flow
const nodeTypes = {
  addButton: AddButtonNode,
};

interface Props {
  onNext: () => void;
  onBack: () => void;
  setData?: (data: any) => void;
}

interface Section {
  id: string;
  name: string;
  type: 'navbar' | 'footer' | 'custom';
  pageId: string;
}

interface PageNode {
  id: string;
  title: string;
  type: 'home' | 'page';
  sections: Section[];
}

export default function SitemapBuilderStep({ onNext, onBack, setData }: Props) {
  const [pages, setPages] = useState<PageNode[]>([
    { 
      id: 'home', 
      title: 'Home', 
      type: 'home',
      sections: [
        { id: 'home-navbar', name: 'Navbar', type: 'navbar', pageId: 'home' },
        { id: 'home-footer', name: 'Footer', type: 'footer', pageId: 'home' },
      ]
    },
    { 
      id: 'about', 
      title: 'About', 
      type: 'page',
      sections: [
        { id: 'about-navbar', name: 'Navbar', type: 'navbar', pageId: 'about' },
        { id: 'about-footer', name: 'Footer', type: 'footer', pageId: 'about' },
      ]
    },
    { 
      id: 'contact', 
      title: 'Contact', 
      type: 'page',
      sections: [
        { id: 'contact-navbar', name: 'Navbar', type: 'navbar', pageId: 'contact' },
        { id: 'contact-footer', name: 'Footer', type: 'footer', pageId: 'contact' },
      ]
    },
    { 
      id: 'services', 
      title: 'Services', 
      type: 'page',
      sections: [
        { id: 'services-navbar', name: 'Navbar', type: 'navbar', pageId: 'services' },
        { id: 'services-footer', name: 'Footer', type: 'footer', pageId: 'services' },
      ]
    },
  ]);

  const [newPageTitle, setNewPageTitle] = useState('');
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);

  // Calculate grid positions for subpages
  const subpages = pages.filter(page => page.type === 'page');
  const gridSpacing = 320;
  const gridStartX = 100;
  const totalWidth = (subpages.length - 1) * gridSpacing;
  const gridBaseX = 250 - totalWidth / 2;
  
  // Calculate position for add button (to the right of rightmost page)
  const addButtonX = subpages.length > 0 ? gridBaseX + (subpages.length - 1) * gridSpacing + 280 : gridBaseX + 280;

  const addPage = () => {
    const pageId = `page-${Date.now()}`;
    const sections: Section[] = [
      { id: `${pageId}-navbar`, name: 'Navbar', type: 'navbar', pageId },
      { id: `${pageId}-footer`, name: 'Footer', type: 'footer', pageId },
    ];
    
    const newPage: PageNode = {
      id: pageId,
      title: 'New Page', // Default title that user can edit
      type: 'page',
      sections
    };
    
    setPages((prev: PageNode[]) => [...prev, newPage]);
    
    // Add new edge from home
    const newEdge: Edge = {
      id: `home-${newPage.id}`,
      source: 'home',
      target: newPage.id,
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
    };
    
    setEdges((prev: Edge[]) => [...prev, newEdge]);
  };

  const addSection = (pageId: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      type: 'custom',
      pageId: pageId,
    };
    
    setPages((prev: PageNode[]) => 
      prev.map(page => 
        page.id === pageId 
          ? { ...page, sections: [...page.sections, newSection] }
          : page
      )
    );
  };

  const removeSection = (sectionId: string) => {
    setPages((prev: PageNode[]) => 
      prev.map(page => ({
        ...page,
        sections: page.sections.filter(section => section.id !== sectionId)
      }))
    );
  };

  const moveSection = (sectionId: string, targetPageId: string) => {
    setPages((prev: PageNode[]) => {
      const section = prev.flatMap(p => p.sections).find(s => s.id === sectionId);
      if (!section) return prev;
      
      return prev.map(page => ({
        ...page,
        sections: page.sections.filter(s => s.id !== sectionId)
      })).map(page => 
        page.id === targetPageId 
          ? { ...page, sections: [...page.sections, { ...section, pageId: targetPageId }] }
          : page
      );
    });
  };

  const removePage = (pageId: string) => {
    setPages((prev: PageNode[]) => prev.filter(page => page.id !== pageId));
    setNodes((prev: Node[]) => prev.filter((node: Node) => node.id !== pageId));
    setEdges((prev: Edge[]) => prev.filter((edge: Edge) => edge.source !== pageId && edge.target !== pageId));
  };

  const updatePageTitle = (pageId: string, newTitle: string) => {
    setPages((prev: PageNode[]) => 
      prev.map(page => 
        page.id === pageId 
          ? { ...page, title: newTitle }
          : page
      )
    );
  };

  const updateSectionName = (sectionId: string, newName: string) => {
    setPages((prev: PageNode[]) => 
      prev.map(page => ({
        ...page,
        sections: page.sections.map(section => 
          section.id === sectionId 
            ? { ...section, name: newName }
            : section
        )
      }))
    );
  };

  // Convert pages to React Flow nodes
  const generateNodes = (): Node[] => [
    {
      id: 'home',
      type: 'input',
      position: { x: 250, y: 100 },
      draggable: false,
      data: { 
        label: (
          <div className="flex flex-col gap-2 py-3 pl-4 pr-8 min-w-[240px] max-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-4 w-4" />
              <InlineEdit 
                value="Home" 
                onSave={(newTitle) => updatePageTitle('home', newTitle)}
                className="font-medium text-base"
              />
              <Badge variant="secondary">Main</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {pages.find(p => p.id === 'home')?.sections.map(section => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedSection(section);
                    e.dataTransfer.setData('text/plain', section.id);
                  }}
                  className="flex items-center gap-2 w-full py-1 bg-[#232b36] rounded border border-white/10 text-xs cursor-move font-mono text-white shadow-sm"
                  style={{ minHeight: 28 }}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                  {section.type === 'navbar' && <Menu className="h-3 w-3" />}
                  {section.type === 'footer' && <Layout className="h-3 w-3" />}
                  <InlineEdit 
                    value={section.name}
                    onSave={(newName) => updateSectionName(section.id, newName)}
                    className="ml-1 text-white"
                  />
                  {section.type === 'custom' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className="h-4 w-4 p-0 ml-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addSection('home')}
              className="flex items-center gap-2 w-full py-1 bg-[#232b36] rounded border border-white/10 text-xs font-mono text-white shadow-sm"
              style={{ minHeight: 28 }}
            >
              <Plus className="h-3 w-3" />
              <span className="ml-1">Add Section</span>
            </button>
          </div>
        )
      },
      style: {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        minWidth: '240px',
        maxWidth: '260px',
      },
    },
    ...subpages.map((page, index) => ({
      id: page.id,
      type: 'default',
      position: { 
        x: Math.round(gridBaseX + index * gridSpacing),
        y: 420
      },
      draggable: false,
      data: { 
        label: (
          <div className="flex flex-col gap-2 py-3 pl-4 pr-8 min-w-[240px] max-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4" />
              <InlineEdit 
                value={page.title}
                onSave={(newTitle) => updatePageTitle(page.id, newTitle)}
                className="font-medium text-base"
              />
            </div>
            <div
              className="flex flex-col gap-2"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = 'transparent';
                if (draggedSection && draggedSection.pageId !== page.id) {
                  moveSection(draggedSection.id, page.id);
                }
              }}
            >
              {page.sections.map(section => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedSection(section);
                    e.dataTransfer.setData('text/plain', section.id);
                  }}
                  className="flex items-center gap-2 w-full py-1 bg-[#232b36] rounded border border-white/10 text-xs cursor-move font-mono text-white shadow-sm"
                  style={{ minHeight: 28 }}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                  {section.type === 'navbar' && <Menu className="h-3 w-3" />}
                  {section.type === 'footer' && <Layout className="h-3 w-3" />}
                  <InlineEdit 
                    value={section.name}
                    onSave={(newName) => updateSectionName(section.id, newName)}
                    className="ml-1 text-white"
                  />
                  {section.type === 'custom' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className="h-4 w-4 p-0 ml-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addSection(page.id)}
              className="flex items-center gap-2 w-full py-1 bg-[#232b36] rounded border border-white/10 text-xs font-mono text-white shadow-sm"
              style={{ minHeight: 28 }}
            >
              <Plus className="h-3 w-3" />
              <span className="ml-1">Add Section</span>
            </button>
          </div>
        )
      },
      style: {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        minWidth: '240px',
        maxWidth: '260px',
      },
    })),
    // Add Page Button Node
    {
      id: 'add-page-button',
      type: 'addButton',
      position: { 
        x: addButtonX,
        y: 420
      },
      draggable: false,
      data: { 
        onClick: () => addPage()
      },
      style: {
        background: 'transparent',
        border: 'none',
        width: '60px',
        height: '60px',
      },
    },
  ];

  const initialEdges: Edge[] = pages
    .filter(page => page.type === 'page')
    .map(page => ({
      id: `home-${page.id}`,
      source: 'home',
      target: page.id,
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
    }));

  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(generateNodes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges],
  );

  const handleContinue = () => {
    setData?.(pages)
    onNext()
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="h-[600px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="border border-white rounded-lg"
          nodesDraggable={false}
          nodeTypes={nodeTypes}
        >
          <Background gap={20} size={1} />
          
          {/* Node Toolbars for page deletion */}
          {pages
            .filter(page => page.type === 'page')
            .map(page => (
              <NodeToolbar
                key={`toolbar-${page.id}`}
                nodeId={page.id}
                position={Position.Top}
                className="bg-background border rounded-lg shadow-lg"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePage(page.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </NodeToolbar>
            ))}

          {/* Add Section Panel */}
          {/* Removed Add Section Panel */}
        </ReactFlow>
      </div>
      
      {/* Continue Button - Outside Canvas */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleContinue} size="lg">
          <Send className="mr-2 h-4 w-4" />
          Continue
        </Button>
      </div>
    </div>
  );
} 