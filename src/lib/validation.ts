import { z } from "zod";

// Decision validation schema
export const decisionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(500, "Title must be less than 500 characters"),
  choice: z
    .string()
    .trim()
    .min(1, "Your choice is required")
    .max(2000, "Choice must be less than 2000 characters"),
  alternatives: z
    .array(z.string().trim().max(500, "Alternative must be less than 500 characters"))
    .max(20, "Maximum 20 alternatives allowed"),
  category: z.string().min(1, "Category is required"),
  confidence: z.number().min(0).max(100),
  tags: z
    .array(z.string().trim().max(50, "Tag must be less than 50 characters"))
    .max(20, "Maximum 20 tags allowed"),
  context: z
    .string()
    .trim()
    .max(5000, "Context must be less than 5000 characters")
    .optional(),
});

// Outcome validation schema
export const outcomeSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(10, "Rating must be between 1-10"),
  wouldChooseDifferently: z.boolean(),
  reflection: z
    .string()
    .trim()
    .max(2000, "Reflection must be less than 2000 characters")
    .optional(),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  category: z.string().min(1, "Please select a category"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

// Weekly review validation schema
export const weeklyReviewSchema = z.object({
  weekRating: z.number().min(1).max(10).optional(),
  reflectionAnswers: z.record(z.string().max(1000)),
  weeklyGoal: z.string().trim().max(500, "Goal must be less than 500 characters").optional(),
});

// Sanitize text input (remove potentially dangerous characters)
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .trim();
}

// Validate and truncate text
export function validateText(input: string, maxLength: number): string {
  return sanitizeText(input).slice(0, maxLength);
}

export type DecisionInput = z.infer<typeof decisionSchema>;
export type OutcomeInput = z.infer<typeof outcomeSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type WeeklyReviewInput = z.infer<typeof weeklyReviewSchema>;
