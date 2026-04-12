import { motion } from 'framer-motion';
import { useCampaignStore, Goal } from '@/store/campaignStore';
import { Eye, MousePointer, TrendingUp, RotateCcw, DollarSign } from 'lucide-react';

const goals: { id: Goal; label: string; icon: typeof Eye }[] = [
  { id: 'awareness', label: 'Узнаваемость', icon: Eye },
  { id: 'traffic', label: 'Трафик', icon: MousePointer },
  { id: 'conversion', label: 'Конверсия', icon: TrendingUp },
  { id: 'retention', label: 'Удержание', icon: RotateCcw },
  { id: 'roas', label: 'Окупаемость (ROAS)', icon: DollarSign },
];

export default function StepGoal() {
  const { campaignName, setCampaignName, goal, setGoal, landingUrl, setLandingUrl } = useCampaignStore();

  const isValidUrl = !landingUrl || /^https?:\/\/.+\..+/.test(landingUrl);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Название кампании</label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="например, Летняя распродажа 2025"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">Цель кампании</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {goals.map((g) => {
            const Icon = g.icon;
            const selected = goal === g.id;
            return (
              <motion.button
                key={g.id}
                onClick={() => setGoal(g.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-accent shadow-soft'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-card'
                }`}
              >
                <Icon size={20} className={selected ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`text-xs font-medium ${selected ? 'text-primary' : 'text-muted-foreground'}`}>{g.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Ссылка посадочной страницы (URL)</label>
        <input
          type="url"
          value={landingUrl}
          onChange={(e) => setLandingUrl(e.target.value)}
          placeholder="https://example.com/promo"
          className={`w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 ${
            !isValidUrl
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : 'border-input bg-card focus:border-primary focus:ring-primary/20'
          }`}
        />
        {!isValidUrl && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-destructive">
            Пожалуйста, введите корректный URL
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
