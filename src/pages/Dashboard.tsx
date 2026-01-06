import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  Calendar,
  Plus,
  FileText,
  Sparkles,
  CheckCircle,
  Brain,
  Compass,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import TwinScore from "@/components/dashboard/TwinScore";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DecisionDetailModal from "@/components/dashboard/DecisionDetailModal";
import OutcomeModal from "@/components/dashboard/OutcomeModal";
import PendingFollowupsWidget from "@/components/dashboard/PendingFollowupsWidget";
import QuickAddFAB from "@/components/dashboard/QuickAddFAB";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import MilestoneCelebration from "@/components/celebrations/MilestoneCelebration";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllDecisions, calculateSuccessRate, Decision } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const ONBOARDING_KEY = "decision_twin_onboarded";
const MILESTONES = [5, 10, 25, 50, 100];

const Dashboard = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [outcomeDecision, setOutcomeDecision] = useState<Decision | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [milestone, setMilestone] = useState<{
    title: string;
    description: string;
    type: "first" | "streak" | "count" | "score";
    value?: number;
  } | null>(null);

  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { dueReminders, dismissReminder, snoozeReminder, refreshReminders } =
    useReminderNotifications();

  // Load decisions function
  const loadDecisions = useCallback(async () => {
    try {
      const allDecisions = await getAllDecisions();
      setDecisions(allDecisions);
      return allDecisions;
    } catch (error) {
      console.error("Failed to load decisions:", error);
      toast({
        title: "Failed to load decisions",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load decisions on mount
  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  // Check for onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  // Show success message and check milestones
  useEffect(() => {
    if (location.state?.showSuccess) {
      toast({
        title: "Decision logged! 🎉",
        description: "Your digital twin is learning from your choices.",
      });
      
      // Check for milestones
      const count = decisions.length;
      if (count === 1) {
        setMilestone({
          title: "First Decision!",
          description: "You've taken the first step in building your digital twin.",
          type: "first",
        });
      } else if (MILESTONES.includes(count)) {
        setMilestone({
          title: `${count} Decisions!`,
          description: `Amazing progress! You've logged ${count} decisions.`,
          type: "count",
          value: count,
        });
      }
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast, decisions.length]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleOutcomeSuccess = async () => {
    await loadDecisions();
    await refreshReminders();
  };

  // Calculate stats
  const totalDecisions = decisions.length;

  // Calculate active days (unique days with decisions)
  const activeDays = new Set(
    decisions.map((d) => new Date(d.createdAt).toDateString())
  ).size;

  // Twin Score: (total decisions / 50) * 100, max 100%
  const twinScore = Math.min(Math.round((totalDecisions / 50) * 100), 100);

  // Success rate from outcomes
  const successRate = calculateSuccessRate(decisions);

  // Get last 10 decisions for timeline
  const recentDecisions = decisions.slice(0, 10);

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton variant="dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Welcome section with Twin Score */}
        <div className="glass-card rounded-2xl p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, <span className="gradient-text">Explorer</span>
              </h1>
              <p className="text-muted-foreground">
                {totalDecisions === 0
                  ? "Your digital twin is waiting. Start logging decisions to build your profile."
                  : `Your digital twin has learned from ${totalDecisions} decision${totalDecisions !== 1 ? "s" : ""}.`}
              </p>
            </div>
            <div className="flex justify-center">
              <TwinScore score={twinScore} />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Total Decisions" value={totalDecisions} />
          <StatCard
            icon={TrendingUp}
            label="Twin Score"
            value={twinScore}
            suffix="%"
          />
          <StatCard icon={Calendar} label="Active Days" value={activeDays} />
          <StatCard
            icon={CheckCircle}
            label="Success Rate"
            value={successRate}
            suffix="%"
          />
        </div>

        {/* Pending Follow-ups */}
        {dueReminders.length > 0 && (
          <PendingFollowupsWidget
            reminders={dueReminders}
            onSnooze={snoozeReminder}
            onDismiss={dismissReminder}
            onAddOutcome={(decision) => setOutcomeDecision(decision)}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link to="/guided-decision">
            <Button variant="outline" className="gap-2">
              <Compass className="w-4 h-4" />
              Help Me Decide
            </Button>
          </Link>
          <Link to="/ask-twin">
            <Button variant="outline" className="gap-2">
              <Brain className="w-4 h-4" />
              Ask Your Twin
            </Button>
          </Link>
        </div>

        {/* Recent Decisions Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Decisions
            </h2>
            {totalDecisions > 0 && (
              <Link to="/log-decision">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                  Log New
                </Button>
              </Link>
            )}
          </div>

          {recentDecisions.length > 0 ? (
            <div className="space-y-3">
              {recentDecisions.map((decision, index) => (
                <div
                  key={decision.id}
                  className="glass-card rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedDecision(decision)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{decision.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{decision.choice}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {decision.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(decision.createdAt).toLocaleDateString()}
                        </span>
                        {decision.outcomes.length > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            Has outcome
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium gradient-text">
                        {decision.confidence}%
                      </div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No decisions yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Your journey starts with a single decision. Log your first one and watch your digital twin come to life!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/log-decision">
                  <Button variant="hero" size="lg">
                    <Plus className="w-5 h-5" />
                    Log Your First Decision
                  </Button>
                </Link>
                <Link to="/guided-decision">
                  <Button variant="outline" size="lg">
                    <Compass className="w-5 h-5" />
                    Help Me Decide
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick action CTA - only show when there are some decisions */}
        {totalDecisions > 0 && totalDecisions < 10 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 text-center border border-primary/20">
            <p className="text-muted-foreground mb-4">
              🎯 Log {10 - totalDecisions} more decision{10 - totalDecisions !== 1 ? "s" : ""} to unlock pattern insights!
            </p>
            <Link to="/log-decision">
              <Button variant="hero">
                <Plus className="w-4 h-4" />
                Continue Logging
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Add FAB (mobile) */}
      {isMobile && totalDecisions > 0 && <QuickAddFAB />}

      {/* Modals */}
      <DecisionDetailModal
        decision={selectedDecision}
        open={!!selectedDecision}
        onOpenChange={(open) => !open && setSelectedDecision(null)}
        onAddOutcome={(decision) => {
          setSelectedDecision(null);
          setOutcomeDecision(decision);
        }}
      />

      <OutcomeModal
        decision={outcomeDecision}
        open={!!outcomeDecision}
        onOpenChange={(open) => !open && setOutcomeDecision(null)}
        onSuccess={handleOutcomeSuccess}
      />

      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <MilestoneCelebration
        open={!!milestone}
        onClose={() => setMilestone(null)}
        milestone={milestone}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
