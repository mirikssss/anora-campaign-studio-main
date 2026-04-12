import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Megaphone, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Plus,
  Globe,
  Bell,
  Code2,
  Layout,
} from 'lucide-react';
import { useCampaignStore } from '@/store/campaignStore';
import Logo from './ui/Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { reset, brandName, startNewCampaign, role } = useCampaignStore();
  const isPublisher = role === 'publisher';

  const advertiserMenuItems = [
    { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Кампании', icon: Megaphone },
    { id: 'audiences', label: 'Аудитории', icon: Users },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'geo', label: 'География', icon: Globe },
  ];

  const publisherMenuItems = [
    { id: 'overview', label: 'Мои площадки', icon: Globe },
    { id: 'analytics', label: 'Статистика', icon: BarChart3 },
    { id: 'geo', label: 'Интеграция SDK', icon: Code2 },
  ];

  const menuItems = isPublisher ? publisherMenuItems : advertiserMenuItems;

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl lg:flex z-50">
      <div className="p-6">
        <Logo className="text-xl" />
      </div>

      {!isPublisher && (
        <div className="px-4 py-2">
          <button
            onClick={startNewCampaign}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Plus size={18} />
            Создать кампанию
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-6">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          Меню
        </div>
        {menuItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 space-y-1">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          Аккаунт
        </div>
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <Settings size={18} />
          Настройки
        </button>
        <button 
          onClick={reset}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
