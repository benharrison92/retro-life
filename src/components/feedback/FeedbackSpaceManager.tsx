import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, Users, MapPin, Calendar, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFeedbackSpaces } from '@/hooks/useFeedbackSpaces';
import { CreateFeedbackSpaceDialog } from './CreateFeedbackSpaceDialog';
import { QRCodeDisplay } from './QRCodeDisplay';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AppHeader } from '@/components/AppHeader';

export const FeedbackSpaceManager = () => {
  const navigate = useNavigate();
  const { feedbackSpaces, loading, deleteFeedbackSpace } = useFeedbackSpaces();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteFeedbackSpace(id);
    setDeleteConfirm(null);
  };

  const handleOpenSpace = (code: string) => {
    navigate(`/feedback/${code}`);
  };

  const getQRCodeUrl = (code: string) => {
    return `${window.location.origin}/feedback/${code}`;
  };

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="container max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Feedback Spaces</h1>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Feedback Spaces</h1>
          <p className="text-muted-foreground">Create and manage feedback spaces for your events</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Space
        </Button>
      </div>

      {feedbackSpaces.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feedback spaces yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first feedback space to start collecting retros from your event attendees
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Space
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedbackSpaces.map((space) => (
            <Card 
              key={space.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenSpace(space.unique_code)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {space.title}
                      <Badge variant={space.is_active ? "default" : "secondary"}>
                        {space.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    {space.description && (
                      <CardDescription className="mt-1">{space.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        setShowQRCode(space.unique_code);
                      }}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        setDeleteConfirm(space.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(space.location_name || space.city) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {space.location_name && `${space.location_name}, `}
                        {space.city && space.state ? `${space.city}, ${space.state}` : space.city}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {format(new Date(space.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {space.unique_code}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Share this code with attendees
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                    💡 Click this card to view the event and manage feedback
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFeedbackSpaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {showQRCode && (
        <QRCodeDisplay
          open={!!showQRCode}
          onOpenChange={() => setShowQRCode(null)}
          code={showQRCode}
          url={getQRCodeUrl(showQRCode)}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Feedback Space"
          message="Are you sure you want to delete this feedback space? This action cannot be undone and all associated retros will no longer be linked to this space."
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
    </>
  );
};