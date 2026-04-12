import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore } from '@/store/campaignStore';
import Stepper from '@/components/Stepper';
import StepGoal from '@/components/steps/StepGoal';
import StepCreative from '@/components/steps/StepCreative';
import StepAudience from '@/components/steps/StepAudience';
import StepBudget from '@/components/steps/StepBudget';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const stepComponents = [StepGoal, StepCreative, StepAudience, StepBudget];

export default function CampaignFlow() {
  const { currentStep, nextStep, prevStep, runAnalysis, setScreen, canProceedCampaignStep } = useCampaignStore();
  const StepComponent = stepComponents[currentStep];
  const isLast = currentStep === 3;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} className="rounded-lg p-2 text-muted-foreground transition hover:text-foreground">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Создание кампании</h1>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <Stepper />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <AnimatePresence mode="wait">
          <StepComponent key={currentStep} />
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft size={16} />
            Назад
          </button>
          <button
            onClick={() => currentStep === 3 ? runAnalysis() : nextStep()}
            disabled={!canProceedCampaignStep(currentStep)}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
          >
            {currentStep === 3 ? (
              <>Анализировать <Sparkles size={16} className="text-primary-foreground/80" /></>
            ) : (
              <>Далее <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
