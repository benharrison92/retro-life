import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { RetroForm } from '@/components/RetroForm';
import { useFeedbackSpaces } from '@/hooks/useFeedbackSpaces';
import { useRetros, UserProfile } from '@/hooks/useRetros';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const CreateRetro = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFeedbackSpaceById } = useFeedbackSpaces();
  const { createRetro } = useRetros();
  
  const feedbackSpaceId = searchParams.get('feedbackSpace');
  const [feedbackSpace, setFeedbackSpace] = useState(null);
  const [loading, setLoading] = useState(!!feedbackSpaceId);

  useEffect(() => {
    const loadFeedbackSpace = async () => {
      if (!feedbackSpaceId) return;
      
      try {
        const space = await getFeedbackSpaceById(feedbackSpaceId);
        setFeedbackSpace(space);
        setLoading(false);
      } catch (error) {
        console.error('Error loading feedback space:', error);
        setLoading(false);
      }
    };

    loadFeedbackSpace();
  }, [feedbackSpaceId, getFeedbackSpaceById]);

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
        is_private: retroData.isPrivate || false, // Include privacy setting
        // Include feedback_space_id if creating for a feedback space
        ...(feedbackSpaceId && { feedback_space_id: feedbackSpaceId })
      };

      console.log('CreateRetro: Saving retro with data:', retroToSave);
      const result = await createRetro(retroToSave, attendeeUsers);
      if (result) {
        toast.success('Feedback submitted successfully!');
        
        // Navigate back to feedback space if that's where we came from
        if (feedbackSpaceId) {
          navigate(-1); // Go back to the feedback space
        } else {
          navigate('/'); // Go to main app
        }
      }
    } catch (error) {
      console.error('Error saving retro:', error);
      toast.error('Failed to save feedback');
    }
  };

  const handleClose = () => {
    if (feedbackSpaceId) {
      navigate(-1); // Go back to feedback space
    } else {
      navigate('/'); // Go to main app
    }
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

  return (
    <>
      <AppHeader />
      <div className="container max-w-4xl mx-auto p-6">
        <RetroForm
          retro={null}
          onClose={handleClose}
          onSave={handleSave}
          currentUserName={user?.email || 'Anonymous'}
          feedbackSpaceMode={!!feedbackSpaceId}
          initialData={feedbackSpace ? {
            title: feedbackSpace.title,
            locationName: feedbackSpace.location_name,
            city: feedbackSpace.city,
            state: feedbackSpace.state,
            country: feedbackSpace.country
          } : undefined}
        />
      </div>
    </>
  );
};

export default CreateRetro;