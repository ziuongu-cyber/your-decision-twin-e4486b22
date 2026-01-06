import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Loader2, AlertTriangle, Plus, Sparkles } from "lucide-react";
import { Decision } from "@/lib/storage";
import { getSettings } from "@/lib/settings";

interface AlternativeSuggesterProps {
  currentDecision: Partial<Decision>;
  decisions: Decision[];
  onAddAlternative?: (alternative: string) => void;
}

const AlternativeSuggester = ({ currentDecision, decisions, onAddAlternative }: AlternativeSuggesterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAlternatives = async () => {
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
          type: "alternatives",
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
        throw new Error(data.error || "Failed to get alternatives");
      }

      const data = await response.json();
      setSuggestions(data.content);
    } catch (err) {
      console.error("Alternatives error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate alternatives");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!suggestions && !isLoading) {
      handleGetAlternatives();
    }
  };

  // Extract alternatives from markdown for quick-add buttons
  const parseAlternatives = (text: string): string[] => {
    const alternatives: string[] = [];
    const regex = /\*\*Alternative(?:\s+\d+)?[:\s]*([^*]+)\*\*/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      alternatives.push(match[1].trim());
    }
    return alternatives.slice(0, 5);
  };

  const parsedAlternatives = suggestions ? parseAlternatives(suggestions) : [];

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleOpen}
        className="gap-2"
      >
        <Lightbulb className="w-4 h-4" />
        Help me think of options
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              AI Alternative Suggestions
            </DialogTitle>
            <DialogDescription>
              Discover options you might not have considered
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing your patterns and generating alternatives...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-3 py-8">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={handleGetAlternatives}>
                  Try Again
                </Button>
              </div>
            ) : suggestions ? (
              <div className="space-y-4 pr-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: suggestions
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </div>

                {parsedAlternatives.length > 0 && onAddAlternative && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-3">Quick add to your alternatives:</p>
                    <div className="flex flex-wrap gap-2">
                      {parsedAlternatives.map((alt, i) => (
                        <Button
                          key={i}
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            onAddAlternative(alt);
                            setIsOpen(false);
                          }}
                          className="gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {alt.length > 30 ? alt.slice(0, 30) + '...' : alt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={handleGetAlternatives}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate New Ideas
                  </Button>
                </div>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlternativeSuggester;
