import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Users, Check, X, UserMinus } from 'lucide-react';

interface FriendsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FriendWithProfile extends UserProfile {
  friendship_id: string;
  status: string;
}

export function FriendsList({ open, onOpenChange }: FriendsListProps) {
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendWithProfile[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

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

      setFriends(
        friendsData?.map(f => ({
          ...((f as any).user_profiles as UserProfile),
          friendship_id: f.id,
          status: f.status
        } as FriendWithProfile)) || []
      );

      setIncomingRequests(
        incomingData?.map(f => ({
          ...((f as any).user_profiles as UserProfile),
          friendship_id: f.id,
          status: f.status
        } as FriendWithProfile)) || []
      );

      setOutgoingRequests(
        outgoingData?.map(f => ({
          ...((f as any).user_profiles as UserProfile),
          friendship_id: f.id,
          status: f.status
        } as FriendWithProfile)) || []
      );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="relative">
              Friends
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
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {friends.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    You don't have any friends yet. Start by finding some!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <Card key={friend.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback>
                              {friend.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.display_name}</p>
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
                              {request.display_name.charAt(0).toUpperCase()}
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
                              {request.display_name.charAt(0).toUpperCase()}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}