import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseconfig";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bed, Save, LogOut, MapPin, AlertCircle, Plus, Minus, CheckCircle } from "lucide-react";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  const [hospitalData, setHospitalData] = useState({
    name: "",
    location: "",
    pincode: "",
    phone: "",
    totalBeds: 0,
    availableBeds: 0,
    icuBeds: 0,
    ventilatorBeds: 0,
    privateBeds: 0,
    rating: 0,
    reviewsCount: 0,
    emergencyOpen: true,
    lat: 0,
    lng: 0,
    waitTime: 0,
    specialties: [] as string[],
    notes: "",
  });

  // Verify auth session and listen for real-time document updates
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin");
        return;
      }

      setHospitalId(user.uid);
      setIsLoading(true);

      const hospitalRef = doc(db, "hospitals", user.uid);
      const unsubscribeDoc = onSnapshot(
        hospitalRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setHospitalData((prev) => ({
              ...prev,
              ...snapshot.data(),
            }));
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching hospital data:", error);
          setIsLoading(false);
        }
      );

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Fast-increment helper for bed counters
  const adjustBedCount = (field: "availableBeds" | "icuBeds" | "ventilatorBeds" | "privateBeds", delta: number) => {
    setHospitalData((prev) => ({
      ...prev,
      [field]: Math.max(0, (Number(prev[field]) || 0) + delta),
    }));
  };

  const handleUpdate = async () => {
    if (!hospitalId) return;
    setIsSaving(true);

    try {
      const hospitalRef = doc(db, "hospitals", hospitalId);
      await setDoc(
        hospitalRef,
        {
          ...hospitalData,
          lastUpdated: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "✅ Data Saved Successfully",
        description: "Public listings now show your updated bed availability.",
      });
    } catch (error) {
      console.error("Error updating data:", error);
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

  const addSpecialty = () => {
    if (newSpecialty.trim() && !hospitalData.specialties.includes(newSpecialty.trim())) {
      setHospitalData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    setHospitalData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Loading hospital data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hospital Staff Portal</h1>
          <p className="text-sm text-gray-500">{hospitalData.name || "Manage Bed & Emergency Status"}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
          <Button onClick={handleUpdate} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Quick Bed Inventory Section with Increment/Decrement Buttons */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100/50">
            <CardTitle className="flex items-center space-x-2 text-blue-950 text-lg">
              <Bed className="w-5 h-5 text-blue-600" />
              <span>Real-Time Bed Counters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Available General Beds */}
              <div className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
                <Label className="font-semibold text-gray-700">Available General Beds</Label>
                <div className="flex items-center justify-between gap-2">
                  <Button size="icon" variant="outline" onClick={() => adjustBedCount("availableBeds", -1)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    className="text-center text-xl font-bold"
                    value={hospitalData.availableBeds}
                    onChange={(e) => setHospitalData({ ...hospitalData, availableBeds: parseInt(e.target.value) || 0 })}
                  />
                  <Button size="icon" variant="outline" onClick={() => adjustBedCount("availableBeds", 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* ICU Beds */}
              <div className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
                <Label className="font-semibold text-gray-700">Available ICU Beds</Label>
                <div className="flex items-center justify-between gap-2">
                  <Button size="icon" variant="outline" onClick={() => adjustBedCount("icuBeds", -1)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    className="text-center text-xl font-bold text-red-600"
                    value={hospitalData.icuBeds}
                    onChange={(e) => setHospitalData({ ...hospitalData, icuBeds: parseInt(e.target.value) || 0 })}
                  />
                  <Button size="icon" variant="outline" onClick={() => adjustBedCount("icuBeds", 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Ventilator Beds */}
              <div className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
                <Label className="font-semibold text-gray-700">Ventilator Beds</Label>
                <div className="flex items-center justify-between gap-2">
                  <Button size="icon" variant="outline" onClick={() => adjustBedCount("ventilatorBeds", -1)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    className="text-center text-xl font-bold text-blue-600"
                    value={hospitalData.ventilatorBeds}
                    onChange={(e) => setHospitalData({ ...hospitalData, ventilatorBeds: parseInt(e.target.value) || 0 })}
                  />
                  <Button size="icon" variant="outline" onClick={() => adjustBedCount("ventilatorBeds", 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Total Facility Capacity */}
              <div className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
                <Label className="font-semibold text-gray-700">Total Bed Capacity</Label>
                <Input
                  type="number"
                  className="text-center text-xl font-medium"
                  value={hospitalData.totalBeds}
                  onChange={(e) => setHospitalData({ ...hospitalData, totalBeds: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground text-center">Total beds registered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency & Facility Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency & Wait Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>Emergency Unit & Wait Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Emergency Department Status</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={hospitalData.emergencyOpen ? "default" : "outline"}
                    className={hospitalData.emergencyOpen ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => setHospitalData({ ...hospitalData, emergencyOpen: true })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Open (Accepting)
                  </Button>
                  <Button
                    type="button"
                    variant={!hospitalData.emergencyOpen ? "destructive" : "outline"}
                    onClick={() => setHospitalData({ ...hospitalData, emergencyOpen: false })}
                  >
                    Closed (Full)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estimated ER Wait Time (Minutes)</Label>
                <Input
                  type="number"
                  value={hospitalData.waitTime}
                  onChange={(e) => setHospitalData({ ...hospitalData, waitTime: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 15"
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  value={hospitalData.phone}
                  onChange={(e) => setHospitalData({ ...hospitalData, phone: e.target.value })}
                  placeholder="Direct emergency line"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hospital Address & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Hospital Profile & Coordinates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hospital Name</Label>
                <Input
                  value={hospitalData.name}
                  onChange={(e) => setHospitalData({ ...hospitalData, name: e.target.value })}
                  placeholder="Official hospital name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>City / Area</Label>
                  <Input
                    value={hospitalData.location}
                    onChange={(e) => setHospitalData({ ...hospitalData, location: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    value={hospitalData.pincode}
                    onChange={(e) => setHospitalData({ ...hospitalData, pincode: e.target.value })}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    value={hospitalData.lat}
                    onChange={(e) => setHospitalData({ ...hospitalData, lat: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    value={hospitalData.lng}
                    onChange={(e) => setHospitalData({ ...hospitalData, lng: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specialties & Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Specialties & Live Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add Specialization (Cardiology, Trauma, Pediatrics, etc.)</Label>
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Type department..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                />
                <Button type="button" onClick={addSpecialty}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {hospitalData.specialties.map((s, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => removeSpecialty(idx)} className="hover:text-blue-900 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Public Notice / Notes (Shown to patients)</Label>
              <Textarea
                value={hospitalData.notes}
                onChange={(e) => setHospitalData({ ...hospitalData, notes: e.target.value })}
                placeholder="e.g. Oxygen plant operational, triage desk active at Gate 2"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}