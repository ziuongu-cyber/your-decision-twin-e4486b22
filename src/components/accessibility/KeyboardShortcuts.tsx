import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { t } from "@/lib/i18n";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  modifiers?: ("ctrl" | "meta" | "shift" | "alt")[];
  global?: boolean;
}

interface KeyboardShortcutsProps {
  additionalShortcuts?: Shortcut[];
}

export function KeyboardShortcuts({ additionalShortcuts = [] }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    // Help
    {
      key: "?",
      description: t("shortcuts.showShortcuts"),
      action: () => setShowHelp(true),
      global: true,
    },
    // Navigation
    {
      key: "n",
      description: t("shortcuts.newDecision"),
      action: () => navigate("/log-decision"),
      global: true,
    },
    {
      key: "s",
      description: t("shortcuts.search"),
      action: () => navigate("/history"),
      global: true,
    },
    {
      key: "k",
      description: t("shortcuts.quickSearch"),
      action: () => navigate("/history"),
      modifiers: ["meta"],
      global: true,
    },
    {
      key: "Escape",
      description: t("shortcuts.closeModal"),
      action: () => setShowHelp(false),
      global: true,
    },
    // Page navigation
    {
      key: "g",
      description: t("shortcuts.goToDashboard"),
      action: () => {},
      global: false, // Requires second key press
    },
    ...additionalShortcuts,
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape
        if (event.key === "Escape") {
          setShowHelp(false);
        }
        return;
      }

      for (const shortcut of shortcuts) {
        if (!shortcut.global) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          (shortcut.key === "?" && event.key === "/" && event.shiftKey);

        const modifiersMatch =
          (!shortcut.modifiers ||
            shortcut.modifiers.every((mod) => {
              if (mod === "ctrl") return event.ctrlKey;
              if (mod === "meta") return event.metaKey || event.ctrlKey;
              if (mod === "shift") return event.shiftKey;
              if (mod === "alt") return event.altKey;
              return false;
            })) &&
          // Ensure no extra modifiers are pressed (except for ? which needs shift)
          (shortcut.modifiers?.length || shortcut.key === "?" ||
            (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey));

        if (keyMatches && modifiersMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const formatKey = (key: string, modifiers?: string[]) => {
    const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const parts: string[] = [];
    
    if (modifiers?.includes("meta")) {
      parts.push(isMac ? "⌘" : "Ctrl");
    }
    if (modifiers?.includes("ctrl")) {
      parts.push("Ctrl");
    }
    if (modifiers?.includes("shift")) {
      parts.push("⇧");
    }
    if (modifiers?.includes("alt")) {
      parts.push(isMac ? "⌥" : "Alt");
    }
    
    parts.push(key.length === 1 ? key.toUpperCase() : key);
    return parts.join(" + ");
  };

  const generalShortcuts = shortcuts.filter(
    (s) => !s.modifiers?.includes("meta") && s.global
  );
  const quickShortcuts = shortcuts.filter(
    (s) => s.modifiers?.includes("meta")
  );

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent
        className="max-w-md"
        aria-describedby="shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⌨️ {t("shortcuts.title")}
          </DialogTitle>
          <DialogDescription id="shortcuts-description">
            {t("shortcuts.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* General shortcuts */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {t("shortcuts.general")}
            </h3>
            <div className="space-y-2">
              {generalShortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                    {formatKey(shortcut.key, shortcut.modifiers)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {quickShortcuts.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {t("shortcuts.actions")}
                </h3>
                <div className="space-y-2">
                  {quickShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                        {formatKey(shortcut.key, shortcut.modifiers)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 bg-muted rounded">?</kbd> anytime to show this help
        </div>
      </DialogContent>
    </Dialog>
  );
}
