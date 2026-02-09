import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import KnowledgeBasePage from "./pages/KnowledgeBase";
import ArticleDetailPage from "./pages/ArticleDetail";
import TicketsPage from "./pages/Tickets";
import TicketDetailPage from "./pages/TicketDetail";
import ProfilePage from "./pages/Profile";
import AdminKanbanPage from "./pages/admin/AdminKanban";
import AdminTicketDetailPage from "./pages/admin/AdminTicketDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout wrapper with protection
function ProtectedLayout({ requireStaff = false }: { requireStaff?: boolean }) {
  return (
    <ProtectedRoute requireStaff={requireStaff}>
      <AppLayout />
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes with Layout */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/kb" element={<KnowledgeBasePage />} />
              <Route path="/kb/:articleId" element={<ArticleDetailPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<ProtectedLayout requireStaff />}>
              <Route path="/admin" element={<AdminKanbanPage />} />
              <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetailPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
