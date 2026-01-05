import { useState, useRef, TouchEvent } from "react";
import { Decision } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableDecisionCardProps {
  decision: Decision;
  onDelete: (id: string) => void;
  onAddOutcome: (decision: Decision) => void;
  onClick: (decision: Decision) => void;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 80;

const SwipeableDecisionCard = ({
  decision,
  onDelete,
  onAddOutcome,
  onClick,
  children,
}: SwipeableDecisionCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // Limit swipe distance
    const limitedDiff = Math.max(-150, Math.min(150, diff));
    setTranslateX(limitedDiff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    // If swiped past threshold, keep it open
    if (Math.abs(translateX) < SWIPE_THRESHOLD) {
      setTranslateX(0);
    } else {
      setTranslateX(translateX > 0 ? 100 : -100);
    }
  };

  const handleAction = (action: "delete" | "outcome") => {
    setTranslateX(0);
    if (action === "delete") {
      onDelete(decision.id);
    } else {
      onAddOutcome(decision);
    }
  };

  const handleClick = () => {
    if (translateX === 0) {
      onClick(decision);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Left action (outcome) */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-start px-4 bg-green-500",
          "transition-opacity",
          translateX > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: Math.abs(translateX) }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white hover:bg-green-600"
          onClick={() => handleAction("outcome")}
        >
          <CheckCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Right action (delete) */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-end px-4 bg-destructive",
          "transition-opacity",
          translateX < 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: Math.abs(translateX) }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white hover:bg-destructive/80"
          onClick={() => handleAction("delete")}
        >
          <Trash2 className="w-6 h-6" />
        </Button>
      </div>

      {/* Main card */}
      <div
        className={cn(
          "relative bg-card glass-card rounded-xl transition-transform",
          !isSwiping && "transition-transform duration-200"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableDecisionCard;
