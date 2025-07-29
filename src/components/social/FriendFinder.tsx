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

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`display_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10);

      setSearchResults(data || []);
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
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                />
                <Button onClick={searchUsers} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user) => {
                    const status = getUserStatus(user.id);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.display_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={status === 'friend' ? 'secondary' : status === 'pending' ? 'outline' : 'default'}
                          disabled={status !== 'none'}
                          onClick={() => sendFriendRequest(user.id)}
                        >
                          {status === 'friend' && 'Friends'}
                          {status === 'pending' && 'Request Sent'}
                          {status === 'none' && (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Friend
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
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