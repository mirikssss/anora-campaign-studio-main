import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export type Role = 'advertiser' | 'publisher' | 'admin' | null;
export type Goal = 'awareness' | 'traffic' | 'conversion' | 'retention' | 'roas';
export type AudienceType = 'broad' | 'targeted' | 'retargeting';
export type Strategy = 'cpc' | 'cpm' | 'cpa';
export type AnalysisStatus = 'good' | 'warning' | 'risk';
export type AppScreen = 'role' | 'onboarding' | 'publisherOnboarding' | 'dashboard' | 'campaign' | 'analysis' | 'simulator';
export type BudgetType = 'daily' | 'periodic' | 'monthly';

export interface AnalysisCard {
  id: string;
  title: string;
  status: AnalysisStatus;
  explanation: string;
  currentValue?: string;
  suggestion?: string;
  applied?: boolean;
  discussing?: boolean;
  messages?: { role: 'user' | 'ai'; text: string }[];
}

interface OnboardingState {
  onboardingStep: number;
  onboardingGoal: Goal | null;
  onboardingAudienceType: AudienceType | null;
  onboardingStrategy: Strategy | null;
  brandName: string;
  industry: string;
  website: string;
  defaultGeos: string[];
}

interface CampaignState extends OnboardingState {
  screen: AppScreen;
  role: Role;
  currentStep: number;
  analyzing: boolean;
  analysisResults: AnalysisCard[] | null;
  aiScore: number | null;
  aiSummary: string | null;

  // Campaign fields
  campaignName: string;
  goal: Goal | null;
  landingUrl: string;
  creativeTab: 'upload' | 'ai';
  uploadedFile: File | null;
  aiDescription: string;
  aiGenerating: boolean;
  aiCta: string;
  aiStyle: string;
  aiColors: string;
  geos: string[];
  audienceType: AudienceType | null;
  showAdvancedAudience: boolean;
  ageRange: [number, number];
  gender: string;
  interests: string;
  lifetimeBudget: string;
  dailyBudget: string;
  budgetType: BudgetType;
  strategy: Strategy | null;
  startDate: Date | null;
  endDate: Date | null;
  showAdvancedBudget: boolean;
  frequencyCap: string;
  deviceTargeting: string;

  // Actions
  setScreen: (screen: AppScreen) => void;
  setRole: (role: Role) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;
  setOnboardingGoal: (goal: Goal) => void;
  setOnboardingAudienceType: (type: AudienceType) => void;
  setOnboardingStrategy: (strategy: Strategy) => void;
  setBrandName: (name: string) => void;
  setIndustry: (industry: string) => void;
  setWebsite: (url: string) => void;
  setDefaultGeos: (geos: string[]) => void;
  finishOnboarding: () => Promise<void>;
  setCampaignName: (name: string) => void;
  setGoal: (goal: Goal) => void;
  setLandingUrl: (url: string) => void;
  setCreativeTab: (tab: 'upload' | 'ai') => void;
  setUploadedFile: (file: File | null) => void;
  setAiDescription: (desc: string) => void;
  setAiGenerating: (generating: boolean) => void;
  setAiCta: (cta: string) => void;
  setAiStyle: (style: string) => void;
  setAiColors: (colors: string) => void;
  setGeos: (geos: string[]) => void;
  setAudienceType: (type: AudienceType) => void;
  toggleAdvancedAudience: () => void;
  setAgeRange: (range: [number, number]) => void;
  setGender: (gender: string) => void;
  setInterests: (interests: string) => void;
  setLifetimeBudget: (budget: string) => void;
  setDailyBudget: (budget: string) => void;
  setBudgetType: (type: BudgetType) => void;
  setStrategy: (strategy: Strategy | null) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  toggleAdvancedBudget: () => void;
  setFrequencyCap: (cap: string) => void;
  setDeviceTargeting: (device: string) => void;
  runAnalysis: () => Promise<void>;
  applySuggestion: (id: string) => void;
  toggleDiscuss: (id: string) => void;
  addMessage: (id: string, message: { role: 'user' | 'ai'; text: string }) => void;
  sendChatMessage: (id: string, text: string) => Promise<void>;
  globalMessages: { role: 'user' | 'ai'; text: string }[];
  sendGlobalMessage: (text: string) => Promise<void>;
  startNewCampaign: () => void;
  reset: () => void;
  canProceedCampaignStep: (step: number) => boolean;
  saveCampaignToBackend: () => Promise<void>;
  totalImpressions: number;
  updateTotalStats: (campaigns: any[]) => void;
  applyOnboardingSettings: () => void;
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      screen: 'role',

