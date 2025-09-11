import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export const useTaggedComments = () => {
  const { user } = useAuth();

  // Extract tagged friends from comment text
  const extractTaggedFriends = (commentText: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const matches = [];
    let match;
    
    while ((match = mentionRegex.exec(commentText)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches;
  };

  // Create notifications for tagged friends
  const notifyTaggedFriends = async (
    commentText: string, 
    retroId: string, 
    itemId: string,
    retroTitle: string
  ) => {
    if (!user) return;

    const taggedNames = extractTaggedFriends(commentText);
    if (taggedNames.length === 0) return;

    try {
      // Get user IDs for tagged friends
      const { data: taggedUsers } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('display_name', taggedNames);

      if (!taggedUsers || taggedUsers.length === 0) return;

      // Create notifications for each tagged friend
      const notifications = taggedUsers.map(taggedUser => ({
        user_id: taggedUser.id,
        type: 'comment_tagged' as const,
        title: 'Tagged in Comment',
        message: `You were tagged in a comment on "${retroTitle}"`,
        related_retro_id: retroId,
        related_user_id: user.id,
        related_item_id: itemId,
        is_read: false
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating tag notifications:', error);
      } else {
        console.log('Successfully created notifications for tagged friends:', taggedNames);
      }
    } catch (error) {
      console.error('Error notifying tagged friends:', error);
    }
  };

  // Render comment text with highlighted tags
  const renderCommentWithTags = (commentText: string): JSX.Element => {
    const parts = commentText.split(/(@\w+(?:\s+\w+)*)/g);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('@')) {
            return (
              <span key={index} className="text-primary font-medium bg-primary/10 px-1 rounded">
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return {
    extractTaggedFriends,
    notifyTaggedFriends,
    renderCommentWithTags
  };
};