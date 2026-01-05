export interface DecisionTemplate {
  id: string;
  name: string;
  category: string;
  tags: string[];
  titlePlaceholder: string;
  choicePlaceholder: string;
  alternativesPlaceholder: string;
  contextPlaceholder: string;
  icon: string;
  isCustom?: boolean;
}

const TEMPLATES_KEY = "templates";

// Predefined templates
export const DEFAULT_TEMPLATES: DecisionTemplate[] = [
  {
    id: "career-job-offer",
    name: "Job Offer",
    category: "Career",
    tags: ["career", "job", "important"],
    titlePlaceholder: "Should I accept the job offer from [Company]?",
    choicePlaceholder: "I decided to accept/decline the offer",
    alternativesPlaceholder: "Stay at current job\nNegotiate better terms\nWait for other offers",
    contextPlaceholder: "Consider: salary, growth opportunities, work-life balance, company culture, commute, benefits...",
    icon: "💼",
  },
  {
    id: "purchase-major",
    name: "Major Purchase",
    category: "Purchase",
    tags: ["purchase", "financial", "planning"],
    titlePlaceholder: "Should I buy [item] for $[amount]?",
    choicePlaceholder: "I decided to purchase/not purchase",
    alternativesPlaceholder: "Buy a cheaper alternative\nWait for a sale\nRent instead of buy\nSave for later",
    contextPlaceholder: "Consider: budget impact, urgency (1-10), alternatives researched, long-term value...",
    icon: "🛍️",
  },
  {
    id: "health-lifestyle",
    name: "Lifestyle Change",
    category: "Health",
    tags: ["health", "lifestyle", "habits"],
    titlePlaceholder: "Should I start/stop [habit or lifestyle change]?",
    choicePlaceholder: "I decided to commit to this change",
    alternativesPlaceholder: "Start gradually\nTry a different approach\nSeek professional guidance\nPostpone until ready",
    contextPlaceholder: "My motivation: \nPotential obstacles: \nSupport system: \nTimeline goal: ",
    icon: "🏃",
  },
  {
    id: "relationship-conversation",
    name: "Difficult Conversation",
    category: "Relationships",
    tags: ["relationship", "communication", "emotional"],
    titlePlaceholder: "Should I have a conversation with [person] about [topic]?",
    choicePlaceholder: "I decided to have/postpone this conversation",
    alternativesPlaceholder: "Write a letter instead\nSeek mediation\nWait for better timing\nAddress indirectly",
    contextPlaceholder: "How I'm feeling: \nWhat I hope to achieve: \nPossible reactions: \nBest/worst case scenarios: ",
    icon: "💬",
  },
  {
    id: "finance-investment",
    name: "Investment Decision",
    category: "Finance",
    tags: ["investment", "financial", "long-term"],
    titlePlaceholder: "Should I invest $[amount] in [investment type]?",
    choicePlaceholder: "I decided to invest/not invest",
    alternativesPlaceholder: "Invest smaller amount\nDiversify into multiple options\nKeep in savings\nSeek professional advice first",
    contextPlaceholder: "Risk tolerance (1-10): \nInvestment timeline: \nResearch done: \nPortion of portfolio: ",
    icon: "📈",
  },
];

// Storage functions
export async function getCustomTemplates(): Promise<DecisionTemplate[]> {
  try {
    if (window.storage?.get) {
      const data = await window.storage.get(TEMPLATES_KEY);
      if (data) return JSON.parse(data);
    } else {
      const data = localStorage.getItem(TEMPLATES_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load templates:", error);
  }
  return [];
}

export async function saveCustomTemplate(template: DecisionTemplate): Promise<void> {
  const templates = await getCustomTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);

  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }

  const data = JSON.stringify(templates);
  if (window.storage?.set) {
    await window.storage.set(TEMPLATES_KEY, data);
  } else {
    localStorage.setItem(TEMPLATES_KEY, data);
  }
}

export async function deleteCustomTemplate(templateId: string): Promise<void> {
  const templates = await getCustomTemplates();
  const filtered = templates.filter(t => t.id !== templateId);

  const data = JSON.stringify(filtered);
  if (window.storage?.set) {
    await window.storage.set(TEMPLATES_KEY, data);
  } else {
    localStorage.setItem(TEMPLATES_KEY, data);
  }
}

export async function getAllTemplates(): Promise<DecisionTemplate[]> {
  const custom = await getCustomTemplates();
  return [...DEFAULT_TEMPLATES, ...custom.map(t => ({ ...t, isCustom: true }))];
}
