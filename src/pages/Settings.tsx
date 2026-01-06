import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Brain,
  Shield,
  Bell,
  Palette,
  Info,
  Trash2,
  Download,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Target,
  Eye,
  Clock,
  Sun,
  Moon,
  Monitor,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Share2,
  Link,
  FileText,
  Lightbulb,
  TrendingUp,
  Rewind,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSettings, saveSettings, AppSettings, getDefaultSettings } from "@/lib/settings";
import { getAllDecisions } from "@/lib/storage";
import { getSharingSettings, saveSharingSettings, SharingSettings, getSharedDecisions, cleanupExpiredShares } from "@/lib/sharing";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    enabled: false,
    defaultShareType: "summary",
    defaultExpireDays: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [decisionCount, setDecisionCount] = useState(0);
  const [activeSharesCount, setActiveSharesCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const [loadedSettings, decisions, loadedSharingSettings, sharedDecisions] = await Promise.all([
        getSettings(),
        getAllDecisions(),
        getSharingSettings(),
        getSharedDecisions(),
      ]);
      setSettings(loadedSettings);
      setDecisionCount(decisions.length);
      setSharingSettings(loadedSharingSettings);
      // Count active (non-expired, non-revoked) shares
      const now = new Date();
      const active = sharedDecisions.filter(s => !s.revoked && new Date(s.expiresAt) > now);
      setActiveSharesCount(active.length);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = await saveSettings({ [key]: value });
    setSettings(updated);
    toast({
      title: "Settings updated",
      description: "Your changes have been saved",
    });
  };

  const updateSharingSetting = async <K extends keyof SharingSettings>(key: K, value: SharingSettings[K]) => {
    const updated = await saveSharingSettings({ [key]: value });
    setSharingSettings(updated);
    toast({
      title: "Sharing settings updated",
      description: "Your changes have been saved",
    });
  };

  const handleCleanupShares = async () => {
    const removed = await cleanupExpiredShares();
    toast({
      title: "Cleanup complete",
      description: `Removed ${removed} expired share links`,
    });
    // Refresh count
    const sharedDecisions = await getSharedDecisions();
    const now = new Date();
    const active = sharedDecisions.filter(s => !s.revoked && new Date(s.expiresAt) > now);
    setActiveSharesCount(active.length);
  };

  const handleClearAllData = async () => {
    // Clear all localStorage items related to the app
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("decision:") || key === "reminders" || key === "insights" || key === "decision_draft") {
        localStorage.removeItem(key);
      }
    }

    // Also try window.storage if available
    if (window.storage?.keys && window.storage?.remove) {
      const storageKeys = await window.storage.keys();
      for (const key of storageKeys) {
        if (key.startsWith("decision:") || key === "reminders" || key === "insights" || key === "decision_draft") {
          await window.storage.remove(key);
        }
      }
    }

    toast({
      title: "All data cleared",
      description: "Your decisions, outcomes, and insights have been deleted",
      variant: "destructive",
    });

    setDecisionCount(0);
    navigate("/dashboard");
  };

  const handleExportData = () => {
    // Trigger the export modal from header
    toast({
      title: "Export data",
      description: "Use the download button in the header to export your data",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="container max-w-4xl py-8 px-4 space-y-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
            <p className="text-muted-foreground mt-1">Customize your Digital Twin experience</p>
          </div>

          {/* Twin Personality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Twin Personality
              </CardTitle>
              <CardDescription>Configure how your Digital Twin communicates with you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Tone
                </Label>
                <RadioGroup
                  value={settings.tone}
                  onValueChange={(v) => updateSetting("tone", v as AppSettings["tone"])}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {[
                    { value: "encouraging", label: "Encouraging", icon: "💪" },
                    { value: "honest", label: "Honest", icon: "🎯" },
                    { value: "analytical", label: "Analytical", icon: "🧠" },
                    { value: "friendly", label: "Friendly", icon: "😊" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        settings.tone === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Advice Style
                </Label>
                <RadioGroup
                  value={settings.adviceStyle}
                  onValueChange={(v) => updateSetting("adviceStyle", v as AppSettings["adviceStyle"])}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { value: "direct", label: "Direct", desc: "Clear, actionable advice" },
                    { value: "exploratory", label: "Exploratory", desc: "Questions to guide thinking" },
                    { value: "balanced", label: "Balanced", desc: "Mix of both approaches" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`style-${option.value}`}
                      className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                        settings.adviceStyle === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={`style-${option.value}`} className="sr-only" />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Show Confidence Scores
                  </Label>
                  <p className="text-sm text-muted-foreground">Display confidence levels in advice</p>
                </div>
                <Switch
                  checked={settings.showConfidenceScores}
                  onCheckedChange={(v) => updateSetting("showConfidenceScores", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Advanced AI Features
              </CardTitle>
              <CardDescription>Enable AI-powered decision analysis and predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Enable Advanced AI
                  </Label>
                  <p className="text-sm text-muted-foreground">Use AI to analyze your decisions and provide insights</p>
                </div>
                <Switch
                  checked={settings.advancedAI}
                  onCheckedChange={(v) => updateSetting("advancedAI", v)}
                />
              </div>

              {settings.advancedAI && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <p className="text-sm font-medium">Choose which AI features to enable:</p>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Impact Predictor
                        </Label>
                        <p className="text-xs text-muted-foreground">Predict outcomes when logging decisions</p>
                      </div>
                      <Switch
                        checked={settings.showImpactPredictor}
                        onCheckedChange={(v) => updateSetting("showImpactPredictor", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Alternative Suggester
                        </Label>
                        <p className="text-xs text-muted-foreground">Get AI-suggested alternatives for decisions</p>
                      </div>
                      <Switch
                        checked={settings.showAlternativeSuggester}
                        onCheckedChange={(v) => updateSetting("showAlternativeSuggester", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Bias Detector
                        </Label>
                        <p className="text-xs text-muted-foreground">Analyze patterns and blind spots in your decisions</p>
                      </div>
                      <Switch
                        checked={settings.showBiasDetector}
                        onCheckedChange={(v) => updateSetting("showBiasDetector", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Rewind className="w-4 h-4" />
                          Decision Replay
                        </Label>
                        <p className="text-xs text-muted-foreground">"What if?" simulator for past decisions</p>
                      </div>
                      <Switch
                        checked={settings.showDecisionReplay}
                        onCheckedChange={(v) => updateSetting("showDecisionReplay", v)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy & Data
              </CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-delete Old Decisions</Label>
                  <p className="text-sm text-muted-foreground">Automatically remove decisions after a period</p>
                </div>
                <Select
                  value={settings.autoDeleteOldDecisions}
                  onValueChange={(v) => updateSetting("autoDeleteOldDecisions", v as AppSettings["autoDeleteOldDecisions"])}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="1year">After 1 year</SelectItem>
                    <SelectItem value="2years">After 2 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="gap-2" onClick={handleExportData}>
                  <Download className="w-4 h-4" />
                  Download My Data
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="w-5 h-5" />
                        Delete All Data?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          This action <strong>cannot be undone</strong>. This will permanently delete:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>{decisionCount} decisions and their outcomes</li>
                          <li>All generated insights</li>
                          <li>All follow-up reminders</li>
                          <li>Your Twin's learned patterns</li>
                        </ul>
                        <p className="font-medium text-destructive">
                          Your Digital Twin will have to start learning from scratch.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAllData} className="bg-destructive hover:bg-destructive/90">
                        Yes, Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Sharing
              </CardTitle>
              <CardDescription>Control how you share decisions with friends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Enable Sharing
                  </Label>
                  <p className="text-sm text-muted-foreground">Allow sharing decisions with friends</p>
                </div>
                <Switch
                  checked={sharingSettings.enabled}
                  onCheckedChange={(v) => updateSharingSetting("enabled", v)}
                />
              </div>

              {sharingSettings.enabled && (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Default Share Content
                    </Label>
                    <RadioGroup
                      value={sharingSettings.defaultShareType}
                      onValueChange={(v) => updateSharingSetting("defaultShareType", v as "full" | "summary")}
                      className="grid grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="share-summary"
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          sharingSettings.defaultShareType === "summary"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value="summary" id="share-summary" className="sr-only" />
                        <span className="font-medium">Summary Only</span>
                        <span className="text-xs text-muted-foreground text-center">Hide full context</span>
                      </Label>
                      <Label
                        htmlFor="share-full"
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          sharingSettings.defaultShareType === "full"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value="full" id="share-full" className="sr-only" />
                        <span className="font-medium">Full Context</span>
                        <span className="text-xs text-muted-foreground text-center">Include all details</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Default Link Expiry
                      </Label>
                      <p className="text-sm text-muted-foreground">How long share links stay active</p>
                    </div>
                    <Select
                      value={String(sharingSettings.defaultExpireDays)}
                      onValueChange={(v) => updateSharingSetting("defaultExpireDays", parseInt(v))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                      <p className="font-medium text-sm">Active Share Links</p>
                      <p className="text-xs text-muted-foreground">{activeSharesCount} links currently active</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCleanupShares}>
                      Clean Up Expired
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Configure reminders and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Outcome Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to log how decisions turned out</p>
                </div>
                <Switch
                  checked={settings.outcomeReminders}
                  onCheckedChange={(v) => updateSetting("outcomeReminders", v)}
                />
              </div>

              {settings.outcomeReminders && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Reminder Timing
                      </Label>
                      <p className="text-sm text-muted-foreground">When to send follow-up reminders</p>
                    </div>
                    <Select
                      value={settings.reminderTiming}
                      onValueChange={(v) => updateSetting("reminderTiming", v as AppSettings["reminderTiming"])}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1day">After 1 day</SelectItem>
                        <SelectItem value="3days">After 3 days</SelectItem>
                        <SelectItem value="1week">After 1 week</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.reminderTiming === "custom" && (
                    <div className="flex items-center gap-3 pl-6">
                      <Input
                        type="number"
                        min={1}
                        max={90}
                        value={settings.customReminderDays || 7}
                        onChange={(e) => updateSetting("customReminderDays", parseInt(e.target.value) || 7)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">days after decision</span>
                    </div>
                  )}
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Logging Reminder</Label>
                  <p className="text-sm text-muted-foreground">Remind me to log decisions daily</p>
                </div>
                <Switch
                  checked={settings.dailyLoggingReminder}
                  onCheckedChange={(v) => updateSetting("dailyLoggingReminder", v)}
                />
              </div>

              {settings.dailyLoggingReminder && (
                <div className="flex items-center gap-3 pl-6">
                  <Label>Reminder time:</Label>
                  <Input
                    type="time"
                    value={settings.dailyLoggingReminderTime}
                    onChange={(e) => updateSetting("dailyLoggingReminderTime", e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Display
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <RadioGroup
                  value={settings.theme}
                  onValueChange={(v) => updateSetting("theme", v as AppSettings["theme"])}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "auto", label: "System", icon: Monitor },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`theme-${option.value}`}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        settings.theme === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={`theme-${option.value}`} className="sr-only" />
                      <option.icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">Show more content with less spacing</p>
                </div>
                <Switch
                  checked={settings.compactView}
                  onCheckedChange={(v) => updateSetting("compactView", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Default Chart Type</Label>
                  <p className="text-sm text-muted-foreground">Preferred chart style for insights</p>
                </div>
                <Select
                  value={settings.defaultChartType}
                  onValueChange={(v) => updateSetting("defaultChartType", v as AppSettings["defaultChartType"])}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Bar Chart
                      </span>
                    </SelectItem>
                    <SelectItem value="line">
                      <span className="flex items-center gap-2">
                        <LineChart className="w-4 h-4" /> Line Chart
                      </span>
                    </SelectItem>
                    <SelectItem value="pie">
                      <span className="flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> Pie Chart
                      </span>
                    </SelectItem>
                    <SelectItem value="area">
                      <span className="flex items-center gap-2">
                        <AreaChart className="w-4 h-4" /> Area Chart
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                About
              </CardTitle>
              <CardDescription>App information and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Digital Twin</p>
                    <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">What is Twin Score?</h4>
                <p className="text-sm text-muted-foreground">
                  Your Twin Score reflects how well your Digital Twin knows you. It's calculated based on:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Number of decisions logged</li>
                  <li>Outcomes recorded</li>
                  <li>Consistency of decision-making patterns</li>
                  <li>Variety of categories covered</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  The higher your score, the more personalized and accurate your Twin's advice becomes.
                </p>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}>
                    <ExternalLink className="w-4 h-4" />
                    View User Guide
                  </a>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <a href="#" onClick={(e) => { e.preventDefault(); toast({ title: "FAQ", description: "Coming soon!" }); }}>
                    <ExternalLink className="w-4 h-4" />
                    Frequently Asked Questions
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </DashboardLayout>
  );
};

export default Settings;
