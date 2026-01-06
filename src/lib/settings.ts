export interface AppSettings {
  // Twin Personality
  tone: "encouraging" | "honest" | "analytical" | "friendly";
  adviceStyle: "direct" | "exploratory" | "balanced";
  showConfidenceScores: boolean;

  // Privacy & Data
  autoDeleteOldDecisions: "never" | "1year" | "2years";

  // Notifications
  outcomeReminders: boolean;
  reminderTiming: "1day" | "3days" | "1week" | "custom";
  customReminderDays?: number;
  dailyLoggingReminder: boolean;
  dailyLoggingReminderTime: string; // HH:mm format

  // Display
  theme: "light" | "dark" | "auto";
  compactView: boolean;
  defaultChartType: "bar" | "line" | "pie" | "area";

  // Advanced AI Features
  advancedAI: boolean;
  showImpactPredictor: boolean;
  showAlternativeSuggester: boolean;
  showBiasDetector: boolean;
  showDecisionReplay: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  tone: "encouraging",
  adviceStyle: "balanced",
  showConfidenceScores: true,
  autoDeleteOldDecisions: "never",
  outcomeReminders: true,
  reminderTiming: "1week",
  customReminderDays: 7,
  dailyLoggingReminder: false,
  dailyLoggingReminderTime: "09:00",
  theme: "dark",
  compactView: false,
  defaultChartType: "bar",
  advancedAI: true,
  showImpactPredictor: true,
  showAlternativeSuggester: true,
  showBiasDetector: true,
  showDecisionReplay: true,
};

const SETTINGS_KEY = "settings";

declare global {
  interface Window {
    storage?: {
      set: (key: string, value: string) => Promise<void>;
      get: (key: string) => Promise<string | null>;
      remove: (key: string) => Promise<void>;
      keys: () => Promise<string[]>;
      list: (prefix: string) => Promise<{ key: string; value: string }[]>;
    };
  }
}

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

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await storage.get(SETTINGS_KEY);
    if (!data) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await storage.set(SETTINGS_KEY, JSON.stringify(updated));

  // Apply theme immediately
  applyTheme(updated.theme);

  return updated;
}

export function applyTheme(theme: AppSettings["theme"]): void {
  const root = document.documentElement;

  if (theme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("light", !prefersDark);
  } else if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
}

export function getDefaultSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS };
}
