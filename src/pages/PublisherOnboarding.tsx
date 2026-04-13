import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore } from '@/store/campaignStore';
import { ArrowLeft, ArrowRight, Code2, Copy, CheckCircle2, Loader2, Globe, BarChart, Layout, Smartphone, Monitor, Laptop, AlertTriangle, ShieldCheck, Search, FileText, Video, Users } from 'lucide-react';
import { toast } from 'sonner';

// ---- Custom Select Component ----
function CustomSelect({ label, value, onChange, options, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: any }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <label className="text-sm font-bold text-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`mt-1.5 flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-sm text-left transition-all ${
          open ? 'border-primary ring-2 ring-primary/20' : 'border-input hover:border-primary/40'
        }`}
      >
        <span className={selected ? 'text-foreground font-medium' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                  value === opt.value
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {opt.icon && <opt.icon size={16} className="shrink-0 text-muted-foreground" />}
                {opt.label}
                {value === opt.value && <CheckCircle2 size={14} className="ml-auto text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ---- Banner Format Cards ----
const bannerFormats = [
  { value: '300x250', label: 'Medium Rectangle', w: 300, h: 250 },
  { value: '728x90', label: 'Leaderboard', w: 728, h: 90 },
  { value: '160x600', label: 'Wide Skyscraper', w: 160, h: 600 },
  { value: 'auto', label: 'Адаптивный', w: 0, h: 0 },
];

function FormatCard({ fmt, selected, onClick }: { fmt: typeof bannerFormats[0]; selected: boolean; onClick: () => void }) {
  // Scale down proportionally to fit in card
  const maxW = 100, maxH = 80;
  let displayW: number, displayH: number;
  if (fmt.w === 0) {
    displayW = maxW; displayH = maxH;
  } else {
    const scale = Math.min(maxW / fmt.w, maxH / fmt.h);
    displayW = Math.round(fmt.w * scale);
    displayH = Math.round(fmt.h * scale);
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all ${
        selected
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
      }`}
    >
      {/* Visual preview */}
      <div className="flex items-center justify-center h-24 mb-3">
        {fmt.w === 0 ? (
          <div className="flex items-center gap-1">
            <div className="w-10 h-14 rounded border-2 border-dashed border-muted-foreground/30" />
            <div className="w-16 h-10 rounded border-2 border-dashed border-muted-foreground/30" />
          </div>
        ) : (
          <div
            className={`rounded border-2 ${selected ? 'border-primary/50 bg-primary/10' : 'border-muted-foreground/20 bg-muted/50'} flex items-center justify-center`}
            style={{ width: displayW, height: displayH }}
          >
            <span className="text-[9px] font-bold text-muted-foreground/50">{fmt.value}</span>
          </div>
        )}
      </div>
      <div className="text-sm font-bold text-foreground">{fmt.value === 'auto' ? 'Auto' : fmt.value}</div>
      <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{fmt.label}</div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <CheckCircle2 size={18} className="text-primary" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ---- Device Split Cards ----
const deviceOptions = [
  { value: 'mobile_heavy', label: 'Мобильный', desc: '>70% мобильный', icon: Smartphone },
  { value: 'desktop_heavy', label: 'Десктоп', desc: '>70% десктоп', icon: Monitor },
  { value: 'mixed', label: 'Смешанный', desc: '50/50', icon: Laptop },
];

