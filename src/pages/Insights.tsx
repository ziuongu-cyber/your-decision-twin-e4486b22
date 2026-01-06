import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Brain,
  TrendingUp,
  Target,
  Sparkles,
  RefreshCw,
  PieChart,
  LineChart,
  ScatterChart,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import BiasDetector from "@/components/ai/BiasDetector";
import DecisionReplay from "@/components/ai/DecisionReplay";
import { getAllDecisions, Decision, calculateSuccessRate } from "@/lib/storage";
import { getSettings, AppSettings } from "@/lib/settings";

// Lazy load chart components
const DecisionsOverTimeChart = lazy(
  () => import("@/components/insights/DecisionsOverTimeChart")
);
const SuccessRateByCategoryChart = lazy(
  () => import("@/components/insights/SuccessRateByCategoryChart")
);
const ConfidenceVsOutcomeChart = lazy(
  () => import("@/components/insights/ConfidenceVsOutcomeChart")
);
const DecisionBreakdownChart = lazy(
  () => import("@/components/insights/DecisionBreakdownChart")
);

const ChartSkeleton = () => (
  <div className="h-64 bg-secondary/50 rounded-lg animate-pulse" />
);

const Insights = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"time" | "category" | "confidence" | "breakdown">("time");
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allDecisions, loadedSettings] = await Promise.all([
          getAllDecisions(),
          getSettings(),
        ]);
        setDecisions(allDecisions);
        setSettings(loadedSettings);
      } catch (error) {
        console.error("Failed to load decisions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate insights
  const categoryBreakdown = decisions.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const avgConfidence = decisions.length
    ? Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length)
    : 0;

  const successRate = calculateSuccessRate(decisions);

  const hasEnoughData = decisions.length >= 5;
  const hasOutcomes = decisions.some((d) => d.outcomes.length > 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton variant="insights" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Decision Insights</h1>
              <p className="text-muted-foreground">
                Patterns and trends from your decision history
              </p>
            </div>
          </div>
        </div>

        {!hasEnoughData ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Need More Data</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Log at least 5 decisions to unlock AI-powered insights about your decision patterns.
              You've logged {decisions.length} so far.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/log-decision">
                <Button variant="hero">
                  <Sparkles className="w-4 h-4" />
                  Log More Decisions
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-6 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold gradient-text">{decisions.length}</div>
                <div className="text-sm text-muted-foreground">Total Decisions</div>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold gradient-text">{avgConfidence}%</div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <RefreshCw className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold gradient-text">{successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* Chart Selector */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeChart === "time" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart("time")}
              >
                <LineChart className="w-4 h-4 mr-1" />
                Over Time
              </Button>
              <Button
                variant={activeChart === "breakdown" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart("breakdown")}
              >
                <PieChart className="w-4 h-4 mr-1" />
                Categories
              </Button>
              <Button
                variant={activeChart === "category" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart("category")}
                disabled={!hasOutcomes}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Success by Category
              </Button>
              <Button
                variant={activeChart === "confidence" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart("confidence")}
                disabled={!hasOutcomes}
              >
                <ScatterChart className="w-4 h-4 mr-1" />
                Confidence vs Outcome
              </Button>
            </div>

            {/* Chart Display */}
            <div className="glass-card rounded-2xl p-6">
              <ErrorBoundary>
                <Suspense fallback={<ChartSkeleton />}>
                  {activeChart === "time" && (
                    <DecisionsOverTimeChart decisions={decisions} />
                  )}
                  {activeChart === "breakdown" && (
                    <DecisionBreakdownChart decisions={decisions} />
                  )}
                  {activeChart === "category" && (
                    <SuccessRateByCategoryChart decisions={decisions} />
                  )}
                  {activeChart === "confidence" && (
                    <ConfidenceVsOutcomeChart decisions={decisions} />
                  )}
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Category Breakdown */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
              <div className="space-y-4">
                {sortedCategories.map(([category, count]) => {
                  const percentage = Math.round((count / decisions.length) * 100);
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span className="text-muted-foreground">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-bg rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Pattern Analysis
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Based on {decisions.length} decisions, here are some patterns:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      Your most common decision category is <strong className="text-foreground">{sortedCategories[0]?.[0] || "N/A"}</strong>
                      {sortedCategories[0] && ` (${Math.round((sortedCategories[0][1] / decisions.length) * 100)}% of decisions)`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      Your average confidence level of {avgConfidence}% suggests you're{" "}
                      {avgConfidence >= 70 ? "generally confident" : avgConfidence >= 50 ? "moderately confident" : "careful and deliberate"} in your choices
                    </span>
                  </li>
                  {successRate > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        With a {successRate}% success rate on tracked outcomes, you're{" "}
                        {successRate >= 70 ? "making great decisions!" : "learning and improving"}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* AI-Powered Bias Detector */}
            {settings?.advancedAI && settings?.showBiasDetector && (
              <BiasDetector className="mt-6" />
            )}

            {/* Decision Replay */}
            {settings?.advancedAI && settings?.showDecisionReplay && decisions.length >= 3 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  "What If?" Simulator
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore alternate paths and learn from hypothetical scenarios based on your decision history.
                </p>
                <DecisionReplay decisions={decisions} />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Insights;
