import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import PublicEventPage from "./pages/PublicEventPage";
import CampaignsPage from "./pages/CampaignsPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import EditCampaignPage from "./pages/EditCampaignPage";
import CampaignPublicPage from "./pages/CampaignPublicPage";
import StoresPage from "./pages/StoresPage";
import StaffEventsAdminPage from "./pages/StaffEventsAdminPage";
import StaffEventsPublicPage from "./pages/StaffEventsPublicPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/events" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/events/new" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
          <Route path="/dashboard/events/:id" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
          <Route path="/event/:id" element={<PublicEventPage />} />
          <Route path="/campaign/:id" element={<CampaignPublicPage />} />
          <Route path="/dashboard/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
          <Route path="/dashboard/campaigns/new" element={<ProtectedRoute><CreateCampaignPage /></ProtectedRoute>} />
          <Route path="/dashboard/campaigns/:id" element={<ProtectedRoute><EditCampaignPage /></ProtectedRoute>} />
          <Route path="/dashboard/stores" element={<ProtectedRoute><StoresPage /></ProtectedRoute>} />
          <Route path="/dashboard/staff-events" element={<ProtectedRoute><StaffEventsAdminPage /></ProtectedRoute>} />
          <Route path="/intern" element={<StaffEventsPublicPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
