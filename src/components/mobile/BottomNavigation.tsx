import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  PenLine,
  MessageCircle,
  BarChart3,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Log", url: "/log-decision", icon: PenLine },
  { title: "Ask", url: "/ask-twin", icon: MessageCircle },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "History", url: "/history", icon: History },
];

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[64px] touch-target",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
