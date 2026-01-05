import { Reminder, getDecision, Decision } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Bell, Clock, CheckCircle, X } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface PendingFollowupsWidgetProps {
  reminders: Reminder[];
  onSnooze: (reminderId: string, days: number) => void;
  onDismiss: (reminderId: string) => void;
  onAddOutcome: (decision: Decision) => void;
}

const PendingFollowupsWidget = ({
  reminders,
  onSnooze,
  onDismiss,
  onAddOutcome,
}: PendingFollowupsWidgetProps) => {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  useEffect(() => {
    const loadDecisions = async () => {
      const decisionMap: Record<string, Decision> = {};
      for (const reminder of reminders) {
        const decision = await getDecision(reminder.decisionId);
        if (decision) {
          decisionMap[reminder.decisionId] = decision;
        }
      }
      setDecisions(decisionMap);
    };
    loadDecisions();
  }, [reminders]);

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        Pending Follow-ups
        <span className="ml-auto text-sm font-normal text-muted-foreground">
          {reminders.length} pending
        </span>
      </h3>

      <div className="space-y-3">
        {reminders.slice(0, 3).map((reminder) => {
          const decision = decisions[reminder.decisionId];
          if (!decision) return null;

          return (
            <div
              key={reminder.id}
              className="bg-secondary/50 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{decision.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onDismiss(reminder.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => onAddOutcome(decision)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Add Outcome
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSnooze(reminder.id, 3)}
                >
                  Snooze 3 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSnooze(reminder.id, 7)}
                >
                  Snooze 1 week
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {reminders.length > 3 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          +{reminders.length - 3} more follow-ups
        </p>
      )}
    </div>
  );
};

export default PendingFollowupsWidget;
