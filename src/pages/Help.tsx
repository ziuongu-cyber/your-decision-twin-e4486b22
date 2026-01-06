import { useState } from "react";
import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageSquare, BookOpen, Lightbulb, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "Getting Started",
    question: "What is Digital Twin?",
    answer: "Digital Twin is an AI-powered decision tracking app that learns from your choices to help you make better decisions. It tracks your decisions, analyzes patterns, and provides personalized insights.",
  },
  {
    category: "Getting Started",
    question: "How do I log my first decision?",
    answer: "Click the '+' button or 'Log Decision' in the navigation. Fill in your decision title, what you chose, any alternatives you considered, and your confidence level. Then click 'Log Decision' to save it.",
  },
  {
    category: "Getting Started",
    question: "What should I log?",
    answer: "Log any decision you want to track and learn from—career choices, purchases, health decisions, relationship decisions, or anything else. The more you log, the better your Digital Twin understands your patterns.",
  },
  {
    category: "Features",
    question: "How does Ask Your Twin work?",
    answer: "Ask Your Twin uses AI to analyze your past decisions and provide personalized advice. It looks at your decision patterns, what worked well, and your preferences to give relevant recommendations.",
  },
  {
    category: "Features",
    question: "What are Weekly Reviews?",
    answer: "Weekly Reviews summarize your decision-making for the week. They include the number of decisions made, confidence trends, AI-generated reflection questions, and space to set goals for the next week.",
  },
  {
    category: "Features",
    question: "How do I track outcomes?",
    answer: "After making a decision, come back later to record the outcome. Click on any decision in your History, then click 'Add Outcome' to rate how it turned out and reflect on what you learned.",
  },
  {
    category: "Features",
    question: "What do the insights show?",
    answer: "Insights analyze your decision patterns—which categories you decide on most, your confidence trends over time, success rates by category, and AI-generated pattern recognition.",
  },
  {
    category: "Data & Privacy",
    question: "Where is my data stored?",
    answer: "Your decision data is stored locally on your device by default. This means only you have access to it. When using cloud features, data is encrypted and securely stored.",
  },
  {
    category: "Data & Privacy",
    question: "Can I export my data?",
    answer: "Yes! Go to Settings > Integrations to export your data in various formats including CSV, Markdown, Notion-compatible format, and calendar events.",
  },
  {
    category: "Data & Privacy",
    question: "How do I delete my data?",
    answer: "Go to Settings and scroll to the bottom to find the 'Delete All Data' option. This will permanently remove all your decisions, insights, and settings.",
  },
  {
    category: "Tips",
    question: "How can I get better insights?",
    answer: "Log decisions consistently, add detailed context and alternatives, track outcomes regularly, and use the same categories for similar decisions. The more data, the better the AI recommendations.",
  },
  {
    category: "Tips",
    question: "What are decision templates?",
    answer: "Templates are pre-filled decision forms for common scenarios like job offers, purchases, or health choices. They help you log decisions faster and ensure you consider important factors.",
  },
];

const CATEGORIES = ["Getting Started", "Features", "Data & Privacy", "Tips"];

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesSearch = searchQuery
      ? item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Help & FAQ</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or reach out for support
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/log-decision")}
            className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-center"
          >
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium">Log Decision</span>
          </button>
          <button
            onClick={() => navigate("/ask-twin")}
            className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-center"
          >
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium">Ask Twin</span>
          </button>
          <button
            onClick={() => navigate("/insights")}
            className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-center"
          >
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium">View Insights</span>
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-center"
          >
            <HelpCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium">Contact Us</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <span className="font-medium pr-4">{item.question}</span>
                {expandedItems.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {expandedItems.has(index) && (
                <div className="px-4 pb-4 text-muted-foreground">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No results found for "{searchQuery}"</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Still Need Help */}
        <div className="mt-12 text-center p-6 glass-card rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Send us a message.
          </p>
          <Button onClick={() => navigate("/contact")}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Help;
