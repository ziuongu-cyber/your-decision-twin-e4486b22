import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Brain, RefreshCw, TrendingDown, Eye, Lightbulb } from "lucide-react";
import { Decision, getAllDecisions } from "@/lib/storage";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface BiasDetectorProps {
  className?: string;
}

const BiasDetector = ({ className }: BiasDetectorProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadDecisions = async () => {
      const allDecisions = await getAllDecisions();
      setDecisions(allDecisions);
    };
    loadDecisions();
  }, []);

  const handleAnalyze = async () => {
    if (decisions.length < 5) {
      setError("Log at least 5 decisions to detect bias patterns");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasLoaded(true);

    try {
      const settings = await getSettings();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/decision-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "biases",
          decisions,
          settings: {
            tone: settings.tone,
            adviceStyle: settings.adviceStyle,
            showConfidenceScores: settings.showConfidenceScores,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze biases");
      }

      const data = await response.json();
      setAnalysis(data.content);
    } catch (err) {
      console.error("Bias detection error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze decision biases");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasLoaded) {
    return (
      <Card className={cn("border-primary/20", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Bias Detector
          </CardTitle>
          <CardDescription>
            Discover patterns and blind spots in your decision-making
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Our AI will analyze {decisions.length} of your decisions to identify cognitive biases, 
              overconfidence patterns, and blind spots in your decision-making.
            </p>
            <Button 
              onClick={handleAnalyze} 
              disabled={decisions.length < 5}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Analyze My Biases
            </Button>
            {decisions.length < 5 && (
              <p className="text-xs text-muted-foreground">
                Need at least 5 decisions ({decisions.length}/5 logged)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Bias Detector
        </CardTitle>
        <CardDescription>
          Patterns and blind spots from {decisions.length} decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing your decision patterns...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handleAnalyze}>
              Try Again
            </Button>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleAnalyze} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Analysis
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default BiasDetector;
