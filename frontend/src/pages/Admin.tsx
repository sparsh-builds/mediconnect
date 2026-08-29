import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebaseconfig";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hospital, Droplet, Lock, Mail, Building, Phone, MapPin, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Facility Registration state
  const [facilityType, setFacilityType] = useState<"hospital" | "bloodbank">("hospital");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regAddress, setRegAddress] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      let role = "hospital";

      if (userDoc.exists()) {
        role = userDoc.data().role;
      } else {
        const bankDoc = await getDoc(doc(db, "blood_banks", user.uid));
        if (bankDoc.exists()) role = "bloodbank";
      }

      localStorage.setItem("userType", role);
      localStorage.setItem("uid", user.uid);

      toast({ title: "Welcome back!", description: "Successfully signed in." });

      if (role === "bloodbank") {
        navigate("/bloodbank-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/hospital-dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regPhone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const uid = userCredential.user.uid;

      // 1. Create User record
      await setDoc(doc(db, "users", uid), {
        email: regEmail,
        role: facilityType,
        createdAt: serverTimestamp(),
      });

      // 2. Initialize Facility Document in both collections for backward compatibility
      if (facilityType === "hospital") {
        const hospitalData = {
          name: regName,
          location: regCity,
          address: regAddress,
          phone: regPhone,
          totalBeds: 0,
          availableBeds: 0,
          icuBeds: 0,
          ventilatorBeds: 0,
          emergencyOpen: true,
          lastUpdated: new Date().toISOString(),
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "hospitals", uid), hospitalData);
      } else {
        const bloodBankData = {
          bankInfo: {
            name: regName,
            address: regAddress,
            city: regCity,
            phone: regPhone,
            hours: "24/7",
          },
          name: regName,
          location: regCity,
          contact: regPhone,
          stock: {
            "A+": 0, "A-": 0, "B+": 0, "B-": 0,
            "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
          },
          bloodStock: {
            "A+": 0, "A-": 0, "B+": 0, "B-": 0,
            "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
          },
          lastUpdated: new Date().toISOString(),
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "blood_banks", uid), bloodBankData);
        await setDoc(doc(db, "bloodbanks", uid), bloodBankData);
      }

      localStorage.setItem("userType", facilityType);
      localStorage.setItem("uid", uid);

      toast({
        title: "Facility Registered!",
        description: "Your dashboard is ready to update live bed and blood stock.",
      });

      if (facilityType === "bloodbank") {
        navigate("/bloodbank-dashboard");
      } else {
        navigate("/hospital-dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Could not complete registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-lg">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Staff Login</TabsTrigger>
            <TabsTrigger value="register">Register Facility</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card className="shadow-md border">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">Portal Login</CardTitle>
                <p className="text-xs text-muted-foreground">Access your hospital or blood bank inventory dashboard</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Registered Email</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="staff@hospital.com"
                        className="pl-9"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-11">
                    {isLoading ? "Authenticating..." : "Sign In to Dashboard"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facility Registration Tab */}
          <TabsContent value="register">
            <Card className="shadow-md border">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">Register New Facility</CardTitle>
                <p className="text-xs text-muted-foreground">Add your hospital or blood bank to the MediConnect network</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Facility Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={facilityType === "hospital" ? "default" : "outline"}
                        onClick={() => setFacilityType("hospital")}
                      >
                        <Hospital className="w-4 h-4 mr-2" /> Hospital
                      </Button>
                      <Button
                        type="button"
                        variant={facilityType === "bloodbank" ? "default" : "outline"}
                        className={facilityType === "bloodbank" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}
                        onClick={() => setFacilityType("bloodbank")}
                      >
                        <Droplet className="w-4 h-4 mr-2" /> Blood Bank
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name">Facility Name *</Label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <Input
                        id="reg-name"
                        placeholder="e.g. Metro Care Hospital"
                        className="pl-9"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email">Official Email *</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="admin@facility.org"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password">Password *</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Min 6 chars"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-phone">Contact Phone *</Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          id="reg-phone"
                          type="tel"
                          placeholder="Phone number"
                          className="pl-9"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-city">City *</Label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        <Input
                          id="reg-city"
                          placeholder="City"
                          className="pl-9"
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-address">Street Address</Label>
                    <Input
                      id="reg-address"
                      placeholder="Locality / Landmark"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isLoading ? "Creating Facility..." : "Complete Registration"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}