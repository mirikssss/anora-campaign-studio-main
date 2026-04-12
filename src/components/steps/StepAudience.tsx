import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore, AudienceType } from '@/store/campaignStore';
import { Globe, Users, Target, ChevronDown } from 'lucide-react';

const GEO_OPTIONS = ['Узбекистан', 'Казахстан', 'Кыргызстан', 'Таджикистан', 'Туркменистан', 'Россия', 'Армения', 'Глобально'];

const audienceTypes: { id: AudienceType; label: string; desc: string; icon: typeof Globe }[] = [
  { id: 'broad', label: 'Широкая', desc: 'Максимум охвата', icon: Globe },
  { id: 'targeted', label: 'Целевая', desc: 'Узкие сегменты', icon: Target },
  { id: 'retargeting', label: 'Ретаргетинг', desc: 'Возврат пользователей', icon: Users },
];

export default function StepAudience() {
  const store = useCampaignStore();

  const toggleGeo = (geo: string) => {
    store.setGeos(
      store.geos.includes(geo) ? store.geos.filter((g) => g !== geo) : [...store.geos, geo]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">География</label>
        <div className="flex flex-wrap gap-2">
          {GEO_OPTIONS.map((geo) => {
            const selected = store.geos.includes(geo);
            return (
              <motion.button
                key={geo}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleGeo(geo)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-accent text-primary font-medium'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {geo}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">Тип аудитории</label>
        <div className="grid grid-cols-3 gap-3">
          {audienceTypes.map((a) => {
            const Icon = a.icon;
            const selected = store.audienceType === a.id;
            return (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => store.setAudienceType(a.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-accent shadow-soft'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <Icon size={20} className={selected ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`text-sm font-medium ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>{a.label}</span>
                <span className="text-xs text-muted-foreground">{a.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => store.toggleAdvancedAudience()}
        className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        <motion.span animate={{ rotate: store.showAdvancedAudience ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.span>
        Расширенные настройки таргетинга
      </button>

      <AnimatePresence>
        {store.showAdvancedAudience && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Возраст</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={store.ageRange[0]}
                    onChange={(e) => store.setAgeRange([+e.target.value, store.ageRange[1]])}
                    className="w-20 rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="number"
                    value={store.ageRange[1]}
                    onChange={(e) => store.setAgeRange([store.ageRange[0], +e.target.value])}
                    className="w-20 rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Пол</label>
                <select
                  value={store.gender}
                  onChange={(e) => store.setGender(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Все</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Интересы</label>
              <input
                type="text"
                value={store.interests}
                onChange={(e) => store.setInterests(e.target.value)}
                placeholder="напр. спорт, технологии, мода"
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