      role: null,
      currentStep: 0,
      analyzing: false,
      analysisResults: null,
      aiScore: null,
      aiSummary: null,

      onboardingStep: 0,
      onboardingGoal: null,
      onboardingAudienceType: null,
      onboardingStrategy: null,
      brandName: '',
      industry: '',
      website: '',
      defaultGeos: [],

      campaignName: '',
      goal: null,
      landingUrl: '',
      creativeTab: 'upload',
      uploadedFile: null,
      aiDescription: '',
      aiGenerating: false,
      aiCta: '',
      aiStyle: 'modern',
      aiColors: '#0A84FF',
      geos: [],
      audienceType: null,
      showAdvancedAudience: false,
      ageRange: [18, 65],
      gender: 'all',
      interests: '',
      lifetimeBudget: '',
      dailyBudget: '',
      strategy: null,
      startDate: null,
      endDate: null,
      showAdvancedBudget: false,
      frequencyCap: '',
      deviceTargeting: 'all',
      budgetType: 'daily',
      totalImpressions: 0,

      updateTotalStats: (campaigns) => {
        const total = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
        set({ totalImpressions: total });
      },

      applyOnboardingSettings: () => {
        const s = get();
        set({
          audienceType: s.onboardingAudienceType || 'broad',
          geos: s.defaultGeos || [],
        });
      },

