import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TreePine, ArrowLeft, Calendar, MapPin } from "lucide-react";
import { useRetros } from '@/hooks/useRetros';
import { useAuth } from '@/hooks/useAuth';
import { Retrospective } from '@/lib/supabase';

interface RetroCreationFlowProps {
  onClose: () => void;
}

export const RetroCreationFlow = ({ onClose }: RetroCreationFlowProps) => {
  const navigate = useNavigate();
  const { retros, fetchParentRetros } = useRetros();
  const { user } = useAuth();
  const [step, setStep] = useState<'selection' | 'parent-list'>('selection');
  const [parentRetros, setParentRetros] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateNewParent = () => {
    navigate('/create-retro?type=parent');
  };

  const handleAddToExisting = async () => {
    setLoading(true);
    const parents = await fetchParentRetros();
    setParentRetros(parents);
    setStep('parent-list');
    setLoading(false);
  };

  const handleSelectParent = (parentId: string) => {
    navigate(`/create-retro?parent_id=${parentId}`);
  };

  const getRBTCount = (retro: Retrospective) => {
    const roses = (retro.roses as any[]) || [];
    const buds = (retro.buds as any[]) || [];
    const thorns = (retro.thorns as any[]) || [];
    return roses.length + buds.length + thorns.length;
  };

  const getLocationString = (retro: Retrospective) => {
    const parts = [];
    if (retro.city) parts.push(retro.city);
    if (retro.state) parts.push(retro.state);
    if (retro.country && retro.country !== 'US') parts.push(retro.country);
    return parts.join(', ') || retro.location_name || '';
  };

  if (step === 'selection') {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-between mb-4">
              <Button onClick={onClose} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Create New Experience</CardTitle>
            <p className="text-muted-foreground">
              Every retrospective needs to be part of a larger journey. Choose how you'd like to organize this experience.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:bg-primary/5"
              onClick={handleCreateNewParent}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary text-primary-foreground rounded-full shrink-0">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Create New Parent Event</h3>
                    <p className="text-muted-foreground mb-3">
                      Start a new journey or event category. Perfect for trips, projects, or recurring activities.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">New Journey</Badge>
                      <Badge variant="secondary">Main Event</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:bg-primary/5"
              onClick={handleAddToExisting}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary text-secondary-foreground rounded-full shrink-0">
                    <TreePine className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Add to Existing Journey</h3>
                    <p className="text-muted-foreground mb-3">
                      Add this experience as a sub-event under an existing parent journey.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">Sub-Event</Badge>
                      <Badge variant="outline">Organized</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4 mt-6">
              <h4 className="font-medium mb-2">💡 Examples of Organization:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div><strong>Europe Trip 2025</strong> → Barcelona Visit, Paris Visit, Transportation</div>
                <div><strong>Angel's Games</strong> → July 11th Game, September 5th Game</div>
                <div><strong>Wedding Planning</strong> → Venue Search, Catering, Photography</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'parent-list') {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <CardHeader className="sticky top-0 bg-card border-b">
            <div className="flex items-center justify-between">
              <Button 
                onClick={() => setStep('selection')} 
                variant="ghost" 
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Choose Parent Journey</CardTitle>
            <p className="text-muted-foreground text-center">
              Select which existing journey this new experience belongs to
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : parentRetros.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Parent Journeys Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You need to create a parent journey first before adding sub-events
                </p>
                <Button onClick={handleCreateNewParent}>
                  Create Your First Journey
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {parentRetros.map((parentRetro) => (
                  <Card 
                    key={parentRetro.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 hover:bg-primary/5"
                    onClick={() => handleSelectParent(parentRetro.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{parentRetro.title}</h3>
                            <Badge variant="secondary">{parentRetro.event_type}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {parentRetro.date}
                            </div>
                            {getLocationString(parentRetro) && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {getLocationString(parentRetro)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              {getRBTCount(parentRetro)} insights recorded
                            </span>
                            {parentRetro.attendees && parentRetro.attendees.length > 0 && (
                              <span className="text-muted-foreground">
                                {parentRetro.attendees.length} attendees
                              </span>
                            )}
                          </div>
                        </div>

                        <Button size="sm">
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};