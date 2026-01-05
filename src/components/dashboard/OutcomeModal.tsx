import { useState } from "react";
import { Decision, addOutcome, Outcome } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OutcomeModalProps {
  decision: Decision | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const OutcomeModal = ({ decision, open, onOpenChange, onSuccess }: OutcomeModalProps) => {
  const [rating, setRating] = useState(4);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!decision) return;

    setIsSubmitting(true);
    try {
      const outcome: Outcome = {
        id: Date.now().toString(),
        rating: rating * 2, // Convert 1-5 to 1-10 scale
        wouldChooseDifferently: rating < 3,
        reflection: reflection.trim(),
        createdAt: new Date().toISOString(),
      };

      await addOutcome(decision.id, outcome);

      toast({
        title: "Outcome recorded! 🎉",
        description: "Your digital twin is learning from the result.",
      });

      setRating(4);
      setReflection("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Failed to save outcome",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(4);
    setReflection("");
    onOpenChange(false);
  };

  if (!decision) return null;

  const ratingLabels = ["Poor", "Below Average", "Average", "Good", "Excellent"];
  const displayRating = hoveredRating ?? rating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Outcome</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Decision:</p>
            <p className="font-medium">{decision.title}</p>
          </div>

          <div className="space-y-3">
            <Label>How did it turn out?</Label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {ratingLabels[displayRating - 1]}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reflection">Reflection (optional)</Label>
            <Textarea
              id="reflection"
              placeholder="What did you learn? Would you make the same choice again?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[100px] bg-secondary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="hero" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Outcome
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OutcomeModal;
