import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { Decision } from "@/lib/storage";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface DecisionImpactPredictorProps {
  currentDecision: Partial<Decision>;
  decisions: Decision[];
  onClose?: () => void;
}

const DecisionImpactPredictor = ({ currentDecision, decisions, onClose }: DecisionImpactPredictorProps) => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const settings = await getSettings();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/decision-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "predict",
          currentDecision,
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
        throw new Error(data.error || "Failed to get prediction");
      }

      const data = await response.json();
      setPrediction(data.content);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate prediction");
    } finally {
      setIsLoading(false);
    }
  };

  if (!prediction && !isLoading && !error) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI Impact Predictor</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered predictions based on {decisions.length} past decisions
              </p>
            </div>
            <Button onClick={handlePredict} disabled={!currentDecision.title || !currentDecision.choice}>
              <Sparkles className="w-4 h-4 mr-2" />
              Predict Outcome
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          AI Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing your decision patterns...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handlePredict}>
              Try Again
            </Button>
          </div>
        ) : prediction ? (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: prediction
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handlePredict}>
                Refresh Prediction
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DecisionImpactPredictor;
