import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { setupErrorHandlers } from "./lib/errorTracking";
import LoadingScreen from "./components/common/LoadingScreen";

// Setup global error handlers
setupErrorHandlers();

// Lazy load the main App component
const App = lazy(() => import("./App.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  </StrictMode>
);
