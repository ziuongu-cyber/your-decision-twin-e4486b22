import { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const DashboardHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-14 md:h-16 border-b border-border/50 flex items-center justify-between px-3 md:px-4 bg-background/80 backdrop-blur-sm safe-area-top">
      <div className="flex items-center gap-4">
        {/* Only show sidebar trigger on desktop */}
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        <span className="font-semibold text-sm md:text-base md:hidden">Digital Twin</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="gap-2 text-muted-foreground"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="w-3 h-3" />K
          </kbd>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
