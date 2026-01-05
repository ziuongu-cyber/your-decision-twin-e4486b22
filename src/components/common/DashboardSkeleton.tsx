import { cn } from "@/lib/utils";

interface DashboardSkeletonProps {
  variant?: "dashboard" | "history" | "insights" | "default";
}

const DashboardSkeleton = ({ variant = "default" }: DashboardSkeletonProps) => {
  if (variant === "dashboard") {
    return (
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-pulse">
        {/* Welcome section */}
        <div className="glass-card rounded-2xl p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-secondary rounded-lg w-3/4" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </div>
            <div className="w-24 h-24 rounded-full bg-secondary" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className="h-8 w-8 bg-secondary rounded-lg mb-3" />
              <div className="h-6 bg-secondary rounded w-1/2 mb-2" />
              <div className="h-4 bg-secondary rounded w-3/4" />
            </div>
          ))}
        </div>

        {/* Recent decisions */}
        <div className="space-y-4">
          <div className="h-6 bg-secondary rounded w-40" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-secondary rounded-full w-16" />
                    <div className="h-6 bg-secondary rounded w-20" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-5 bg-secondary rounded w-12" />
                  <div className="h-3 bg-secondary rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "history") {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary" />
            <div className="space-y-2">
              <div className="h-6 bg-secondary rounded w-40" />
              <div className="h-4 bg-secondary rounded w-24" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-10 bg-secondary rounded-lg" />
            <div className="w-48 h-10 bg-secondary rounded-lg" />
          </div>
        </div>

        {/* Decision list */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 bg-secondary rounded-full w-16" />
                  <div className="h-6 bg-secondary rounded w-24" />
                </div>
              </div>
              <div className="w-8 h-8 bg-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "insights") {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 h-24" />
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 h-28" />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-6 h-72" />
          <div className="glass-card rounded-2xl p-6 h-72" />
        </div>

        {/* Pattern analysis */}
        <div className="glass-card rounded-2xl p-6 h-48" />
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="animate-pulse space-y-4">
      <div className="glass-card rounded-2xl p-6 h-32" />
      <div className="glass-card rounded-2xl p-6 h-96" />
    </div>
  );
};

export default DashboardSkeleton;
