import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus } from 'lucide-react';
import { RetroNode } from '@/hooks/useRetroNodes';
import { NodeCard } from './NodeCard';

interface TreeSidebarProps {
  nodes: RetroNode[];
  selectedNodeId?: string;
  onNodeSelect: (node: RetroNode) => void;
  onAddNode?: (parentId?: string) => void;
  onEditNode?: (node: RetroNode) => void;
  onDeleteNode?: (nodeId: string) => void;
  onOpenRBT?: (node: RetroNode) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const TreeSidebar: React.FC<TreeSidebarProps> = ({
  nodes,
  selectedNodeId,
  onNodeSelect,
  onAddNode,
  onEditNode,
  onDeleteNode,
  onOpenRBT,
  searchQuery = '',
  onSearchChange
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const filterNodes = (nodes: RetroNode[], query: string): RetroNode[] => {
    if (!query.trim()) return nodes;
    
    return nodes.filter(node => {
      const matchesQuery = node.title.toLowerCase().includes(query.toLowerCase()) ||
                          (node.subtitle?.toLowerCase().includes(query.toLowerCase())) ||
                          node.type.toLowerCase().includes(query.toLowerCase());
      
      const hasMatchingChildren = node.children ? 
        filterNodes(node.children, query).length > 0 : false;
      
      return matchesQuery || hasMatchingChildren;
    }).map(node => ({
      ...node,
      children: node.children ? filterNodes(node.children, query) : []
    }));
  };

  const renderNodeTree = (nodes: RetroNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div 
          className={`cursor-pointer ${selectedNodeId === node.id ? 'ring-2 ring-primary rounded-lg' : ''}`}
          onClick={() => onNodeSelect(node)}
        >
          <NodeCard
            node={node}
            onExpand={() => toggleNodeExpansion(node.id)}
            onEdit={onEditNode ? () => onEditNode(node) : undefined}
            onDelete={onDeleteNode ? () => onDeleteNode(node.id) : undefined}
            onOpenRBT={onOpenRBT ? () => onOpenRBT(node) : undefined}
            onAddChild={onAddNode ? () => onAddNode(node.id) : undefined}
            isExpanded={expandedNodes.has(node.id)}
            compact={true}
          />
        </div>
        
        {expandedNodes.has(node.id) && node.children && node.children.length > 0 && (
          <div className="mt-2 ml-4">
            {renderNodeTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const filteredNodes = filterNodes(nodes, searchQuery);

  return (
    <Sidebar className="w-80 border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Retro Tree</h2>
          <div className="flex items-center gap-2">
            {onAddNode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddNode()}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <SidebarTrigger />
          </div>
        </div>
        
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-2">
            {filteredNodes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No matching nodes found' : 'No nodes yet'}
                </p>
                {onAddNode && !searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddNode()}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Node
                  </Button>
                )}
              </div>
            ) : (
              renderNodeTree(filteredNodes)
            )}
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};