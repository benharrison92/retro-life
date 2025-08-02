import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AtSign, X } from 'lucide-react';

interface FriendTaggerProps {
  value: string;
  onChange: (value: string) => void;
  onTaggedFriendsChange?: (friends: UserProfile[]) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
  disabled?: boolean;
}

interface TaggedFriend extends UserProfile {
  startIndex: number;
  endIndex: number;
}

export const FriendTagger: React.FC<FriendTaggerProps> = ({
  value,
  onChange,
  onTaggedFriendsChange,
  placeholder = "Type @ to tag friends...",
  className = "",
  onSubmit,
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [taggedFriends, setTaggedFriends] = useState<TaggedFriend[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load friends for suggestions
  const loadFriends = async (query: string) => {
    if (!user || query.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      // Get accepted friendships and search by display name
      const { data: friendsData } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          user_profiles!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsData) {
        const friends = friendsData
          .map(f => f.user_profiles)
          .filter(Boolean)
          .filter((friend: UserProfile) => 
            friend.display_name.toLowerCase().includes(query.toLowerCase())
          );
        
        setSuggestions(friends.slice(0, 5)); // Limit to 5 suggestions
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Parse text to find @mentions and update tagged friends
  const parseTaggedFriends = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const matches = Array.from(text.matchAll(mentionRegex));
    
    const newTaggedFriends: TaggedFriend[] = [];
    
    matches.forEach(match => {
      const username = match[1];
      const startIndex = match.index!;
      const endIndex = startIndex + match[0].length;
      
      // Find the friend in our suggestions or previously tagged friends
      const friend = suggestions.find(f => 
        f.display_name.toLowerCase() === username.toLowerCase()
      ) || taggedFriends.find(f => 
        f.display_name.toLowerCase() === username.toLowerCase()
      );
      
      if (friend) {
        newTaggedFriends.push({
          ...friend,
          startIndex,
          endIndex
        });
      }
    });
    
    setTaggedFriends(newTaggedFriends);
    onTaggedFriendsChange?.(newTaggedFriends);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(newCursorPos);
    
    // Parse tagged friends
    parseTaggedFriends(newValue);
    
    // Check if we're typing a mention
    const textBeforeCursor = newValue.slice(0, newCursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setShowSuggestions(true);
      setActiveSuggestion(0);
      loadFriends(query);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (friend: UserProfile) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const mentionStart = mentionMatch.index!;
      const newText = 
        value.slice(0, mentionStart) + 
        `@${friend.display_name} ` + 
        textAfterCursor;
      
      onChange(newText);
      setShowSuggestions(false);
      
      // Focus back to input and set cursor after the mention
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = mentionStart + friend.display_name.length + 2;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[activeSuggestion]) {
          selectSuggestion(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Render text with highlighted mentions
  const renderTextWithHighlights = () => {
    if (taggedFriends.length === 0) return value;
    
    let lastIndex = 0;
    const parts = [];
    
    taggedFriends
      .sort((a, b) => a.startIndex - b.startIndex)
      .forEach((friend, index) => {
        // Add text before mention
        if (friend.startIndex > lastIndex) {
          parts.push(value.slice(lastIndex, friend.startIndex));
        }
        
        // Add highlighted mention
        parts.push(
          <Badge key={`mention-${index}`} variant="secondary" className="mx-1">
            @{friend.display_name}
          </Badge>
        );
        
        lastIndex = friend.endIndex;
      });
    
    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(value.slice(lastIndex));
    }
    
    return parts;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
        <AtSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Tagged friends preview */}
      {taggedFriends.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {taggedFriends.map((friend, index) => (
            <Badge key={`tagged-${index}`} variant="secondary" className="flex items-center gap-1">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-xs">
                  {friend.display_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              @{friend.display_name}
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto border shadow-lg"
        >
          {suggestions.map((friend, index) => (
            <div
              key={friend.id}
              className={`p-2 cursor-pointer flex items-center gap-2 hover:bg-accent ${
                index === activeSuggestion ? 'bg-accent' : ''
              }`}
              onClick={() => selectSuggestion(friend)}
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {friend.display_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{friend.display_name}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};