import { Brain, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading your Digital Twin..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      {/* Animated Logo */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 gradient-bg rounded-full animate-pulse" />
        <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-3 h-3 text-accent-foreground" />
        </div>
      </div>

      {/* Loading Text */}
      <h1 className="text-2xl font-bold gradient-text mb-2">Digital Twin</h1>
      <p className="text-muted-foreground text-sm mb-6">{message}</p>

      {/* Loading Bar */}
      <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full gradient-bg animate-loading-bar" />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
            width: 100%;
          }
          50% {
            transform: translateX(0%);
            width: 100%;
          }
          100% {
            transform: translateX(100%);
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
