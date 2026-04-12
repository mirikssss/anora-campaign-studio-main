import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart3, Users, MousePointerClick, MoreHorizontal, Copy, Trash, Megaphone, User, Bell, Globe, Code2, Eye, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import { useCampaignStore } from '@/store/campaignStore';
import Logo from '@/components/ui/Logo';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
  const { brandName, startNewCampaign, role } = useCampaignStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isPublisher = role === 'publisher';
  const [activeTab, setActiveTab] = useState<string>('overview');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (isPublisher) {
      // Publisher: load sites
      fetch(`${API_URL}/api/publishers/sites`)
        .then(r => r.ok ? r.json() : [])
        .then(data => { setSites(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      // Advertiser: load campaigns
      fetch(`${API_URL}/api/campaigns`)
        .then(r => r.json())
        .then(data => { setCampaigns(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [isPublisher]);

  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent_total || 0), 0);

  // ---- Advertiser metrics ----
  const advertiserMetrics = [
    { label: 'Расход', value: `$${totalSpent.toFixed(2)}` },
    { label: 'Показы', value: '0' },
    { label: 'Средний CTR', value: '0.0%' },
  ];

  // ---- Publisher metrics ----
  const activeSites = sites.filter(s => s.status === 'active');
  const publisherMetrics = [
    { label: 'Площадки', value: String(sites.length) },
    { label: 'Активные', value: String(activeSites.length) },
    { label: 'Показы (сегодня)', value: '0' },
  ];

  const metrics = isPublisher ? publisherMetrics : advertiserMetrics;

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <Logo className="text-xl" />
              </div>
              <h2 className="hidden lg:block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {isPublisher ? 'PUBLISHER PANEL' : 'DASHBOARD'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 w-full max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <>
              <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                    {isPublisher ? 'Мои площадки' : 'Сводка'}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">С возвращением{brandName ? `, ${brandName}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold uppercase text-[10px] tracking-widest">Период:</span>
                  <button className="rounded-xl border border-border bg-card px-4 py-2 font-bold text-foreground hover:bg-muted transition-colors shadow-sm">
                    Сегодня
                  </button>
                </div>
              </div>

              {/* Draft Warning (advertiser only) */}
              {!isPublisher && (
                <AnimatePresence>
                  {useCampaignStore.getState().campaignName && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                           <Megaphone size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">У вас есть незавершенная кампания</h4>
                          <p className="text-sm text-muted-foreground font-medium mt-1">
                            Кампания "{useCampaignStore.getState().campaignName}" ожидает запуска.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => useCampaignStore.getState().setScreen('campaign')}
                        className="whitespace-nowrap rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                      >
                        Продолжить настройку
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Metrics */}
              <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {metrics.map((stat, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    key={i}
                    className="rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                    <div className="mt-3 font-display text-4xl font-bold text-foreground tracking-tight">{stat.value}</div>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-success uppercase">
                       +0.0% <span className="text-muted-foreground/50 text-[8px]">vs yesterday</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ========== ADVERTISER: Recent Campaigns ========== */}
              {!isPublisher && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="mb-6 flex items-center justify-between font-display">
                    <h3 className="text-xl font-bold">Последние кампании</h3>
                    <button onClick={() => setActiveTab('campaigns')} className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Все кампании →</button>
                  </div>
                  {loading ? (
                    <div className="py-20 text-center text-muted-foreground animate-pulse font-medium">Загрузка данных...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 py-24 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <BarChart3 size={32} className="text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="mt-8 font-display text-2xl font-bold text-foreground">Нет активных кампаний</h3>
                      <p className="mt-3 max-w-sm text-base text-muted-foreground font-medium">
                        Создайте вашу первую рекламную кампанию.
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={startNewCampaign}
                        className="mt-10 flex items-center justify-center gap-2 rounded-2xl bg-foreground px-8 py-4 text-sm font-bold text-background transition-all hover:opacity-90 shadow-xl"
                      >
                        <Plus size={20} />
                        Запустить Anora
                      </motion.button>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {campaigns.slice(0, 3).map((c: any) => (
                        <div key={c.id} className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                               <Megaphone size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-muted text-muted-foreground rounded-lg uppercase tracking-wider">{c.status}</span>
                          </div>
                          <h4 className="font-display text-lg font-bold text-foreground leading-tight">{c.name}</h4>
                          <div className="mt-4 flex flex-wrap gap-2">
                             <span className="text-[10px] font-bold px-2 py-0.5 border border-border rounded text-muted-foreground uppercase">{c.objective}</span>
                             <span className="text-[10px] font-bold px-2 py-0.5 border border-border rounded text-muted-foreground uppercase">{c.strategy}</span>
                          </div>
                          <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                             <div className="text-base font-bold text-foreground">${c.budget_lifetime}</div>
                             <div className="text-[10px] text-muted-foreground font-medium">{new Date(c.start_date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ========== PUBLISHER: Sites List ========== */}
              {isPublisher && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="mb-6 flex items-center justify-between font-display">
                    <h3 className="text-xl font-bold">Ваши площадки</h3>
                  </div>
                  {loading ? (
                    <div className="py-20 text-center text-muted-foreground animate-pulse font-medium">Загрузка...</div>
                  ) : sites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 py-24 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <Globe size={32} className="text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="mt-8 font-display text-2xl font-bold text-foreground">Нет зарегистрированных площадок</h3>
                      <p className="mt-3 max-w-sm text-base text-muted-foreground font-medium">
                        Добавьте свой первый сайт для начала монетизации.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {sites.map((site: any) => (
                        <div key={site.id} className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                          <div className="flex justify-between items-start mb-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                               <Globe size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                              site.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            }`}>{site.status === 'active' ? 'Активна' : 'Ожидание SDK'}</span>
                          </div>
                          <h4 className="font-display text-lg font-bold text-foreground leading-tight">{site.domain}</h4>
                          <div className="mt-3 flex flex-wrap gap-2">
                             <span className="text-[10px] font-bold px-2 py-0.5 border border-border rounded text-muted-foreground uppercase">{site.category}</span>
                             <span className="text-[10px] font-bold px-2 py-0.5 border border-border rounded text-muted-foreground uppercase">{site.geo}</span>
                             <span className="text-[10px] font-bold px-2 py-0.5 border border-border rounded text-muted-foreground uppercase">{site.traffic}</span>
                          </div>

                          {/* Mock revenue stats */}
                          <div className="mt-6 pt-5 border-t border-border/50 grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Показы</div>
                              <div className="text-lg font-bold text-foreground mt-1">0</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Клики</div>
                              <div className="text-lg font-bold text-foreground mt-1">0</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Доход</div>
                              <div className="text-lg font-bold text-success mt-1">$0.00</div>
                            </div>
                          </div>

                          {/* Slots info */}
                          {site.slots && site.slots.length > 0 && (
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                              <Code2 size={12} />
                              {site.slots.map((sl: any, i: number) => (
                                <span key={i} className="bg-muted px-2 py-0.5 rounded font-bold">{sl.format} · {sl.location}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* Campaigns tab (advertiser only) */}
          {activeTab === 'campaigns' && !isPublisher && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-3xl font-bold">Все кампании</h2>
                <button onClick={startNewCampaign} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95">
                   <Plus size={18} /> Создать
                </button>
              </div>
              {loading ? <p className="animate-pulse">Загрузка...</p> : (
                <div className="space-y-4">
                  {campaigns.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                            <Megaphone size={22} className="text-muted-foreground" />
                         </div>
                         <div className="min-w-0">
                            <h4 className="font-bold text-lg truncate">{c.name}</h4>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                               {c.objective} • ${c.budget_lifetime} • {c.strategy?.toUpperCase()}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="px-4 py-1.5 bg-muted rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{c.status}</div>
                         <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <MoreHorizontal size={18} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl font-bold mb-8">
                {isPublisher ? 'Статистика площадок' : 'Сквозная аналитика'}
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-10 min-h-[400px] shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
                    <BarChart3 size={40} className="text-primary opacity-40" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{isPublisher ? 'Доход по дням' : 'Распределение расходов'}</h3>
                  <p className="text-muted-foreground text-sm max-w-xs font-medium">
                    {isPublisher
                      ? 'После накопления показов здесь появится график дохода по дням.'
                      : `После накопления данных здесь появится автоматическая сегментация по ${campaigns.length} кампаниям.`
                    }
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-10 min-h-[400px] shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="h-20 w-20 rounded-3xl bg-success/5 flex items-center justify-center mb-6">
                    {isPublisher ? <Eye size={40} className="text-success opacity-40" /> : <Users size={40} className="text-success opacity-40" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{isPublisher ? 'Показы по форматам' : 'Анализ аудитории'}</h3>
                  <p className="text-muted-foreground text-sm max-w-xs font-medium">
                    {isPublisher
                      ? 'Сравнение эффективности размещений по форматам баннеров.'
                      : 'Мы объединяем данные о конверсиях и интересах ваших пользователей в единый портрет.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audiences' && !isPublisher && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl font-bold mb-8">Аудиторные сегменты</h2>
              {campaigns.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <Users size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-lg">Посетители лендинга</h4>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{campaigns[0].name}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-xs text-muted-foreground font-bold uppercase">Объем:</span>
                          <span className="text-2xl font-display font-bold text-foreground">2,430</span>
                       </div>
                       <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[65%]" />
                       </div>
                       <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">Собрано за последние 7 дней.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                   <Users size={48} className="mx-auto text-muted/30 mb-6" />
                   <p className="text-muted-foreground font-medium">Запустите первую кампанию, чтобы Anora начала сбор аудитории.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="font-display text-3xl font-bold mb-8">Мой профиль</h2>
              <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-6 mb-8">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold uppercase">
                    {brandName ? brandName.charAt(0) : (isPublisher ? 'P' : 'A')}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{brandName || (isPublisher ? 'Аккаунт Паблишера' : 'Аккаунт Рекламодателя')}</h3>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mt-1">
                      План: <span className="text-primary group-hover:text-primary">FREE TIER</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
                    <input type="text" readOnly value="demo@anora.test" className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Роль</label>
                    <input type="text" readOnly value={isPublisher ? 'Владелец площадок (Publisher)' : 'Рекламодатель (Advertiser)'} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none" />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <button className="rounded-xl border border-primary/20 text-primary bg-primary/5 px-6 py-3 text-sm font-bold w-full transition-colors hover:bg-primary/10">
                      Обновить пароль
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
