import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCampaignStore } from '@/store/campaignStore';

const steps = ['Цель и название', 'Формат и креатив', 'Аудитория', 'Бюджет и расписание'];

export default function Stepper() {
  const { currentStep, setStep } = useCampaignStore();

  return (
    <div className="flex items-center justify-center gap-1">
      {steps.map((label, i) => {
        const completed = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={label} className="flex items-center gap-1">
            <button
              onClick={() => i <= currentStep && setStep(i)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : completed
                  ? 'bg-accent text-accent-foreground cursor-pointer hover:bg-accent/80'
                  : 'text-muted-foreground cursor-default'
              }`}
            >
              {completed ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                  <Check size={14} />
                </motion.span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
                  {i + 1}
                </span>
              )}
              <span className="hidden sm:inline whitespace-nowrap">{label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 transition-colors ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
