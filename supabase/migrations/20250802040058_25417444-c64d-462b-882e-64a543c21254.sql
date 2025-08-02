-- Add privacy field to retrospectives table
-- Default is 'public' so existing retros remain visible to friends
ALTER TABLE public.retrospectives 
ADD COLUMN is_private boolean NOT NULL DEFAULT false;

-- Add index for better query performance on privacy filtering
CREATE INDEX idx_retrospectives_privacy ON public.retrospectives(is_private);

-- Add comment for documentation
COMMENT ON COLUMN public.retrospectives.is_private IS 'When false (default), retro is visible to friends. When true, only visible to owner.';