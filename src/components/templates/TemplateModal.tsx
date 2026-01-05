import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, Trash2 } from "lucide-react";
import { getAllTemplates, deleteCustomTemplate, DecisionTemplate } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: DecisionTemplate) => void;
}

const TemplateModal = ({ open, onOpenChange, onSelect }: TemplateModalProps) => {
  const [templates, setTemplates] = useState<DecisionTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      const allTemplates = await getAllTemplates();
      setTemplates(allTemplates);
    };
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCustomTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast({
        title: "Template deleted",
        description: "The template has been removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleSelect = (template: DecisionTemplate) => {
    onSelect(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className="w-full glass-card rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {template.category}
                      </p>
                    </div>
                  </div>
                  {(template as any).isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(template.id, e)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No templates found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateModal;
