import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Rewind, Loader2, AlertTriangle, Send, Sparkles } from "lucide-react";
import { Decision } from "@/lib/storage";
import { getSettings } from "@/lib/settings";

interface DecisionReplayProps {
  decisions: Decision[];
  selectedDecision?: Decision;
}

const DecisionReplay = ({ decisions, selectedDecision }: DecisionReplayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState(
    selectedDecision 
      ? `What if I had chosen differently for "${selectedDecision.title}"?` 
      : ""
  );
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!question.trim()) return;

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
          type: "replay",
          decisions,
          question,
          settings: {
            tone: settings.tone,
            adviceStyle: settings.adviceStyle,
            showConfidenceScores: settings.showConfidenceScores,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze");
      }

      const data = await response.json();
      setAnalysis(data.content);
    } catch (err) {
      console.error("Replay error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const suggestedQuestions = [
    "What if I had chosen the opposite of my usual approach?",
    "How would my life be different if I had been more cautious?",
    "What patterns should I break in my future decisions?",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Rewind className="w-4 h-4" />
          Decision Replay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rewind className="w-5 h-5 text-primary" />
            Decision Replay - "What If?" Simulator
          </DialogTitle>
          <DialogDescription>
            Explore alternate paths and learn from hypothetical scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a 'what if' question about your past decisions..."
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={!question.trim() || isLoading}
                className="h-auto"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            {!analysis && !isLoading && (
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(q)}
                    className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Result */}
          <ScrollArea className="max-h-[50vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Simulating alternate timeline...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-3 py-8">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={handleAnalyze}>
                  Try Again
                </Button>
              </div>
            ) : analysis ? (
              <div className="space-y-4 pr-4">
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setAnalysis(null);
                    setQuestion("");
                  }}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask Another Question
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Rewind className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Explore Alternate Paths</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ask "what if" questions about your past decisions. The AI will simulate 
                    alternate outcomes based on your decision patterns.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DecisionReplay;
