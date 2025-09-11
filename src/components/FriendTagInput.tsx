import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface FriendTagInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

interface TaggedFriend {
  id: string;
  display_name: string;
  avatar_url?: string;
}

export const FriendTagInput = ({ 
  value, 
  onChange, 
  onKeyDown, 
  placeholder = "Add comment...", 
  className = "" 
}: FriendTagInputProps) => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [filteredFriends, setFilteredFriends] = useState<UserProfile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionQuery, setMentionQuery] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load friends on component mount
  useEffect(() => {
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      // Get accepted friendships in both directions
      const { data: sentFriendships } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          user_profiles!friendships_friend_id_fkey(id, display_name, email, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      const { data: receivedFriendships } = await supabase
        .from('friendships')
        .select(`
          user_id,
          user_profiles!friendships_user_id_fkey(id, display_name, email, avatar_url)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      const allFriends = [
        ...(sentFriendships?.map(f => (f as any).user_profiles) || []),
        ...(receivedFriendships?.map(f => (f as any).user_profiles) || [])
      ].filter(Boolean);

      setFriends(allFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Handle input change and detect @ mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    
    // Find the last @ symbol before cursor
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space or start of string before @
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || lastAtIndex === 0) {
        // Extract the query after @
        const query = textBeforeCursor.substring(lastAtIndex + 1);
        
        // Only show if query doesn't contain spaces (incomplete mention)
        if (!query.includes(' ')) {
          setMentionStart(lastAtIndex);
          setMentionQuery(query.toLowerCase());
          
          // Filter friends based on query
          const filtered = friends.filter(friend =>
            friend.display_name.toLowerCase().includes(query.toLowerCase())
          );
          setFilteredFriends(filtered);
          setShowFriends(filtered.length > 0);
          setSelectedIndex(0);
          return;
        }
      }
    }
    
    // Hide dropdown if no valid mention context
    setShowFriends(false);
    setMentionStart(-1);
    setMentionQuery('');
  };

  // Handle key navigation in dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showFriends && filteredFriends.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredFriends.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredFriends.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertFriendMention(filteredFriends[selectedIndex]);
        return; // Don't call onKeyDown for Enter when selecting friend
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowFriends(false);
        return;
      }
    }
    
    // Call original onKeyDown if provided
    onKeyDown?.(e);
  };

  // Insert friend mention into text
  const insertFriendMention = (friend: UserProfile) => {
    if (mentionStart === -1) return;
    
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(mentionStart + mentionQuery.length + 1); // +1 for @
    const newValue = `${beforeMention}@${friend.display_name} ${afterMention}`;
    
    onChange(newValue);
    setShowFriends(false);
    setMentionStart(-1);
    setMentionQuery('');
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = beforeMention.length + friend.display_name.length + 2; // +2 for @ and space
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowFriends(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={className}
      />
      
      {showFriends && filteredFriends.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute bottom-full left-0 mb-1 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto"
        >
          {filteredFriends.map((friend, index) => (
            <div
              key={friend.id}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => insertFriendMention(friend)}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={friend.avatar_url} />
                <AvatarFallback className="text-xs">
                  {friend.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{friend.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};