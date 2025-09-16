import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Users, UserMinus, Crown } from 'lucide-react';
import { useTripPlannerMembers } from '@/hooks/useTripPlannerMembers';
import { Skeleton } from '@/components/ui/skeleton';

interface TripPlannerMembersDialogProps {
  tripPlannerId: string;
  tripPlannerName: string;
  isOwner: boolean;
}

export function TripPlannerMembersDialog({ tripPlannerId, tripPlannerName, isOwner }: TripPlannerMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const { members, loading, removeMember } = useTripPlannerMembers(tripPlannerId);

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Members ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trip Planner Members</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Members of "{tripPlannerName}"
          </p>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Active Members */}
          <div>
            <h4 className="text-sm font-medium mb-3">Active Members</h4>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No other members in this trip planner
              </p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user_profiles.avatar_url || ''} />
                        <AvatarFallback>
                          {member.user_profiles.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.user_profiles.display_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                            {member.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {isOwner && member.role !== 'owner' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.user_profiles.display_name} from this trip planner? They will lose access to all trip planning content.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}