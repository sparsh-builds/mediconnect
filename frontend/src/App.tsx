import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Common Pages
import Home from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Developer from "./pages/Developer";

// OPD Booking Pages
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import Payment from "./pages/Payment";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Hospital Bed & Blood Bank Public Discovery Pages
import Hospitals from "./pages/Hospitals";
import BloodBanks from "./pages/BloodBanks";

// Hospital Bed & Blood Bank Protected Dashboards
import HospitalDashboard from "./pages/HospitalDashBoard";
import BloodBankDashboard from "./pages/BloodBankDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            {/* Public Discovery Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/bloodbanks" element={<BloodBanks />} />
            <Route path="/developer" element={<Developer />} />

            {/* OPD & Patient Routes */}
            <Route
              path="/book"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Healthcare Provider & Facility Dashboards */}
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor", "admin"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital-dashboard"
              element={
                <ProtectedRoute allowedRoles={["hospital", "admin"]}>
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bloodbank-dashboard"
              element={
                <ProtectedRoute allowedRoles={["bloodbank", "admin"]}>
                  <BloodBankDashboard />
                </ProtectedRoute>
              }
            />

            {/* Administration Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;