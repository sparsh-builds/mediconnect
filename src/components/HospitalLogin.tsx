// src/components/HospitalLogin.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseconfig";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HospitalLoginProps {
  loginType: "hospital" | "bloodbank" | "admin";
}

const HospitalLogin: React.FC<HospitalLoginProps> = ({ loginType }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // In your HospitalLogin component, replace the handleLogin function:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid; // ✅ Firebase Auth UID

    // Save login info to localStorage for UI + Firestore link
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", loginType);
    localStorage.setItem("uid", uid); // ✅ store UID

    toast({ 
      title: "Login Successful", 
      description: `Welcome, ${loginType}!` 
    });

    // Redirect based on login type
    if (loginType === "hospital") {
      navigate("/hospital-dashboard");
    } else if (loginType === "bloodbank") {
      navigate("/bloodbank-dashboard");
    } else {
      navigate("/admin-dashboard");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    toast({
      title: "Login Failed",
      description: error.message,
      variant: "destructive",
    });
  }
  setIsLoading(false);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card border-0 bg-medical-card">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl">
              {loginType.charAt(0).toUpperCase() + loginType.slice(1)} Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-muted rounded-md flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>
                Your session is secure.{" "}
                {loginType.charAt(0).toUpperCase() + loginType.slice(1)} access only.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalLogin;