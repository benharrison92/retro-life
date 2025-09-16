import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { RetroForm } from '@/components/RetroForm';
import { RetroCreationFlow } from '@/components/RetroCreationFlow';
import { useFeedbackSpaces } from '@/hooks/useFeedbackSpaces';
import { useRetros, UserProfile } from '@/hooks/useRetros';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CreateRetro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFeedbackSpaceById } = useFeedbackSpaces();
  const { createRetro, updateRetro } = useRetros();
  
  const feedbackSpaceId = searchParams.get('feedbackSpace');
  const parentId = searchParams.get('parent_id');
  const editId = searchParams.get('edit');
  const type = searchParams.get('type'); // 'parent' for new parent retros
  const [feedbackSpace, setFeedbackSpace] = useState(null);
  const [parentRetro, setParentRetro] = useState(null);
  const [editRetro, setEditRetro] = useState(null);
  const [loading, setLoading] = useState(!!feedbackSpaceId || !!parentId || !!editId);
  const [isCreatingParent, setIsCreatingParent] = useState(type === 'parent');
  const [showCreationFlow, setShowCreationFlow] = useState(
    !feedbackSpaceId && !parentId && !editId && type !== 'parent'
  );

  // Keep selection flow in sync with URL query params
  useEffect(() => {
    setIsCreatingParent(type === 'parent');
    setShowCreationFlow(!feedbackSpaceId && !parentId && !editId && type !== 'parent');
  }, [feedbackSpaceId, parentId, editId, type]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load feedback space if creating for feedback space
        if (feedbackSpaceId) {
          const space = await getFeedbackSpaceById(feedbackSpaceId);
          setFeedbackSpace(space);
        }
        
        // Load parent retro if creating a child retro
        if (parentId) {
          const { data, error } = await supabase
            .from('retrospectives')
            .select('*')
            .eq('id', parentId)
            .single();
            
          if (error) {
            console.error('Error loading parent retro:', error);
            toast.error('Failed to load parent retrospective');
          } else {
            setParentRetro(data);
          }
        }

        // Load existing retro if editing
        if (editId) {
          const { data, error } = await supabase
            .from('retrospectives')
            .select('*')
            .eq('id', editId)
            .single();
            
          if (error) {
            console.error('Error loading retro for editing:', error);
            toast.error('Failed to load retrospective for editing');
          } else {
            setEditRetro(data);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [feedbackSpaceId, parentId, editId, getFeedbackSpaceById]);

  const handleSave = async (retroData, attendeeUsers?: UserProfile[]) => {
    try {
      console.log('CreateRetro: feedbackSpaceId from URL:', feedbackSpaceId);
      
      const retroToSave = {
        title: retroData.title,
        event_type: retroData.eventType,
        date: retroData.date,
        attendees: retroData.attendees,
        roses: retroData.roses,
        buds: retroData.buds,
        thorns: retroData.thorns,
        photos: retroData.photos || [],
        location_name: retroData.locationName,
        city: retroData.city,
        state: retroData.state,
        country: retroData.country || 'US',
        latitude: retroData.latitude,
        longitude: retroData.longitude,
        is_private: retroData.isPrivate || false,
        // Include parent_id if creating a child retro
        ...(parentId && { parent_id: parentId }),
        // Include feedback_space_id if creating for a feedback space
        ...(feedbackSpaceId && { feedback_space_id: feedbackSpaceId })
      };

      console.log('CreateRetro: Saving retro with data:', retroToSave);
      
      let result;
      if (editId) {
        // Update existing retro
        result = await updateRetro(editId, retroToSave, attendeeUsers);
        toast.success('Retrospective updated successfully!');
      } else {
        // Create new retro
        result = await createRetro(retroToSave, attendeeUsers);
        toast.success('Feedback submitted successfully!');
      }
      
      if (result) {
        // Navigate based on context
        if (editId) {
          navigate(`/trip/${editId}`); // Go back to the edited retro
        } else if (feedbackSpaceId) {
          navigate(-1); // Go back to feedback space
        } else if (parentId) {
          navigate(`/trip/${parentId}`); // Go back to parent retro
        } else {
          navigate('/'); // Go to main app
        }
      }
    } catch (error) {
      console.error('Error saving retro:', error);
      toast.error(`Failed to ${editId ? 'update' : 'save'} feedback`);
    }
  };

  const handleClose = () => {
    if (editId) {
      navigate(`/trip/${editId}`); // Go back to the retro being edited
    } else if (feedbackSpaceId) {
      navigate(-1); // Go back to feedback space
    } else if (parentId) {
      navigate(`/trip/${parentId}`); // Go back to parent retro
    } else {
      navigate('/'); // Go to main app
    }
  };

  const handleCloseCreationFlow = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <>
        <AppHeader />
        <div className="container max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to leave feedback.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="container max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (showCreationFlow) {
    return (
      <>
        <AppHeader />
        <RetroCreationFlow onClose={handleCloseCreationFlow} />
      </>
    );
  }

  console.log('CreateRetro render: showCreationFlow=', showCreationFlow, 'loading=', loading, 'type=', type, 'isCreatingParent=', isCreatingParent);

  return (
    <>
      <AppHeader />
      <div className="container max-w-4xl mx-auto p-6">
        <RetroForm
          retro={editRetro ? {
            id: editRetro.id,
            title: editRetro.title,
            eventType: editRetro.event_type,
            date: editRetro.date,
            attendees: editRetro.attendees || [],
            roses: editRetro.roses || [],
            buds: editRetro.buds || [],
            thorns: editRetro.thorns || [],
            photos: editRetro.photos || [],
            locationName: editRetro.location_name,
            city: editRetro.city,
            state: editRetro.state,
            country: editRetro.country,
            latitude: editRetro.latitude,
            longitude: editRetro.longitude,
            ownerName: user?.email || 'Anonymous',
            createdAt: new Date(editRetro.created_at),
            updatedAt: editRetro.updated_at ? new Date(editRetro.updated_at) : undefined,
            attendeeUsers: editRetro.attendee_users || []
          } : null}
          onClose={handleClose}
          onSave={handleSave}
          currentUserName={user?.email || 'Anonymous'}
          feedbackSpaceMode={!!feedbackSpaceId}
          isCreatingParent={isCreatingParent}
          parentContext={parentRetro ? {
            title: parentRetro.title,
            eventType: parentRetro.event_type
          } : undefined}
          initialData={
            feedbackSpace ? {
              title: feedbackSpace.title,
              locationName: feedbackSpace.location_name,
              city: feedbackSpace.city,
              state: feedbackSpace.state,
              country: feedbackSpace.country
            } : parentRetro ? {
              title: `${parentRetro.title} - `,
              // Don't inherit location data for child retros
            } : undefined
          }
        />
      </div>
    </>
  );
};

export default CreateRetro;