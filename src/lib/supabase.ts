export { supabase } from '@/integrations/supabase/client';

// Database types
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
}

export interface Retrospective {
  id: string;
  user_id: string;
  title: string;
  event_type: string;
  date: string;
  attendees: string[];
  attendeeUsers?: UserProfile[]; // Tagged user attendees
  roses: RBTItem[];
  buds: RBTItem[];
  thorns: RBTItem[];
  photos: RetroPhoto[];
  primaryPhotoUrl?: string;
  location_name?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  parent_id?: string; // For hierarchical retros - null for parent retros
  feedback_space_id?: string;
  feedbackSpaceName?: string; // Name of the feedback space if retro is part of one
  ownerName?: string; // Display name of the user who created the retro
  is_private: boolean; // Privacy setting - when true, only owner can view
  // Google Places data
  place_id?: string;
  place_name?: string;
  place_address?: string;
  place_rating?: number;
  place_user_ratings_total?: number;
  place_types?: string[];
  place_photos?: any[];
  created_at: string;
  updated_at: string;
}

export interface PhotoReaction {
  id: string;
  user_id: string;
  user_name: string;
  type: 'heart';
  timestamp: string;
}

export interface PhotoComment {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: string;
  taggedFriends?: UserProfile[]; // Friends tagged in this comment
}

export interface RetroPhoto {
  id: string;
  url: string;
  caption?: string;
  reactions: PhotoReaction[];
  comments: PhotoComment[];
  taggedFriends?: UserProfile[]; // Friends tagged in this photo
}

export interface RBTItem {
  id: string;
  text: string;
  tags: string[];
  comments: Comment[];
  ownerName?: string;
  photos?: RetroPhoto[];
}

export interface Comment {
  id: string;
  text: string;
  authorName: string;
  timestamp: string;
  taggedFriends?: UserProfile[]; // Friends tagged in this comment
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

export interface Catalogue {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogueItem {
  id: string;
  catalogue_id: string;
  user_id: string;
  original_retro_id: string;
  original_item_id: string;
  item_type: 'rose' | 'bud' | 'thorn';
  item_text: string;
  item_tags: string[];
  saved_from_user_id: string;
  saved_from_user_name: string;
  created_at: string;
}