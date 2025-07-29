export { supabase } from '@/integrations/supabase/client';

// Database types
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface FriendInvitation {
  id: string;
  from_user_id: string;
  to_email: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  updated_at: string;
}