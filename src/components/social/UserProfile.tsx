import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Save, Loader2 } from 'lucide-react';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
  });

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      await updateProfile(formData);
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="text-lg">
                {formData.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email || ''} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed from here
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}