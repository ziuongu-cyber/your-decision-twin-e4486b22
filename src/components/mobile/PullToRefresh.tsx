import { useState, useRef, ReactNode, TouchEvent } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

const PULL_THRESHOLD = 80;

const PullToRefresh = ({ onRefresh, children, className }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    // Only enable pull-to-refresh when at the top of the scroll
    if (containerRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Only allow pulling down
    if (diff > 0) {
      // Apply resistance
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, 100);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50); // Keep indicator visible

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }

    setIsPulling(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-10 transition-opacity",
          pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{ top: Math.max(0, pullDistance - 40) }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-secondary flex items-center justify-center",
            isRefreshing && "animate-spin"
          )}
        >
          <RefreshCw
            className={cn(
              "w-5 h-5 text-primary transition-transform",
              pullDistance >= PULL_THRESHOLD && !isRefreshing && "text-primary"
            )}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${(pullDistance / PULL_THRESHOLD) * 180}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
