import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Check, X, Clock } from "lucide-react";
import { useCatalogueMembers } from "@/hooks/useCatalogueMembers";

export const PendingCatalogueInvitations = () => {
  const { pendingInvitations, respondToInvitation } = useCatalogueMembers();

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-elegant bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 border-l-4 border-purple-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <FolderOpen className="w-5 h-5" />
          Pending Catalogue Invitations
          <Badge variant="secondary">{pendingInvitations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingInvitations.map((invitation) => (
            <div 
              key={invitation.id}
              className="flex items-center justify-between p-4 bg-background rounded-lg border shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{invitation.catalogue?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Invited by {invitation.invited_by_profile?.display_name}
                  </p>
                  {invitation.catalogue?.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {invitation.catalogue.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => respondToInvitation(invitation.id, 'accepted')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => respondToInvitation(invitation.id, 'declined')}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};