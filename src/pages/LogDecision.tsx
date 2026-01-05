import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PenLine, Plus, X, Save, Sparkles } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { saveDecision, createRemindersForDecision, Decision } from "@/lib/storage";
import { DecisionTemplate, DEFAULT_TEMPLATES } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Career",
  "Finance",
  "Health",
  "Relationships",
  "Purchase",
  "Education",
  "Travel",
  "Lifestyle",
  "Other",
];

const LogDecision = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [choice, setChoice] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([""]);
  const [category, setCategory] = useState("");
  const [confidence, setConfidence] = useState([70]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [context, setContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null);

  // Load template from navigation state
  useEffect(() => {
    if (location.state?.template) {
      const template = location.state.template as DecisionTemplate;
      setSelectedTemplate(template);
      setTitle(template.titlePlaceholder);
      setChoice(template.choicePlaceholder);
      setAlternatives(template.alternativesPlaceholder.split("\n").filter(Boolean));
      setCategory(template.category);
      setTags(template.tags);
      setContext(template.contextPlaceholder);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAddAlternative = () => {
    setAlternatives([...alternatives, ""]);
  };

  const handleRemoveAlternative = (index: number) => {
    if (alternatives.length > 1) {
      setAlternatives(alternatives.filter((_, i) => i !== index));
    }
  };

  const handleAlternativeChange = (index: number, value: string) => {
    const newAlternatives = [...alternatives];
    newAlternatives[index] = value;
    setAlternatives(newAlternatives);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !choice.trim() || !category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the title, your choice, and category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const decision: Decision = {
        id: Date.now().toString(),
        title: title.trim(),
        choice: choice.trim(),
        alternatives: alternatives.filter((a) => a.trim()),
        category,
        confidence: confidence[0],
        tags,
        context: context.trim(),
        createdAt: new Date().toISOString(),
        outcomes: [],
      };

      await saveDecision(decision);
      await createRemindersForDecision(decision);

      toast({
        title: "Decision logged! 🎉",
        description: "Your digital twin is learning from your choices.",
      });

      navigate("/dashboard", { state: { showSuccess: true } });
    } catch (error) {
      console.error("Failed to save decision:", error);
      toast({
        title: "Failed to save decision",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <PenLine className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Log a Decision</h1>
              <p className="text-muted-foreground">Record your choice and let your twin learn</p>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="mb-6">
            <Label className="text-sm text-muted-foreground mb-2 block">Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TEMPLATES.slice(0, 5).map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setTitle(template.titlePlaceholder);
                    setChoice(template.choicePlaceholder);
                    setAlternatives(template.alternativesPlaceholder.split("\n").filter(Boolean));
                    setCategory(template.category);
                    setTags(template.tags);
                    setContext(template.contextPlaceholder);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedTemplate?.id === template.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {template.icon} {template.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Decision Title *</Label>
              <Input
                id="title"
                placeholder="What decision did you make?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary"
              />
            </div>

            {/* Choice */}
            <div className="space-y-2">
              <Label htmlFor="choice">Your Choice *</Label>
              <Textarea
                id="choice"
                placeholder="What did you decide to do?"
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
                className="bg-secondary min-h-[80px]"
              />
            </div>

            {/* Alternatives */}
            <div className="space-y-2">
              <Label>Alternatives Considered</Label>
              {alternatives.map((alt, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Alternative ${index + 1}`}
                    value={alt}
                    onChange={(e) => handleAlternativeChange(index, e.target.value)}
                    className="bg-secondary"
                  />
                  {alternatives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAlternative(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAlternative}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Alternative
              </Button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Confidence */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Confidence Level</Label>
                <span className="text-sm font-medium gradient-text">{confidence[0]}%</span>
              </div>
              <Slider
                value={confidence}
                onValueChange={setConfidence}
                max={100}
                step={5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                How confident are you in this decision?
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="bg-secondary"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor="context">Context & Notes</Label>
              <Textarea
                id="context"
                placeholder="Any additional context, thoughts, or factors that influenced your decision..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="bg-secondary min-h-[100px]"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Log Decision
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LogDecision;
