import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Lightbulb,
  MessageSquare,
  Target,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Save,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getAllDecisions, Decision, getPendingFollowups, Reminder } from "@/lib/storage";
import { getWeeklyReview, saveWeeklyReview, WeeklyReview as WeeklyReviewType, getWeekStart, getAllReviewWeeks } from "@/lib/weeklyReview";
import { supabase } from "@/integrations/supabase/client";
import { getSettings } from "@/lib/settings";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks, addWeeks, isSameWeek } from "date-fns";

const WeeklyReview = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [review, setReview] = useState<WeeklyReviewType | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [pendingFollowups, setPendingFollowups] = useState<(Reminder & { decision?: Decision })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const { toast } = useToast();

  // Form state for editable fields
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [weekGoal, setWeekGoal] = useState("");
  const [weekRating, setWeekRating] = useState(5);

  const weekStart = format(currentWeekStart, "yyyy-MM-dd");
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  // Get decisions for this week
  const getWeekDecisions = useCallback((allDecisions: Decision[]) => {
    return allDecisions.filter((d) => {
      const decisionDate = new Date(d.createdAt);
      return isWithinInterval(decisionDate, { start: currentWeekStart, end: weekEnd });
    });
  }, [currentWeekStart, weekEnd]);

  // Calculate week summary
  const calculateSummary = useCallback((weekDecisions: Decision[]) => {
    if (weekDecisions.length === 0) {
      return {
        decisionCount: 0,
        mostActiveDay: null,
        primaryCategory: null,
        confidenceTrend: "stable" as const,
        avgConfidence: 0,
      };
    }

    // Most active day
    const dayCounts: Record<string, number> = {};
    weekDecisions.forEach((d) => {
      const day = format(new Date(d.createdAt), "EEEE");
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Primary category
    const categoryCounts: Record<string, number> = {};
    weekDecisions.forEach((d) => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    });
    const primaryCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Confidence trend (compare to previous week)
    const avgConfidence = Math.round(weekDecisions.reduce((sum, d) => sum + d.confidence, 0) / weekDecisions.length);
    
    return {
      decisionCount: weekDecisions.length,
      mostActiveDay,
      primaryCategory,
      confidenceTrend: "stable" as const, // Will be updated when comparing with prev week
      avgConfidence,
    };
  }, []);

  // Get wins from past decisions with good outcomes
  const getWins = useCallback((allDecisions: Decision[]) => {
    return allDecisions
      .filter((d) => {
        const hasGoodOutcome = d.outcomes?.some((o) => o.rating >= 7 && !o.wouldChooseDifferently);
        const isFromPast = new Date(d.createdAt) < currentWeekStart;
        return hasGoodOutcome && isFromPast;
      })
      .slice(0, 3)
      .map((d) => ({
        decisionId: d.id,
        title: d.title,
        outcome: d.outcomes[d.outcomes.length - 1]?.reflection || "Great outcome!",
        rating: d.outcomes[d.outcomes.length - 1]?.rating || 0,
      }));
  }, [currentWeekStart]);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allDecisions, followups, savedReview, weeks] = await Promise.all([
        getAllDecisions(),
        getPendingFollowups(),
        getWeeklyReview(weekStart),
        getAllReviewWeeks(),
      ]);

      setDecisions(allDecisions);
      setPendingFollowups(followups);
      setAvailableWeeks(weeks);

      if (savedReview) {
        setReview(savedReview);
        setReflectionAnswers(savedReview.reflectionAnswers || {});
        setWeekGoal(savedReview.weekGoal || "");
        setWeekRating(savedReview.weekRating || 5);
      } else {
        // Generate new review data
        const weekDecisions = getWeekDecisions(allDecisions);
        const summary = calculateSummary(weekDecisions);
        const wins = getWins(allDecisions);

        setReview({
          weekStart,
          summary,
          wins,
          reflectionQuestions: [],
          reflectionAnswers: {},
          lookingAhead: {
            upcomingFollowups: followups.slice(0, 5).map((f) => ({
              decisionId: f.decisionId,
              title: f.decisionTitle,
              dueDate: f.dueDate,
            })),
            suggestedFocusAreas: [],
          },
          weekRating: 5,
          weekGoal: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setReflectionAnswers({});
        setWeekGoal("");
        setWeekRating(5);
      }
    } catch (error) {
      console.error("Failed to load review data:", error);
      toast({
        title: "Failed to load review",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [weekStart, getWeekDecisions, calculateSummary, getWins, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate AI reflection questions
  const generateReflectionQuestions = async () => {
    setIsGenerating(true);
    try {
      const settings = await getSettings();
      const weekDecisions = getWeekDecisions(decisions);

      const { data, error } = await supabase.functions.invoke("decision-ai", {
        body: {
          type: "weekly-reflection",
          decisions: weekDecisions,
          weekSummary: review?.summary,
          settings: {
            tone: settings.tone,
            adviceStyle: settings.adviceStyle,
          },
        },
      });

      if (error) throw error;

      // Parse questions from response
      const content = data.content || "";
      let questions: string[] = [];
      
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          questions = parsed.map((q: string | { question: string }) => 
            typeof q === 'string' ? q : q.question
          ).filter((q): q is string => typeof q === 'string');
        }
      } catch {
        // Extract questions from markdown
        const lines = content.split("\n").filter((l: string) => l.trim());
        questions = lines
          .filter((l: string) => l.includes("?"))
          .map((l: string) => l.replace(/^[\d\.\-\*\s]+/, "").trim())
          .slice(0, 3);
      }

      if (questions.length === 0) {
        questions = [
          `You made ${review?.summary.decisionCount || 0} decisions this week. What pattern do you notice?`,
          "Which decision are you most uncertain about?",
          "What would you do differently next week?",
        ];
      }

      setReview((prev) =>
        prev
          ? {
              ...prev,
              reflectionQuestions: questions,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    } catch (error) {
      console.error("Failed to generate questions:", error);
      // Fallback questions
      setReview((prev) =>
        prev
          ? {
              ...prev,
              reflectionQuestions: [
                `You made ${prev.summary.decisionCount} decisions this week. What pattern do you notice?`,
                "Which decision required the most thought?",
                "What are you looking forward to next week?",
              ],
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save review
  const handleSave = async () => {
    if (!review) return;
    setIsSaving(true);
    try {
      const updatedReview: WeeklyReviewType = {
        ...review,
        reflectionAnswers,
        weekGoal,
        weekRating,
        updatedAt: new Date().toISOString(),
      };
      await saveWeeklyReview(updatedReview);
      setReview(updatedReview);
      toast({
        title: "Review saved!",
        description: "Your weekly reflection has been saved.",
      });
    } catch (error) {
      console.error("Failed to save review:", error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation
  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    if (!isCurrentWeek) {
      setCurrentWeekStart((prev) => addWeeks(prev, 1));
    }
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const weekDecisions = getWeekDecisions(decisions);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with navigation */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            </Link>
            {!isCurrentWeek && (
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                Go to Current Week
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold">Weekly Review</h1>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center justify-center gap-2">
                <span>{format(currentWeekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}</span>
                {isCurrentWeek && <Badge variant="secondary">Current Week</Badge>}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={goToNextWeek} disabled={isCurrentWeek}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Week Summary */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Week Summary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-xl">
              <div className="text-2xl font-bold text-primary">{review?.summary.decisionCount || 0}</div>
              <div className="text-sm text-muted-foreground">Decisions Made</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-xl">
              <div className="text-lg font-semibold">{review?.summary.mostActiveDay || "—"}</div>
              <div className="text-sm text-muted-foreground">Most Active Day</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-xl">
              <div className="text-lg font-semibold">{review?.summary.primaryCategory || "—"}</div>
              <div className="text-sm text-muted-foreground">Primary Focus</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center justify-center gap-1">
                {review?.summary.confidenceTrend === "up" ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : review?.summary.confidenceTrend === "down" ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : (
                  <Minus className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-lg font-semibold">{review?.summary.avgConfidence || 0}%</span>
              </div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>
        </div>

        {/* Wins & Learnings */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Wins & Learnings
          </h2>

          {review?.wins && review.wins.length > 0 ? (
            <div className="space-y-3">
              {review.wins.map((win, index) => (
                <div key={index} className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{win.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{win.outcome}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      {win.rating}/10
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No wins to highlight yet. Keep logging outcomes to see your successes here!
            </p>
          )}
        </div>

        {/* Questions for Reflection */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Questions for Reflection
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={generateReflectionQuestions}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              {review?.reflectionQuestions?.length ? "Regenerate" : "Generate Questions"}
            </Button>
          </div>

          {review?.reflectionQuestions && review.reflectionQuestions.length > 0 ? (
            <div className="space-y-4">
              {review.reflectionQuestions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium">{question}</label>
                  <Textarea
                    placeholder="Type your reflection..."
                    value={reflectionAnswers[question] || ""}
                    onChange={(e) =>
                      setReflectionAnswers((prev) => ({
                        ...prev,
                        [question]: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Click "Generate Questions" to get personalized reflection prompts based on your week.
            </p>
          )}
        </div>

        {/* Looking Ahead */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Looking Ahead
          </h2>

          {/* Upcoming Follow-ups */}
          {pendingFollowups.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Follow-ups</h3>
              <div className="space-y-2">
                {pendingFollowups.slice(0, 5).map((followup) => (
                  <div
                    key={followup.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <span className="text-sm">{followup.decisionTitle}</span>
                    <Badge variant="outline">{format(new Date(followup.dueDate), "MMM d")}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week Goal */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              This week I'll...
            </label>
            <Textarea
              placeholder="Set an intention for the coming week..."
              value={weekGoal}
              onChange={(e) => setWeekGoal(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Rate Your Week */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Rate Your Week
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">How would you rate this week?</span>
              <span className="text-2xl font-bold text-primary">{weekRating}/10</span>
            </div>
            <Slider
              value={[weekRating]}
              onValueChange={([value]) => setWeekRating(value)}
              min={1}
              max={10}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Challenging</span>
              <span>Amazing</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="hero" size="lg" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Review
          </Button>
        </div>

        {/* Past Reviews Archive */}
        {availableWeeks.length > 1 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Past Reviews</h2>
            <div className="flex flex-wrap gap-2">
              {availableWeeks
                .filter((w) => w !== weekStart)
                .slice(0, 8)
                .map((week) => (
                  <Button
                    key={week}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekStart(new Date(week))}
                  >
                    {format(new Date(week), "MMM d")}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WeeklyReview;
