import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { UserCheck, X, Search } from 'lucide-react';

interface PhotoTaggerProps {
  onTagFriend: (friend: UserProfile) => void;
  existingTags?: UserProfile[];
  className?: string;
}

export const PhotoTagger: React.FC<PhotoTaggerProps> = ({
  onTagFriend,
  existingTags = [],
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  // Load friends
  const loadFriends = async (query = '') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: friendsData } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          user_profiles!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsData) {
        let availableFriends = friendsData
          .map(f => f.user_profiles)
          .filter(Boolean)
          .filter((friend: UserProfile) => 
            !existingTags.some(tag => tag.id === friend.id)
          );

        if (query) {
          availableFriends = availableFriends.filter((friend: UserProfile) =>
            friend.display_name.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        setFriends(availableFriends.slice(0, 8));
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDropdown) {
      loadFriends(searchQuery);
    }
  }, [showDropdown, searchQuery, user, existingTags]);

  const handleTagFriend = (friend: UserProfile) => {
    onTagFriend(friend);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search friends to tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="pr-8"
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1"
        >
          <UserCheck className="w-4 h-4" />
          Tag
        </Button>
      </div>

      {/* Friends dropdown */}
      {showDropdown && (
        <Card className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto border shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading friends...
            </div>
          ) : friends.length > 0 ? (
            <div className="p-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-2 cursor-pointer flex items-center gap-2 hover:bg-accent rounded"
                  onClick={() => handleTagFriend(friend)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">
                      {friend.display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{friend.display_name}</div>
                    <div className="text-xs text-muted-foreground">{friend.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? 'No friends found' : 'No friends available to tag'}
            </div>
          )}
        </Card>
      )}

      {/* Close dropdown overlay */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};