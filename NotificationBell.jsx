import React, { useState, useEffect } from 'react';
import { Bell, Check, Package, Truck, MapPin, QrCode, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const typeIcons = {
  donation_claimed: Package,
  donation_picked_up: Truck,
  donation_delivered: Check,
  new_donation_nearby: MapPin,
  qr_verified: QrCode,
  general: Info,
};

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Browser push notifications + real-time badge refresh
  usePushNotifications(user?.email);

  // Also refresh the bell badge when a new notification arrives via subscription
  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data?.user_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.email] });
      }
    });
    return unsub;
  }, [user?.email]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7"
              onClick={() => notifications.filter(n => !n.read).forEach(n => markReadMutation.mutate(n.id))}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No notifications yet</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const Icon = typeIcons[notif.type] || Info;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                    onClick={() => { if (!notif.read) markReadMutation.mutate(notif.id); }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!notif.read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.read ? 'font-medium' : 'text-muted-foreground'}`}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
