import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CatalogueMember } from '@/hooks/useCatalogueMembers';

interface CatalogueFriendTagInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  members: CatalogueMember[];
}

export const CatalogueFriendTagInput: React.FC<CatalogueFriendTagInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  members
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<CatalogueMember[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionQuery, setMentionQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get only accepted members with user profiles
  const availableMembers = members.filter(m => 
    m.status === 'accepted' && m.user_profile?.display_name
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);

    // Check for @ mentions
    const lastAtSymbol = newValue.lastIndexOf('@', cursorPos - 1);
    
    if (lastAtSymbol !== -1) {
      // Check if there's a space or start of string before @
      const beforeAt = lastAtSymbol === 0 ? '' : newValue[lastAtSymbol - 1];
      if (beforeAt === '' || beforeAt === ' ') {
        const afterAt = newValue.slice(lastAtSymbol + 1, cursorPos);
        
        // Check if there's no space in the mention query
        if (!afterAt.includes(' ')) {
          setMentionStart(lastAtSymbol);
          setMentionQuery(afterAt);
          
          // Filter members based on query
          const filtered = availableMembers.filter(member =>
            member.user_profile?.display_name
              .toLowerCase()
              .includes(afterAt.toLowerCase())
          );
          
          setFilteredMembers(filtered);
          setShowDropdown(filtered.length > 0);
          setSelectedIndex(0);
          return;
        }
      }
    }
    
    setShowDropdown(false);
    setMentionStart(-1);
    setMentionQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && filteredMembers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredMembers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredMembers.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          insertMemberMention(filteredMembers[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setShowDropdown(false);
          break;
        default:
          onKeyDown?.(e);
      }
    } else {
      onKeyDown?.(e);
    }
  };

  const insertMemberMention = (member: CatalogueMember) => {
    if (!member.user_profile?.display_name || mentionStart === -1) return;

    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + 1 + mentionQuery.length);
    const newValue = `${beforeMention}@${member.user_profile.display_name} ${afterMention}`;
    
    onChange(newValue);
    setShowDropdown(false);
    setMentionStart(-1);
    setMentionQuery('');
    
    // Focus back to input and position cursor after the mention
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = beforeMention.length + member.user_profile!.display_name.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showDropdown && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => insertMemberMention(member)}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={member.user_profile?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {member.user_profile?.display_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {member.user_profile?.display_name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {member.user_profile?.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};