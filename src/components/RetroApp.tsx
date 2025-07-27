import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, User, Calendar, Tag } from "lucide-react";
import { RetroForm } from "./RetroForm";
import { RetroCard } from "./RetroCard";
import { ConfirmDialog } from "./ConfirmDialog";

export interface RBTItem {
  id: string;
  text: string;
  tags: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  authorName: string;
  timestamp: string;
}

export interface Retro {
  id: string;
  title: string;
  eventType: string;
  date: string;
  ownerName: string;
  attendees: string[];
  roses: RBTItem[];
  buds: RBTItem[];
  thorns: RBTItem[];
  createdAt: Date;
  updatedAt?: Date;
}

// Sample data for initial state
const sampleRetros: Retro[] = [
  {
    id: "1",
    title: "Hawaii Vacation",
    eventType: "Trip",
    date: "2024-07-15",
    ownerName: "Ben",
    attendees: ["Ben", "Ashley Harrison"],
    roses: [
      { 
        id: "r1", 
        text: "Saw two sea turtles", 
        tags: ["wildlife", "ocean"], 
        comments: [] 
      },
      { 
        id: "r2", 
        text: "Overwhelming sense of gratitude for family", 
        tags: ["family", "emotions"], 
        comments: [
          {
            id: "c1",
            text: "This was such a beautiful moment!",
            authorName: "Ashley Harrison",
            timestamp: new Date().toISOString()
          }
        ]
      }
    ],
    buds: [
      { 
        id: "b1", 
        text: "Getting heads down on pursuing a business venture", 
        tags: ["business", "future"], 
        comments: [] 
      }
    ],
    thorns: [
      { 
        id: "t1", 
        text: "Stressing in line at the airport", 
        tags: ["travel", "airport"], 
        comments: [] 
      }
    ],
    createdAt: new Date("2024-07-15"),
  },
  {
    id: "2",
    title: "BNP Paribas Tennis Tournament",
    eventType: "Event",
    date: "2024-03-10",
    ownerName: "Ben",
    attendees: ["Ben", "Elwood", "Alex"],
    roses: [
      { 
        id: "r3", 
        text: "Dinner and spending time with the Pierotti family", 
        tags: ["social", "family"], 
        comments: [] 
      },
      { 
        id: "r4", 
        text: "Late night match with Elwood making friends in the crowd", 
        tags: ["tennis", "social", "kids"], 
        comments: [] 
      }
    ],
    buds: [
      { 
        id: "b2", 
        text: "Hawaii in 1 week!", 
        tags: ["travel", "excitement"], 
        comments: [] 
      }
    ],
    thorns: [
      { 
        id: "t2", 
        text: "Parking was a nightmare, arrived too late", 
        tags: ["parking", "event"], 
        comments: [] 
      }
    ],
    createdAt: new Date("2024-03-10"),
  }
];

