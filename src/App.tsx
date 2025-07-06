
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import VotingBooth from "./pages/VotingBooth";
import Mesa from "./pages/Mesa";
import { SuperAdminRoute } from "./components/SuperAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/sistema-electoral" element={<Index />} />
            <Route path="/mesa" element={<Mesa />} />
            <Route path="/cabina" element={<VotingBooth />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/results" element={<Results />} />
            <Route path="/admin" element={<SuperAdminRoute><Admin /></SuperAdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
