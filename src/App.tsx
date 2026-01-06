import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LogDecision from "./pages/LogDecision";
import History from "./pages/History";
import AskTwin from "./pages/AskTwin";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import GuidedDecision from "./pages/GuidedDecision";
import WeeklyReview from "./pages/WeeklyReview";
import NotFound from "./pages/NotFound";
import { SkipLink } from "./components/accessibility/SkipLink";
import { LiveRegionProvider } from "./components/accessibility/LiveRegion";
import { KeyboardShortcuts } from "./components/accessibility/KeyboardShortcuts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LiveRegionProvider>
        <SkipLink />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <KeyboardShortcuts />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/log-decision" element={<LogDecision />} />
            <Route path="/history" element={<History />} />
            <Route path="/ask-twin" element={<AskTwin />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/guided-decision" element={<GuidedDecision />} />
            <Route path="/weekly-review" element={<WeeklyReview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LiveRegionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
