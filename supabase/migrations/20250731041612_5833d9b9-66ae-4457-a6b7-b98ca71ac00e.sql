-- Create catalogues table for user-created collections
CREATE TABLE public.catalogues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalogue_items table for saved roses/buds/thorns
CREATE TABLE public.catalogue_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_id UUID NOT NULL REFERENCES public.catalogues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  original_retro_id UUID NOT NULL,
  original_item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('rose', 'bud', 'thorn')),
  item_text TEXT NOT NULL,
  item_tags TEXT[] DEFAULT '{}',
  saved_from_user_id UUID NOT NULL,
  saved_from_user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_items ENABLE ROW LEVEL SECURITY;

-- Create policies for catalogues
CREATE POLICY "Users can view their own catalogues" 
ON public.catalogues 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own catalogues" 
ON public.catalogues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalogues" 
ON public.catalogues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalogues" 
ON public.catalogues 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for catalogue_items
CREATE POLICY "Users can view their own catalogue items" 
ON public.catalogue_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own catalogue items" 
ON public.catalogue_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalogue items" 
ON public.catalogue_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_catalogues_updated_at
BEFORE UPDATE ON public.catalogues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_catalogues_user_id ON public.catalogues(user_id);
CREATE INDEX idx_catalogue_items_catalogue_id ON public.catalogue_items(catalogue_id);
CREATE INDEX idx_catalogue_items_user_id ON public.catalogue_items(user_id);