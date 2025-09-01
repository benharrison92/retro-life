import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { RetroNode, useRetroNodes } from '@/hooks/useRetroNodes';
import { TreeSidebar } from '@/components/hierarchy/TreeSidebar';
import { TripOverview } from '@/components/hierarchy/TripOverview';
import { RBTEditor } from '@/components/hierarchy/RBTEditor';
import { useAuth } from '@/hooks/useAuth';

export default function HierarchicalTrips() {
  const { tripId } = useParams();
  const [selectedTrip, setSelectedTrip] = useState<RetroNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<RetroNode | null>(null);
  const [rbtEditorOpen, setRbtEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { nodes, loading, createNode, updateNode, deleteNode } = useRetroNodes();
  const { user } = useAuth();

  useEffect(() => {
    if (tripId && nodes.length > 0) {
      const trip = findNodeById(nodes, tripId);
      if (trip && trip.type === 'TRIP') {
        setSelectedTrip(trip);
        setSelectedNode(trip);
      }
    }
  }, [tripId, nodes]);

  // Set page title
  useEffect(() => {
    document.title = selectedTrip ? `${selectedTrip.title} - Hierarchical Retro` : 'Hierarchical Retros';
  }, [selectedTrip]);

  const findNodeById = (nodes: RetroNode[], id: string): RetroNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleAddNode = async (parentId?: string, type: RetroNode['type'] = 'TRIP') => {
    const title = prompt(`Enter ${type.toLowerCase()} title:`);
    if (!title) return;

    await createNode({
      parent_id: parentId,
      type,
      title,
      visibility: 'PRIVATE',
      metadata: {},
      order_index: 0,
    });
  };

  const handleEditNode = async (node: RetroNode) => {
    const newTitle = prompt('Enter new title:', node.title);
    if (!newTitle || newTitle === node.title) return;

    await updateNode(node.id, { title: newTitle });
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm('Are you sure you want to delete this node and all its children?')) return;
    await deleteNode(nodeId);
  };

  const handleOpenRBT = (node: RetroNode) => {
    setSelectedNode(node);
    setRbtEditorOpen(true);
  };

  const handleNodeSelect = (node: RetroNode) => {
    setSelectedNode(node);
    if (node.type === 'TRIP') {
      setSelectedTrip(node);
    }
  };

  if (loading && !selectedTrip) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (tripId && !selectedTrip) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Trip Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The trip you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <SidebarProvider>
        <div className="flex w-full">
          <TreeSidebar
            nodes={nodes}
            selectedNodeId={selectedNode?.id}
            onNodeSelect={handleNodeSelect}
            onAddNode={handleAddNode}
            onEditNode={handleEditNode}
            onDeleteNode={handleDeleteNode}
            onOpenRBT={handleOpenRBT}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <main className="flex-1 p-6">
            {selectedTrip ? (
              <TripOverview
                trip={selectedTrip}
                onAddCategory={() => handleAddNode(selectedTrip.id, 'CATEGORY')}
                onEditTrip={() => handleEditNode(selectedTrip)}
                onAddCity={(categoryId) => handleAddNode(categoryId, 'CITY')}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <h1 className="text-2xl font-bold mb-4">Welcome to Hierarchical Retros</h1>
                  <p className="text-muted-foreground mb-6">
                    Organize your retrospectives in a hierarchical structure. Start by creating a trip or selecting one from the sidebar.
                  </p>
                  {user && (
                    <Button onClick={() => handleAddNode(undefined, 'TRIP')}>
                      Create Your First Trip
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </SidebarProvider>

      {/* RBT Editor */}
      <RBTEditor
        node={selectedNode}
        isOpen={rbtEditorOpen}
        onClose={() => {
          setRbtEditorOpen(false);
        }}
      />
    </div>
  );
}