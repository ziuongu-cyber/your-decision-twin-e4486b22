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
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { SkipLink } from "./components/accessibility/SkipLink";
import { LiveRegionProvider } from "./components/accessibility/LiveRegion";
import { KeyboardShortcuts } from "./components/accessibility/KeyboardShortcuts";
import ErrorBoundary from "./components/common/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
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
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LiveRegionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
