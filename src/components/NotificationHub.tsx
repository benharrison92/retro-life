import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, Trash2, User, Calendar, MessageCircle, UserPlus, FolderOpen, ExternalLink, CheckCircle, XCircle, MapPin } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NotificationHubProps {
  className?: string;
}

export const NotificationHub = ({ className }: NotificationHubProps) => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acceptFriendRequest,
    declineFriendRequest,
    acceptTripPlannerInvitation,
    declineTripPlannerInvitation,
  } = useNotifications();
  
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    // Don't auto-click for invitations with action buttons
    if ((notification.type === 'friend_request' || notification.type === 'trip_planner_invitation') && !notification.is_read) {
      return; // Let the user use the Accept/Decline buttons instead
    }

    // Mark as read when clicked
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'comment_tagged':
        if (notification.related_retro_id) {
          setOpen(false); // Close dialog
          navigate(`/trip/${notification.related_retro_id}`);
        }
        break;
      case 'retro_tagged':
        if (notification.related_retro_id) {
          setOpen(false); // Close dialog
          navigate(`/?retro=${notification.related_retro_id}`);
        }
        break;
      case 'catalogue_invitation':
        setOpen(false); // Close dialog
        navigate('/catalogues');
        break;
      case 'trip_planner_invitation':
        setOpen(false); // Close dialog
        navigate('/travel-planner');
        break;
      case 'friend_request':
        setOpen(false); // Close dialog
        // Navigate to friends section where they can accept/decline
        navigate('/?friends=true');
        break;
      default:
        // For other notification types, just mark as read
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'retro_tagged':
        return <User className="w-4 h-4 text-primary" />;
      case 'comment_added':
      case 'comment_tagged':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'catalogue_invitation':
        return <FolderOpen className="w-4 h-4 text-purple-500" />;
      case 'trip_planner_invitation':
        return <MapPin className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const isClickableNotification = (type: string, isRead: boolean) => {
    // Invitations are only clickable when read (no action buttons)
    if (type === 'friend_request' || type === 'trip_planner_invitation') return isRead;
    return ['retro_tagged', 'catalogue_invitation', 'comment_tagged'].includes(type);
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const isClickable = isClickableNotification(notification.type, notification.is_read);
    
    return (
      <div 
        className={`p-3 border-b transition-colors ${
          notification.is_read ? 'bg-background' : 'bg-muted/50'
        } ${isClickable ? 'cursor-pointer hover:bg-accent/50' : ''}`}
        onClick={isClickable ? () => handleNotificationClick(notification) : undefined}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-medium truncate ${
                  notification.is_read ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {notification.title}
                </h4>
                {isClickable && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0" />
              )}
            </div>
            
            <p className={`text-xs mb-2 ${
              notification.is_read ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {notification.message}
            </p>
            
            {/* Friend request action buttons */}
            {notification.type === 'friend_request' && !notification.is_read && (
              <div className="flex gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => acceptFriendRequest(notification.id, notification.related_user_id!)}
                  className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => declineFriendRequest(notification.id, notification.related_user_id!)}
                  className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Decline
                </Button>
              </div>
            )}
            
            {/* Trip planner invitation action buttons */}
            {notification.type === 'trip_planner_invitation' && !notification.is_read && (
              <div className="flex gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => acceptTripPlannerInvitation(notification.id, notification.related_item_id)}
                  className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => declineTripPlannerInvitation(notification.id, notification.related_item_id)}
                  className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Decline
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <Check className="w-3 h-3" />
                    Mark read
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`relative bg-background hover:bg-accent transition-all duration-200 ${className}`}
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </DialogTitle>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-6">
              <Bell className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified when you're tagged in retros or receive comments
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};