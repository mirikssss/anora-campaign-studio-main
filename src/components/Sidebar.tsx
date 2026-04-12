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
  DollarSign,
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
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'monetization', label: 'Монетизация', icon: DollarSign },
    { id: 'audiences', label: 'Аудитории', icon: Users },
  ];

  const publisherMenuItems = [
    { id: 'overview', label: 'Мои площадки', icon: Globe },
    { id: 'analytics', label: 'Статистика', icon: BarChart3 },
    { id: 'monetization', label: 'Доходы', icon: DollarSign },
    { id: 'geo', label: 'Интеграция SDK', icon: Code2 },
  ];

  const menuItems = isPublisher ? publisherMenuItems : advertiserMenuItems;

  return (
    <>
      {/* Desktop Sidebar */}
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
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-border bg-background px-6 pb-safe pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 3).map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={20} className={active ? 'fill-primary/20' : ''} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-2 bg-transparent text-[10px] font-medium transition-colors ${
            activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings size={20} />
          <span>Профиль</span>
        </button>
      </div>
    </>
  );
}
