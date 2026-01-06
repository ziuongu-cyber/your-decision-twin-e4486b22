import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Target, TrendingUp, MessageSquare, ChevronRight, ChevronLeft, Sparkles, Play, Zap } from "lucide-react";

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
    highlight: "AI-Powered Learning",
  },
  {
    icon: Target,
    title: "Log Your Decisions",
    description:
      "Record your choices, alternatives you considered, and how confident you felt. The more you log, the smarter your twin becomes.",
    highlight: "Easy Tracking",
  },
  {
    icon: TrendingUp,
    title: "Track Outcomes",
    description:
      "Come back later to record how your decisions turned out. This helps your twin learn what works for you.",
    highlight: "Learn & Improve",
  },
  {
    icon: MessageSquare,
    title: "Ask Your Twin",
    description:
      "Facing a tough choice? Ask your twin for personalized advice based on your past decisions and patterns.",
    highlight: "Smart Advice",
  },
];

const FEATURES = [
  { icon: Sparkles, label: "AI-Powered Insights" },
  { icon: Target, label: "Decision Templates" },
  { icon: TrendingUp, label: "Progress Tracking" },
  { icon: MessageSquare, label: "Weekly Reviews" },
];

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

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

  const handleStartTour = () => {
    setShowWelcome(false);
    setStep(0);
  };

  const handleStartUsing = () => {
    onComplete();
  };

  const currentStep = STEPS[step];
  const Icon = currentStep?.icon;
  const isLastStep = step === STEPS.length - 1;

  // Welcome Screen
  if (showWelcome) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg [&>button]:hidden" aria-describedby="welcome-description">
          <DialogHeader className="text-center">
            {/* Animated Logo */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 gradient-bg rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-primary animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-accent-foreground" />
              </div>
            </div>
            
            <DialogTitle className="text-3xl font-bold">
              Welcome to <span className="gradient-text">Digital Twin</span>
            </DialogTitle>
          </DialogHeader>

          <p id="welcome-description" className="text-center text-muted-foreground py-2">
            Your AI-powered decision companion that learns from your choices and helps you make better decisions.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 py-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Demo Animation Placeholder */}
          <div className="relative h-32 rounded-xl bg-gradient-to-br from-primary/10 via-secondary to-accent/10 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Play className="w-5 h-5" />
                <span className="text-sm">Quick overview in 30 seconds</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-col pt-4">
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleStartTour}
            >
              <Play className="w-4 h-4 mr-2" />
              Take a Tour
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleStartUsing}
            >
              Start Using
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Tour Steps
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden" aria-describedby="step-description">
        <DialogHeader className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
              {Icon && <Icon className="w-10 h-10 text-primary-foreground" />}
            </div>
            <div className="absolute top-0 right-1/4 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              {currentStep.highlight}
            </div>
          </div>
          <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
        </DialogHeader>

        <p id="step-description" className="text-center text-muted-foreground py-4">
          {currentStep.description}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-primary w-6" : "bg-secondary hover:bg-secondary/80"
              }`}
              aria-label={`Go to step ${i + 1}`}
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
