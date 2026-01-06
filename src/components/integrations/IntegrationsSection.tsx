import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Webhook,
  Calendar,
  FileText,
  Upload,
  Download,
  ExternalLink,
  BookOpen,
  Loader2,
  CheckCircle,
  FileSpreadsheet,
  Wand2,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllDecisions, Decision, saveDecision } from "@/lib/storage";
import {
  getIntegrationSettings,
  saveIntegrationSettings,
  IntegrationSettings,
  exportToNotion,
  generateICSEvents,
  exportToJournalFormat,
  downloadFile,
  downloadAllJournalEntries,
  parseCSV,
  ParsedDecision,
  JournalFormat,
} from "@/lib/integrations";
import { supabase } from "@/integrations/supabase/client";
import { getSettings } from "@/lib/settings";

export function IntegrationsSection() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<IntegrationSettings>({
    webhookUrl: "",
    webhookEnabled: false,
  });
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [textToParse, setTextToParse] = useState("");
  const [parsedPreview, setParsedPreview] = useState<ParsedDecision[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [integrationSettings, allDecisions] = await Promise.all([
        getIntegrationSettings(),
        getAllDecisions(),
      ]);
      setSettings(integrationSettings);
      setDecisions(allDecisions);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSettingChange = async <K extends keyof IntegrationSettings>(
    key: K,
    value: IntegrationSettings[K]
  ) => {
    const updated = await saveIntegrationSettings({ [key]: value });
    setSettings(updated);
    toast({
      title: "Settings saved",
      description: "Integration settings have been updated.",
    });
  };

  // Export handlers
  const handleNotionExport = () => {
    setIsExporting(true);
    try {
      const markdown = exportToNotion(decisions);
      downloadFile(markdown, "decisions-notion-export.md", "text/markdown");
      toast({
        title: "Export complete",
        description: "Notion-formatted markdown has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate Notion export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCalendarExport = () => {
    setIsExporting(true);
    try {
      const ics = generateICSEvents(decisions);
      downloadFile(ics, "decision-reviews.ics", "text/calendar");
      toast({
        title: "Calendar export complete",
        description: "ICS file downloaded. Import it into your calendar app.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate calendar events.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleJournalExport = (format: JournalFormat) => {
    setIsExporting(true);
    try {
      if (decisions.length === 1) {
        const { filename, content } = exportToJournalFormat(decisions[0], format);
        const mimeType = format === "dayone" ? "application/json" : "text/markdown";
        downloadFile(content, filename, mimeType);
      } else {
        downloadAllJournalEntries(decisions, format);
      }
      toast({
        title: "Journal export started",
        description: `Downloading ${decisions.length} entries in ${format} format.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate journal export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import handlers
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsed = parseCSV(content);
        setParsedPreview(parsed);
        setShowImportDialog(true);
        toast({
          title: "CSV parsed",
          description: `Found ${parsed.length} decisions. Review and import.`,
        });
      } catch (error) {
        toast({
          title: "Parse failed",
          description: "Could not parse CSV file. Check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTextParse = async () => {
    if (!textToParse.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);
    try {
      const appSettings = await getSettings();
      const { data, error } = await supabase.functions.invoke("decision-ai", {
        body: {
          type: "parse-text",
          textContent: textToParse,
          decisions: [],
          settings: {
            tone: appSettings.tone,
            adviceStyle: appSettings.adviceStyle,
          },
        },
      });

      if (error) throw error;

      const content = data.content || "[]";
      let parsed: ParsedDecision[] = [];
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        toast({
          title: "Parse incomplete",
          description: "AI couldn't extract structured decisions. Try more specific text.",
          variant: "destructive",
        });
        return;
      }

      if (parsed.length > 0) {
        setParsedPreview(parsed);
        setShowImportDialog(true);
        toast({
          title: "Text analyzed",
          description: `AI found ${parsed.length} decisions. Review and import.`,
        });
      } else {
        toast({
          title: "No decisions found",
          description: "AI couldn't identify any decisions in the text.",
        });
      }
    } catch (error) {
      console.error("Text parsing error:", error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportDecisions = async () => {
    let imported = 0;
    for (const parsed of parsedPreview) {
      const decision: Decision = {
        id: `imported-${Date.now()}-${imported}`,
        title: parsed.title,
        choice: parsed.choice,
        category: parsed.category,
        confidence: parsed.confidence,
        alternatives: parsed.alternatives,
        context: parsed.context,
        tags: [...parsed.tags, "imported"],
        createdAt: parsed.date || new Date().toISOString(),
        outcomes: [],
      };
      await saveDecision(decision);
      imported++;
    }

    toast({
      title: "Import complete",
      description: `Successfully imported ${imported} decisions.`,
    });
    setShowImportDialog(false);
    setParsedPreview([]);
    setTextToParse("");
    
    // Refresh decisions list
    const allDecisions = await getAllDecisions();
    setDecisions(allDecisions);
  };

  const testWebhook = async () => {
    if (!settings.webhookUrl) {
      toast({
        title: "No webhook URL",
        description: "Please enter a webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(settings.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          event: "test",
          timestamp: new Date().toISOString(),
          message: "Test from Decision Twin",
        }),
      });
      toast({
        title: "Test sent",
        description: "Webhook test request sent. Check your destination.",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Could not send test request.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Integrations
          </CardTitle>
          <CardDescription>Connect with external tools and export your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-4 mt-4">
              <Accordion type="single" collapsible className="w-full">
                {/* Notion Export */}
                <AccordionItem value="notion">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Send to Notion
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Export your decisions as formatted Markdown, ready to import into Notion.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">How to import to Notion:</h4>
                      <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                        <li>Download the Markdown file below</li>
                        <li>Open Notion and create a new page</li>
                        <li>Type <code className="bg-muted px-1 rounded">/import</code> and select "Markdown"</li>
                        <li>Upload the downloaded file</li>
                        <li>Optionally convert to a database for filtering</li>
                      </ol>
                    </div>
                    <Button onClick={handleNotionExport} disabled={isExporting || decisions.length === 0}>
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      Download for Notion ({decisions.length} decisions)
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Calendar Export */}
                <AccordionItem value="calendar">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Calendar Integration
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Create calendar events for decision follow-ups. Events are scheduled 7 and 30 days after each decision.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">How to add to your calendar:</h4>
                      <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                        <li>Download the .ics file below</li>
                        <li>Open the file with your calendar app (Google Calendar, Apple Calendar, Outlook)</li>
                        <li>Confirm the import when prompted</li>
                        <li>Review events will appear as reminders</li>
                      </ol>
                    </div>
                    <Button onClick={handleCalendarExport} disabled={isExporting || decisions.length === 0}>
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      Download Calendar Events
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Journal Export */}
                <AccordionItem value="journal">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Journal Export
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Export decisions as journal entries compatible with popular journaling apps.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleJournalExport("obsidian")}
                        disabled={isExporting || decisions.length === 0}
                        className="flex-col h-auto py-4"
                      >
                        <span className="font-medium">Obsidian</span>
                        <span className="text-xs text-muted-foreground">Markdown + frontmatter</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleJournalExport("dayone")}
                        disabled={isExporting || decisions.length === 0}
                        className="flex-col h-auto py-4"
                      >
                        <span className="font-medium">Day One</span>
                        <span className="text-xs text-muted-foreground">JSON format</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleJournalExport("markdown")}
                        disabled={isExporting || decisions.length === 0}
                        className="flex-col h-auto py-4"
                      >
                        <span className="font-medium">Plain Markdown</span>
                        <span className="text-xs text-muted-foreground">Universal format</span>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Each decision will be downloaded as a separate file.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import" className="space-y-4 mt-4">
              <Accordion type="single" collapsible className="w-full">
                {/* CSV Import */}
                <AccordionItem value="csv">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Import from CSV
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Import decisions from a spreadsheet. Your CSV should have columns for: title, choice, category, confidence, alternatives (semicolon-separated), context, tags.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">Expected CSV format:</h4>
                      <code className="text-xs block bg-background p-2 rounded overflow-x-auto">
                        title,choice,category,confidence,alternatives,context,tags<br/>
                        "Buy new laptop","MacBook Pro","Finance",75,"Dell XPS;ThinkPad","Need for work","work;tech"
                      </code>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV File
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Text Parse */}
                <AccordionItem value="text">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Import from Text (AI)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Paste journal entries, notes, or any text. AI will extract decisions automatically.
                    </p>
                    <Textarea
                      placeholder="Paste your journal entries, meeting notes, or any text containing decisions..."
                      value={textToParse}
                      onChange={(e) => setTextToParse(e.target.value)}
                      rows={6}
                    />
                    <Button onClick={handleTextParse} disabled={isParsing || !textToParse.trim()}>
                      {isParsing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      Analyze & Extract Decisions
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Webhook className="w-4 h-4" />
                      Enable Webhooks
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send decision data to external services when logged
                    </p>
                  </div>
                  <Switch
                    checked={settings.webhookEnabled}
                    onCheckedChange={(v) => handleSettingChange("webhookEnabled", v)}
                  />
                </div>

                {settings.webhookEnabled && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="webhook-url"
                          placeholder="https://hooks.zapier.com/..."
                          value={settings.webhookUrl}
                          onChange={(e) => handleSettingChange("webhookUrl", e.target.value)}
                        />
                        <Button variant="outline" onClick={testWebhook}>
                          Test
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Works with Zapier, Make, n8n, or any service accepting POST webhooks.
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <h4 className="font-medium text-sm">Webhook payload format:</h4>
                      <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "event": "decision_logged",
  "timestamp": "2024-01-15T10:30:00Z",
  "decision": {
    "id": "...",
    "title": "...",
    "choice": "...",
    "category": "...",
    "confidence": 75
  }
}`}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify({
                            event: "decision_logged",
                            timestamp: "2024-01-15T10:30:00Z",
                            decision: { id: "...", title: "...", choice: "...", category: "...", confidence: 75 }
                          }, null, 2));
                          toast({ title: "Copied to clipboard" });
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy example
                      </Button>
                    </div>

                    <Accordion type="single" collapsible>
                      <AccordionItem value="zapier">
                        <AccordionTrigger className="text-sm">How to set up with Zapier</AccordionTrigger>
                        <AccordionContent>
                          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                            <li>Go to <a href="https://zapier.com" target="_blank" className="text-primary hover:underline">zapier.com</a> and create a new Zap</li>
                            <li>Choose "Webhooks by Zapier" as the trigger</li>
                            <li>Select "Catch Hook" as the trigger event</li>
                            <li>Copy the webhook URL provided by Zapier</li>
                            <li>Paste it in the Webhook URL field above</li>
                            <li>Click "Test" to send a test payload</li>
                            <li>Continue setting up your Zap actions (e.g., add to Google Sheet, send email)</li>
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Import Preview Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Review Import ({parsedPreview.length} decisions)
            </DialogTitle>
            <DialogDescription>
              Review the decisions found and import them to your journal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-4">
            {parsedPreview.map((decision, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-1">
                <div className="font-medium">{decision.title}</div>
                <div className="text-sm text-muted-foreground">{decision.choice}</div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-secondary rounded">{decision.category}</span>
                  <span className="text-muted-foreground">{decision.confidence}% confident</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportDecisions}>
              Import {parsedPreview.length} Decisions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
