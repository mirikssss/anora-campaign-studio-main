import { motion } from 'framer-motion';
import { Megaphone, Code2, Shield } from 'lucide-react';
import { useCampaignStore, Role } from '@/store/campaignStore';

import Logo from '@/components/ui/Logo';

const roles: { id: Role; title: string; description: string; icon: typeof Megaphone }[] = [
  { id: 'advertiser', title: 'Рекламодатель', description: 'Создание и управление кампаниями', icon: Megaphone },
  { id: 'publisher', title: 'Владелец сайта (SDK)', description: 'Монетизация трафика рекламой', icon: Code2 },
  { id: 'admin', title: 'Администратор', description: 'Управление платформой', icon: Shield },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function RoleSelection() {
  const { role, setRole } = useCampaignStore();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-xl text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-4">
          <Logo className="text-5xl" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Добро пожаловать
        </h1>
        <p className="mt-2 text-muted-foreground">Выберите вашу роль для продолжения</p>

        <motion.div className="mt-10 grid gap-4" variants={container} initial="hidden" animate="show">
          {roles.map((r) => {
            const Icon = r.icon;
            const selected = role === r.id;
            return (
              <motion.button
                key={r.id}
                variants={item}
                onClick={() => setRole(r.id)}
                className={`group relative flex items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-accent shadow-soft'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-card'
                }`}
                whileTap={{ scale: 0.985 }}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground'
                  }`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <div className="font-display text-base font-semibold text-foreground">{r.title}</div>
                  <div className="text-sm text-muted-foreground">{r.description}</div>
                </div>
                {selected && (
                  <motion.div
                    className="absolute right-5 h-5 w-5 rounded-full bg-primary"
                    layoutId="role-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <svg className="text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: role ? 1 : 0.4 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <button
            disabled={!role}
            onClick={() => {
              if (role === 'advertiser') {
                useCampaignStore.getState().setScreen('onboarding');
              } else if (role === 'publisher') {
                useCampaignStore.getState().setScreen('publisherOnboarding');
              }
            }}
            className="w-full rounded-xl bg-primary px-8 py-3.5 font-display font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Продолжить
          </button>
        </motion.div>

        {/* LINK TO WOW SIMULATOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <a
            href="/publisher-demo"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-zinc-950 px-8 py-3.5 font-display font-medium text-white shadow-2xl transition-all hover:scale-105 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            <span className="absolute inset-0 z-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <span className="h-full w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-md"></span>
            </span>
            <Code2 size={18} className="relative z-10 text-primary" />
            <span className="relative z-10">Запустить Publisher Simulator (RTB)</span>
            <span className="relative z-10 ml-2 rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">WOW-Эффект</span>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
