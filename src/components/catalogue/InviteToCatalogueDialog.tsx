import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useCatalogueMembers } from "@/hooks/useCatalogueMembers";

interface InviteToCatalogueDialogProps {
  catalogueId: string;
  catalogueName: string;
}

export const InviteToCatalogueDialog = ({ catalogueId, catalogueName }: InviteToCatalogueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { inviteUser } = useCatalogueMembers(catalogueId);

  const handleInvite = async () => {
    if (!email.trim()) return;
    
    setIsInviting(true);
    const success = await inviteUser(email.trim());
    
    if (success) {
      setEmail('');
      setOpen(false);
    }
    setIsInviting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInvite();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite to "{catalogueName}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter user's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <p className="text-sm text-muted-foreground">
              The user will receive a notification to join your catalogue
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={!email.trim() || isInviting}
            >
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};