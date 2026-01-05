export interface Outcome {
  id: string;
  rating: number; // 1-10
  wouldChooseDifferently: boolean;
  reflection: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  title: string;
  choice: string;
  alternatives: string[];
  category: string;
  confidence: number;
  tags: string[];
  context: string;
  createdAt: string;
  outcomes: Outcome[];
}

export interface Insights {
  topPatterns: Array<{
    pattern: string;
    confidence: "high" | "medium" | "low";
    examples: string[];
  }>;
  successFactors: string[];
  recommendations: string[];
  personality: string;
  generatedAt: number;
}

// Type declaration for window.storage
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

// Fallback to localStorage if window.storage is not available
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

  async remove(key: string): Promise<void> {
    if (window.storage?.remove) {
      await window.storage.remove(key);
    } else {
      localStorage.removeItem(key);
    }
  },

  async keys(): Promise<string[]> {
    if (window.storage?.keys) {
      return await window.storage.keys();
    }
    return Object.keys(localStorage);
  },

  async list(prefix: string): Promise<{ key: string; value: string }[]> {
    if (window.storage?.list) {
      return await window.storage.list(prefix);
    }
    // Fallback: filter localStorage keys by prefix
    const allKeys = Object.keys(localStorage);
    const matchingKeys = allKeys.filter((key) => key.startsWith(prefix));
    return matchingKeys.map((key) => ({
      key,
      value: localStorage.getItem(key) || "",
    }));
  },
};

export async function saveDecision(decision: Decision): Promise<void> {
  await storage.set(`decision:${decision.id}`, JSON.stringify(decision));
}

export async function getDecision(id: string): Promise<Decision | null> {
  const data = await storage.get(`decision:${id}`);
  if (!data) return null;
  return JSON.parse(data) as Decision;
}

