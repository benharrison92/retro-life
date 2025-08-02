import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Search, Users } from "lucide-react";
import { useCatalogueMembers } from "@/hooks/useCatalogueMembers";
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface InviteToCatalogueDialogProps {
  catalogueId: string;
  catalogueName: string;
}

interface FriendProfile extends UserProfile {
  friendship_id: string;
}

export const InviteToCatalogueDialog = ({ catalogueId, catalogueName }: InviteToCatalogueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  
  const { inviteUserById } = useCatalogueMembers(catalogueId);
  const { user } = useAuth();

  // Load friends when dialog opens
  useEffect(() => {
    if (open && user) {
      loadFriends();
    }
  }, [open, user]);

  const loadFriends = async () => {
    if (!user) return;
    
    setLoadingFriends(true);
    try {
      const { data: friendsData } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          status,
          user_profiles!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      const friendProfiles = friendsData?.map(f => ({
        ...((f as any).user_profiles as UserProfile),
        friendship_id: f.id
      } as FriendProfile)) || [];

      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async () => {
    if (!selectedFriend) return;
    
    setIsInviting(true);
    const success = await inviteUserById(selectedFriend.id);
    
    if (success) {
      setSelectedFriend(null);
      setSearchTerm('');
      setOpen(false);
    }
    setIsInviting(false);
  };

  const handleSelectFriend = (friend: FriendProfile) => {
    setSelectedFriend(friend);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Friend
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite to "{catalogueName}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search friends */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Friends</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected friend */}
          {selectedFriend && (
            <div className="space-y-2">
              <Label>Selected Friend</Label>
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedFriend.avatar_url} />
                      <AvatarFallback>
                        {selectedFriend.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{selectedFriend.display_name}</p>
                      <p className="text-xs text-muted-foreground">{selectedFriend.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFriend(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Friends list */}
          <div className="space-y-2 flex-1 overflow-hidden">
            <Label>Your Friends</Label>
            {loadingFriends ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading friends...
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No friends found.</p>
                <p className="text-xs">Add some friends to invite them to catalogues!</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No friends match your search.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredFriends.map((friend) => (
                  <Card
                    key={friend.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedFriend?.id === friend.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSelectFriend(friend)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
                            {friend.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{friend.display_name}</p>
                          <p className="text-xs text-muted-foreground">{friend.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Your friend will receive a notification to join your catalogue
          </p>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={!selectedFriend || isInviting}
          >
            {isInviting ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};