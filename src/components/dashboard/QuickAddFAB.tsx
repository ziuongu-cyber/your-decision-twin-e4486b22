import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAddFABProps {
  className?: string;
}

const QuickAddFAB = ({ className }: QuickAddFABProps) => {
  return (
    <Link
      to="/log-decision"
      className={cn(
        "fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40",
        "w-14 h-14 rounded-full gradient-bg",
        "flex items-center justify-center",
        "shadow-lg shadow-primary/30 glow-primary",
        "hover:scale-110 active:scale-95 transition-transform",
        className
      )}
      aria-label="Log new decision"
    >
      <Plus className="w-6 h-6 text-primary-foreground" />
    </Link>
  );
};

export default QuickAddFAB;
