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
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import TwinScore from "@/components/dashboard/TwinScore";
import StatCard from "@/components/dashboard/StatCard";
import { getAllDecisions, calculateSuccessRate, Decision } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { toast } = useToast();

  // Load decisions function
  const loadDecisions = useCallback(async () => {
    try {
      const allDecisions = await getAllDecisions();
      setDecisions(allDecisions);
    } catch (error) {
      console.error("Failed to load decisions:", error);
      toast({
        title: "Failed to load decisions",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load decisions on mount
  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  // Show success message if redirected from LogDecision
  useEffect(() => {
    if (location.state?.showSuccess) {
      toast({
        title: "Decision logged! 🎉",
        description: "Your digital twin is learning from your choices.",
      });
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

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
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-pulse">
          <div className="glass-card rounded-2xl p-4 md:p-8 h-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 h-24" />
            ))}
          </div>
        </div>
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
              <Link to="/log-decision">
                <Button variant="hero" size="lg">
                  <Plus className="w-5 h-5" />
                  Log Your First Decision
                </Button>
              </Link>
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
    </DashboardLayout>
  );
};

export default Dashboard;
