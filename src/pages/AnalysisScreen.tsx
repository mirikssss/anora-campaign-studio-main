import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore, AnalysisCard, AnalysisStatus } from '@/store/campaignStore';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, ArrowLeft, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

const statusConfig: Record<AnalysisStatus, { icon: typeof CheckCircle2; color: string; border: string }> = {
  good: { icon: CheckCircle2, color: 'text-success', border: 'border-l-success' },
  warning: { icon: AlertTriangle, color: 'text-warning', border: 'border-l-warning' },
  risk: { icon: XCircle, color: 'text-destructive', border: 'border-l-destructive' },
};

const loaderSteps = [
  'Оценка соответствия цели...',
  'Анализ качества аудитории...',
  'Проверка креативов и баннеров...',
  'Расчет эффективности бюджета...',
  'Оптимизация географии и расписания...',
  'Проверка флагов риска...',
  'Формирование итоговой оценки...',
];

function AiLoader() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < loaderSteps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center p-6 overflow-hidden bg-background">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Big glowing brain/loader icon */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex items-center justify-center mb-10 mt-[-60px]"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.2)]">
          <Loader2 size={48} className="animate-spin text-primary relative z-10" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center text-balance z-10">Анализ кампании искусственным интеллектом</h2>
      <p className="text-muted-foreground mb-10 text-center z-10">Пожалуйста, подождите. Anora обрабатывает параметры...</p>

      {/* Styled card for checklist */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-xl p-8 shadow-2xl">
        <div className="space-y-5">
          {loaderSteps.map((step, i) => {
            const isActive = i === activeStep;
            const isPast = i < activeStep;
            const isFuture = i > activeStep;
            
            return (
              <motion.div 
                key={step} 
                initial={false}
                animate={{ 
                  opacity: isFuture ? 0.3 : 1, 
                  x: isActive ? 10 : 0,
                  scale: isActive ? 1.02 : 1
                }}
                className={`flex items-center gap-4 transition-all duration-300`}
              >
                <div className={`flex items-center justify-center w-6 h-6 shrink-0`}>
                  {isPast ? (
                     <CheckCircle2 size={22} className="text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  ) : isActive ? (
                     <Loader2 size={22} className="animate-spin text-primary" />
                  ) : (
                     <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                <span className={`text-base ${isActive ? 'text-foreground font-semibold drop-shadow-sm' : 'text-muted-foreground font-medium'}`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsSidebar() {
  const store = useCampaignStore();
  const getApplied = (id: string) => store.analysisResults?.find(c => c.id === id)?.applied;
  
  const rules = [
    { 
      id: 'budget', 
      label: 'Бюджет', 
      value: `$${store.lifetimeBudget} (${store.strategy?.toUpperCase()})`,
      appliedValue: `$350 (${store.strategy?.toUpperCase()})`,
      isApplied: getApplied('budget')
    },
    { 
      id: 'budget_cap', 
      label: 'Дневной лимит', 
      value: `$${store.dailyBudget} / день`,
      appliedValue: `$25 / день`,
      isApplied: getApplied('budget')
    },
    { 
      id: 'strategy',
      label: 'Стратегия', 
      value: store.strategy?.toUpperCase() || '-',
    },
    { 
      id: 'geo',
      label: 'География', 
      value: store.geos.join(', ') || 'Не выбрана',
      appliedValue: (store.geos.join(', ') + ', Samarkand, Namangan').replace(/^,\s/, ''),
      isApplied: getApplied('geo')
    },
    { 
      id: 'schedule',
      label: 'Расписание', 
      value: (store.startDate && store.endDate) ? '18:00 – 23:00' : 'Круглосуточно',
      appliedValue: '18:00 – 23:00',
      isApplied: getApplied('schedule')
    },
    { 
      id: 'duration',
      label: 'Длительность', 
      value: store.startDate && store.endDate ? 'Задана' : '14 дней',
    },
    { 
      id: 'devices',
      label: 'Устройства', 
      value: store.deviceTargeting === 'all' ? 'Все устройства' : store.deviceTargeting,
    },
    { 
      id: 'freq',
      label: 'Частота', 
      value: `${store.frequencyCap || 3} / польз / день`,
    },
  ];

  return (
    <div className="w-72 shrink-0 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-sm self-start sticky top-28 hidden lg:block overflow-hidden">
      <h3 className="font-display text-[11px] font-bold tracking-widest text-muted-foreground mb-6 uppercase">
        Параметры кампании
      </h3>
      <div className="space-y-6">
        {rules.map((r, i) => (
          <div key={i} className="min-w-0">
             <div className="text-[10px] font-bold text-muted-foreground/50 mb-1.5 uppercase tracking-wider">{r.label}</div>
             <div className="relative overflow-hidden">
               <AnimatePresence mode="popLayout">
                 {!r.isApplied ? (
                   <motion.div
                     key="original"
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 10 }}
                     className="text-sm font-semibold text-foreground overflow-hidden text-ellipsis line-clamp-2"
                   >
                     {r.value}
                   </motion.div>
                 ) : (
                   <motion.div
                     key="applied"
                     initial={{ opacity: 0, x: -10, backgroundColor: 'rgba(34, 197, 94, 0)' }}
                     animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                     exit={{ opacity: 0, x: 10 }}
                     transition={{ duration: 0.4 }}
                     className="text-sm font-semibold text-success px-2 py-1 -ml-2 rounded w-full break-words leading-tight"
                   >
                     {r.appliedValue}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMarkdown(text: string) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
  return { __html: html };
}

function DiscussPanel({ card }: { card: AnalysisCard }) {
  const { sendChatMessage } = useCampaignStore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    if (!input.trim() || isSending) return;
    const currentInput = input;
    setInput('');
    setIsSending(true);
    
    await sendChatMessage(card.id, currentInput);
    
    setIsSending(false);
  };

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
      <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
        <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
          {card.messages?.map((m, i) => (
            <div key={i} className="text-sm text-foreground">
              <span className="text-xs text-muted-foreground">{m.role === 'ai' ? 'Anora ИИ' : 'Вы'}:</span>
              <p 
                className={`mt-0.5 leading-relaxed ${m.role === 'ai' ? 'text-foreground/90' : 'font-medium'}`} 
                dangerouslySetInnerHTML={formatMarkdown(m.text)}
              />
            </div>
          ))}
          {isSending && (
            <div className="text-sm text-muted-foreground">
              <span className="text-xs">Anora ИИ:</span>
              <p className="mt-0.5 animate-pulse">Печатает ответ...</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Аргументируйте свое решение..."
            disabled={isSending}
            className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <button 
            onClick={send} 
            disabled={isSending || !input.trim()}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {isSending ? '...' : 'Отправить'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AnalysisCardItem({ card }: { card: AnalysisCard }) {
  const { applySuggestion, toggleDiscuss } = useCampaignStore();
  const config = statusConfig[card.status] || statusConfig['warning'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border border-border bg-card p-5 shadow-sm border-l-4 ${config.border}`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 shrink-0`}>
          <config.icon size={20} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-semibold text-foreground">{card.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{card.explanation}</p>

          {card.suggestion && (
            <div className="mt-4">
              <div className="mb-4 text-sm font-mono text-muted-foreground bg-muted/50 p-3 rounded-lg flex items-center gap-2">
                <span className="line-through opacity-70">{card.currentValue || 'Текущее значение'}</span>
                <span>→</span>
                <span className="text-success font-semibold">{card.suggestion}</span>
              </div>
              
              <div className="flex gap-3">
                {card.applied ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                    <CheckCircle2 size={16} /> Вариант применен
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => applySuggestion(card.id)}
                      className="flex-1 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90"
                    >
                      Применить изменение
                    </button>
                    <button
                      onClick={() => toggleDiscuss(card.id)}
                      className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
                    >
                      {card.discussing ? 'Скрыть обсуждение' : 'Обсудить ↗'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {card.discussing && <DiscussPanel card={card} />}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AnalysisScreen() {
  const { analyzing, analysisResults, setScreen, campaignName, saveCampaignToBackend } = useCampaignStore();

  if (analyzing) {
    return <AiLoader />;
  }

  const score = 72; // Make dynamic later if needed

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('campaign')} className="rounded-lg p-2 text-muted-foreground transition hover:text-foreground hover:bg-muted">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">{campaignName || 'Новая кампания'}</h1>
              <p className="text-xs text-muted-foreground">ИИ завершил проверку вашей кампании</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground">
              Score <span className="font-bold text-foreground">{score}</span> / 100
            </div>
            <button 
              onClick={() => {
                if (saveCampaignToBackend) saveCampaignToBackend();
                setScreen('dashboard');
              }}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm"
            >
              Запустить кампанию
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <SettingsSidebar />
          
          <div className="flex-1 space-y-4 font-sans">
            <h3 className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4 opacity-50">Требует внимания</h3>
            {analysisResults?.map((card) => (
              <AnalysisCardItem key={card.id} card={card} />
            ))}
            
            <GlobalChat />
          </div>
        </div>
      </main>
    </div>
  );
}

function GlobalChat() {
  const { globalMessages, sendGlobalMessage } = useCampaignStore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    if (!input.trim() || isSending) return;
    const currentInput = input;
    setInput('');
    setIsSending(true);
    await sendGlobalMessage(currentInput);
    setIsSending(false);
  };

  return (
    <div className="mt-8">
      <h3 className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4 opacity-50">Ассистент кампании</h3>
      
      {globalMessages.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-muted/50 p-4 space-y-3 max-h-64 overflow-y-auto">
          {globalMessages.map((m, i) => (
            <div key={i} className="text-sm text-foreground">
              <span className="text-xs text-muted-foreground">{m.role === 'ai' ? 'Anora ИИ' : 'Вы'}:</span>
              <p 
                className={`mt-0.5 leading-relaxed ${m.role === 'ai' ? 'text-foreground/90' : 'font-medium'}`} 
                dangerouslySetInnerHTML={formatMarkdown(m.text)}
              />
            </div>
          ))}
          {isSending && (
            <div className="text-sm text-muted-foreground">
              <span className="text-xs">Anora ИИ:</span>
              <p className="mt-0.5 animate-pulse">Печатает ответ...</p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={isSending}
          placeholder="Спросите ИИ о чем угодно по этой кампании..."
          className="flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <button 
          onClick={send}
          disabled={isSending || !input.trim()}
          className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {isSending ? '...' : 'Отправить'}
        </button>
      </div>
    </div>
  );
}
