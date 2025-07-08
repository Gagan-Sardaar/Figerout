
"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { onNotificationsChange, markNotificationAsRead, AppNotification } from '@/services/notification-service';
import type { User } from '@/lib/user-data';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <Check className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
};

export function NotificationsPopover({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      const unsubscribe = onNotificationsChange(user.id, (newNotifications) => {
        setNotifications(newNotifications);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [user?.id]);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read) {
      await markNotificationAsRead(user.id, notification.id);
    }
    // If there's a link, you could navigate to it here.
    // e.g., if (notification.link) router.push(notification.link);
    setIsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }
    if (notifications.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Mail className="h-10 w-10 mb-4" />
              <p className="text-sm">You have no new notifications.</p>
        </div>
      );
    }
    return (
        <div className="flex flex-col">
            {notifications.map((notification) => (
            <div
                key={notification.id}
                className={cn(
                "flex items-start gap-4 p-4 transition-colors hover:bg-accent hover:text-accent-foreground",
                !notification.read && 'bg-muted/50'
                )}
                onClick={() => handleNotificationClick(notification)}
                role="button"
            >
                <div className="mt-1 shrink-0">{notificationIcons[notification.type]}</div>
                <div className="flex-grow">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                </p>
                </div>
                {!notification.read && (
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"></div>
                )}
            </div>
            ))}
        </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-medium">Notifications</h4>
        </div>
        <ScrollArea className="h-96">
            {renderContent()}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
