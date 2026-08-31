import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, User, Building, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (userRole: UserRole) => {
    switch (userRole) {
      case "doctor":
        navigate("/doctor-dashboard");
        break;
      case "hospital":
        navigate("/hospital-dashboard");
        break;
      case "bloodbank":
        navigate("/bloodbank-dashboard");
        break;
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "patient":
      default:
        navigate("/patient-dashboard");
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const profile = await signup(email, password, role, name);
        toast.success("Account created successfully!");
        handleRoleRedirect(profile.role);
      } else {
        const profile = await login(email, password);
        toast.success(`Welcome back, ${profile.name || "User"}!`);
        handleRoleRedirect(profile.role);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMsg = err.message || "Authentication failed.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        errorMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errorMsg = "This email is already registered. Please sign in instead.";
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 justify-between">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md shadow-xl border bg-white rounded-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {isSignUp ? "Create MediConnect Account" : "Sign In to MediConnect"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {isSignUp
                ? "Register as a patient, doctor, or healthcare facility"
                : "Enter your credentials to access your portal"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUp && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                      {role === "hospital"
                        ? "Hospital Name *"
                        : role === "bloodbank"
                        ? "Blood Bank Name *"
                        : "Full Name *"}
                    </Label>
                    <div className="relative">
                      {role === "hospital" || role === "bloodbank" ? (
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      )}
                      <Input
                        id="name"
                        type="text"
                        placeholder={
                          role === "hospital"
                            ? "e.g. Metro Care Hospital"
                            : role === "bloodbank"
                            ? "e.g. LifeSource Blood Bank"
                            : "John Doe"
                        }
                        className="pl-9 text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs font-semibold text-slate-700">
                      Account Type / Role *
                    </Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full h-10 border border-slate-200 rounded-md px-3 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="patient">Patient (OPD Bookings & Bed Tracker)</option>
                      <option value="doctor">Medical Specialist / Doctor</option>
                      <option value="hospital">Hospital Staff (ICU & Bed Updates)</option>
                      <option value="bloodbank">Blood Bank Staff (Stock Inventory)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center text-xs text-slate-600 pt-2">
                <button
                  type="button"
                  className="font-medium text-sky-600 hover:underline"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;