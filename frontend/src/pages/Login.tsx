import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebaseconfig";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;

      // 2. Read role directly from Firestore
      let userRole = "hospital";
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        userRole = userDoc.data().role;
      } else {
        // Fallback check if blood bank document exists
        const bankDoc = await getDoc(doc(db, "blood_banks", uid));
        if (bankDoc.exists()) userRole = "bloodbank";
      }

      // 3. Cache session data
      localStorage.setItem("userType", userRole);
      localStorage.setItem("uid", uid);

      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });

      // 4. Auto-route to the correct dashboard
      if (userRole === "bloodbank") {
        navigate("/bloodbank-dashboard");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/hospital-dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-md border bg-white">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Partner & Staff Portal</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Sign in to update real-time bed availability or blood stock
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Official Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@facility.org"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center text-xs text-gray-500 pt-2">
                Need to list your facility?{" "}
                <Link to="/admin" className="text-blue-600 font-semibold hover:underline">
                  Register Facility
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}