      setScreen: (screen) => set({ screen }),
      setRole: (role) => set({ role }),
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 3) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      nextOnboardingStep: () => set((s) => ({ onboardingStep: Math.min(s.onboardingStep + 1, 3) })),
      prevOnboardingStep: () => set((s) => ({ onboardingStep: Math.max(s.onboardingStep - 1, 0) })),
      setOnboardingGoal: (goal) => set({ onboardingGoal: goal }),
      setOnboardingAudienceType: (type) => set({ onboardingAudienceType: type }),
      setOnboardingStrategy: (strategy) => set({ onboardingStrategy: strategy }),
      setBrandName: (name) => set({ brandName: name }),
      setIndustry: (industry) => set({ industry }),
      setWebsite: (url) => set({ website: url }),
      setDefaultGeos: (geos) => set({ defaultGeos: geos }),
      finishOnboarding: async () => {
        const s = get();
        try {
          const authRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `${s.brandName.replace(/\s+/g, '').toLowerCase() || 'user'}@example.com`, password: '123' })
          });
          const authData = await authRes.json();
          const userId = authData.user?.id || '00000000-0000-0000-0000-000000000000';

          await fetch(`${API_URL}/api/brands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              name: s.brandName,
              industry: s.industry,
              website: s.website,
              default_objective: s.onboardingGoal,
              default_geo: s.defaultGeos,
              default_strategy: s.onboardingStrategy
            })
          });
        } catch(e) {
          console.error(e);
        }
        
        set({
          screen: 'dashboard',
          goal: s.onboardingGoal,
          audienceType: s.onboardingAudienceType,
          strategy: s.onboardingStrategy,
          geos: s.defaultGeos,
        });
      },
      setCampaignName: (name) => set({ campaignName: name }),
      setGoal: (goal) => set({ goal }),
      setLandingUrl: (url) => set({ landingUrl: url }),
      setCreativeTab: (tab) => set({ creativeTab: tab }),
      setUploadedFile: (file) => set({ uploadedFile: file }),
      setAiDescription: (desc) => set({ aiDescription: desc }),
      setAiGenerating: (generating) => set({ aiGenerating: generating }),
      setAiCta: (cta) => set({ aiCta: cta }),
      setAiStyle: (style) => set({ aiStyle: style }),
      setAiColors: (colors) => set({ aiColors: colors }),
      setGeos: (geos) => set({ geos }),
      setAudienceType: (type) => set({ audienceType: type }),
      toggleAdvancedAudience: () => set((s) => ({ showAdvancedAudience: !s.showAdvancedAudience })),
      setAgeRange: (range) => set({ ageRange: range }),
      setGender: (gender) => set({ gender }),
      setInterests: (interests) => set({ interests }),
      setLifetimeBudget: (budget) => set({ lifetimeBudget: budget }),
      setDailyBudget: (budget) => set({ dailyBudget: budget }),
      setBudgetType: (type) => set({ budgetType: type }),
      setStrategy: (strategy) => set({ strategy }),
      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
      toggleAdvancedBudget: () => set((s) => ({ showAdvancedBudget: !s.showAdvancedBudget })),
      setFrequencyCap: (cap) => set({ frequencyCap: cap }),
      setDeviceTargeting: (device) => set({ deviceTargeting: device }),
      startNewCampaign: () => set((s) => ({
        screen: 'campaign',
        currentStep: 0,
        analyzing: false,
        analysisResults: null,
        aiScore: null,
        aiSummary: null,
        campaignName: '',
        landingUrl: '',
        creativeTab: 'upload',
        uploadedFile: null,
        aiDescription: '',
        aiCta: '',
        aiStyle: 'modern',
        aiColors: '#0A84FF',
        showAdvancedAudience: false,
        ageRange: [18, 65] as [number, number],
        gender: 'all',
        interests: '',
        lifetimeBudget: '',
        dailyBudget: '',
        strategy: null,
        startDate: null,
        endDate: null,
        showAdvancedBudget: false,
        frequencyCap: '',
        deviceTargeting: 'all',
      })),
      runAnalysis: async () => {
        const s = get();
        set({ analyzing: true, screen: 'analysis' });
        
        try {
          const res = await fetch(`${API_URL}/api/analyze-campaign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignData: {
                campaignName: s.campaignName,
                brandName: s.brandName,
                audiences: [s.audienceType || 'all'],
                objective: s.goal,
                strategy: s.strategy,
                dailyBudget: s.dailyBudget,
                lifetimeBudget: s.lifetimeBudget,
                deviceTargeting: s.deviceTargeting
              }
            })
          });
          
          if (!res.ok) throw new Error('AI analysis failed');
          const data = await res.json();
          
          // data.analysis will be a string from OpenRouter
          // For now, we'll parse it into a structured summary and one big card
          // In a real app we'd prompt the AI for JSON specifically
          
          set({
            analyzing: false,
            aiSummary: data.Summary || 'Анализ завершен',
            aiScore: data.Score || 85,
            analysisResults: data.Cards?.length ? data.Cards.map((c: any) => ({
              ...c,
              status: c.status?.toLowerCase() || 'warning'
            })) : [
              {
                id: 'no-cards',
                title: 'Оптимизаций не найдено',
                status: 'good',
                explanation: 'ИИ не вернул специфических рекомендаций.',
              }
            ]
          });
        } catch (e) {
          console.error(e);
          set({ 
            analyzing: false, 
            analysisResults: [{
              id: 'error',
              title: 'Ошибка анализа',
              status: 'risk',
              explanation: 'Не удалось подключиться к ИИ-модулю. Проверьте API ключ.'
            }]
          });
        }
      },
      applySuggestion: (id) => {
        const results = get().analysisResults;
        if (!results) return;
        
        const card = results.find(r => r.id === id) as any;
        if (card && card.valueToApply) {
          // Attempt to dynamically apply the change to the store state
          if (id === 'dailyBudget') set({ dailyBudget: card.valueToApply.toString().replace(/\D/g, '') });
          if (id === 'lifetimeBudget') set({ lifetimeBudget: card.valueToApply.toString().replace(/\D/g, '') });
          if (id === 'geos') set({ geos: typeof card.valueToApply === 'string' ? card.valueToApply.split(',').map((s:string) => s.trim()) : card.valueToApply });
          if (id === 'audienceType') set({ audienceType: card.valueToApply });
          if (id === 'strategy') set({ strategy: card.valueToApply });
        }
        
        // Mark the card as applied in the UI
        set({
          analysisResults: results.map((r) =>
            r.id === id ? { ...r, applied: true } : r
          ),
        });
      },
      toggleDiscuss: (id) => {
        const results = get().analysisResults;
        if (!results) return;
        set({
          analysisResults: results.map((r) =>
            r.id === id ? { ...r, discussing: !r.discussing } : r
          ),
        });
      },
      addMessage: (id, message) => {
        const results = get().analysisResults;
        if (!results) return;
        set({
          analysisResults: results.map((r) =>
            r.id === id ? { ...r, messages: [...(r.messages || []), message] } : r
          ),
        });
      },
      sendChatMessage: async (id, text) => {
        const state = get();
        const results = state.analysisResults;
        if (!results) return;
        
        const card = results.find(r => r.id === id);
        if (!card) return;

        // Optimistically add user message
        state.addMessage(id, { role: 'user', text });

        try {
          const res = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardId: id,
              userMessage: text,
              contextTitle: card.title,
              contextExplanation: card.explanation,
              previousMessages: card.messages || []
            })
          });

          if (!res.ok) throw new Error('Chat API failed');
          const data = await res.json();
          
          // Add AI response
          get().addMessage(id, { role: 'ai', text: data.reply });
        } catch (e) {
          console.error('Chat error:', e);
          get().addMessage(id, { role: 'ai', text: 'К сожалению, не удалось получить ответ от сервера. Попробуйте еще раз.' });
        }
      },
      globalMessages: [],
      sendGlobalMessage: async (text: string) => {
        const s = get();
        set({ globalMessages: [...s.globalMessages, { role: 'user', text }] });
        
        const context = `Budget: ${s.dailyBudget}/day, Goal: ${s.goal}, Audience: ${s.audienceType}, Geo: ${s.geos?.join(', ')}`;
        
        try {
          const res = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardId: 'global',
              userMessage: text,
              contextTitle: 'General Campaign Overview',
              contextExplanation: context,
              previousMessages: s.globalMessages
            })
          });

          if (!res.ok) throw new Error('Global chat API failed');
          const data = await res.json();
          set({ globalMessages: [...get().globalMessages, { role: 'ai', text: data.reply }] });
        } catch (e) {
          console.error('Global chat error:', e);
          set({ globalMessages: [...get().globalMessages, { role: 'ai', text: 'Ошибка сети. Попробуйте позже.' }] });
        }
      },
      reset: () => set({
        screen: 'role',
        role: null,
        currentStep: 0,
        brandName: '',
        campaignName: '',
        onboardingStep: 0,
      }),
      canProceedCampaignStep: (step: number) => {
        const s = get();
        if (step === 0) {
          const validUrl = /^https?:\/\/.+\..+/.test(s.landingUrl);
          return !!(s.campaignName.trim() && s.goal && validUrl);
        }
        if (step === 1) {
          if (s.creativeTab === 'upload') return !!s.uploadedFile;
          return s.aiDescription.length >= 20 && s.aiDescription.length <= 1000;
        }
        if (step === 2) {
          return s.geos.length > 0 && !!s.audienceType;
        }
        if (step === 3) {
          if (!s.strategy || !s.startDate) return false;
          if (s.budgetType === 'periodic') {
            return !!(s.lifetimeBudget && Number(s.lifetimeBudget) > 0 && s.endDate);
          }
          if (s.budgetType === 'daily' || s.budgetType === 'monthly') {
            return !!(s.dailyBudget && Number(s.dailyBudget) > 0);
          }
          return false;
        }
        return false;
      },
      saveCampaignToBackend: async () => {
        const s = get();
        const industry = s.industry?.toLowerCase() || 'default';
        const objective = s.goal || 'traffic';
        
        // Calculate effective budget for predictions
        let budget = 0;
        if (s.budgetType === 'periodic') {
          budget = Number(s.lifetimeBudget) || 0;
        } else if (s.startDate && s.endDate) {
          const days = Math.max(1, Math.ceil((new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / (1000 * 3600 * 24)));
          budget = (Number(s.dailyBudget) || 0) * days;
        } else {
          budget = (Number(s.dailyBudget) || 0) * 30; // Default to 30 days if no end date
        }

        const benchmarks: Record<string, { ctr: number; cvr: number; cpm: number }> = {
          ecommerce: { ctr: 0.024, cvr: 0.031, cpm: 5.15 },
          saas: { ctr: 0.012, cvr: 0.05, cpm: 12.0 },
          gaming: { ctr: 0.035, cvr: 0.08, cpm: 3.5 },
          default: { ctr: 0.015, cvr: 0.02, cpm: 4.5 }
        };
        const bench = benchmarks[industry] || benchmarks.default;
        
        const predicted_impressions = Math.floor((budget / bench.cpm) * 1000);
        const predicted_clicks = Math.floor(predicted_impressions * bench.ctr);
        const predicted_conversions = Math.floor(predicted_clicks * bench.cvr);
        const avgOrderValue = 50; 
        const predicted_revenue = predicted_conversions * avgOrderValue;
        const costPerImpression = bench.cpm / 1000;
        const effectiveness_score = (bench.ctr * bench.cvr * avgOrderValue) - costPerImpression;

        const score_payload = {
          predicted_ctr: bench.ctr,
          predicted_cvr: bench.cvr,
          predicted_impressions,
          predicted_clicks,
          predicted_cpm: bench.cpm,
          predicted_conversions,
          predicted_revenue,
          effectiveness_score: Number(effectiveness_score.toFixed(2)),
          objective,
          target_segments: [s.deviceTargeting || 'all', `${s.ageRange[0]}-${s.ageRange[1]}`, s.geos[0]?.toLowerCase() || 'tashkent']
        };

        const formData = new FormData();
        formData.append('name', s.campaignName);
        formData.append('objective', objective);
        formData.append('landing_url', s.landingUrl);
        formData.append('geo', JSON.stringify(s.geos));
        formData.append('budget_type', s.budgetType);
        formData.append('budget_lifetime', s.lifetimeBudget.toString());
        formData.append('budget_daily', s.dailyBudget.toString());
        formData.append('strategy', s.strategy || 'cpc');
        formData.append('start_date', s.startDate ? new Date(s.startDate).toISOString() : new Date().toISOString());
        if (s.endDate) formData.append('end_date', new Date(s.endDate).toISOString());
        formData.append('frequency_cap', s.frequencyCap || '3');
        formData.append('score_payload', JSON.stringify(score_payload));
        
        if (s.creativeTab === 'upload' && s.uploadedFile) {
          formData.append('banner', s.uploadedFile);
        }
        
        try {
          const res = await fetch(`${API_URL}/api/campaigns`, {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) throw new Error('API Error');
          
          // Clear the draft to remove the "unfinished campaign" warning
          set({
            screen: 'dashboard',
            campaignName: '',
            goal: null,
            geos: [],
            audienceType: null,
            aiDescription: '',
            landingUrl: '',
            uploadedFile: null,
          });
        } catch (e) {
          console.error('Failed to save to backend:', e);
        }
      },
    }),
    {
      name: 'anora-campaign-store',
    }
  )
);
