import { format, startOfWeek } from "date-fns";

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

// Storage helper
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

  async list(prefix: string): Promise<{ key: string; value: string }[]> {
    if (window.storage?.list) {
      return await window.storage.list(prefix);
    }
    const allKeys = Object.keys(localStorage);
    const matchingKeys = allKeys.filter((key) => key.startsWith(prefix));
    return matchingKeys.map((key) => ({
      key,
      value: localStorage.getItem(key) || "",
    }));
  },
};

export interface WeekSummary {
  decisionCount: number;
  mostActiveDay: string | null;
  primaryCategory: string | null;
  confidenceTrend: "up" | "down" | "stable";
  avgConfidence: number;
}

export interface Win {
  decisionId: string;
  title: string;
  outcome: string;
  rating: number;
}

export interface UpcomingFollowup {
  decisionId: string;
  title: string;
  dueDate: string;
}

export interface WeeklyReview {
  weekStart: string; // ISO date string (Monday)
  summary: WeekSummary;
  wins: Win[];
  reflectionQuestions: string[];
  reflectionAnswers: Record<string, string>;
  lookingAhead: {
    upcomingFollowups: UpcomingFollowup[];
    suggestedFocusAreas: string[];
  };
  weekRating: number; // 1-10
  weekGoal: string;
  createdAt: string;
  updatedAt: string;
}

const REVIEW_PREFIX = "review:";

export function getWeekStart(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export async function getWeeklyReview(weekStart: string): Promise<WeeklyReview | null> {
  const data = await storage.get(`${REVIEW_PREFIX}${weekStart}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as WeeklyReview;
  } catch {
    return null;
  }
}

export async function saveWeeklyReview(review: WeeklyReview): Promise<void> {
  await storage.set(`${REVIEW_PREFIX}${review.weekStart}`, JSON.stringify(review));
}

export async function getAllReviewWeeks(): Promise<string[]> {
  const items = await storage.list(REVIEW_PREFIX);
  return items
    .map((item) => item.key.replace(REVIEW_PREFIX, ""))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}

export async function hasCurrentWeekReview(): Promise<boolean> {
  const currentWeekStart = getWeekStart();
  const review = await getWeeklyReview(currentWeekStart);
  return review !== null;
}
