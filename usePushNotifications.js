import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const typeEmoji = {
  donation_claimed: '📦',
  donation_picked_up: '🚚',
  donation_delivered: '✅',
  new_donation_nearby: '📍',
  qr_verified: '🔐',
  general: '🔔',
};

function fireBrowserNotification(title, message, type) {
  if (Notification.permission !== 'granted') return;
  const emoji = typeEmoji[type] || '🔔';
  try {
    new Notification(`${emoji} ${title}`, {
      body: message,
      icon: '/favicon.ico',
      tag: `mealconnect-${Date.now()}`,
    });
  } catch (_) {}
}

export function usePushNotifications(userEmail) {
  const knownIds = useRef(new Set());
  const initialised = useRef(false);

  // Request permission once
  useEffect(() => {
    if (!userEmail) return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [userEmail]);

  // Subscribe to new Notification records for this user
  useEffect(() => {
    if (!userEmail) return;

    // Pre-load existing IDs so we don't toast stale records
    base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 50)
      .then(existing => {
        existing.forEach(n => knownIds.current.add(n.id));
        initialised.current = true;
      });

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (!initialised.current) return;
      if (event.type !== 'create') return;
      if (event.data?.user_email !== userEmail) return;
      if (knownIds.current.has(event.id)) return;

      knownIds.current.add(event.id);
      fireBrowserNotification(event.data.title, event.data.message, event.data.type);
    });

    return () => {
      unsub();
      initialised.current = false;
    };
  }, [userEmail]);
}
