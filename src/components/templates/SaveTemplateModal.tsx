import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Sparkles } from "lucide-react";
import { saveCustomTemplate, DecisionTemplate } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateData: {
    titlePlaceholder: string;
    choicePlaceholder: string;
    alternativesPlaceholder: string;
    category: string;
    tags: string[];
    contextPlaceholder: string;
  };
}

const EMOJI_OPTIONS = ["📋", "💼", "💰", "❤️", "🏠", "🎓", "✈️", "🎯", "💡", "⚡"];

const SaveTemplateModal = ({
  open,
  onOpenChange,
  templateData,
}: SaveTemplateModalProps) => {
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📋");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your template.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const template: DecisionTemplate = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        icon: selectedEmoji,
        category: templateData.category || "Other",
        tags: templateData.tags,
        titlePlaceholder: templateData.titlePlaceholder,
        choicePlaceholder: templateData.choicePlaceholder,
        alternativesPlaceholder: templateData.alternativesPlaceholder,
        contextPlaceholder: templateData.contextPlaceholder,
      };

      await saveCustomTemplate(template);

      toast({
        title: "Template saved! 🎉",
        description: "You can now use this template for future decisions.",
      });

      setName("");
      setSelectedEmoji("📋");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to save template",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedEmoji("📋");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="My Custom Template"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label>Choose an Icon</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? "bg-primary text-primary-foreground scale-110"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-lg p-3 text-sm text-muted-foreground">
            <p>
              This template will save your current form structure including
              category and tags.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="hero" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTemplateModal;
