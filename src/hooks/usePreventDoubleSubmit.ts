import { useState, useCallback, useRef } from "react";

interface UsePreventDoubleSubmitOptions {
  minDelay?: number; // Minimum delay between submissions in ms
}

export function usePreventDoubleSubmit(options: UsePreventDoubleSubmitOptions = {}) {
  const { minDelay = 500 } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const handleSubmit = useCallback(
    async <T>(submitFn: () => Promise<T>): Promise<T | null> => {
      const now = Date.now();
      
      // Prevent rapid submissions
      if (isSubmitting || now - lastSubmitTime.current < minDelay) {
        return null;
      }

      lastSubmitTime.current = now;
      setIsSubmitting(true);

      try {
        const result = await submitFn();
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, minDelay]
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    lastSubmitTime.current = 0;
  }, []);

  return {
    isSubmitting,
    handleSubmit,
    reset,
  };
}
