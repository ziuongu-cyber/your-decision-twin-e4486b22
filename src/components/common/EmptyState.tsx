import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: "default" | "hero" | "outline";
  };
  className?: string;
  children?: ReactNode;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) => {
  const ActionIcon = action?.icon;

  return (
    <div className={cn("glass-card rounded-2xl p-12 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <Button
          variant={action.variant || "hero"}
          size="lg"
          onClick={action.onClick}
        >
          {ActionIcon && <ActionIcon className="w-5 h-5" />}
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
