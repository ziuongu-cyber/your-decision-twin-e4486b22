import { Decision } from "./storage";
import { format } from "date-fns";

// Integration Settings
export interface IntegrationSettings {
  webhookUrl: string;
  webhookEnabled: boolean;
  notionDatabaseId?: string;
}

const INTEGRATION_SETTINGS_KEY = "integration_settings";

const storage = {
  async set(key: string, value: string): Promise<void> {
    if (window.storage?.set) {
      await window.storage.set(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },
  async get(key: string): Promise<string | null> {
    if (window.storage?.get) {
      return await window.storage.get(key);
    }
    return localStorage.getItem(key);
  },
};

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  const data = await storage.get(INTEGRATION_SETTINGS_KEY);
  if (!data) {
    return { webhookUrl: "", webhookEnabled: false };
  }
  try {
    return JSON.parse(data);
  } catch {
    return { webhookUrl: "", webhookEnabled: false };
  }
}

export async function saveIntegrationSettings(settings: Partial<IntegrationSettings>): Promise<IntegrationSettings> {
  const current = await getIntegrationSettings();
  const updated = { ...current, ...settings };
  await storage.set(INTEGRATION_SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// Webhook trigger
export async function triggerWebhook(decision: Decision): Promise<boolean> {
  const settings = await getIntegrationSettings();
  if (!settings.webhookEnabled || !settings.webhookUrl) {
    return false;
  }

  try {
    await fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      body: JSON.stringify({
        event: "decision_logged",
        timestamp: new Date().toISOString(),
        decision: {
          id: decision.id,
          title: decision.title,
          choice: decision.choice,
          category: decision.category,
          confidence: decision.confidence,
          alternatives: decision.alternatives,
          context: decision.context,
          tags: decision.tags,
          createdAt: decision.createdAt,
        },
      }),
    });
    return true;
  } catch (error) {
    console.error("Webhook trigger failed:", error);
    return false;
  }
}

// Export to Notion format (Markdown)
export function exportToNotion(decisions: Decision[]): string {
  let markdown = `# Decision Journal Export\n\n`;
  markdown += `*Exported on ${format(new Date(), "MMMM d, yyyy")}*\n\n`;
  markdown += `---\n\n`;

  decisions.forEach((decision) => {
    markdown += `## ${decision.title}\n\n`;
    markdown += `| Property | Value |\n`;
    markdown += `|----------|-------|\n`;
    markdown += `| **Category** | ${decision.category} |\n`;
    markdown += `| **Choice** | ${decision.choice} |\n`;
    markdown += `| **Confidence** | ${decision.confidence}% |\n`;
    markdown += `| **Date** | ${format(new Date(decision.createdAt), "MMMM d, yyyy")} |\n`;
    if (decision.tags.length > 0) {
      markdown += `| **Tags** | ${decision.tags.join(", ")} |\n`;
    }
    markdown += `\n`;

    if (decision.alternatives.length > 0) {
      markdown += `### Alternatives Considered\n`;
      decision.alternatives.forEach((alt) => {
        markdown += `- ${alt}\n`;
      });
      markdown += `\n`;
    }

    if (decision.context) {
      markdown += `### Context\n${decision.context}\n\n`;
    }

    if (decision.outcomes.length > 0) {
      markdown += `### Outcomes\n`;
      decision.outcomes.forEach((outcome) => {
        markdown += `- **Rating:** ${outcome.rating}/10\n`;
        markdown += `- **Would choose differently:** ${outcome.wouldChooseDifferently ? "Yes" : "No"}\n`;
        if (outcome.reflection) {
          markdown += `- **Reflection:** ${outcome.reflection}\n`;
        }
        markdown += `\n`;
      });
    }

    markdown += `---\n\n`;
  });

  markdown += `\n## How to Import to Notion\n\n`;
  markdown += `1. Open Notion and create a new page\n`;
  markdown += `2. Type \`/import\` and select "Markdown"\n`;
  markdown += `3. Upload this file\n`;
  markdown += `4. Optionally, convert to a database for better organization\n`;

  return markdown;
}

// Generate ICS calendar events
export function generateICSEvents(decisions: Decision[]): string {
  const now = new Date();
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  let ics = `BEGIN:VCALENDAR\n`;
  ics += `VERSION:2.0\n`;
  ics += `PRODID:-//Decision Twin//Decision Reviews//EN\n`;
  ics += `CALSCALE:GREGORIAN\n`;
  ics += `METHOD:PUBLISH\n`;

  decisions.forEach((decision) => {
    const decisionDate = new Date(decision.createdAt);
    
    // Create review events at 7 days and 30 days
    [7, 30].forEach((days) => {
      const reviewDate = new Date(decisionDate);
      reviewDate.setDate(reviewDate.getDate() + days);
      
      // Only create future events
      if (reviewDate > now) {
        const endDate = new Date(reviewDate);
        endDate.setHours(endDate.getHours() + 1);

        ics += `BEGIN:VEVENT\n`;
        ics += `UID:${decision.id}-${days}@decisiontwin\n`;
        ics += `DTSTAMP:${formatICSDate(now)}\n`;
        ics += `DTSTART:${formatICSDate(reviewDate)}\n`;
        ics += `DTEND:${formatICSDate(endDate)}\n`;
        ics += `SUMMARY:Review decision: ${decision.title.replace(/[,;\\]/g, " ")}\n`;
        ics += `DESCRIPTION:Time to review your decision about "${decision.title}".\\n\\nChoice: ${decision.choice}\\nCategory: ${decision.category}\\nOriginal confidence: ${decision.confidence}%\n`;
        ics += `CATEGORIES:Decision Review\n`;
        ics += `END:VEVENT\n`;
      }
    });
  });

  ics += `END:VCALENDAR`;
  return ics;
}

// Export formats for journals
export type JournalFormat = "dayone" | "obsidian" | "markdown";

export function exportToJournalFormat(decision: Decision, format: JournalFormat): { filename: string; content: string } {
  const date = new Date(decision.createdAt);
  const dateStr = formatDate(date, "yyyy-MM-dd");
  const timeStr = formatDate(date, "HH:mm");

  switch (format) {
    case "dayone": {
      // Day One JSON format
      const entry = {
        creationDate: decision.createdAt,
        modifiedDate: decision.createdAt,
        text: generateJournalMarkdown(decision),
        tags: ["decision", decision.category, ...decision.tags],
        starred: decision.confidence >= 80,
      };
      return {
        filename: `${dateStr}_${decision.id}.json`,
        content: JSON.stringify(entry, null, 2),
      };
    }
    case "obsidian": {
      // Obsidian with frontmatter
      let content = `---\n`;
      content += `date: ${dateStr}\n`;
      content += `time: ${timeStr}\n`;
      content += `type: decision\n`;
      content += `category: ${decision.category}\n`;
      content += `confidence: ${decision.confidence}\n`;
      content += `tags: [decision, ${decision.category}${decision.tags.length ? ", " + decision.tags.join(", ") : ""}]\n`;
      content += `---\n\n`;
      content += generateJournalMarkdown(decision);
      return {
        filename: `${dateStr}_${sanitizeFilename(decision.title)}.md`,
        content,
      };
    }
    default: {
      // Plain markdown
      return {
        filename: `${dateStr}_${sanitizeFilename(decision.title)}.md`,
        content: generateJournalMarkdown(decision),
      };
    }
  }
}

function formatDate(date: Date, formatStr: string): string {
  // Simple date formatting
  const pad = (n: number) => n.toString().padStart(2, "0");
  return formatStr
    .replace("yyyy", date.getFullYear().toString())
    .replace("MM", pad(date.getMonth() + 1))
    .replace("dd", pad(date.getDate()))
    .replace("HH", pad(date.getHours()))
    .replace("mm", pad(date.getMinutes()));
}

function generateJournalMarkdown(decision: Decision): string {
  let md = `# ${decision.title}\n\n`;
  md += `**Date:** ${format(new Date(decision.createdAt), "MMMM d, yyyy 'at' h:mm a")}\n`;
  md += `**Category:** ${decision.category}\n`;
  md += `**Confidence:** ${decision.confidence}%\n\n`;

  md += `## Decision\n${decision.choice}\n\n`;

  if (decision.alternatives.length > 0) {
    md += `## Alternatives Considered\n`;
    decision.alternatives.forEach((alt) => {
      md += `- ${alt}\n`;
    });
    md += `\n`;
  }

  if (decision.context) {
    md += `## Context\n${decision.context}\n\n`;
  }

  if (decision.outcomes.length > 0) {
    md += `## Outcomes\n`;
    decision.outcomes.forEach((outcome, i) => {
      md += `### Outcome ${i + 1}\n`;
      md += `- Rating: ${outcome.rating}/10\n`;
      md += `- Would choose differently: ${outcome.wouldChooseDifferently ? "Yes" : "No"}\n`;
      if (outcome.reflection) {
        md += `- Reflection: ${outcome.reflection}\n`;
      }
      md += `\n`;
    });
  }

  if (decision.tags.length > 0) {
    md += `---\n*Tags: ${decision.tags.join(", ")}*\n`;
  }

  return md;
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string = "text/plain"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download multiple files as zip would require a library, so we'll offer individual downloads
export function downloadAllJournalEntries(decisions: Decision[], format: JournalFormat): void {
  decisions.forEach((decision, index) => {
    setTimeout(() => {
      const { filename, content } = exportToJournalFormat(decision, format);
      const mimeType = format === "dayone" ? "application/json" : "text/markdown";
      downloadFile(content, filename, mimeType);
    }, index * 200); // Stagger downloads
  });
}

// CSV Import parsing
export interface ParsedDecision {
  title: string;
  choice: string;
  category: string;
  confidence: number;
  alternatives: string[];
  context: string;
  tags: string[];
  date?: string;
}

export function parseCSV(csvContent: string): ParsedDecision[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const decisions: ParsedDecision[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });

    decisions.push({
      title: row.title || row.decision || row.name || `Decision ${i}`,
      choice: row.choice || row.selected || row.option || "",
      category: row.category || row.type || "Other",
      confidence: parseInt(row.confidence || "50") || 50,
      alternatives: (row.alternatives || "").split(";").filter(Boolean).map((a) => a.trim()),
      context: row.context || row.notes || row.description || "",
      tags: (row.tags || "").split(";").filter(Boolean).map((t) => t.trim()),
      date: row.date || undefined,
    });
  }

  return decisions;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// Plain text parsing with AI (returns structured prompt for AI)
export function getTextParsingPrompt(text: string): string {
  return `Extract decisions from this journal entry or text. For each decision found, identify:
- Title (brief summary)
- Choice made
- Category (Career, Finance, Health, Relationships, Personal, Education, Other)
- Confidence level (1-100, estimate based on language)
- Alternatives considered
- Context

Text to analyze:
"""
${text}
"""

Respond with a JSON array of decisions. Each decision should have: title, choice, category, confidence, alternatives (array), context.`;
}
