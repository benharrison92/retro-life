import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Users, Check, X, UserMinus, UserPlus, Mail, Search } from 'lucide-react';

interface FriendsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FriendWithProfile extends UserProfile {
  friendship_id: string;
  status: string;
}

export function FriendsManager({ open, onOpenChange }: FriendsManagerProps) {
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendWithProfile[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Find Friends state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && user) {
      loadFriends();
    }
  }, [open, user]);

  const loadFriends = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get friends (accepted friendships)
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

      // Get incoming requests
      const { data: incomingData } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          status,
          user_profiles!friendships_user_id_fkey(*)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      // Get outgoing requests
      const { data: outgoingData } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          status,
          user_profiles!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      const friendsWithProfiles = friendsData?.map(f => ({
        ...((f as any).user_profiles as UserProfile),
        friendship_id: f.id,
        status: f.status
      } as FriendWithProfile)) || [];

      const incomingWithProfiles = incomingData?.map(f => ({
        ...((f as any).user_profiles as UserProfile),
        friendship_id: f.id,
        status: f.status
      } as FriendWithProfile)) || [];

      const outgoingWithProfiles = outgoingData?.map(f => ({
        ...((f as any).user_profiles as UserProfile),
        friendship_id: f.id,
        status: f.status
      } as FriendWithProfile)) || [];

      setFriends(friendsWithProfiles);
      setIncomingRequests(incomingWithProfiles);
      setOutgoingRequests(outgoingWithProfiles);

      // Also set friend IDs for search functionality
      const allFriendIds = [
        ...friendsWithProfiles.map(f => f.id),
        ...outgoingWithProfiles.map(f => f.id)
      ];
      setFriendIds(friendsWithProfiles.map(f => f.id));
      setPendingRequestIds(outgoingWithProfiles.map(f => f.id));

    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: "Failed to load friends",
        description: "Could not load your friends list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Friend request accepted!",
        description: "You're now friends!",
      });

      loadFriends();
    } catch (error: any) {
      toast({
        title: "Failed to accept request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Friend request rejected",
        description: "The friend request has been rejected.",
      });

      loadFriends();
    } catch (error: any) {
      toast({
        title: "Failed to reject request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Friend removed",
        description: "You are no longer friends.",
      });

      loadFriends();
    } catch (error: any) {
      toast({
        title: "Failed to remove friend",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const searchUsers = async (query: string = '') => {
    if (!user) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Use secure search function - now returns results even with empty query
      const { data: users, error } = await supabase
        .rpc('search_users_for_friend_discovery', { 
          search_query: query.trim() || '' 
        });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      // Add email field as empty since the interface expects it, but it's not exposed for security
      const usersWithEmailField = ((users || []) as Array<{ id: string; display_name: string; avatar_url?: string | null }>).map(u => ({
        ...u,
        email: '' as string
      }));

      setSearchResults(usersWithEmailField);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search failed",
        description: "Could not search for users. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Load initial results and debounced search
  useEffect(() => {
    if (open && user) {
      // Load some initial users when the tab opens
      searchUsers('');
    }
  }, [open, user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      // First check if a friendship already exists (in either direction)
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          toast({
            title: "Already friends",
            description: "You are already friends with this person.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Request already sent",
            description: "A friend request is already pending with this person.",
            variant: "destructive",
          });
        }
        return;
      }

      // Create new friendship request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      setPendingRequestIds(prev => [...prev, friendId]);
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });
      
      // Reload friends to update the UI
      loadFriends();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Failed to send request",
        description: error.message || "Could not send friend request. Please try again.",
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
    if (friendIds.includes(userId)) return 'friend';
    if (pendingRequestIds.includes(userId)) return 'pending';
    return 'none';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="friends" className="relative">
              My Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="incoming" className="relative">
              Requests
              {incomingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {incomingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Sent
              {outgoingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {outgoingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="find">
              Find Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {friends.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    You don't have any friends yet. Try the "Find Friends" tab!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <Card key={friend.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors" onClick={() => {
                          onOpenChange(false);
                          navigate(`/user/${friend.id}`);
                        }}>
                          <Avatar>
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback>
                              {friend.display_name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium hover:text-primary transition-colors">{friend.display_name}</p>
                            <p className="text-sm text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFriend(friend.friendship_id)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="incoming" className="space-y-4">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No pending friend requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.avatar_url} />
                            <AvatarFallback>
                              {request.display_name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.display_name}</p>
                            <p className="text-sm text-muted-foreground">{request.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptFriendRequest(request.friendship_id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectFriendRequest(request.friendship_id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No outgoing friend requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {outgoingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.avatar_url} />
                            <AvatarFallback>
                              {request.display_name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.display_name}</p>
                            <p className="text-sm text-muted-foreground">{request.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="find" className="space-y-6">
            {/* Search existing users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Find People on RetroApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Search for people to connect with. Start typing a name or browse all users.
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Search by name or browse all users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {searchLoading && (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Searching for people...</p>
                      </div>
                    </div>
                  )}
                  
                  {!searchLoading && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? `Found ${searchResults.length} people matching "${searchQuery}"` : `Showing ${searchResults.length} people on RetroApp`}
                          </p>
                          {searchResults.map((userResult) => {
                            const status = getUserStatus(userResult.id);
                            return (
                              <Card key={userResult.id} className="transition-all hover:shadow-md">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage src={userResult.avatar_url} />
                                        <AvatarFallback className="text-sm font-medium">
                                          {userResult.display_name?.charAt(0)?.toUpperCase() || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-base truncate">{userResult.display_name}</p>
                                        <p className="text-sm text-muted-foreground">RetroApp User</p>
                                      </div>
                                    </div>
                                    <Button
                                      size="default"
                                      variant={status === 'friend' ? 'secondary' : status === 'pending' ? 'outline' : 'default'}
                                      disabled={status !== 'none'}
                                      onClick={() => {
                                        sendFriendRequest(userResult.id);
                                      }}
                                      className="ml-4"
                                    >
                                      {status === 'friend' && (
                                        <>
                                          <Check className="h-4 w-4 mr-2" />
                                          Friends
                                        </>
                                      )}
                                      {status === 'pending' && (
                                        <>
                                          <Users className="h-4 w-4 mr-2" />
                                          Request Sent
                                        </>
                                      )}
                                      {status === 'none' && (
                                        <>
                                          <UserPlus className="h-4 w-4 mr-2" />
                                          Add Friend
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </>
                      ) : (
                        !searchLoading && (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">
                                {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Try searching for a different name or invite friends to join RetroApp.
                              </p>
                            </CardContent>
                          </Card>
                        )
                      )}
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}