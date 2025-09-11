import { useState, useEffect } from 'react';
import { supabase, Catalogue, CatalogueItem } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useCatalogues = () => {
  const { user } = useAuth();
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCatalogues = async () => {
    if (!user) return;
    
    setLoading(true);
    console.log('fetchCatalogues: Starting fetch for user:', user.id);
    
    try {
      // Fetch owned catalogues
      console.log('fetchCatalogues: Fetching owned catalogues...');
      const { data: ownedCatalogues, error: ownedError } = await supabase
        .from('catalogues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('fetchCatalogues: Owned catalogues result:', { data: ownedCatalogues, error: ownedError });
      
      if (ownedError) {
        console.error('fetchCatalogues: Error fetching owned catalogues:', ownedError);
        throw ownedError;
      }

      // Fetch shared catalogues where user is an accepted member
      console.log('fetchCatalogues: Fetching shared catalogues...');
      
      // First get the catalogue IDs where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('catalogue_members')
        .select('catalogue_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      console.log('fetchCatalogues: Membership data:', { data: membershipData, error: membershipError });

      if (membershipError) {
        console.error('fetchCatalogues: Error fetching memberships:', membershipError);
        throw membershipError;
      }

      // Then fetch the actual catalogues using the IDs
      let sharedCatalogues = [];
      if (membershipData && membershipData.length > 0) {
        const catalogueIds = membershipData.map(m => m.catalogue_id);
        console.log('fetchCatalogues: Fetching catalogues with IDs:', catalogueIds);
        
        const { data: sharedCatalogueData, error: sharedError } = await supabase
          .from('catalogues')
          .select('*')
          .in('id', catalogueIds);

        console.log('fetchCatalogues: Shared catalogue data:', { data: sharedCatalogueData, error: sharedError });

        if (sharedError) {
          console.error('fetchCatalogues: Error fetching shared catalogues:', sharedError);
          throw sharedError;
        }

        sharedCatalogues = sharedCatalogueData || [];
      }

      // Combine and deduplicate catalogues
      const allCatalogues = [
        ...(ownedCatalogues || []),
        ...sharedCatalogues
      ];

      console.log('fetchCatalogues: Combined catalogues before dedup:', allCatalogues);

      // Remove duplicates and sort by created_at
      const uniqueCatalogues = allCatalogues
        .filter((cat, index, self) => 
          index === self.findIndex(c => c.id === cat.id)
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('fetchCatalogues: Final unique catalogues:', uniqueCatalogues);
      setCatalogues(uniqueCatalogues);
    } catch (error) {
      console.error('fetchCatalogues: Final error:', error);
      toast.error('Failed to load catalogues');
    } finally {
      setLoading(false);
    }
  };

  const createCatalogue = async (name: string, description?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('catalogues')
        .insert({
          user_id: user.id,
          name,
          description
        })
        .select()
        .single();

      if (error) throw error;
      
      setCatalogues(prev => [data, ...prev]);
      toast.success('Catalogue created successfully');
      return data;
    } catch (error) {
      console.error('Error creating catalogue:', error);
      toast.error('Failed to create catalogue');
    }
  };

  const updateCatalogue = async (catalogueId: string, updates: Partial<Catalogue>) => {
    try {
      const { data, error } = await supabase
        .from('catalogues')
        .update(updates)
        .eq('id', catalogueId)
        .select()
        .single();

      if (error) throw error;

      setCatalogues(prev => 
        prev.map(cat => cat.id === catalogueId ? data : cat)
      );
      toast.success('Catalogue updated successfully');
    } catch (error) {
      console.error('Error updating catalogue:', error);
      toast.error('Failed to update catalogue');
    }
  };

  const deleteCatalogue = async (catalogueId: string) => {
    try {
      const { error } = await supabase
        .from('catalogues')
        .delete()
        .eq('id', catalogueId);

      if (error) throw error;

      setCatalogues(prev => prev.filter(cat => cat.id !== catalogueId));
      toast.success('Catalogue deleted successfully');
    } catch (error) {
      console.error('Error deleting catalogue:', error);
      toast.error('Failed to delete catalogue');
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, [user]);

  return {
    catalogues,
    loading,
    createCatalogue,
    updateCatalogue,
    deleteCatalogue,
    refreshCatalogues: fetchCatalogues
  };
};

export const useCatalogueItems = (catalogueId?: string) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!user || !catalogueId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('catalogue_items')
        .select('*')
        .eq('catalogue_id', catalogueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data as CatalogueItem[]) || []);
    } catch (error) {
      console.error('Error fetching catalogue items:', error);
      toast.error('Failed to load catalogue items');
    } finally {
      setLoading(false);
    }
  };

  const addItemToCatalogue = async (
    catalogueId: string,
    retroId: string,
    itemId: string,
    itemType: 'rose' | 'bud' | 'thorn',
    itemText: string,
    itemTags: string[],
    savedFromUserId: string,
    savedFromUserName: string,
    placeData?: {
      place_id?: string;
      place_name?: string;
      place_address?: string;
      place_rating?: number;
      place_user_ratings_total?: number;
      place_types?: string[];
    }
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('catalogue_items')
        .insert({
          catalogue_id: catalogueId,
          user_id: user.id,
          original_retro_id: retroId,
          original_item_id: itemId,
          item_type: itemType,
          item_text: itemText,
          item_tags: itemTags,
          saved_from_user_id: savedFromUserId,
          saved_from_user_name: savedFromUserName,
          ...(placeData && {
            place_id: placeData.place_id,
            place_name: placeData.place_name,
            place_address: placeData.place_address,
            place_rating: placeData.place_rating,
            place_user_ratings_total: placeData.place_user_ratings_total,
            place_types: placeData.place_types,
          }),
        })
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [data as CatalogueItem, ...prev]);
      toast.success('Item saved to catalogue');
      return data;
    } catch (error) {
      console.error('Error adding item to catalogue:', error);
      toast.error('Failed to save item to catalogue');
    }
  };

  const removeItemFromCatalogue = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('catalogue_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from catalogue');
    } catch (error) {
      console.error('Error removing item from catalogue:', error);
      toast.error('Failed to remove item from catalogue');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [catalogueId, user]);

  return {
    items,
    loading,
    addItemToCatalogue,
    removeItemFromCatalogue,
    refreshItems: fetchItems
  };
};