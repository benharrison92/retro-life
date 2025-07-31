import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, User, Calendar, Tag, MapPin } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RetroForm } from "./RetroForm";
import { NotificationHub } from "./NotificationHub";
import { RetroCard } from "./RetroCard";
import { ConfirmDialog } from "./ConfirmDialog";
import { useRetros } from "@/hooks/useRetros";
import { useAuth } from "@/hooks/useAuth";
import { Retrospective, RBTItem, Comment, UserProfile } from "@/lib/supabase";

// Legacy type for compatibility with existing components
export interface Retro {
  id: string;
  title: string;
  eventType: string;
  date: string;
  ownerName: string;
  attendees: string[];
  attendeeUsers?: UserProfile[]; // Tagged user attendees
  roses: RBTItem[];
  buds: RBTItem[];
  thorns: RBTItem[];
  locationName?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Export types for other components
export type { RBTItem, Comment };

export const RetroApp = () => {
  const { retros, loading, createRetro, updateRetro, deleteRetro, searchRetrosByLocation, refreshRetros } = useRetros();
  const { user, profile } = useAuth();
  const [editingRetro, setEditingRetro] = useState<Retrospective | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserRetros, setShowUserRetros] = useState(false);
  const [retroToDelete, setRetroToDelete] = useState<Retrospective | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationResults, setLocationResults] = useState<Retrospective[]>([]);

  const { toast } = useToast();
  const currentUserName = profile?.display_name || 'You';

  // Convert Retrospective to legacy Retro for existing components
  const convertToLegacy = (retro: Retrospective): Retro & {
    locationName?: string;
    city?: string;
    state?: string;
    country?: string;
  } => ({
    id: retro.id,
    title: retro.title,
    eventType: retro.event_type,
    date: retro.date,
    ownerName: currentUserName, // Since it's from database, it's always current user's or friend's
    attendees: retro.attendees,
    attendeeUsers: retro.attendeeUsers, // Include tagged users
    roses: retro.roses,
    buds: retro.buds,
    thorns: retro.thorns,
    locationName: retro.location_name,
    city: retro.city,
    state: retro.state,
    country: retro.country,
    latitude: retro.latitude,
    longitude: retro.longitude,
    createdAt: new Date(retro.created_at),
    updatedAt: retro.updated_at ? new Date(retro.updated_at) : undefined,
  });

  // Search by location
  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) {
      setLocationResults([]);
      setShowLocationSearch(false);
      return;
    }

    const parts = locationSearch.split(',').map(p => p.trim());
    const city = parts[0];
    const state = parts[1];
    
    const results = await searchRetrosByLocation(city, state);
    setLocationResults(results);
    setShowLocationSearch(true);
  };

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
        (retro.location_name && retro.location_name.toLowerCase().includes(keyword)) ||
        (retro.city && retro.city.toLowerCase().includes(keyword)) ||
        (retro.state && retro.state.toLowerCase().includes(keyword)) ||
        retro.attendees.some(attendee => attendee.toLowerCase().includes(keyword)) ||
        retro.roses.some(r => r.text.toLowerCase().includes(keyword) || r.tags?.some(t => t.toLowerCase().includes(keyword))) ||
        retro.buds.some(b => b.text.toLowerCase().includes(keyword) || b.tags?.some(t => t.toLowerCase().includes(keyword))) ||
        retro.thorns.some(t => t.text.toLowerCase().includes(keyword) || t.tags?.some(tg => tg.toLowerCase().includes(keyword)))
      ) : true;

    const matchesUser = searchUser ?
      retro.attendees.some(attendee => attendee.toLowerCase().includes(searchUser.toLowerCase()))
      : true;

    return matchesTags && matchesKeywords && matchesUser;
  });

  const retrosToDisplay = showLocationSearch && locationResults.length > 0 
    ? locationResults 
    : (showUserRetros && selectedUser
      ? filteredRetros.filter(retro => retro.attendees.includes(selectedUser))
      : filteredRetros);

  // Get all unique users from attendees
  const allUsers = [...new Set(retros.flatMap(r => r.attendees))].sort();

  const handleOpenCreateModal = () => {
    setEditingRetro(null);
    setShowCreateModal(true);
  };

  const handleEditRetro = async (retro: Retro) => {
    // Refresh retros first to get latest attendeeUsers data
    await refreshRetros();
    
    // Find the updated retro with attendees
    const updatedDbRetro = retros.find(r => r.id === retro.id);
    
    // Convert legacy retro back to Retrospective using the updated data if available
    const dbRetro: Retrospective = {
      id: retro.id,
      user_id: user?.id || '',
      title: retro.title,
      event_type: retro.eventType,
      date: retro.date,
      attendees: retro.attendees,
      attendeeUsers: updatedDbRetro?.attendeeUsers || retro.attendeeUsers || [], // Include current attendeeUsers
      roses: retro.roses,
      buds: retro.buds,
      thorns: retro.thorns,
      photos: [],
      location_name: retro.locationName,
      city: retro.city,
      state: retro.state,
      country: retro.country,
      latitude: retro.latitude,
      longitude: retro.longitude,
      created_at: retro.createdAt.toISOString(),
      updated_at: retro.updatedAt?.toISOString() || '',
    };
    console.log('handleEditRetro: Setting editingRetro to:', dbRetro);
    setEditingRetro(dbRetro);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingRetro(null);
  };

  const handleSaveRetro = async (legacyRetroData: Omit<Retro, 'id' | 'createdAt' | 'updatedAt'> & {
    locationName?: string;
    city?: string;
    state?: string;
  }, attendeeUsers?: UserProfile[]) => {
    // Convert legacy data to database format
    const retroData: Omit<Retrospective, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title: legacyRetroData.title,
      event_type: legacyRetroData.eventType,
      date: legacyRetroData.date,
      attendees: legacyRetroData.attendees,
      roses: legacyRetroData.roses,
      buds: legacyRetroData.buds,
      thorns: legacyRetroData.thorns,
      photos: [],
      location_name: typeof legacyRetroData.locationName === 'string' ? legacyRetroData.locationName : undefined,
      city: typeof legacyRetroData.city === 'string' ? legacyRetroData.city : undefined,
      state: typeof legacyRetroData.state === 'string' ? legacyRetroData.state : undefined,
      country: 'US', // Default to US for now
      latitude: undefined,
      longitude: undefined,
    };

    console.log('handleSaveRetro: Legacy retro data:', legacyRetroData);
    console.log('handleSaveRetro: Attendee users:', attendeeUsers);

    console.log('handleSaveRetro: editingRetro value:', editingRetro);

    if (editingRetro) {
      // Update existing retro
      console.log('handleSaveRetro: Updating existing retro:', editingRetro.id);
      await updateRetro(editingRetro.id, retroData, attendeeUsers);
      // Refresh to get updated attendees
      await refreshRetros();
    } else {
      // Create new retro with attendees
      console.log('handleSaveRetro: Creating NEW retro with attendees:', attendeeUsers);
      try {
        await createRetro(retroData, attendeeUsers);
        console.log('handleSaveRetro: Retro created successfully');
        // Refresh the retros list to get the newly created attendees
    await refreshRetros();
    console.log('handleSaveRetro: Retros refreshed after save');
      } catch (error) {
        console.error('handleSaveRetro: Error creating retro:', error);
      }
    }
    handleCloseCreateModal();
  };

  const handleDeleteConfirm = (retro: Retro) => {
    // Find the corresponding Retrospective
    const dbRetro = retros.find(r => r.id === retro.id);
    if (dbRetro) {
      setRetroToDelete(dbRetro);
      setShowConfirmModal(true);
    }
  };

  const handleActualDelete = async () => {
    if (retroToDelete) {
      await deleteRetro(retroToDelete.id);
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
    setShowLocationSearch(false);
    setLocationSearch('');
  };

  const handleUpdateRetroItem = async (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: RBTItem) => {
    const retro = retros.find(r => r.id === retroId);
    if (!retro) return;

    const updatedRetro = {
      ...retro,
      [itemType]: retro[itemType].map(item => 
        item.id === itemId ? updatedItem : item
      ),
    };

    await updateRetro(retroId, updatedRetro);
  };

  if (loading) {
    console.log('RetroApp: Loading retros...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your retrospectives...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card className="shadow-elegant">
            <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
                    Retro App
                  </CardTitle>
                  <p className="text-lg opacity-90">Reflect, Learn, Optimize Your Experiences</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center text-sm text-muted-foreground mb-6 p-3 bg-muted/50 rounded-lg">
                Current User: <span className="font-semibold text-foreground">{currentUserName}</span>
              </div>
            
            <div className="space-y-4">
              <NotificationHub className="w-full sm:w-auto" />
              
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={handleOpenCreateModal}
                  className="w-full sm:w-auto px-6 py-3 text-lg font-bold"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Retro
                </Button>

              {(showUserRetros && selectedUser) || showLocationSearch ? (
                <Button
                  onClick={handleBackToAllRetros}
                  variant="outline"
                  className="w-full sm:w-auto px-6 py-3 text-lg font-bold"
                  size="lg"
                >
                  ← Back to All Retros
                </Button>
                ) : null}
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <div className="flex">
                  <Input
                    placeholder="City, State..."
                    className="pl-10 rounded-r-none"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  />
                  <Button
                    onClick={handleLocationSearch}
                    className="rounded-l-none px-3"
                    variant="outline"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
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

        {showLocationSearch && (
          <Card className="shadow-elegant bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col items-center">
                  <span>Retros near {locationSearch}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {locationResults.length} {locationResults.length === 1 ? 'retro' : 'retros'} found
                    </Badge>
                    {locationResults.length > 0 && (
                      <Badge variant="outline" className="text-sm">
                        Discover experiences in your area
                      </Badge>
                    )}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Retros Grid */}
        {retrosToDisplay.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="p-10 text-center">
              <p className="text-xl text-muted-foreground">
                {searchKeywords || filterTags || searchUser || showLocationSearch ? "No matching retros found." : "No retros yet. Start by creating one!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Special location-based layout */}
            {showLocationSearch && locationResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {retrosToDisplay.map((retro, index) => (
                  <div key={retro.id} className="relative">
                    <RetroCard
                      retro={convertToLegacy(retro)}
                      onEdit={handleEditRetro}
                      onDelete={handleDeleteConfirm}
                      onUpdateItem={handleUpdateRetroItem}
                      currentUserName={currentUserName}
                    />
                    {/* Special location indicator for search results */}
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        Closest Match
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Regular grid layout */}
            {!showLocationSearch && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {retrosToDisplay.map(retro => (
                  <RetroCard
                    key={retro.id}
                    retro={convertToLegacy(retro)}
                    onEdit={handleEditRetro}
                    onDelete={handleDeleteConfirm}
                    onUpdateItem={handleUpdateRetroItem}
                    currentUserName={currentUserName}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <RetroForm
          retro={editingRetro ? convertToLegacy(editingRetro) : null}
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
    </>
  );
};