export async function getAllDecisions(): Promise<Decision[]> {
  const items = await storage.list("decision:");

  const decisions: Decision[] = [];
  for (const item of items) {
    if (item.value) {
      try {
        decisions.push(JSON.parse(item.value) as Decision);
      } catch {
        // Skip invalid entries
      }
    }
  }

  // Sort by createdAt descending (newest first)
  return decisions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deleteDecision(id: string): Promise<void> {
  await storage.remove(`decision:${id}`);
  // Also delete related reminders
  await deleteRemindersForDecision(id);
}

export async function addOutcome(decisionId: string, outcome: Outcome): Promise<Decision | null> {
  const decision = await getDecision(decisionId);
  if (!decision) return null;

  decision.outcomes = [...(decision.outcomes || []), outcome];
  await saveDecision(decision);

  // Mark related reminders as completed
  await markDecisionRemindersCompleted(decisionId);

  return decision;
}

export function calculateSuccessRate(decisions: Decision[]): number {
  const allOutcomes = decisions.flatMap(d => d.outcomes || []);
  if (allOutcomes.length === 0) return 0;

  const totalRating = allOutcomes.reduce((sum, o) => sum + o.rating, 0);
  return Math.round((totalRating / allOutcomes.length / 10) * 100);
}

// Draft management
const DRAFT_KEY = "decision_draft";

export async function saveDraft(draft: Partial<Decision>): Promise<void> {
  await storage.set(DRAFT_KEY, JSON.stringify(draft));
}

export async function getDraft(): Promise<Partial<Decision> | null> {
  const data = await storage.get(DRAFT_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  await storage.remove(DRAFT_KEY);
}

// Insights management
const INSIGHTS_KEY = "insights";

export async function saveInsights(insights: Insights): Promise<void> {
  await storage.set(INSIGHTS_KEY, JSON.stringify(insights));
}

export async function getInsights(): Promise<Insights | null> {
  const data = await storage.get(INSIGHTS_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function clearInsights(): Promise<void> {
  await storage.remove(INSIGHTS_KEY);
}

// Reminder management
export type ReminderStatus = "pending" | "completed" | "snoozed";

export interface Reminder {
  id: string;
  decisionId: string;
  decisionTitle: string;
  dueDate: string; // ISO string
  type: "1day" | "7day" | "30day";
  status: ReminderStatus;
  snoozedUntil?: string; // ISO string if snoozed
  createdAt: string;
}

const REMINDERS_KEY = "reminders";

export async function getReminders(): Promise<Reminder[]> {
  const data = await storage.get(REMINDERS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Reminder[];
  } catch {
    return [];
  }
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await storage.set(REMINDERS_KEY, JSON.stringify(reminders));
}

export async function createRemindersForDecision(decision: Decision): Promise<void> {
  const reminders = await getReminders();
  const now = new Date(decision.createdAt);

  const newReminders: Reminder[] = [
    {
      id: `${decision.id}-1day`,
      decisionId: decision.id,
      decisionTitle: decision.title,
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: "1day",
      status: "pending",
      createdAt: decision.createdAt,
    },
    {
      id: `${decision.id}-7day`,
      decisionId: decision.id,
      decisionTitle: decision.title,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: "7day",
      status: "pending",
      createdAt: decision.createdAt,
    },
    {
      id: `${decision.id}-30day`,
      decisionId: decision.id,
      decisionTitle: decision.title,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: "30day",
      status: "pending",
      createdAt: decision.createdAt,
    },
  ];

  // Filter out any existing reminders for this decision
  const filteredReminders = reminders.filter(r => r.decisionId !== decision.id);
  await saveReminders([...filteredReminders, ...newReminders]);
}

export async function updateReminderStatus(
  reminderId: string,
  status: ReminderStatus,
  snoozeDays?: number
): Promise<void> {
  const reminders = await getReminders();
  const updatedReminders = reminders.map(r => {
    if (r.id === reminderId) {
      return {
        ...r,
        status,
        snoozedUntil: snoozeDays
          ? new Date(Date.now() + snoozeDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      };
    }
    return r;
  });
  await saveReminders(updatedReminders);
}

export async function markDecisionRemindersCompleted(decisionId: string): Promise<void> {
  const reminders = await getReminders();
  const updatedReminders = reminders.map(r => {
    if (r.decisionId === decisionId) {
      return { ...r, status: "completed" as ReminderStatus };
    }
    return r;
  });
  await saveReminders(updatedReminders);
}

export async function deleteRemindersForDecision(decisionId: string): Promise<void> {
  const reminders = await getReminders();
  const filteredReminders = reminders.filter(r => r.decisionId !== decisionId);
  await saveReminders(filteredReminders);
}

export async function getDueReminders(): Promise<Reminder[]> {
  const reminders = await getReminders();
  const decisions = await getAllDecisions();
  const now = new Date();

  return reminders.filter(r => {
    // Skip completed reminders
    if (r.status === "completed") return false;

    // Check if snoozed and still within snooze period
    if (r.status === "snoozed" && r.snoozedUntil) {
      if (new Date(r.snoozedUntil) > now) return false;
    }

    // Check if due
    if (new Date(r.dueDate) > now) return false;

    // Check if decision still exists and has no outcome for this timeframe
    const decision = decisions.find(d => d.id === r.decisionId);
    if (!decision) return false;

    // Check if any outcome exists after the reminder was created
    const hasRecentOutcome = decision.outcomes?.some(o => {
      const outcomeDate = new Date(o.createdAt);
      const reminderCreated = new Date(r.createdAt);
      return outcomeDate >= reminderCreated;
    });

    return !hasRecentOutcome;
  });
}

export async function getPendingFollowups(): Promise<Array<Reminder & { decision?: Decision }>> {
  const reminders = await getReminders();
  const decisions = await getAllDecisions();
  const now = new Date();

  const pending = reminders
    .filter(r => {
      if (r.status === "completed") return false;

      // Check if snoozed and still within snooze period
      if (r.status === "snoozed" && r.snoozedUntil) {
        if (new Date(r.snoozedUntil) > now) return false;
      }

      const decision = decisions.find(d => d.id === r.decisionId);
      if (!decision) return false;

      // Check if decision has outcome after this reminder's creation
      const hasOutcome = decision.outcomes?.some(o => {
        const outcomeDate = new Date(o.createdAt);
        const reminderCreated = new Date(r.createdAt);
        return outcomeDate >= reminderCreated;
      });

      return !hasOutcome;
    })
    .map(r => ({
      ...r,
      decision: decisions.find(d => d.id === r.decisionId),
    }))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Deduplicate by decision (only show earliest due reminder per decision)
  const seen = new Set<string>();
  return pending.filter(r => {
    if (seen.has(r.decisionId)) return false;
    seen.add(r.decisionId);
    return true;
  });
}
