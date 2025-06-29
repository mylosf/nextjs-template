import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Plus, Trash2, Home, FileText, GripVertical, Menu, Layout } from 'lucide-react';
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
import '@xyflow/react/dist/style.css';

interface Props {
  onNext: () => void;
  onBack: () => void;
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

export default function SitemapBuilderStep({ onNext, onBack }: Props) {
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
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [showAddSection, setShowAddSection] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);

  // Calculate grid positions for subpages
  const subpages = pages.filter(page => page.type === 'page');
  const gridSpacing = 320;
  const gridStartX = 100;
  const totalWidth = (subpages.length - 1) * gridSpacing;
  const gridBaseX = 250 - totalWidth / 2;

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
              <span className="font-medium text-base">Home</span>
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
                  <span className="ml-1">{section.name}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAddSection('home')}
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
              <span className="font-medium text-base">{page.title}</span>
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
                  <span className="ml-1">{section.name}</span>
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
              onClick={() => setShowAddSection(page.id)}
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

  const addPage = () => {
    if (!newPageTitle.trim()) return;
    
    const newPage: PageNode = {
      id: `page-${Date.now()}`,
      title: newPageTitle,
      type: 'page',
      sections: [
        { id: `page-${Date.now()}-navbar`, name: 'Navbar', type: 'navbar', pageId: `page-${Date.now()}` },
        { id: `page-${Date.now()}-footer`, name: 'Footer', type: 'footer', pageId: `page-${Date.now()}` },
      ]
    };
    
    setPages((prev: PageNode[]) => [...prev, newPage]);
    
    // Add new node
    const newNode: Node = {
      id: newPage.id,
      type: 'default',
      position: { 
        x: 100 + (pages.filter(p => p.type === 'page').length * 320), 
        y: 420 
      },
      draggable: false,
      data: { 
        label: (
          <div className="flex flex-col gap-2 py-3 pl-4 pr-8 min-w-[240px] max-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-base">{newPage.title}</span>
            </div>
            <div
              className="flex flex-col gap-2"
            >
              {newPage.sections.map(section => (
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
                  <span className="ml-1">{section.name}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAddSection(newPage.id)}
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
    };
    
    setNodes((prev: Node[]) => [...prev, newNode]);
    
    // Add new edge from home
    const newEdge: Edge = {
      id: `home-${newPage.id}`,
      source: 'home',
      target: newPage.id,
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
    };
    
    setEdges((prev: Edge[]) => [...prev, newEdge]);
    setNewPageTitle('');
    setShowAddInput(false);
  };

  const addSection = (pageId: string) => {
    if (!newSectionName.trim()) return;
    
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: newSectionName,
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
    
    setNewSectionName('');
    setShowAddSection(null);
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
          
          {/* Floating Add Page Panel */}
          <Panel position="top-right" className="bg-background border rounded-lg p-4 shadow-lg">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Add New Page</h3>
              {showAddInput ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Page title"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPage()}
                    className="w-48"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={addPage} size="sm" className="flex-1">
                      Add
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAddInput(false);
                        setNewPageTitle('');
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowAddInput(true)} 
                  size="sm" 
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page
                </Button>
              )}
            </div>
          </Panel>

          {/* Add Section Panel */}
          {showAddSection && (
            <Panel position="top-left" className="bg-background border rounded-lg p-4 shadow-lg">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Add Section to {pages.find(p => p.id === showAddSection)?.title}</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Section name"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSection(showAddSection)}
                    className="w-48"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => addSection(showAddSection)} size="sm" className="flex-1">
                      Add
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAddSection(null);
                        setNewSectionName('');
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* Continue Button Panel */}
          <Panel position="bottom-right">
            <Button onClick={onNext} size="lg">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
} 