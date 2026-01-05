import { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Sparkles } from "lucide-react";

interface MilestoneCelebrationProps {
  open: boolean;
  onClose: () => void;
  milestone: {
    title: string;
    description: string;
    type: "first" | "streak" | "count" | "score";
    value?: number;
  } | null;
}

const MilestoneCelebration = ({
  open,
  onClose,
  milestone,
}: MilestoneCelebrationProps) => {
  useEffect(() => {
    if (open && milestone) {
      // Fire confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#a855f7", "#7c3aed", "#ec4899"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#a855f7", "#7c3aed", "#ec4899"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [open, milestone]);

  if (!milestone) return null;

  const getIcon = () => {
    switch (milestone.type) {
      case "first":
        return <Star className="w-12 h-12 text-yellow-500" />;
      case "streak":
        return <Sparkles className="w-12 h-12 text-primary" />;
      case "count":
        return <Trophy className="w-12 h-12 text-yellow-500" />;
      case "score":
        return <Trophy className="w-12 h-12 text-primary" />;
      default:
        return <Trophy className="w-12 h-12 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            {getIcon()}
          </div>
          <DialogTitle className="text-2xl">{milestone.title}</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground py-4">{milestone.description}</p>

        {milestone.value !== undefined && (
          <div className="text-4xl font-bold gradient-text mb-4">
            {milestone.value}
          </div>
        )}

        <Button variant="hero" onClick={onClose} className="w-full">
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneCelebration;
