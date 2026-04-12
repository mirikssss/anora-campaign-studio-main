import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCampaignStore } from '@/store/campaignStore';

export function useNotifications() {
  const { role } = useCampaignStore();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Mock user ID for demo
  const mockUserId = role === 'publisher' ? 'publisher-mock-id' : 'bab1dd90-c5e3-415d-ac93-ef0020380c05';

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications?user_id=${mockUserId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.length > 0) {
          const latest = data[0];
          
          // If we have a new notification that isn't read and is different from the last one we saw
          if (latest.id !== lastNotificationId && !latest.is_read) {
            setLastNotificationId(latest.id);
            
            // Trigger Sonner Toast for WOW effect
            toast(latest.title, {
              description: latest.message,
              action: {
                label: 'Посмотреть',
                onClick: () => {
                  // This logic depends on where we want to navigate
                  console.log('Notification clicked');
                },
              },
            });
          }
        }
      } catch (e) {
        console.error('Notification check failed:', e);
      }
    };

    const interval = setInterval(checkNotifications, 10000); // Check every 10s
    checkNotifications(); // Initial check

    return () => clearInterval(interval);
  }, [role, lastNotificationId, API_URL]);
}
