import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseconfig";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Droplet, Save, LogOut, Plus, Minus, MapPin, Phone, Clock, Building2 } from "lucide-react";

export default function BloodBankDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bankId, setBankId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [bankInfo, setBankInfo] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
    hours: "24/7",
    lat: 0,
    lng: 0,
  });

  const [bloodStock, setBloodStock] = useState<Record<string, number>>({
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
  });

  // Verify auth session and sync real-time document
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin");
        return;
      }

      setBankId(user.uid);
      setIsLoading(true);

      const bankRef = doc(db, "blood_banks", user.uid);
      const unsubscribeDoc = onSnapshot(
        bankRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.bankInfo) setBankInfo(data.bankInfo);
            if (data.bloodStock) setBloodStock((prev) => ({ ...prev, ...data.bloodStock }));
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching blood bank data:", error);
          setIsLoading(false);
        }
      );

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const adjustStock = (type: string, delta: number) => {
    setBloodStock((prev) => ({
      ...prev,
      [type]: Math.max(0, (Number(prev[type]) || 0) + delta),
    }));
  };

  const handleSaveStock = async () => {
    if (!bankId) return;
    setIsSaving(true);

    try {
      const bankRef = doc(db, "blood_banks", bankId);
      await setDoc(
        bankRef,
        {
          bankInfo,
          bloodStock,
          lastUpdated: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "✅ Blood Stock Updated",
        description: "Public listings now show your updated inventory.",
      });
    } catch (error) {
      console.error("Error updating blood stock:", error);
      toast({
        title: "❌ Update Failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      toast({ title: "Logged out", description: "You have been signed out." });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Loading blood bank data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blood Bank Portal</h1>
          <p className="text-sm text-gray-500">{bankInfo.name || "Manage Real-Time Blood Stock"}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
          <Button onClick={handleSaveStock} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Blood Stock"}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Real-time Blood Stock Grid */}
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="bg-red-50/50 border-b border-red-100/50">
            <CardTitle className="flex items-center space-x-2 text-red-950 text-lg">
              <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
              <span>Available Units by Blood Group</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(bloodStock).map(([type, units]) => (
                <div key={type} className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">{type}</span>
                    <span className="text-xs text-muted-foreground">Units</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button size="icon" variant="outline" onClick={() => adjustStock(type, -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      className="text-center text-xl font-bold text-red-600"
                      value={units}
                      onChange={(e) =>
                        setBloodStock({ ...bloodStock, [type]: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                    />
                    <Button size="icon" variant="outline" onClick={() => adjustStock(type, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Facility Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <Building2 className="w-4 h-4 text-gray-600" />
              <span>Blood Bank Contact & Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facility Name</Label>
                <Input
                  value={bankInfo.name}
                  onChange={(e) => setBankInfo({ ...bankInfo, name: e.target.value })}
                  placeholder="e.g. Red Cross Regional Blood Center"
                />
              </div>
              <div className="space-y-2">
                <Label>Emergency Phone / Helpline</Label>
                <Input
                  value={bankInfo.phone}
                  onChange={(e) => setBankInfo({ ...bankInfo, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={bankInfo.address}
                  onChange={(e) => setBankInfo({ ...bankInfo, address: e.target.value })}
                  placeholder="Street / Area"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={bankInfo.city}
                  onChange={(e) => setBankInfo({ ...bankInfo, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>Operating Hours</Label>
                <Input
                  value={bankInfo.hours}
                  onChange={(e) => setBankInfo({ ...bankInfo, hours: e.target.value })}
                  placeholder="e.g. 24/7 or 8 AM - 8 PM"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}