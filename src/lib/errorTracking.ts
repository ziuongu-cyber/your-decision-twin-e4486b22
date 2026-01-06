// Error tracking utility for production
// In a real app, this would send errors to a service like Sentry

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface TrackedError {
  message: string;
  stack?: string;
  timestamp: string;
  context?: ErrorContext;
  url: string;
  userAgent: string;
}

const MAX_STORED_ERRORS = 50;
const ERRORS_KEY = "app_errors";

// Get stored errors
function getStoredErrors(): TrackedError[] {
  try {
    const stored = localStorage.getItem(ERRORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save error to local storage
function storeError(error: TrackedError): void {
  try {
    const errors = getStoredErrors();
    errors.unshift(error);
    // Keep only recent errors
    const trimmed = errors.slice(0, MAX_STORED_ERRORS);
    localStorage.setItem(ERRORS_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

// Track an error
export function trackError(error: Error, context?: ErrorContext): void {
  const trackedError: TrackedError = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Store locally
  storeError(trackedError);

  // In production, you would send this to an error tracking service
  if (import.meta.env.PROD) {
    // Example: sendToErrorService(trackedError);
  }
}

// Track a custom event
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  // In production, send to analytics service
  if (import.meta.env.PROD) {
    // Example: sendToAnalytics(eventName, properties);
  }

  // Development logging
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Event] ${eventName}`, properties);
  }
}

// Key analytics events
export const AnalyticsEvents = {
  DECISION_CREATED: "decision_created",
  DECISION_DELETED: "decision_deleted",
  OUTCOME_ADDED: "outcome_added",
  TWIN_ASKED: "twin_asked",
  INSIGHTS_VIEWED: "insights_viewed",
  EXPORT_COMPLETED: "export_completed",
  IMPORT_COMPLETED: "import_completed",
  WEEKLY_REVIEW_COMPLETED: "weekly_review_completed",
  TEMPLATE_USED: "template_used",
  SEARCH_PERFORMED: "search_performed",
  SETTINGS_CHANGED: "settings_changed",
} as const;

// Export stored errors for debugging
export function exportErrors(): TrackedError[] {
  return getStoredErrors();
}

// Clear stored errors
export function clearErrors(): void {
  localStorage.removeItem(ERRORS_KEY);
}

// Setup global error handlers
export function setupErrorHandlers(): void {
  // Handle uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    if (error) {
      trackError(error, {
        component: "window",
        action: "uncaught_error",
        metadata: { source, lineno, colno },
      });
    }
    // Don't prevent default handling
    return false;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    
    trackError(error, {
      component: "window",
      action: "unhandled_rejection",
    });
  };
}
