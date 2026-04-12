import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore, Goal, AudienceType, Strategy } from '@/store/campaignStore';
import { ArrowLeft, ArrowRight, Check, Eye, MousePointer, TrendingUp, RotateCcw, DollarSign, Users, Target, RefreshCw, MousePointerClick } from 'lucide-react';

const goals: { id: Goal; label: string; icon: typeof Eye }[] = [
  { id: 'awareness', label: 'Узнаваемость', icon: Eye },
  { id: 'traffic', label: 'Трафик', icon: MousePointer },
  { id: 'conversion', label: 'Конверсии', icon: TrendingUp },
  { id: 'retention', label: 'Удержание', icon: RotateCcw },
  { id: 'roas', label: 'Окупаемость (ROAS)', icon: DollarSign },
];

const audiences: { id: AudienceType; label: string; desc: string; icon: typeof Users }[] = [
  { id: 'broad', label: 'Широкая аудитория', desc: 'Охватите максимально широкую аудиторию', icon: Users },
  { id: 'targeted', label: 'Целевая аудитория', desc: 'Сфокусируйтесь на демографии и интересах', icon: Target },
  { id: 'retargeting', label: 'Ретаргетинг', desc: 'Верните пользователей, которые уже взаимодействовали', icon: RefreshCw },
];

const strategies: { id: Strategy; label: string; desc: string; icon: typeof MousePointerClick }[] = [
  { id: 'cpc', label: 'CPC', desc: 'Оплата за клик — лучше всего для привлечения трафика', icon: MousePointerClick },
  { id: 'cpm', label: 'CPM', desc: 'Оплата за 1000 показов — лучше всего для узнаваемости', icon: Eye },
  { id: 'cpa', label: 'CPA', desc: 'Оплата за действие — лучше всего для конверсий', icon: Target },
];

const industries = ['E-commerce', 'SaaS', 'Финансы', 'Здравоохранение', 'Образование', 'Гейминг', 'Медиа', 'Путешествия', 'Еда и напитки', 'Другое'];
const geoOptions = ['Россия', 'Казахстан', 'Беларусь', 'Узбекистан', 'Кыргызстан', 'Армения', 'Глобально'];

const steps = ['Цель', 'Таргетинг', 'Бюджет и стратегия', 'Информация о бизнесе'];

function OnboardingStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {steps.map((label, i) => {
        const completed = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={label} className="flex items-center gap-1">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              active ? 'bg-primary text-primary-foreground' : completed ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            }`}>
              {completed ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                  <Check size={14} />
                </motion.span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">{i + 1}</span>
              )}
              <span className="hidden sm:inline whitespace-nowrap">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 transition-colors ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepGoal() {
  const { onboardingGoal, setOnboardingGoal } = useCampaignStore();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Какова ваша основная цель?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Это поможет нам настроить платформу под вас</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {goals.map((g) => {
          const Icon = g.icon;
          const selected = onboardingGoal === g.id;
          return (
            <motion.button key={g.id} onClick={() => setOnboardingGoal(g.id)} whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition-all duration-200 ${
                selected ? 'border-primary bg-accent shadow-soft' : 'border-border bg-card hover:border-primary/30 hover:shadow-card'
              }`}>
              <Icon size={22} className={selected ? 'text-primary' : 'text-muted-foreground'} />
              <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-muted-foreground'}`}>{g.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function StepTargeting() {
  const { onboardingAudienceType, setOnboardingAudienceType } = useCampaignStore();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Настройки таргетинга</h2>
        <p className="mt-1 text-sm text-muted-foreground">Как бы вы хотели охватить свою аудиторию?</p>
      </div>
      <div className="grid gap-3">
        {audiences.map((a) => {
          const Icon = a.icon;
          const selected = onboardingAudienceType === a.id;
          return (
            <motion.button key={a.id} onClick={() => setOnboardingAudienceType(a.id)} whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                selected ? 'border-primary bg-accent shadow-soft' : 'border-border bg-card hover:border-primary/30 hover:shadow-card'
              }`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-foreground">{a.label}</div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function StepBudgetStrategy() {
  const { onboardingStrategy, setOnboardingStrategy } = useCampaignStore();
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Бюджет и стратегия</h2>
        <p className="mt-1 text-sm text-muted-foreground">Выберите, как вы хотите оплачивать кампании</p>
      </div>
      <div className="grid gap-3">
        {strategies.map((s) => {
          const selected = onboardingStrategy === s.id;
          return (
            <motion.button key={s.id} onClick={() => setOnboardingStrategy(s.id)} whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                selected ? 'border-primary bg-accent shadow-soft' : 'border-border bg-card hover:border-primary/30 hover:shadow-card'
              }`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-foreground">{s.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function StepBusinessInfo() {
  const { brandName, setBrandName, industry, setIndustry, website, setWebsite, defaultGeos, setDefaultGeos } = useCampaignStore();

  const toggleGeo = (geo: string) => {
    setDefaultGeos(defaultGeos.includes(geo) ? defaultGeos.filter((g) => g !== geo) : [...defaultGeos, geo]);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Информация о бизнесе</h2>
        <p className="mt-1 text-sm text-muted-foreground">Расскажите нам о вашем бизнесе</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Название бренда / компании</label>
        <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Моя Компания"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Индустрия</label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
          <option value="">Выберите индустрию</option>
          {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Веб-сайт <span className="text-muted-foreground">(опционально)</span></label>
        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Гео по умолчанию (выберите хотя бы одно)</label>
        <div className="flex flex-wrap gap-2">
          {geoOptions.map((geo) => {
            const selected = defaultGeos.includes(geo);
            return (
              <button key={geo} onClick={() => toggleGeo(geo)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  selected ? 'border-primary bg-accent text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                }`}>
                {geo}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

const stepComponents = [StepGoal, StepTargeting, StepBudgetStrategy, StepBusinessInfo];

export default function AdvertiserOnboarding() {
  const { onboardingStep, nextOnboardingStep, prevOnboardingStep, finishOnboarding, onboardingGoal, onboardingAudienceType, onboardingStrategy, brandName, industry, defaultGeos } = useCampaignStore();
  const StepComponent = stepComponents[onboardingStep];
  const isLast = onboardingStep === 3;

  const canProceed = () => {
    if (onboardingStep === 0) return onboardingGoal !== null;
    if (onboardingStep === 1) return onboardingAudienceType !== null;
    if (onboardingStep === 2) return onboardingStrategy !== null;
    if (onboardingStep === 3) return brandName.trim() !== '' && industry !== '' && defaultGeos.length > 0;
    return true;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="font-display text-lg font-bold text-foreground">Настройка аккаунта</h1>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <OnboardingStepper currentStep={onboardingStep} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <AnimatePresence mode="wait">
          <StepComponent key={onboardingStep} />
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <button onClick={prevOnboardingStep} disabled={onboardingStep === 0}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground disabled:opacity-0 disabled:pointer-events-none">
            <ArrowLeft size={16} /> Назад
          </button>
          {isLast ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={finishOnboarding} disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              <Check size={16} /> Завершить
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={nextOnboardingStep} disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              Далее <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </footer>
    </div>
  );
}