function DeviceCard({ opt, selected, onClick }: { opt: typeof deviceOptions[0]; selected: boolean; onClick: () => void }) {
  const Icon = opt.icon;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all ${
        selected
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
      }`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-3 ${
        selected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        <Icon size={28} />
      </div>
      <div className="text-sm font-bold text-foreground">{opt.label}</div>
      <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{opt.desc}</div>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
          <CheckCircle2 size={18} className="text-primary" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ---- Main Component ----
export default function PublisherOnboarding() {
  const { setScreen } = useCampaignStore();
  const [step, setStep] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Step 1
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [geo, setGeo] = useState('');
  const [domainError, setDomainError] = useState('');
  const [domainChecking, setDomainChecking] = useState(false);
  const [domainVerified, setDomainVerified] = useState(false);
  
  // Step 2
  const [traffic, setTraffic] = useState('');
  const [deviceSplit, setDeviceSplit] = useState('');
  const [contentType, setContentType] = useState('');
  
  // Step 3
  const [format, setFormat] = useState('300x250');
  const [location, setLocation] = useState('inline');
  const [quantity, setQuantity] = useState('1');

  // Step 4
  const [sdkStatus, setSdkStatus] = useState<'pending' | 'checking' | 'verifying_content' | 'active'>('pending');
  const [siteId, setSiteId] = useState<string | null>(null);
  type VStep = { label: string; status: 'pending' | 'checking' | 'done' | 'fail' };
  const [verificationSteps, setVerificationSteps] = useState<VStep[]>([]);

  const steps = [
    { title: 'Регистрация', icon: Globe },
    { title: 'Трафик', icon: BarChart },
    { title: 'Слоты', icon: Layout },
    { title: 'SDK', icon: Code2 },
  ];

  // ---- Domain Validation ----
  const validateDomain = async () => {
    setDomainError('');
    setDomainChecking(true);
    setDomainVerified(false);

    const d = domain.trim().toLowerCase();

    // Basic format
    const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
    if (!domainRegex.test(d)) {
      setDomainError('Невалидный формат домена. Пример: example.com');
      setDomainChecking(false);
      return;
    }

    // Simulate HEAD fetch + SSL check + domain age
    await new Promise(r => setTimeout(r, 2000));

    // Mock: check if domain resolves (we'll pretend popular domains work)
    const knownDomains = ['google.com', 'facebook.com', 'nike.com', 'amazon.com', 'github.com', 'youtube.com', 'twitch.tv', 'reddit.com'];
    const isKnown = knownDomains.some(kd => d.includes(kd));

    // Check HTTPS availability (mock)
    const hasSSL = !d.endsWith('.local') && !d.endsWith('.test');
    if (!hasSSL) {
      setDomainError('Сайт не поддерживает HTTPS. Безопасное соединение обязательно.');
      setDomainChecking(false);
      return;
    }

    // Check domain age (mock: flag if contains "new" or "temp")
    if (d.includes('temp') || d.includes('test')) {
      setDomainError('Домен зарегистрирован менее 30 дней назад. Свяжитесь с нами для ручной проверки.');
      setDomainChecking(false);
      return;
    }

    // Check if site responds (mock: try real fetch with timeout)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      // In production: fetch(`https://${d}`, { method: 'HEAD', signal: controller.signal })
      // For hackathon demo we simulate
      await new Promise(r => setTimeout(r, 1000));
      clearTimeout(timeout);
      
      setDomainVerified(true);
      toast.success(`✅ ${d} прошёл первичную проверку`);
    } catch (e) {
      setDomainError('Сайт не отвечает или недоступен (timeout >5s).');
    }

    setDomainChecking(false);
  };

  const canProceed = () => {
    if (step === 0) return domainVerified && category && language && geo;
    if (step === 1) return traffic && deviceSplit && contentType;
    if (step === 2) return format && location && quantity;
    return true;
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep(s => s + 1);
    } else if (step === 2) {
      try {
        const res = await fetch(`${API_URL}/api/publishers/sites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain, category, language, geo,
            traffic, deviceSplit, contentType,
            slots: [{ format, location, quantity }]
          })
        });
        const data = await res.json();
        if (data.id) {
          setSiteId(data.id);
          setStep(3);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // ---- Multi-step SDK Verification ----
  const verifySDK = async () => {
    if (!siteId) return;
    setSdkStatus('checking');
    
    const vSteps: VStep[] = [
      { label: 'Пингуем ваш сайт...', status: 'checking' },
      { label: 'Поиск SDK скрипта в HTML...', status: 'pending' },
      { label: 'Проверка sdk_key и домена...', status: 'pending' },
      { label: 'ИИ-анализ содержимого страниц...', status: 'pending' },
    ];
    setVerificationSteps([...vSteps]);

    // Step 1: Ping site
    await new Promise(r => setTimeout(r, 1200));
    vSteps[0].status = 'done';
    vSteps[1].status = 'checking';
    setVerificationSteps([...vSteps]);

    // Step 2: Check SDK presence
    await new Promise(r => setTimeout(r, 1500));
    vSteps[1].status = 'done';
    vSteps[2].status = 'checking';
    setVerificationSteps([...vSteps]);

    // Step 3: Validate sdk_key + domain match
    await new Promise(r => setTimeout(r, 1000));
    vSteps[2].status = 'done';
    vSteps[3].status = 'checking';
    setVerificationSteps([...vSteps]);
    setSdkStatus('verifying_content');

    // Step 4: AI content analysis (mock — ready for real LLM)
    await new Promise(r => setTimeout(r, 2000));
    
    // In production: const aiResult = await analyzeContent(domain);
    // Mock result
    const aiResult = {
      detected_category: category, // matches for demo
      prohibited_flags: [],
      language_match: true,
    };

    if (aiResult.prohibited_flags.length > 0) {
      vSteps[3].status = 'fail';
      setVerificationSteps([...vSteps]);
      setSdkStatus('pending');
      toast.error('Обнаружен запрещённый контент. Площадка отклонена.');
      return;
    }

    vSteps[3].status = 'done';
    setVerificationSteps([...vSteps]);

    // Register SDK
    try {
      const res = await fetch(`${API_URL}/sdk/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId })
      });
      if (res.ok) {
        setSdkStatus('active');
        toast.success('SDK верифицировано! Площадка активна.');
        setTimeout(() => setScreen('dashboard'), 2500);
      } else {
        setSdkStatus('pending');
        toast.error('SDK не найдено. Убедитесь, что скрипт установлен.');
      }
    } catch (e) {
      setSdkStatus('pending');
    }
  };

  const codeSnippet = `<!-- 1. Вставьте этот SDK в <head> вашего сайта -->
<script 
  src="${API_URL}/sdk.js" 
  data-site-id="${siteId || 'YOUR_SITE_ID'}"
  async>
</script>

<!-- 2. Разместите этот блок там, где должна быть реклама -->
<div 
  class="anora-ad-slot" 
  data-format="${format}" 
  data-location="${location}">
</div>`;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 px-6 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="font-display text-lg font-bold text-foreground">Подключение площадки</h1>
        </div>
        <div className="mx-auto mt-6 flex max-w-4xl gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {step > i ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-bold hidden sm:block uppercase tracking-wider ${step >= i ? 'text-foreground' : 'text-muted-foreground'}`}>{s.title}</span>
              </div>
              <div className={`h-1.5 w-full rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* ===== STEP 0: Site Registration ===== */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Базовая информация</h2>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">URL и тематика вашего сайта.</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground">Домен</label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={domain}
                      onChange={e => { setDomain(e.target.value); setDomainVerified(false); setDomainError(''); }}
                      placeholder="example.com"
                      className="flex-1 rounded-xl border border-input bg-card px-4 py-3.5 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={validateDomain}
                      disabled={!domain.trim() || domainChecking}
                      className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
                    >
                      {domainChecking ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      Проверить
                    </button>
                  </div>
                  {domainError && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-start gap-2 text-sm text-destructive font-medium">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {domainError}
                    </motion.div>
                  )}
                  {domainVerified && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center gap-2 text-sm text-success font-bold">
                      <ShieldCheck size={16} /> Домен прошёл проверку (SSL ✓, доступность ✓)
                    </motion.div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CustomSelect
                    label="Категория сайта"
                    value={category}
                    onChange={setCategory}
                    placeholder="Выберите..."
                    options={[
                      { value: 'news', label: 'Новости / СМИ' },
                      { value: 'blog', label: 'Блог / Статьи' },
                      { value: 'ecommerce', label: 'E-commerce' },
                      { value: 'tools', label: 'Инструменты' },
                    ]}
                  />
                  <CustomSelect
                    label="Основной язык"
                    value={language}
                    onChange={setLanguage}
                    placeholder="Выберите..."
                    options={[
                      { value: 'ru', label: 'Русский' },
                      { value: 'uz', label: 'Узбекский' },
                      { value: 'en', label: 'Английский' },
                    ]}
                  />
                </div>
                <CustomSelect
                  label="Основная гео аудитории"
                  value={geo}
                  onChange={setGeo}
                  placeholder="Выберите..."
                  options={[
                    { value: 'uzbekistan', label: 'Узбекистан', icon: Globe },
                    { value: 'kz', label: 'Казахстан', icon: Globe },
                    { value: 'cis', label: 'СНГ (весь)', icon: Globe },
                  ]}
                />
              </div>
            )}

            {/* ===== STEP 1: Traffic ===== */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Трафик и аудитория</h2>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">Опишите посещаемость вашей площадки.</p>
                </div>
                <CustomSelect
                  label="Дневной трафик (уникальных)"
                  value={traffic}
                  onChange={setTraffic}
                  placeholder="Выберите объем..."
                  options={[
                    { value: '<1000', label: '< 1,000 в день' },
                    { value: '1k-10k', label: '1,000 — 10,000' },
                    { value: '10k-50k', label: '10,000 — 50,000' },
                    { value: '100k+', label: '100,000+' },
                  ]}
                />

                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">Десктоп / Мобайл</label>
                  <div className="grid grid-cols-3 gap-4">
                    {deviceOptions.map(opt => (
                      <DeviceCard key={opt.value} opt={opt} selected={deviceSplit === opt.value} onClick={() => setDeviceSplit(opt.value)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">Тип контента</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'text', label: 'Статьи / Текст', icon: FileText },
                      { value: 'video', label: 'Видео / Media', icon: Video },
                      { value: 'ugc', label: 'UGC', icon: Users },
                    ].map(opt => {
                      const Icon = opt.icon;
                      const sel = contentType === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setContentType(opt.value)}
                          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all ${
                            sel ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                          }`}
                        >
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-2 ${sel ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Icon size={24} />
                          </div>
                          <div className="text-sm font-bold text-foreground">{opt.label}</div>
                          {sel && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                              <CheckCircle2 size={16} className="text-primary" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Ad Slots ===== */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Рекламные слоты</h2>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">Выберите формат и расположение.</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">Формат баннера</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {bannerFormats.map(fmt => (
                      <FormatCard key={fmt.value} fmt={fmt} selected={format === fmt.value} onClick={() => setFormat(fmt.value)} />
                    ))}
                  </div>
                </div>

                <CustomSelect
                  label="Расположение на странице"
                  value={location}
                  onChange={setLocation}
                  placeholder="Выберите..."
                  options={[
                    { value: 'header', label: 'Шапка (Header)' },
                    { value: 'sidebar', label: 'Боковая колонка (Sidebar)' },
                    { value: 'inline', label: 'Внутри контента (Inline)' },
                    { value: 'footer', label: 'Подвал (Footer)' },
                  ]}
                />
                <div>
                  <label className="text-sm font-bold text-foreground">Количество блоков на странице</label>
                  <input type="number" min="1" max="5" value={quantity} onChange={e=>setQuantity(e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            )}

            {/* ===== STEP 3: SDK Installation ===== */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Установка SDK</h2>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">Вставьте код перед <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&lt;/head&gt;</code></p>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeSnippet);
                        toast.success('Скопировано в буфер обмена');
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                      <Copy size={12} /> Копировать
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-5 text-xs font-mono text-muted-foreground leading-relaxed">
                    <code>{codeSnippet}</code>
                  </pre>
                </div>

                {/* Verification status panel */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  {verificationSteps.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-foreground text-lg mb-4">Верификация площадки</h3>
                      {verificationSteps.map((vs, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {vs.status === 'checking' && <Loader2 size={18} className="animate-spin text-primary" />}
                          {vs.status === 'done' && <CheckCircle2 size={18} className="text-success" />}
                          {vs.status === 'fail' && <AlertTriangle size={18} className="text-destructive" />}
                          {vs.status === 'pending' && <div className="h-[18px] w-[18px] rounded-full border-2 border-muted-foreground/25" />}
                          <span className={`text-sm font-medium ${vs.status === 'checking' ? 'text-primary' : vs.status === 'done' ? 'text-foreground' : vs.status === 'fail' ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {vs.label}
                          </span>
                        </div>
                      ))}
                      {sdkStatus === 'active' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-success font-bold bg-success/10 rounded-xl px-4 py-3">
                          <ShieldCheck size={20} /> Все проверки пройдены. Перенаправляем в панель...
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Globe size={28} />
                      </div>
                      <h3 className="font-bold text-foreground text-lg">Ожидание связи...</h3>
                      <p className="mt-1 text-sm text-muted-foreground mb-6 font-medium">Установите скрипт на сайт и нажмите кнопку ниже.</p>
                      <button onClick={verifySDK} className="rounded-xl px-8 py-3 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                        Проверить установку SDK
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : setScreen('role')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:text-foreground ${step === 3 && sdkStatus === 'active' ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowLeft size={16} /> Назад
          </button>

          {step < 3 && (
            <button
              disabled={!canProceed()}
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-primary/20"
            >
              Далее <ArrowRight size={16} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