export const RetroApp = () => {
  const [retros, setRetros] = useState<Retro[]>(() => {
    const saved = localStorage.getItem('retros');
    return saved ? JSON.parse(saved) : sampleRetros;
  });
  const [editingRetro, setEditingRetro] = useState<Retro | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserRetros, setShowUserRetros] = useState(false);
  const [retroToDelete, setRetroToDelete] = useState<Retro | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentUserName] = useState('My Name');

  const { toast } = useToast();

  // Save to localStorage whenever retros change
  useEffect(() => {
    localStorage.setItem('retros', JSON.stringify(retros));
  }, [retros]);

  // Filter logic
  const filteredRetros = retros.filter(retro => {
    const matchesTags = filterTags ? 
      filterTags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean).every(filterTag =>
        retro.roses.some(r => r.tags?.some(t => t.toLowerCase().includes(filterTag))) ||
        retro.buds.some(b => b.tags?.some(t => t.toLowerCase().includes(filterTag))) ||
        retro.thorns.some(t => t.tags?.some(tg => tg.toLowerCase().includes(filterTag)))
      ) : true;

    const matchesKeywords = searchKeywords ?
      searchKeywords.toLowerCase().split(' ').filter(Boolean).every(keyword =>
        retro.title.toLowerCase().includes(keyword) ||
        retro.date.includes(keyword) ||
        retro.attendees.some(attendee => attendee.toLowerCase().includes(keyword)) ||
        retro.roses.some(r => r.text.toLowerCase().includes(keyword) || r.tags?.some(t => t.toLowerCase().includes(keyword))) ||
        retro.buds.some(b => b.text.toLowerCase().includes(keyword) || b.tags?.some(t => t.toLowerCase().includes(keyword))) ||
        retro.thorns.some(t => t.text.toLowerCase().includes(keyword) || t.tags?.some(tg => tg.toLowerCase().includes(keyword)))
      ) : true;

    const matchesUser = searchUser ?
      retro.attendees.some(attendee => attendee.toLowerCase().includes(searchUser.toLowerCase())) ||
      retro.ownerName.toLowerCase().includes(searchUser.toLowerCase())
      : true;

    return matchesTags && matchesKeywords && matchesUser;
  });

  const retrosToDisplay = showUserRetros && selectedUser
    ? filteredRetros.filter(retro => retro.attendees.includes(selectedUser) || retro.ownerName === selectedUser)
    : filteredRetros;

  // Get all unique users
  const allUsers = [...new Set(retros.flatMap(r => [...r.attendees, r.ownerName]))].sort();

  const handleOpenCreateModal = () => {
    setEditingRetro(null);
    setShowCreateModal(true);
  };

  const handleEditRetro = (retro: Retro) => {
    setEditingRetro(retro);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingRetro(null);
  };

  const handleSaveRetro = (retroData: Omit<Retro, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRetro) {
      // Update existing retro
      setRetros(prev => prev.map(r => 
        r.id === editingRetro.id 
          ? { ...retroData, id: editingRetro.id, createdAt: editingRetro.createdAt, updatedAt: new Date() }
          : r
      ));
      toast({
        title: "Retro updated!",
        description: "Your retrospective has been successfully updated.",
      });
    } else {
      // Create new retro
      const newRetro: Retro = {
        ...retroData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setRetros(prev => [newRetro, ...prev]);
      toast({
        title: "Retro created!",
        description: "Your new retrospective has been created.",
      });
    }
    handleCloseCreateModal();
  };

  const handleDeleteConfirm = (retro: Retro) => {
    setRetroToDelete(retro);
    setShowConfirmModal(true);
  };

  const handleActualDelete = () => {
    if (retroToDelete) {
      setRetros(prev => prev.filter(r => r.id !== retroToDelete.id));
      toast({
        title: "Retro deleted",
        description: "Your retrospective has been removed.",
        variant: "destructive",
      });
    }
    setShowConfirmModal(false);
    setRetroToDelete(null);
  };

  const handleViewUserRetros = (user: string) => {
    setSelectedUser(user);
    setShowUserRetros(true);
  };

  const handleBackToAllRetros = () => {
    setShowUserRetros(false);
    setSelectedUser(null);
    setSearchUser('');
  };

  const handleUpdateRetroItem = (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: RBTItem) => {
    setRetros(prev => prev.map(retro => 
      retro.id === retroId 
        ? {
            ...retro,
            [itemType]: retro[itemType].map(item => 
              item.id === itemId ? updatedItem : item
            ),
            updatedAt: new Date()
          }
        : retro
    ));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-elegant">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-3xl md:text-4xl font-bold text-center tracking-tight">
              Retro App
            </CardTitle>
            <p className="text-center text-lg opacity-90">Reflect, Learn, Optimize Your Experiences</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center text-sm text-muted-foreground mb-6 p-3 bg-muted/50 rounded-lg">
              Current User: <span className="font-semibold text-foreground">{currentUserName}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto px-6 py-3 text-lg font-bold"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Retro
              </Button>

              {showUserRetros && selectedUser && (
                <Button
                  onClick={handleBackToAllRetros}
                  variant="outline"
                  className="w-full sm:w-auto px-6 py-3 text-lg font-bold"
                  size="lg"
                >
                  ← Back to All Retros
                </Button>
              )}
            </div>

            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search keywords..."
                  className="pl-10"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                />
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter by tags..."
                  className="pl-10"
                  value={filterTags}
                  onChange={(e) => setFilterTags(e.target.value)}
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
                {searchUser && (
                  <div className="absolute z-10 w-full bg-card border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {allUsers
                      .filter(user => user.toLowerCase().includes(searchUser.toLowerCase()))
                      .map(user => (
                        <button
                          key={user}
                          onClick={() => handleViewUserRetros(user)}
                          className="block w-full text-left px-4 py-2 hover:bg-muted text-foreground"
                        >
                          {user}
                        </button>
                      ))}
                    {allUsers.filter(user => user.toLowerCase().includes(searchUser.toLowerCase())).length === 0 && (
                      <p className="px-4 py-2 text-muted-foreground">No users found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {showUserRetros && selectedUser && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <User className="w-6 h-6" />
                Retros by {selectedUser}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Retros Grid */}
        {retrosToDisplay.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="p-10 text-center">
              <p className="text-xl text-muted-foreground">
                {searchKeywords || filterTags || searchUser ? "No matching retros found." : "No retros yet. Start by creating one!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retrosToDisplay.map(retro => (
              <RetroCard
                key={retro.id}
                retro={retro}
                onEdit={handleEditRetro}
                onDelete={handleDeleteConfirm}
                onUpdateItem={handleUpdateRetroItem}
                currentUserName={currentUserName}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <RetroForm
          retro={editingRetro}
          onClose={handleCloseCreateModal}
          onSave={handleSaveRetro}
          currentUserName={currentUserName}
        />
      )}

      {showConfirmModal && retroToDelete && (
        <ConfirmDialog
          title="Delete Retrospective"
          message={`Are you sure you want to delete "${retroToDelete.title}"? This action cannot be undone.`}
          onConfirm={handleActualDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};