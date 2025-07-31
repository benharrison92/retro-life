import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Crown, User, Trash2, Clock, Check, X } from "lucide-react";
import { useCatalogueMembers } from "@/hooks/useCatalogueMembers";
import { InviteToCatalogueDialog } from "./InviteToCatalogueDialog";

interface CatalogueMembersDialogProps {
  catalogueId: string;
  catalogueName: string;
  isOwner: boolean;
}

export const CatalogueMembersDialog = ({ catalogueId, catalogueName, isOwner }: CatalogueMembersDialogProps) => {
  const [open, setOpen] = useState(false);
  const { members, loading, removeMember } = useCatalogueMembers(catalogueId);

  const acceptedMembers = members.filter(m => m.status === 'accepted');
  const pendingMembers = members.filter(m => m.status === 'pending');

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      await removeMember(memberId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Members ({acceptedMembers.length})
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              "{catalogueName}" Members
            </DialogTitle>
            
            {isOwner && (
              <InviteToCatalogueDialog 
                catalogueId={catalogueId} 
                catalogueName={catalogueName} 
              />
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden px-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading members...</div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Accepted Members */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Active Members ({acceptedMembers.length})
                  </h3>
                  <div className="space-y-2">
                    {acceptedMembers.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                            {member.role === 'owner' ? (
                              <Crown className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <User className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.user_profile?.display_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user_profile?.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                            {member.role === 'owner' ? 'Owner' : 'Member'}
                          </Badge>
                          
                          {isOwner && member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {acceptedMembers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No active members
                      </p>
                    )}
                  </div>
                </div>

                {/* Pending Invitations */}
                {isOwner && pendingMembers.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending Invitations ({pendingMembers.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingMembers.map((member) => (
                        <div 
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                              <Clock className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.user_profile?.display_name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.user_profile?.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Pending</Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};