import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BottomNavigation from "@/components/mobile/BottomNavigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop sidebar - hidden on mobile */}
        <nav className="hidden md:block" aria-label="Main navigation">
          <DashboardSidebar />
        </nav>
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main 
            id="main-content" 
            className="flex-1 p-4 md:p-6 mesh-gradient overflow-auto pb-20 md:pb-6"
            tabIndex={-1}
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
        </div>
        {/* Mobile bottom navigation */}
        <nav aria-label="Mobile navigation">
          <BottomNavigation />
        </nav>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
