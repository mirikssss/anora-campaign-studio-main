import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore } from '@/store/campaignStore';
import { useSimulatorStore } from '@/store/simulatorStore';
import { ArrowLeft, User, Activity, AlertTriangle, ShieldCheck, RefreshCw, BarChart3, Users, Zap, Terminal } from 'lucide-react';

export default function PublisherSimulator() {
  const { setScreen } = useCampaignStore();
  const { 
    users, 
    activeUserId, 
    setActiveUser, 
    simulateVisit, 
    currentAd, 
    adLoading, 
    logs, 
    dropPerformance, 
    triggerOptimization,
    campaigns,
    loadRealCampaigns
  } = useSimulatorStore();

  useEffect(() => {
    loadRealCampaigns();
  }, [loadRealCampaigns]);

  const activeUser = users.find(u => u.id === activeUserId);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setScreen('dashboard'); window.location.href = '/'; }} className="rounded-lg p-2 text-muted-foreground transition hover:text-foreground hover:bg-muted">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Terminal size={18} className="text-primary" />
                DCO & Delivery Simulator
              </h1>
              <p className="text-xs text-muted-foreground">Интерактивный движок открутки рекламы (RTB Simulation)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-success" /> SDK Active</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: PUBLISHER MOCK SITE */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-muted/20">
              <div className="font-display font-medium">gazeta.uz (Паблишер)</div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-border"></div>
                <div className="w-3 h-3 rounded-full bg-border"></div>
                <div className="w-3 h-3 rounded-full bg-border"></div>
              </div>
            </div>
            
            <div className="p-8 pb-32">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-display font-bold mb-4">Развитие IT-рынка в СНГ: инвестиции и перспективы</h1>
                <p className="text-muted-foreground mb-8">Технологический сектор продолжает активный рост, привлекая новые капиталы. Эксперты прогнозируют...</p>
                
                {/* AD SLOT */}
                <div className="relative my-10 border border-dashed border-border/60 bg-muted/30 rounded-xl flex flex-col items-center justify-center p-6 min-h-[250px] transition-all">
                  <span className="absolute top-2 left-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Ad Slot (In-Read)</span>
                  
                  <AnimatePresence mode="wait">
                    {adLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3 text-muted-foreground"
                      >
                        <RefreshCw size={24} className="animate-spin text-primary" />
                        <span className="text-xs font-mono">SDK requests ad...</span>
                      </motion.div>
                    ) : currentAd ? (
                      <motion.div 
                        key={currentAd.id}
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`w-full max-w-md h-auto min-h-[160px] ${!currentAd.banner_url ? currentAd.color : 'bg-transparent'} rounded-lg shadow-md flex items-center justify-center text-white p-0 relative overflow-hidden`}
                      >
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/40 rounded text-[10px] backdrop-blur-md z-10">Ad</div>
                        {currentAd.banner_url ? (
                          <img src={currentAd.banner_url} alt={currentAd.name} className="w-full h-auto max-h-[300px] object-cover" />
                        ) : (
                          <div className="text-center p-6">
                            <h3 className="font-bold text-lg mb-1 text-white">{currentAd.brand}</h3>
                            <p className="text-sm text-white/90">{currentAd.name}</p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm text-muted-foreground"
                      >
                        Нет подходящей рекламы
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE CAMPAIGNS PANEL */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Активные кампании (Биржа)</h3>
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border ${c.status === 'removed' ? 'opacity-40 border-dashed bg-muted/20' : 'border-border bg-card'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${c.color}`}></div>
                    <div>
                      <div className="text-sm font-medium">{c.brand}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">Geo: {c.geos.join(', ')}</div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-xs">
                      <div className="text-muted-foreground font-mono">CTR</div>
                      <div className="font-medium">{(c.ctr * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-muted-foreground font-mono">Show/Click</div>
                      <div className="font-medium">{c.impressions} / {c.clicks}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIMULATOR CONTROLS */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          
          {/* USER PROFILE MOCK */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-display font-medium flex items-center gap-2"><User size={16}/> Профиль юзера</h3>
             </div>
             
             <div className="flex flex-wrap gap-2 mb-4">
               {users.map(u => (
                 <button 
                  key={u.id}
                  onClick={() => setActiveUser(u.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${activeUserId === u.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-muted'}`}
                 >
                   {u.name}
                 </button>
               ))}
             </div>

             {activeUser && (
               <div className="bg-muted/30 rounded-lg p-3 text-sm font-mono text-muted-foreground">
                 <div>GEO: <span className="text-foreground">{activeUser.geo}</span></div>
                 <div>INT: <span className="text-foreground">{activeUser.interests.join(', ')}</span></div>
               </div>
             )}
          </div>

          {/* SIMULATOR CONTROLS */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
             <h3 className="font-display font-medium flex items-center gap-2 mb-4"><Zap size={16}/> Управление симуляцией</h3>
             
             <div className="space-y-3">
               <button 
                 onClick={simulateVisit}
                 className="w-full relative overflow-hidden rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 shadow flex items-center justify-center gap-2 group"
               >
                 <ArrowLeft size={16} className="text-primary absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                 Симулировать заход юзера
               </button>
               
               <p className="text-xs text-muted-foreground text-center mb-4 leading-relaxed">
                  SDK запрашивает бэкенд Anora, Delivery Engine высчитывает Match Score (Geo + Int) и проводит RTB-аукцион.
               </p>
               
               <hr className="border-border"/>
               
               <button 
                 onClick={dropPerformance}
                 className="w-full rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/10 flex items-center justify-center gap-2"
               >
                 <AlertTriangle size={16} />
                 Обвалить CTR Anora-кампании
               </button>
               
               <button 
                 onClick={triggerOptimization}
                 className="w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/10 flex items-center justify-center gap-2"
               >
                 <Activity size={16} />
                 Запустить AI Optimization
               </button>

             </div>
          </div>

          {/* LOG TTY */}
          <div className="rounded-xl border border-border bg-zinc-950 p-5 shadow-sm flex-1 min-h-[300px] flex flex-col">
            <h3 className="font-mono text-xs text-zinc-500 mb-4 flex items-center justify-between">
              <span>anora_delivery_engine.log</span>
              <span className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div></span>
            </h3>
            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'warning' ? 'text-yellow-400' : 
                      'text-green-400/80'
                    }
                  >
                    <span className="text-zinc-600 mr-2">[{log.time}]</span> 
                    {log.message}
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <div className="text-zinc-600 italic">Waiting for SDK events...</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
