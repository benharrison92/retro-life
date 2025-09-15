import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthModal } from '@/components/auth/AuthModal';
import { FriendsManager } from '@/components/social/FriendsManager';
import { UserProfile } from '@/components/social/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  User, 
  LogOut, 
  LogIn,
  MessageCircle,
  Bell,
  Globe,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SocialHeader() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [friendsManagerOpen, setFriendsManagerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setAuthModalOpen(true)}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
        
        <Button 
          size="sm"
          onClick={() => navigate('/auth')}
        >
          Sign Up
        </Button>
        
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen} 
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Social action buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFriendsManagerOpen(true)}
        className="relative"
      >
        <Users className="h-4 w-4 mr-2" />
        Friends
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/travel-planner')}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Travel Planner
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/explore')}
      >
        <Globe className="h-4 w-4 mr-2" />
        Explore Map
      </Button>

      {/* User dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">
              {profile?.display_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFriendsManagerOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Friends
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/travel-planner')}>
            <Calendar className="mr-2 h-4 w-4" />
            Travel Planner
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/explore')}>
            <Globe className="mr-2 h-4 w-4" />
            Explore Map
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <FriendsManager 
        open={friendsManagerOpen} 
        onOpenChange={setFriendsManagerOpen} 
      />
      <UserProfile 
        open={profileOpen} 
        onOpenChange={setProfileOpen} 
      />
    </div>
  );
}