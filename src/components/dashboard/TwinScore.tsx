import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TwinScoreProps {
  score: number;
}

const TwinScore = ({ score }: TwinScoreProps) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreMessage = () => {
    if (score < 20) return "Just getting started! Log more decisions.";
    if (score < 50) return "Building up! Your twin is learning.";
    if (score < 80) return "Strong profile! Great decision patterns.";
    return "Master level! Your twin knows you well.";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative w-32 h-32 cursor-help hover:scale-105 transition-transform">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--gradient-start))" />
                <stop offset="100%" stopColor="hsl(var(--gradient-end))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold gradient-text">{score}%</span>
            <span className="text-xs text-muted-foreground">Twin Score</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="font-medium mb-1">Twin Score: {score}%</p>
        <p className="text-xs text-muted-foreground">
          {getScoreMessage()} Score = decisions logged / 50 (max 100%).
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TwinScore;
