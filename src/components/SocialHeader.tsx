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
import { FriendFinder } from '@/components/social/FriendFinder';
import { FriendsList } from '@/components/social/FriendsList';
import { UserProfile } from '@/components/social/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  User, 
  LogOut, 
  LogIn,
  MessageCircle,
  Bell,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SocialHeader() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [friendFinderOpen, setFriendFinderOpen] = useState(false);
  const [friendsListOpen, setFriendsListOpen] = useState(false);
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
        onClick={() => setFriendFinderOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Find Friends
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setFriendsListOpen(true)}
        className="relative"
      >
        <Users className="h-4 w-4 mr-2" />
        Friends
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/catalogues')}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        My Catalogues
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
          <DropdownMenuItem onClick={() => setFriendsListOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Friends
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFriendFinderOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Find Friends
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <FriendFinder 
        open={friendFinderOpen} 
        onOpenChange={setFriendFinderOpen} 
      />
      <FriendsList 
        open={friendsListOpen} 
        onOpenChange={setFriendsListOpen} 
      />
      <UserProfile 
        open={profileOpen} 
        onOpenChange={setProfileOpen} 
      />
    </div>
  );
}