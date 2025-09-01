import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Mail, Users } from 'lucide-react';

interface FriendFinderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendFinder({ open, onOpenChange }: FriendFinderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadFriends();
    }
  }, [open, user]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      // Get current friends and pending requests
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id, status')
        .eq('user_id', user.id);

      if (friendships) {
        setFriends(friendships.filter(f => f.status === 'accepted').map(f => f.friend_id));
        setPendingRequests(friendships.filter(f => f.status === 'pending').map(f => f.friend_id));
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // With new security restrictions, we can only search among friends
      // Get user's friends first
      const { data: friendships } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          user_profiles!friendships_friend_id_fkey(id, display_name, email, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      // Also get reverse friendships
      const { data: reverseFriendships } = await supabase
        .from('friendships')
        .select(`
          user_id,
          user_profiles!friendships_user_id_fkey(id, display_name, email, avatar_url)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      // Combine and search among friends
      const allFriends = [
        ...(friendships?.map(f => (f as any).user_profiles) || []),
        ...(reverseFriendships?.map(f => (f as any).user_profiles) || [])
      ].filter(Boolean);

      const filteredFriends = allFriends.filter(friend =>
        (friend.display_name.toLowerCase().includes(query.toLowerCase()) ||
         friend.email.toLowerCase().includes(query.toLowerCase())) &&
        friend.id !== user.id
      );

      setSearchResults(filteredFriends);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search failed",
        description: "Could not search for users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      setPendingRequests(prev => [...prev, friendId]);
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendInviteEmail = async () => {
    if (!inviteEmail.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('friend_invitations')
        .insert({
          from_user_id: user.id,
          to_email: inviteEmail,
          status: 'pending'
        });

      if (error) throw error;

      setInviteEmail('');
      toast({
        title: "Invitation sent!",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUserStatus = (userId: string) => {
    if (friends.includes(userId)) return 'friend';
    if (pendingRequests.includes(userId)) return 'pending';
    return 'none';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Friends
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search existing users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Start typing name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((user) => {
                      const status = getUserStatus(user.id);
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-accent border-b last:border-b-0">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {user.display_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{user.display_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={status === 'friend' ? 'secondary' : status === 'pending' ? 'outline' : 'default'}
                            disabled={status !== 'none'}
                            onClick={() => {
                              sendFriendRequest(user.id);
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                            className="ml-2 h-8 px-2 text-xs"
                          >
                            {status === 'friend' && 'Friends'}
                            {status === 'pending' && 'Sent'}
                            {status === 'none' && (
                              <>
                                <UserPlus className="h-3 w-3 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {loading && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg p-3">
                    <p className="text-sm text-muted-foreground text-center">Searching...</p>
                  </div>
                )}
                
                {searchQuery && !loading && searchResults.length === 0 && showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg p-3">
                    <p className="text-sm text-muted-foreground text-center">
                      No friends found matching "{searchQuery}"
                      <br />
                      <span className="text-xs">Note: You can only search among your current friends. Use "Invite Friends" to add new people.</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invite by email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invite Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Invite friends who aren't on RetroApp yet via email.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendInviteEmail()}
                />
                <Button onClick={sendInviteEmail} disabled={!inviteEmail.trim()}>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}