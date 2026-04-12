import { motion } from 'framer-motion';
import { useCampaignStore } from '@/store/campaignStore';
import { Upload, Sparkles, X, Image, AlertTriangle } from 'lucide-react';
import { useCallback, useState } from 'react';

export default function StepCreative() {
  const store = useCampaignStore();
  const [violationError, setViolationError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    store.setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [store]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAIGeneration = () => {
    setViolationError('');
    const promptLower = store.aiDescription.toLowerCase();
    const bannedWords = ['казино', 'casino', 'ставки', 'betting', 'adult', 'порно'];
    
    if (bannedWords.some(word => promptLower.includes(word))) {
      setViolationError('Ошибка полиси: Модерация отклонила ваш запрос. Промпт содержит запрещенные слова (адалт, гемблинг, оружие и т.д).');
      return;
    }

    store.setAiGenerating(true);
    setTimeout(() => {
      store.setAiGenerating(false);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(['upload', 'ai'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => store.setCreativeTab(tab)}
            className={`relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              store.creativeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {store.creativeTab === tab && (
              <motion.div
                layoutId="creative-tab"
                className="absolute inset-0 rounded-lg bg-card shadow-soft"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {tab === 'upload' ? <Upload size={14} /> : <Sparkles size={14} />}
              {tab === 'upload' ? 'Загрузить баннер' : 'ИИ-Генерация'}
            </span>
          </button>
        ))}
      </div>

      {store.creativeTab === 'upload' ? (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 ${
              dragOver ? 'border-primary bg-accent' : 'border-border hover:border-primary/40'
            }`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {preview ? (
              <div className="relative p-4">
                <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                <button
                  onClick={(e) => { e.stopPropagation(); setPreview(null); store.setUploadedFile(null); }}
                  className="absolute -right-1 -top-1 rounded-full bg-foreground/10 p-1 transition hover:bg-foreground/20"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Image size={32} className="mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Перетащите сюда или кликните для загрузки</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, GIF до 5МБ</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Описание продукта / услуги</label>
            <textarea
              value={store.aiDescription}
              onChange={(e) => store.setAiDescription(e.target.value)}
              placeholder="Опишите ваш продукт или услугу..."
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Текст призыва к действию (CTA)</label>
              <input
                type="text"
                value={store.aiCta}
                onChange={(e) => store.setAiCta(e.target.value)}
                placeholder="напр. Купить сейчас"
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Стиль</label>
              <select
                value={store.aiStyle}
                onChange={(e) => store.setAiStyle(e.target.value)}
                className="w-full appearance-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="modern">Современный / Минимализм</option>
                <option value="bold">Яркий / Насыщенный</option>
                <option value="elegant">Элегантный / Премиум</option>
                <option value="playful">Игривый / Весёлый</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Цвет бренда</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={store.aiColors}
                onChange={(e) => store.setAiColors(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
              />
              <input
                type="text"
                value={store.aiColors}
                onChange={(e) => store.setAiColors(e.target.value)}
                className="w-32 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-mono text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <button 
            onClick={handleAIGeneration}
            disabled={store.aiGenerating || store.aiDescription.length < 10}
            className="w-full rounded-xl bg-primary px-6 py-3 font-display font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={16} />
              {store.aiGenerating ? 'Генерация...' : 'Генерировать баннер'}
            </span>
          </button>
          {violationError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive"
            >
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-semibold">Policy Violation</p>
                <p className="mt-1 opacity-90">{violationError}</p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
