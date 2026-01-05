import { Decision } from "./storage";

export interface SharedDecision {
  id: string;
  shareId: string;
  decisionId: string;
  decision: Decision;
  shareType: "full" | "summary";
  expiresAt: string;
  createdAt: string;
  revoked: boolean;
  comments: SharedComment[];
}

export interface SharedComment {
  id: string;
  shareId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface SharingSettings {
  enabled: boolean;
  defaultShareType: "full" | "summary";
  defaultExpireDays: number;
}

const SHARED_KEY = "shared_decisions";
const SHARING_SETTINGS_KEY = "sharing_settings";

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

// Default sharing settings
const DEFAULT_SHARING_SETTINGS: SharingSettings = {
  enabled: false,
  defaultShareType: "summary",
  defaultExpireDays: 7,
};

// Generate a unique share ID
function generateShareId(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Get all shared decisions
export async function getSharedDecisions(): Promise<SharedDecision[]> {
  try {
    const data = await storage.get(SHARED_KEY);
    if (!data) return [];
    return JSON.parse(data) as SharedDecision[];
  } catch {
    return [];
  }
}

// Save shared decisions
async function saveSharedDecisions(shared: SharedDecision[]): Promise<void> {
  await storage.set(SHARED_KEY, JSON.stringify(shared));
}

// Create a shareable link for a decision
export async function shareDecision(
  decision: Decision,
  shareType: "full" | "summary" = "summary",
  expireDays: number = 7
): Promise<SharedDecision> {
  const shared = await getSharedDecisions();

  // Create the shared decision
  const sharedDecision: SharedDecision = {
    id: crypto.randomUUID(),
    shareId: generateShareId(),
    decisionId: decision.id,
    decision: shareType === "summary" ? {
      ...decision,
      context: decision.context?.slice(0, 200) + (decision.context && decision.context.length > 200 ? "..." : ""),
    } : decision,
    shareType,
    expiresAt: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    revoked: false,
    comments: [],
  };

  shared.push(sharedDecision);
  await saveSharedDecisions(shared);

  return sharedDecision;
}

// Get a shared decision by share ID
export async function getSharedDecision(shareId: string): Promise<SharedDecision | null> {
  const shared = await getSharedDecisions();
  const found = shared.find(s => s.shareId === shareId);

  if (!found) return null;

  // Check if expired or revoked
  if (found.revoked || new Date(found.expiresAt) < new Date()) {
    return null;
  }

  return found;
}

// Get shared decisions for a specific decision ID
export async function getSharesForDecision(decisionId: string): Promise<SharedDecision[]> {
  const shared = await getSharedDecisions();
  return shared.filter(s => s.decisionId === decisionId && !s.revoked);
}

// Revoke a shared link
export async function revokeShare(shareId: string): Promise<void> {
  const shared = await getSharedDecisions();
  const updated = shared.map(s =>
    s.shareId === shareId ? { ...s, revoked: true } : s
  );
  await saveSharedDecisions(updated);
}

// Add a comment to a shared decision
export async function addComment(
  shareId: string,
  author: string,
  content: string
): Promise<SharedComment | null> {
  const shared = await getSharedDecisions();
  const index = shared.findIndex(s => s.shareId === shareId);

  if (index === -1) return null;

  const comment: SharedComment = {
    id: crypto.randomUUID(),
    shareId,
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  shared[index].comments.push(comment);
  await saveSharedDecisions(shared);

  return comment;
}

// Get comments for a shared decision
export async function getComments(shareId: string): Promise<SharedComment[]> {
  const sharedDecision = await getSharedDecision(shareId);
  return sharedDecision?.comments || [];
}

// Get sharing settings
export async function getSharingSettings(): Promise<SharingSettings> {
  try {
    const data = await storage.get(SHARING_SETTINGS_KEY);
    if (!data) return { ...DEFAULT_SHARING_SETTINGS };
    return { ...DEFAULT_SHARING_SETTINGS, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_SHARING_SETTINGS };
  }
}

// Save sharing settings
export async function saveSharingSettings(settings: Partial<SharingSettings>): Promise<SharingSettings> {
  const current = await getSharingSettings();
  const updated = { ...current, ...settings };
  await storage.set(SHARING_SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// Generate shareable URL
export function getShareUrl(shareId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${shareId}`;
}

// Check if a decision has active shares
export async function hasActiveShares(decisionId: string): Promise<boolean> {
  const shares = await getSharesForDecision(decisionId);
  const now = new Date();
  return shares.some(s => !s.revoked && new Date(s.expiresAt) > now);
}

// Clean up expired shares
export async function cleanupExpiredShares(): Promise<number> {
  const shared = await getSharedDecisions();
  const now = new Date();
  const valid = shared.filter(s => new Date(s.expiresAt) > now && !s.revoked);
  const removed = shared.length - valid.length;
  await saveSharedDecisions(valid);
  return removed;
}

// Get unread comments count (for notification badge)
export async function getUnreadCommentsCount(): Promise<number> {
  const shared = await getSharedDecisions();
  const lastChecked = localStorage.getItem("last_comments_check");
  const lastCheckedDate = lastChecked ? new Date(lastChecked) : new Date(0);

  let count = 0;
  for (const s of shared) {
    for (const c of s.comments) {
      if (new Date(c.createdAt) > lastCheckedDate) {
        count++;
      }
    }
  }

  return count;
}

// Mark comments as read
export async function markCommentsAsRead(): Promise<void> {
  localStorage.setItem("last_comments_check", new Date().toISOString());
}
