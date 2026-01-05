import { useState, useEffect, useCallback } from "react";
import { getDueReminders, Reminder, updateReminderStatus, ReminderStatus } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface UseReminderNotificationsReturn {
  dueReminders: Reminder[];
  dismissReminder: (reminderId: string) => Promise<void>;
  snoozeReminder: (reminderId: string, days: number) => Promise<void>;
  completeReminder: (reminderId: string) => Promise<void>;
  refreshReminders: () => Promise<void>;
}

export function useReminderNotifications(): UseReminderNotificationsReturn {
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const { toast } = useToast();

  const refreshReminders = useCallback(async () => {
    try {
      const reminders = await getDueReminders();
      setDueReminders(reminders);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  }, []);

  useEffect(() => {
    refreshReminders();
    // Check for reminders every 5 minutes
    const interval = setInterval(refreshReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshReminders]);

  const dismissReminder = useCallback(
    async (reminderId: string) => {
      try {
        const status: ReminderStatus = "dismissed";
        await updateReminderStatus(reminderId, status);
        await refreshReminders();
        toast({
          title: "Reminder dismissed",
          description: "You can still add an outcome from your history.",
        });
      } catch (error) {
        toast({
          title: "Failed to dismiss reminder",
          variant: "destructive",
        });
      }
    },
    [refreshReminders, toast]
  );

  const snoozeReminder = useCallback(
    async (reminderId: string, days: number) => {
      try {
        await updateReminderStatus(reminderId, "snoozed", days);
        await refreshReminders();
        toast({
          title: "Reminder snoozed",
          description: `We'll remind you again in ${days} day${days !== 1 ? "s" : ""}.`,
        });
      } catch (error) {
        toast({
          title: "Failed to snooze reminder",
          variant: "destructive",
        });
      }
    },
    [refreshReminders, toast]
  );

  const completeReminder = useCallback(
    async (reminderId: string) => {
      try {
        await updateReminderStatus(reminderId, "completed");
        await refreshReminders();
      } catch (error) {
        toast({
          title: "Failed to update reminder",
          variant: "destructive",
        });
      }
    },
    [refreshReminders, toast]
  );

  return {
    dueReminders,
    dismissReminder,
    snoozeReminder,
    completeReminder,
    refreshReminders,
  };
}

export default useReminderNotifications;
