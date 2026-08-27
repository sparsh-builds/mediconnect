import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import BloodBanks from "./pages/BloodBanks";
import Admin from "./pages/Admin";
import Developer from "./pages/Developer";
import NotFound from "./pages/NotFound";
import HospitalDashboard from "./pages/HospitalDashBoard";
import BloodBankDashboard from "./pages/BloodBankDashboard";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute
import Login from "./pages/Login"


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/bloodbanks" element={<BloodBanks />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/hospital-dashboard" 
            element={
              <ProtectedRoute requiredRole="hospital">
                <HospitalDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bloodbank-dashboard" 
            element={
              <ProtectedRoute requiredRole="bloodbank">
                <BloodBankDashboard />
              </ProtectedRoute>
            } 
          />
        
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;