import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTripPlannerMembers } from '@/hooks/useTripPlannerMembers';
import { toast } from 'sonner';
import type { UserProfile } from '@/lib/supabase';

interface InviteToTripPlannerDialogProps {
  tripPlannerId: string;
  tripPlannerName: string;
}

interface FriendProfile extends UserProfile {
  friendship_id: string;
}

export function InviteToTripPlannerDialog({ tripPlannerId, tripPlannerName }: InviteToTripPlannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [inviting, setInviting] = useState(false);
  const { user } = useAuth();
  const { inviteUserById } = useTripPlannerMembers(tripPlannerId);

  const loadFriends = async () => {
    if (!user || !open) return;

    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          user_profiles!friendships_user_id_fkey(id, email, display_name, avatar_url),
          friend_profiles:user_profiles!friendships_friend_id_fkey(id, email, display_name, avatar_url)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const friendProfiles: FriendProfile[] = [];
      friendships?.forEach((friendship) => {
        if (friendship.user_id === user.id && friendship.friend_profiles) {
          friendProfiles.push({
            ...friendship.friend_profiles,
            friendship_id: friendship.id
          });
        } else if (friendship.friend_id === user.id && friendship.user_profiles) {
          friendProfiles.push({
            ...friendship.user_profiles,
            friendship_id: friendship.id
          });
        }
      });

      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends');
    }
  };

  useEffect(() => {
    loadFriends();
  }, [open, user]);

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async () => {
    if (!selectedFriend) return;

    setInviting(true);
    try {
      await inviteUserById(selectedFriend.id);
      setOpen(false);
      setSelectedFriend(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error inviting friend:', error);
    } finally {
      setInviting(false);
    }
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friend to Trip Planner</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Invite a friend to collaborate on "{tripPlannerName}"
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Friend */}
          {selectedFriend && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedFriend.avatar_url || ''} />
                  <AvatarFallback>
                    {selectedFriend.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedFriend.display_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedFriend.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No friends found. Add some friends first!
              </p>
            ) : filteredFriends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No friends match your search.
              </p>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedFriend?.id === friend.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSelectFriend(friend)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {friend.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{friend.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedFriend(null);
                setSearchTerm('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!selectedFriend || inviting}
              className="flex-1"
            >
              {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}