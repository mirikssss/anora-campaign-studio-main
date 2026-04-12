import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CreditCard, TrendingDown, EyeOff, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { useCampaignStore } from '@/store/campaignStore';

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { role } = useCampaignStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Mock user ID for the demo since full auth wasn't needed
  // In reality this comes from JWT/Context
  const mockUserId = role === 'publisher' ? 'publisher-mock-id' : 'bab1dd90-c5e3-415d-ac93-ef0020380c05'; 

  const fetchNotes = () => {
    fetch(`${API_URL}/api/notifications?user_id=${mockUserId}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotes();
    const int = setInterval(fetchNotes, 30000); // Poll every 30s
    return () => clearInterval(int);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch(e) {}
  };

  const getIcon = (type: string) => {
    if (type.includes('BUDGET')) return <CreditCard className="text-warning" />;
    if (type.includes('LOW_CTR')) return <TrendingDown className="text-warning" />;
    if (type.includes('ZERO_IMPRESSIONS')) return <EyeOff className="text-destructive" />;
    if (type.includes('GOOD')) return <CheckCircle2 className="text-success" />;
    return <AlertTriangle className="text-muted-foreground" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl font-bold">Центр Уведомлений</h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchNotes} className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Обновить
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Telegram Integration Banner */}
        <div className="bg-primary/5 p-6 border-b border-border flex items-center justify-between sm:flex-row flex-col gap-4">
          <div>
            <h4 className="font-bold flex items-center gap-2"><Send size={16} className="text-primary"/> Интеграция с Telegram</h4>
            <p className="text-xs text-muted-foreground font-medium mt-1 max-w-md">Получайте критические алерты напрямую в мессенджер. Бот собирает уведомления и отправляет дайджест раз в час.</p>
          </div>
          <button className="whitespace-nowrap px-4 py-2 font-bold text-xs bg-primary text-primary-foreground rounded-xl shadow-lg hover:opacity-90">
            Подключить @AnoraAlertsBot
          </button>
        </div>

        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground font-medium flex flex-col items-center justify-center">
              <Bell size={32} className="opacity-20 mb-4" />
              Нет новых уведомлений
            </div>
          ) : (
            notifications.map((n, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={n.id} 
                className={`p-6 flex gap-5 transition-colors ${n.is_read ? 'bg-transparent opacity-60' : 'bg-muted/20 hover:bg-muted/40'}`}
              >
                <div className="h-10 w-10 shrink-0 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className={`text-base font-bold truncate ${n.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</h4>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 font-medium leading-relaxed mb-3">
                    {n.message}
                  </p>
                  
                  {!n.is_read && (
                    <button onClick={() => markAsRead(n.id)} className="text-xs font-bold text-primary hover:underline">
                      Отметить прочитанным
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
