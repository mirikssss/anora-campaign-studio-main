import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore, Strategy } from '@/store/campaignStore';
import { ChevronDown, CalendarIcon, MousePointerClick, Eye, Target, AlertTriangle } from 'lucide-react';
import { format, startOfToday, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const strategies: { id: Strategy; label: string; desc: string; icon: any }[] = [
  { id: 'cpc', label: 'CPC', desc: 'Оплата за клик — лучше всего для трафика', icon: MousePointerClick },
  { id: 'cpm', label: 'CPM', desc: 'Оплата за 1000 показов — лучше всего для узнаваемости', icon: Eye },
  { id: 'cpa', label: 'CPA', desc: 'Оплата за действие — лучше всего для конверсий', icon: Target },
];

export default function StepBudget() {
  const store = useCampaignStore();

  let daysToExhaust = 0;
  let duration = 0;
  let budgetExhaustionWarning = false;

  const today = startOfToday();
  const startDate = store.startDate ? new Date(store.startDate) : null;
  const endDate = store.endDate ? new Date(store.endDate) : null;

  // Validation
  const startBeforeToday = startDate && startDate < today;
  const endBeforeStart = startDate && endDate && endDate <= startDate;

  if (store.lifetimeBudget && store.dailyBudget && startDate && endDate) {
    const life = Number(store.lifetimeBudget);
    const daily = Number(store.dailyBudget);
    if (life > 0 && daily > 0) {
      daysToExhaust = Math.ceil(life / daily);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysToExhaust < duration) {
        budgetExhaustionWarning = true;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Бюджет на всё время ($)</label>
          <input
            type="number"
            value={store.lifetimeBudget}
            onChange={(e) => store.setLifetimeBudget(e.target.value)}
            placeholder="500"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Дневной бюджет ($)</label>
          <input
            type="number"
            value={store.dailyBudget}
            onChange={(e) => store.setDailyBudget(e.target.value)}
            placeholder="25"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">Стратегия ставок</label>
        <div className="space-y-2">
          {strategies.map((s) => {
            const selected = store.strategy === s.id;
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => store.setStrategy(s.id)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-accent'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                  <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <div className="ml-auto">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? 'border-primary' : 'border-muted-foreground/40'
                  }`}>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2.5 w-2.5 rounded-full bg-primary"
                      />
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={cn(
            "mb-1.5 block text-sm font-medium",
            startBeforeToday ? 'text-destructive' : 'text-foreground'
          )}>Дата начала</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-left transition-all",
                startBeforeToday
                  ? 'border-destructive ring-2 ring-destructive/20 text-destructive'
                  : startDate
                  ? 'border-input hover:border-primary/30 text-foreground'
                  : 'border-input hover:border-primary/30 text-muted-foreground'
              )}>
                <CalendarIcon size={14} />
                {startDate ? format(startDate, 'PPP') : 'Выбрать дату'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate ?? undefined}
                onSelect={(d) => {
                  store.setStartDate(d ?? null);
                  // Clear end date if it's now invalid
                  if (d && endDate && endDate <= d) store.setEndDate(null);
                }}
                disabled={(d) => d < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {startBeforeToday && (
            <p className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1">
              <AlertTriangle size={11} /> Дата начала не может быть в прошлом
            </p>
          )}
        </div>
        <div>
          <label className={cn(
            "mb-1.5 block text-sm font-medium",
            endBeforeStart ? 'text-destructive' : 'text-foreground'
          )}>Дата окончания</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-left transition-all",
                endBeforeStart
                  ? 'border-destructive ring-2 ring-destructive/20 text-destructive'
                  : endDate
                  ? 'border-input hover:border-primary/30 text-foreground'
                  : 'border-input hover:border-primary/30 text-muted-foreground'
              )}>
                <CalendarIcon size={14} />
                {endDate ? format(endDate, 'PPP') : 'Выбрать дату'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate ?? undefined}
                onSelect={(d) => store.setEndDate(d ?? null)}
                disabled={(d) => d < (startDate ? addDays(startDate, 1) : addDays(today, 1))}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {endBeforeStart && (
            <p className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1">
              <AlertTriangle size={11} /> Должна быть позже даты начала
            </p>
          )}
        </div>
      </div>

      {/* Date error banner */}
      <AnimatePresence>
        {(startBeforeToday || endBeforeStart) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive"
          >
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div className="text-sm">
              <p className="font-bold">Некорректные даты</p>
              <p className="mt-0.5 opacity-80">
                {startBeforeToday && 'Дата начала не может быть в прошлом. '}
                {endBeforeStart && 'Дата окончания должна быть позже даты начала.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => store.toggleAdvancedBudget()}
        className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        <motion.span animate={{ rotate: store.showAdvancedBudget ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.span>
        Расширенные настройки
      </button>

      <AnimatePresence>
        {store.showAdvancedBudget && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Ограничение показов (на пользователя/день)</label>
                <input
                  type="number"
                  value={store.frequencyCap}
                  onChange={(e) => store.setFrequencyCap(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Таргетинг по устройствам</label>
                <select
                  value={store.deviceTargeting}
                  onChange={(e) => store.setDeviceTargeting(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Все устройства</option>
                  <option value="mobile">Только мобильные</option>
                  <option value="desktop">Только ПК</option>
                  <option value="tablet">Только планшеты</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Warnings Section */}
      <div className="space-y-3">
        <AnimatePresence>
          {store.strategy === 'cpa' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 rounded-xl border border-warning/50 bg-warning/10 p-4 text-warning"
            >
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-semibold">Требуется пиксель конверсии</p>
                <p className="mt-1 opacity-90">Сложно оптимизировать CPA без сигнала о конверсии. Убедитесь, что пиксель установлен на вашей посадочной странице.</p>
              </div>
            </motion.div>
          )}

          {budgetExhaustionWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 rounded-xl border border-warning/50 bg-warning/10 p-4 text-warning"
            >
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-semibold">Бюджет будет исчерпан до конца кампании</p>
                <p className="mt-1 opacity-90">Ваш дневной лимит исчерпает общий бюджет за {daysToExhaust} дн., хотя кампания длится {duration} дн. Рекомендуем снизить дневной лимит или увеличить общий бюджет.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
