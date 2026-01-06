import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  MessageCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getAllDecisions, calculateSuccessRate, Decision } from "@/lib/storage";
import { getSettings, AppSettings } from "@/lib/settings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: "up" | "down";
}

const STARTER_PROMPTS = [
  "Should I invest in this opportunity?",
  "How would I handle a difficult conversation?",
  "What would past-me choose about this purchase?",
  "Am I ready for this big change?",
];

const AskTwin = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [twinScore, setTwinScore] = useState(0);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Load decisions and settings on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [allDecisions, loadedSettings] = await Promise.all([
          getAllDecisions(),
          getSettings(),
        ]);
        setDecisions(allDecisions);
        setSettings(loadedSettings);
        setTwinScore(Math.min(Math.round((allDecisions.length / 50) * 100), 100));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  // Handle prefilled question from navigation state
  useEffect(() => {
    if (location.state?.prefillQuestion) {
      setInput(location.state.prefillQuestion);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAIResponse = async (question: string): Promise<string> => {
    // Check if advanced AI is enabled
    if (!settings?.advancedAI) {
      return generateLocalResponse(question);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/decision-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "chat",
          decisions,
          question,
          settings: {
            tone: settings?.tone || "encouraging",
            adviceStyle: settings?.adviceStyle || "balanced",
            showConfidenceScores: settings?.showConfidenceScores !== false,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("AI response error:", error);
      // Fallback to local response
      return generateLocalResponse(question);
    }
  };

  const generateLocalResponse = (question: string): string => {
    // Simple local AI response based on decisions
    if (decisions.length === 0) {
      return "I don't have enough data about your decision patterns yet. Start by logging some decisions, and I'll be able to give you personalized advice based on your history!";
    }

    const categories = [...new Set(decisions.map(d => d.category))];
    const avgConfidence = Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length);
    const successRate = calculateSuccessRate(decisions);

    return `Based on your ${decisions.length} logged decisions, here's what I can tell you:

**Your Decision Profile:**
- You've made decisions in: ${categories.join(", ")}
- Your average confidence level is ${avgConfidence}%
- Your success rate based on outcomes is ${successRate}%

**My Analysis:**
Looking at "${question}", I notice you tend to ${avgConfidence > 70 ? "be quite confident in your choices" : "carefully consider your options"}. 

${decisions.length >= 5 
  ? `Your most common decision category is "${categories[0]}", which suggests you're often facing choices in this area.`
  : "Log a few more decisions so I can identify your patterns more accurately."}

Would you like me to help you think through this decision step by step?`;
  };

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const responseContent = await generateAIResponse(messageText);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
    );
    toast({
      title: feedback === "up" ? "Thanks for the feedback! 👍" : "Thanks for letting us know 👎",
      description: "This helps your Twin learn better.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
                <Brain className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ask Your Digital Twin</h1>
                <p className="text-muted-foreground">
                  Get personalized advice based on your decision patterns
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xl font-bold">{twinScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Twin Score</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-primary">
                  <Target className="w-4 h-4" />
                  <span className="text-xl font-bold">{decisions.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Decisions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass-card rounded-2xl p-4 mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">What's on your mind?</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Your Digital Twin can analyze your past decisions to help you make better choices.
                  Try one of these prompts to get started:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      disabled={isLoading}
                      className="glass-card rounded-xl p-4 text-left text-sm hover:bg-secondary/50 hover:border-primary/30 border border-transparent transition-all duration-200 group"
                    >
                      <MessageCircle className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "glass-card"
                      )}
                    >
                      {message.role === "assistant" && isLoading && message.content === "" ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Twin is thinking</span>
                          <span className="animate-pulse">...</span>
                        </div>
                      ) : (
                        <>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          {message.role === "assistant" && message.content && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                              <span className="text-xs text-muted-foreground mr-2">
                                Was this helpful?
                              </span>
                              <button
                                onClick={() => handleFeedback(message.id, "up")}
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  message.feedback === "up"
                                    ? "bg-green-500/20 text-green-400"
                                    : "hover:bg-secondary text-muted-foreground"
                                )}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, "down")}
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  message.feedback === "down"
                                    ? "bg-red-500/20 text-red-400"
                                    : "hover:bg-secondary text-muted-foreground"
                                )}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your Digital Twin anything..."
              className="min-h-[56px] max-h-32 resize-none bg-secondary border-border/50"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="h-14 px-6 gradient-bg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Your Twin analyzes {decisions.length} past decision{decisions.length !== 1 ? "s" : ""} to give personalized advice
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskTwin;
