import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Target, TrendingUp, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Brain,
    title: "Meet Your Decision Twin",
    description:
      "Your digital twin learns from every decision you make, building a personalized profile of your decision-making patterns.",
  },
  {
    icon: Target,
    title: "Log Your Decisions",
    description:
      "Record your choices, alternatives you considered, and how confident you felt. The more you log, the smarter your twin becomes.",
  },
  {
    icon: TrendingUp,
    title: "Track Outcomes",
    description:
      "Come back later to record how your decisions turned out. This helps your twin learn what works for you.",
  },
  {
    icon: MessageSquare,
    title: "Ask Your Twin",
    description:
      "Facing a tough choice? Ask your twin for personalized advice based on your past decisions and patterns.",
  },
];

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;
  const isLastStep = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader className="text-center">
          <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
            <Icon className="w-10 h-10 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
        </DialogHeader>

        <p className="text-center text-muted-foreground py-4">
          {currentStep.description}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button variant="hero" onClick={handleNext}>
              {isLastStep ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
