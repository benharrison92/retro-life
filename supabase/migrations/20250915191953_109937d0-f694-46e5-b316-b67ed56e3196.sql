-- Create tables for likes and comments on retrospectives

-- Table for retrospective likes
CREATE TABLE public.retrospective_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retro_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(retro_id, user_id)
);

-- Table for retrospective comments  
CREATE TABLE public.retrospective_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retro_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retrospective_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for likes
CREATE POLICY "Users can like retrospectives they can view"
ON public.retrospective_likes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM retrospectives r
    WHERE r.id = retro_id AND (
      r.user_id = auth.uid() OR
      (r.is_private = false AND EXISTS (
        SELECT 1 FROM friendships f
        WHERE ((f.user_id = auth.uid() AND f.friend_id = r.user_id) OR
               (f.friend_id = auth.uid() AND f.user_id = r.user_id)) AND
        f.status = 'accepted'
      )) OR
      is_retro_attendee(r.id, auth.uid())
    )
  )
);

CREATE POLICY "Users can view likes on retrospectives they can access"
ON public.retrospective_likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM retrospectives r
    WHERE r.id = retro_id AND (
      r.user_id = auth.uid() OR
      (r.is_private = false AND EXISTS (
        SELECT 1 FROM friendships f
        WHERE ((f.user_id = auth.uid() AND f.friend_id = r.user_id) OR
               (f.friend_id = auth.uid() AND f.user_id = r.user_id)) AND
        f.status = 'accepted'
      )) OR
      is_retro_attendee(r.id, auth.uid())
    )
  )
);

CREATE POLICY "Users can delete their own likes"
ON public.retrospective_likes
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for comments
CREATE POLICY "Users can comment on retrospectives they can view"
ON public.retrospective_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM retrospectives r
    WHERE r.id = retro_id AND (
      r.user_id = auth.uid() OR
      (r.is_private = false AND EXISTS (
        SELECT 1 FROM friendships f
        WHERE ((f.user_id = auth.uid() AND f.friend_id = r.user_id) OR
               (f.friend_id = auth.uid() AND f.user_id = r.user_id)) AND
        f.status = 'accepted'
      )) OR
      is_retro_attendee(r.id, auth.uid())
    )
  )
);

CREATE POLICY "Users can view comments on retrospectives they can access"
ON public.retrospective_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM retrospectives r
    WHERE r.id = retro_id AND (
      r.user_id = auth.uid() OR
      (r.is_private = false AND EXISTS (
        SELECT 1 FROM friendships f
        WHERE ((f.user_id = auth.uid() AND f.friend_id = r.user_id) OR
               (f.friend_id = auth.uid() AND f.user_id = r.user_id)) AND
        f.status = 'accepted'
      )) OR
      is_retro_attendee(r.id, auth.uid())
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON public.retrospective_comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.retrospective_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger for comments
CREATE TRIGGER update_retrospective_comments_updated_at
    BEFORE UPDATE ON public.retrospective_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();