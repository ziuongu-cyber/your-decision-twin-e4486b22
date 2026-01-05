import { Decision } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, Target, FileText, CheckCircle, Star } from "lucide-react";
import { format } from "date-fns";

interface DecisionDetailModalProps {
  decision: Decision | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOutcome?: (decision: Decision) => void;
}

const DecisionDetailModal = ({
  decision,
  open,
  onOpenChange,
  onAddOutcome,
}: DecisionDetailModalProps) => {
  if (!decision) return null;

  const hasOutcome = decision.outcomes.length > 0;
  const avgRating = hasOutcome
    ? decision.outcomes.reduce((sum, o) => sum + o.rating, 0) / decision.outcomes.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{decision.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(decision.createdAt), "MMM d, yyyy")}
            </span>
            <Badge variant="secondary">{decision.category}</Badge>
            <span className="gradient-text font-medium">
              {decision.confidence}% confident
            </span>
          </div>

          {/* Choice */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              Your Choice
            </h4>
            <p className="text-muted-foreground">{decision.choice}</p>
          </div>

          {/* Alternatives */}
          {decision.alternatives.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Alternatives Considered</h4>
              <ul className="space-y-1">
                {decision.alternatives.map((alt, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {decision.tags.length > 0 && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-primary" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {decision.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Context */}
          {decision.context && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                Context & Notes
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {decision.context}
              </p>
            </div>
          )}

          {/* Outcomes */}
          {hasOutcome ? (
            <div className="glass-card rounded-xl p-4">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Outcome Recorded
              </h4>
              <div className="space-y-3">
                {decision.outcomes.map((outcome, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.ceil(outcome.rating / 2)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(outcome.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    {outcome.reflection && (
                      <p className="text-sm text-muted-foreground">{outcome.reflection}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            onAddOutcome && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onAddOutcome(decision)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Add Outcome
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DecisionDetailModal;
