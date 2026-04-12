import { create } from 'zustand';

export interface SimUser {
  id: string;
  name: string;
  geo: string;
  interests: string[];
}

export interface SimCampaign {
  id: string;
  name: string;
  brand: string;
  geos: string[];
  audience: string[];
  ctr: number;
  impressions: number;
  clicks: number;
  color: string;
  status: 'active' | 'removed' | 'pending_review';
  banner_url?: string | null;
}

interface LogEntry {
  id: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'error';
}

interface SimulatorState {
  users: SimUser[];
  activeUserId: string;
  campaigns: SimCampaign[];
  logs: LogEntry[];
  currentAd: SimCampaign | null;
  adLoading: boolean;

  setActiveUser: (id: string) => void;
  simulateVisit: () => void;
  dropPerformance: () => void;
  triggerOptimization: () => void;
  addLog: (msg: string, type: 'info' | 'warning' | 'error') => void;
  loadRealCampaigns: () => Promise<void>;
}

const INITIAL_USERS: SimUser[] = [
  { id: '1', name: 'Alisher (Tashkent)', geo: 'Узбекистан', interests: ['tech', 'business'] },
  { id: '2', name: 'Aida (Almaty)', geo: 'Казахстан', interests: ['beauty', 'shopping'] },
  { id: '3', name: 'Ivan (Moscow)', geo: 'Россия', interests: ['sports', 'gaming'] },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  users: INITIAL_USERS,
  activeUserId: INITIAL_USERS[0].id,
  campaigns: [],
  logs: [],
  currentAd: null,
  adLoading: false,

  loadRealCampaigns: async () => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns`);
      if (!res.ok) throw new Error('API fetching failed');
      const data = await res.json();
      
      const realCampaigns = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        brand: 'Anora Client', // Or c.brand_id mapping
        geos: c.geo || ['Узбекистан'],
        audience: ['tech', 'business', 'shopping', 'sports'], // Mock mapped interests
        ctr: c.score_payload?.predicted_ctr || 0.05,
        impressions: 0,
        clicks: 0,
        color: 'bg-primary',
        status: c.status === 'pending_review' ? 'active' : c.status, // Force active for simulation
        banner_url: c.banner_url ? `${API_URL}${c.banner_url}` : null
      }));

      // In case DB is empty, throw some mock competitors in
      if (realCampaigns.length < 3) {
        realCampaigns.push(
          {
            id: 'c2', name: 'Nike Sneakers', brand: 'Nike',
            geos: ['Казахстан', 'Россия'], audience: ['sports', 'shopping'],
            ctr: 0.08, impressions: 0, clicks: 0, color: 'bg-orange-500', status: 'active', banner_url: null
          },
          {
            id: 'c3', name: 'Kaspi Bank Credit', brand: 'Kaspi',
            geos: ['Казахстан'], audience: ['business', 'tech'],
            ctr: 0.03, impressions: 0, clicks: 0, color: 'bg-red-500', status: 'active', banner_url: null
          }
        );
      }

      set({ campaigns: realCampaigns });
    } catch(e) {
      console.error(e);
      get().addLog('Failed to fetch real campaigns, using mocks', 'error');
    }
  },

  setActiveUser: (id) => set({ activeUserId: id }),

  addLog: (message, type) => {
    set((state) => ({
      logs: [
        { id: Math.random().toString(), message, time: new Date().toLocaleTimeString(), type },
        ...state.logs
      ].slice(0, 50)
    }));
  },

  simulateVisit: () => {
    const { users, activeUserId, campaigns, addLog } = get();
    const user = users.find(u => u.id === activeUserId);
    if (!user) return;

    set({ adLoading: true });
    
    addLog(`[HTTP GET] /api/delivery/ad?slot=in-read&client_id=${user.id}`, 'info');
    
    // Simulate staggered backend logic
    setTimeout(() => {
      addLog(`ENGINE: Аггрегация профиля: Geo => ${user.geo}, Interests => [${user.interests.join(',')}]`, 'info');
      
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      addLog(`ENGINE: Найдено ${activeCampaigns.length} активных кампаний в базе. Запуск RTB аукциона...`, 'info');
      
      let bestAd: SimCampaign | null = null;
      let highestScore = -1;

      for (const campaign of activeCampaigns) {
        let score = 0;
        
        // Match GEO (critical)
        if (campaign.geos.some(g => g.toLowerCase() === user.geo.toLowerCase())) {
          score += 50;
        } else {
          score -= 100; // Penalize hard for wrong geo
        }

        // Match Audience
        const interestMatch = user.interests.some(i => campaign.audience.includes(i));
        if (interestMatch) score += 20;

        // Factor in CTR performance
        score += campaign.ctr * 100; 

        // Noise
        score += Math.random() * 10;
        
        // Log the math for top candidates occasionally or just silently compute
        if (score > highestScore) {
          highestScore = score;
          bestAd = campaign;
        }
      }

      setTimeout(() => {
        if (bestAd && highestScore > 0) {
          addLog(`AUCTION: Победитель определен -> [${bestAd.id}] "${bestAd.name}" с метрикой eCPM/Score = ${Math.round(highestScore)}`, 'info');
          addLog(`SDK: Рендер баннера... (+1 Impression)`, 'warning');
          
          // Update stats
          const clicked = Math.random() < bestAd.ctr;
          
          set(state => ({
            currentAd: bestAd,
            adLoading: false,
            campaigns: state.campaigns.map(c => {
              if (c.id === bestAd!.id) {
                return { ...c, impressions: c.impressions + 1, clicks: c.clicks + (clicked ? 1 : 0) };
              }
              return c;
            })
          }));

          if (clicked) {
            setTimeout(() => {
               addLog(`[ACTION] Юзер ${user.name} КЛИКНУЛ на баннер! (+1 Click, CTR updated)`, 'info');
            }, 800);
          }

        } else {
          addLog(`AUCTION FAILED: Ни одна кампания не прошла фильтр Geo/Targeting.`, 'error');
          set({ currentAd: null, adLoading: false });
        }
      }, 500);

    }, 300);
  },

  dropPerformance: () => {
    const { campaigns, addLog } = get();
    // Ruin performance of the current Anora campaign
    set({
      campaigns: campaigns.map(c => {
        if (c.id === 'c1') {
          return { ...c, ctr: 0.001 }; // Tank the CTR
        }
        if (c.id === 'c2') {
          return { ...c, ctr: 0.15 }; // Boost competitor
        }
        return c;
      })
    });
    addLog('CRASH: Эмуляция падения CTR для Anora Campaign. CTR обвален до 0.001', 'error');
  },

  triggerOptimization: () => {
    const { campaigns, addLog } = get();
    addLog('SYSTEM: Запуск движка оптимизации (Risk Engine)...', 'info');
    
    setTimeout(() => {
      set(state => {
        const newCampaigns = state.campaigns.map(c => {
          if (c.ctr < 0.01 && c.status === 'active') {
            addLog(`OPTIMIZATION: Кампания ${c.name} отключена от паблишера из-за низкого CTR`, 'warning');
            return { ...c, status: 'removed' as const };
          }
          return c;
        });
        return { campaigns: newCampaigns };
      });
    }, 800);
  }
}));
