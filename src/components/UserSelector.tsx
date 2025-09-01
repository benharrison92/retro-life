import React, { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
}

interface UserSelectorProps {
  selectedUsers: UserProfile[];
  onUsersChange: (users: UserProfile[]) => void;
  placeholder?: string;
}

export const UserSelector = ({ selectedUsers, onUsersChange, placeholder = "Search for users..." }: UserSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // With the new security policy, we can only search among friends
        // First get user's friends, then search among them
        const { data: friendships, error: friendError } = await supabase
          .from('friendships')
          .select(`
            friend_id,
            user_profiles!friendships_friend_id_fkey(id, display_name, email, avatar_url)
          `)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .eq('status', 'accepted');

        if (friendError) {
          console.error('Error fetching friends:', friendError);
          return;
        }

        // Also get reverse friendships (where current user is the friend)
        const { data: reverseFriendships, error: reverseError } = await supabase
          .from('friendships')
          .select(`
            user_id,
            user_profiles!friendships_user_id_fkey(id, display_name, email, avatar_url)
          `)
          .eq('friend_id', (await supabase.auth.getUser()).data.user?.id)
          .eq('status', 'accepted');

        if (reverseError) {
          console.error('Error fetching reverse friendships:', reverseError);
          return;
        }

        // Combine and flatten friend profiles
        const allFriends = [
          ...(friendships?.map(f => (f as any).user_profiles) || []),
          ...(reverseFriendships?.map(f => (f as any).user_profiles) || [])
        ].filter(Boolean);

        // Filter friends based on search query
        const filteredFriends = allFriends.filter(friend =>
          friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          friend.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Filter out already selected users
        const filteredResults = filteredFriends.filter(
          user => !selectedUsers.some(selected => selected.id === user.id)
        );

        setSearchResults(filteredResults);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedUsers]);

  const handleAddUser = (user: UserProfile) => {
    console.log('UserSelector: Adding user:', user);
    console.log('UserSelector: Current selectedUsers before add:', selectedUsers);
    const newUsers = [...selectedUsers, user];
    console.log('UserSelector: New users list:', newUsers);
    onUsersChange(newUsers);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs">
                  {getInitials(user.display_name)}
                </AvatarFallback>
              </Avatar>
              <span>{user.display_name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveUser(user.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
            onBlur={() => {
              // Delay hiding results to allow clicking on them
              setTimeout(() => setShowResults(false), 200);
            }}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
          />
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-popover border shadow-lg">
            <CardContent className="p-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => handleAddUser(user)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {getInitials(user.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border shadow-lg">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              No friends found matching "{searchQuery}". 
              <br />
              <span className="text-xs">Note: You can only tag friends in retrospectives.</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};