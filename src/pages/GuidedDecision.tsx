import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Brain,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  Home,
  RefreshCw,
  Check,
  Star,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getAllDecisions, Decision } from "@/lib/storage";
import { getSettings, AppSettings } from "@/lib/settings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const GUIDED_SESSION_KEY = "guided_session";

interface GuidedQuestion {
  id: string;
  question: string;
  placeholder: string;
}

interface GuidedOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface GuidedSession {
  step: number;
  decisionQuestion: string;
  questions: GuidedQuestion[];
  answers: Record<string, string>;
  options: GuidedOption[];
  ratings: Record<string, number>;
  recommendation: string;
  savedAt: string;
}

type Step = "question" | "clarifying" | "options" | "rating" | "recommendation";

const STEPS: Step[] = ["question", "clarifying", "options", "rating", "recommendation"];

const GuidedDecision = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>("question");
  const [decisionQuestion, setDecisionQuestion] = useState("");
  const [questions, setQuestions] = useState<GuidedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<GuidedOption[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [recommendation, setRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Load decisions and settings
  useEffect(() => {
    const loadData = async () => {
      const [allDecisions, loadedSettings] = await Promise.all([
        getAllDecisions(),
        getSettings(),
      ]);
      setDecisions(allDecisions);
      setSettings(loadedSettings);
    };
    loadData();
  }, []);

  // Check for saved session
  useEffect(() => {
    const checkSavedSession = async () => {
      try {
        let savedSession: string | null = null;
        if (window.storage?.get) {
          savedSession = await window.storage.get(GUIDED_SESSION_KEY);
        } else {
          savedSession = localStorage.getItem(GUIDED_SESSION_KEY);
        }
        
        if (savedSession) {
          setShowResumeDialog(true);
        }
      } catch (error) {
        console.error("Failed to check saved session:", error);
      }
    };
    checkSavedSession();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStep, currentQuestionIndex]);

  // Save session
  const saveSession = async () => {
    const session: GuidedSession = {
      step: STEPS.indexOf(currentStep),
      decisionQuestion,
      questions,
      answers,
      options,
      ratings,
      recommendation,
      savedAt: new Date().toISOString(),
    };

    try {
      const data = JSON.stringify(session);
      if (window.storage?.set) {
        await window.storage.set(GUIDED_SESSION_KEY, data);
      } else {
        localStorage.setItem(GUIDED_SESSION_KEY, data);
      }
      toast({
        title: "Session saved",
        description: "You can resume this later from the dashboard.",
      });
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  // Load saved session
  const loadSession = async () => {
    try {
      let savedSession: string | null = null;
      if (window.storage?.get) {
        savedSession = await window.storage.get(GUIDED_SESSION_KEY);
      } else {
        savedSession = localStorage.getItem(GUIDED_SESSION_KEY);
      }

      if (savedSession) {
        const session: GuidedSession = JSON.parse(savedSession);
        setDecisionQuestion(session.decisionQuestion);
        setQuestions(session.questions);
        setAnswers(session.answers);
        setOptions(session.options);
        setRatings(session.ratings);
        setRecommendation(session.recommendation);
        setCurrentStep(STEPS[session.step] || "question");
        setShowResumeDialog(false);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  // Clear session
  const clearSession = async () => {
    try {
      if (window.storage?.remove) {
        await window.storage.remove(GUIDED_SESSION_KEY);
      } else {
        localStorage.removeItem(GUIDED_SESSION_KEY);
      }
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  };

  // Start fresh
  const startFresh = () => {
    clearSession();
    setDecisionQuestion("");
    setQuestions([]);
    setAnswers({});
    setOptions([]);
    setRatings({});
    setRecommendation("");
    setCurrentStep("question");
    setCurrentQuestionIndex(0);
    setShowResumeDialog(false);
  };

  // AI API call
  const callAI = async (type: string, extraData: Record<string, unknown> = {}) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/decision-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        type,
        decisions,
        question: decisionQuestion,
        settings: {
          tone: settings?.tone || "encouraging",
          adviceStyle: settings?.adviceStyle || "balanced",
          showConfidenceScores: settings?.showConfidenceScores !== false,
        },
        ...extraData,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to get AI response");
    }

    return response.json();
  };

  // Handle decision question submit
  const handleQuestionSubmit = async () => {
    if (!decisionQuestion.trim()) return;

    setIsLoading(true);
    try {
      const data = await callAI("guided-questions");
      
      // Parse JSON response
      let parsedQuestions: GuidedQuestion[];
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch {
        // Fallback questions if AI fails
        parsedQuestions = [
          { id: "1", question: "What's most important to you about this decision?", placeholder: "e.g., financial security, personal growth, relationships..." },
          { id: "2", question: "What's your timeline for making this decision?", placeholder: "e.g., this week, this month, no rush..." },
          { id: "3", question: "What constraints or limitations do you have?", placeholder: "e.g., budget, location, time..." },
          { id: "4", question: "Who else is affected by this decision?", placeholder: "e.g., family, team, just me..." },
        ];
      }

      setQuestions(parsedQuestions);
      setCurrentStep("clarifying");
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error getting questions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer submit
  const handleAnswerSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id] || "";

    if (!answer.trim()) {
      toast({
        title: "Please provide an answer",
        description: "Your answer helps the AI understand your needs better.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, generate options
      setIsLoading(true);
      try {
        const guidedAnswers = questions.map(q => ({
          question: q.question,
          answer: answers[q.id] || "",
        }));

        const data = await callAI("guided-options", { guidedAnswers });

        let parsedOptions: GuidedOption[];
        try {
          const jsonMatch = data.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            parsedOptions = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found");
          }
        } catch {
          // Fallback options
          parsedOptions = [
            { id: "1", title: "Option A", description: "The first approach based on your inputs", pros: ["Aligns with your values"], cons: ["May require adjustment"] },
            { id: "2", title: "Option B", description: "An alternative approach", pros: ["Different perspective"], cons: ["May not fit all constraints"] },
            { id: "3", title: "Option C", description: "A balanced middle ground", pros: ["Combines benefits"], cons: ["May compromise on some aspects"] },
          ];
        }

        setOptions(parsedOptions);
        // Initialize ratings
        const initialRatings: Record<string, number> = {};
        parsedOptions.forEach(opt => { initialRatings[opt.id] = 5; });
        setRatings(initialRatings);
        setCurrentStep("options");
      } catch (error) {
        console.error("Error getting options:", error);
        toast({
          title: "Error",
          description: "Failed to generate options. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle go back in questions
  const handleGoBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle options to rating
  const handleProceedToRating = () => {
    setCurrentStep("rating");
  };

  // Handle rating submit
  const handleRatingSubmit = async () => {
    setIsLoading(true);
    try {
      const guidedAnswers = questions.map(q => ({
        question: q.question,
        answer: answers[q.id] || "",
      }));

      const optionRatings = options.map(opt => ({
        option: opt.title,
        rating: ratings[opt.id] || 5,
      }));

      const data = await callAI("guided-recommendation", { guidedAnswers, optionRatings });
      setRecommendation(data.content);
      setCurrentStep("recommendation");
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save as decision
  const handleSaveAsDecision = async () => {
    await clearSession();
    
    // Build context from answers
    const contextParts = questions.map(q => `${q.question}\n${answers[q.id] || "No answer"}`);
    const alternativesFromOptions = options.map(o => o.title);
    
    // Find highest rated option
    let highestRatedOption = options[0];
    let highestRating = 0;
    options.forEach(opt => {
      if (ratings[opt.id] > highestRating) {
        highestRating = ratings[opt.id];
        highestRatedOption = opt;
      }
    });

    navigate("/log-decision", {
      state: {
        prefill: {
          title: decisionQuestion,
          choice: highestRatedOption?.title || "",
          alternatives: alternativesFromOptions.filter(a => a !== highestRatedOption?.title),
          context: `${contextParts.join("\n\n")}\n\n---\nAI Recommendation:\n${recommendation}`,
          confidence: highestRating * 10,
        },
      },
    });
  };

  // Calculate progress
  const getProgress = () => {
    const stepIndex = STEPS.indexOf(currentStep);
    if (currentStep === "clarifying" && questions.length > 0) {
      const questionProgress = (currentQuestionIndex + 1) / questions.length;
      return ((stepIndex + questionProgress) / STEPS.length) * 100;
    }
    return ((stepIndex + 1) / STEPS.length) * 100;
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case "question": return "Step 1: What's your decision?";
      case "clarifying": return `Step 2: Question ${currentQuestionIndex + 1} of ${questions.length}`;
      case "options": return "Step 3: Review your options";
      case "rating": return "Step 4: Rate each option";
      case "recommendation": return "Step 5: AI Recommendation";
      default: return "";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Guided Decision Mode</h1>
                <p className="text-sm text-muted-foreground">{getStepLabel()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={saveSession}>
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowExitDialog(true)}>
                <Home className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1 glass-card rounded-2xl p-4">
          <div className="space-y-4 pb-4">
            {/* Step 1: Decision Question */}
            {currentStep === "question" && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1">
                    <p className="text-sm">
                      Hi! I'm here to help you think through a decision step by step. 
                      What decision are you trying to make?
                    </p>
                  </div>
                </div>

                <div className="pl-13 space-y-3">
                  <Textarea
                    value={decisionQuestion}
                    onChange={(e) => setDecisionQuestion(e.target.value)}
                    placeholder="e.g., Should I accept this job offer? Should I move to a new city?"
                    className="min-h-[100px] bg-secondary"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleQuestionSubmit}
                    disabled={!decisionQuestion.trim() || isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating questions...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Start Guided Mode
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Clarifying Questions */}
            {currentStep === "clarifying" && questions.length > 0 && (
              <div className="space-y-4">
                {/* Show decision as user message */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                    <p className="text-sm">{decisionQuestion}</p>
                  </div>
                </div>

                {/* Show answered questions */}
                {questions.slice(0, currentQuestionIndex).map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">{i + 1}</span>
                      </div>
                      <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1">
                        <p className="text-sm">{q.question}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                        <p className="text-sm">{answers[q.id]}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Current question */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">{currentQuestionIndex + 1}</span>
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1">
                      <p className="text-sm">{questions[currentQuestionIndex].question}</p>
                    </div>
                  </div>

                  <div className="pl-13 space-y-3">
                    <Textarea
                      value={answers[questions[currentQuestionIndex].id] || ""}
                      onChange={(e) => setAnswers({
                        ...answers,
                        [questions[currentQuestionIndex].id]: e.target.value,
                      })}
                      placeholder={questions[currentQuestionIndex].placeholder}
                      className="min-h-[80px] bg-secondary"
                      disabled={isLoading}
                    />
                    <div className="flex gap-2">
                      {currentQuestionIndex > 0 && (
                        <Button variant="outline" onClick={handleGoBack}>
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Back
                        </Button>
                      )}
                      <Button 
                        onClick={handleAnswerSubmit}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {currentQuestionIndex === questions.length - 1 ? "Generating options..." : "Processing..."}
                          </>
                        ) : currentQuestionIndex === questions.length - 1 ? (
                          <>
                            Generate Options
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Options */}
            {currentStep === "options" && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1">
                    <p className="text-sm">
                      Based on your answers, here are some options to consider. 
                      Review each one, then rate them on the next step.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {options.map((option, i) => (
                    <Card key={option.id} className="border-primary/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                            {i + 1}
                          </span>
                          {option.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-green-500 mb-1">Pros</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {option.pros.map((pro, j) => (
                                <li key={j} className="flex items-start gap-1">
                                  <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-orange-500 mb-1">Cons</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {option.cons.map((con, j) => (
                                <li key={j} className="flex items-start gap-1">
                                  <span className="text-orange-500 shrink-0">•</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button onClick={handleProceedToRating} className="w-full">
                  Rate These Options
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 4: Rating */}
            {currentStep === "rating" && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1">
                    <p className="text-sm">
                      Rate each option from 1-10 based on how appealing it is to you. 
                      Trust your gut!
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {options.map((option) => (
                    <Card key={option.id} className="border-primary/10">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{option.title}</h4>
                          <span className="text-2xl font-bold gradient-text">
                            {ratings[option.id] || 5}
                          </span>
                        </div>
                        <Slider
                          value={[ratings[option.id] || 5]}
                          onValueChange={([v]) => setRatings({ ...ratings, [option.id]: v })}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Not appealing</span>
                          <span>Very appealing</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  onClick={handleRatingSubmit} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating recommendation...
                    </>
                  ) : (
                    <>
                      Get AI Recommendation
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 5: Recommendation */}
            {currentStep === "recommendation" && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1">
                    <h3 className="font-semibold mb-2 text-primary">AI Recommendation</h3>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: recommendation
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSaveAsDecision} variant="hero" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save as Decision
                  </Button>
                  <Button onClick={startFresh} variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start New Decision
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Guided Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved. You can resume later from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              saveSession();
              navigate("/dashboard");
            }}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Dialog */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Previous Session?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unfinished guided decision session. Would you like to continue where you left off?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={startFresh}>Start Fresh</AlertDialogCancel>
            <AlertDialogAction onClick={loadSession}>Resume</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default GuidedDecision;
