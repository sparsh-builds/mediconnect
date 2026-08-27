import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseconfig"; // Adjust the import path as necessary
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Send } from "lucide-react";

export default function EmergencyBloodRequest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestData, setRequestData] = useState({
    patientName: "",
    bloodGroup: "O+",
    unitsNeeded: 1,
    hospitalName: "",
    city: "",
    contactPhone: "",
    urgencyLevel: "Immediate (Next 2-4 hrs)",
  });

  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestData.patientName || !requestData.hospitalName || !requestData.contactPhone) {
      toast({ title: "Please fill all details", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "emergency_requests"), {
        ...requestData,
        status: "OPEN",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "🚨 SOS Blood Request Broadcasted",
        description: "Your emergency request is now live for nearby donors and blood banks.",
      });

      setRequestData({
        patientName: "",
        bloodGroup: "O+",
        unitsNeeded: 1,
        hospitalName: "",
        city: "",
        contactPhone: "",
        urgencyLevel: "Immediate (Next 2-4 hrs)",
      });
    } catch (error) {
      console.error("Error creating request:", error);
      toast({ title: "Failed to post request", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="border-red-300 shadow-lg ring-1 ring-red-200">
        <CardHeader className="bg-red-50 border-b border-red-200 text-center">
          <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Post Urgent Blood Requirement (SOS)</CardTitle>
          <p className="text-sm text-red-700">Broadcast immediate blood requirements to donors in your city.</p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handlePostRequest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Name *</Label>
                <Input
                  value={requestData.patientName}
                  onChange={(e) => setRequestData({ ...requestData, patientName: e.target.value })}
                  placeholder="Name of patient"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Required Blood Group *</Label>
                <select
                  className="w-full h-10 px-3 border rounded-md bg-white text-sm font-bold text-red-600"
                  value={requestData.bloodGroup}
                  onChange={(e) => setRequestData({ ...requestData, bloodGroup: e.target.value })}
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Units Required *</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={requestData.unitsNeeded}
                  onChange={(e) => setRequestData({ ...requestData, unitsNeeded: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact Number *</Label>
                <Input
                  type="tel"
                  value={requestData.contactPhone}
                  onChange={(e) => setRequestData({ ...requestData, contactPhone: e.target.value })}
                  placeholder="Direct phone number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hospital / Clinic Name & Ward *</Label>
              <Input
                value={requestData.hospitalName}
                onChange={(e) => setRequestData({ ...requestData, hospitalName: e.target.value })}
                placeholder="e.g. City Civil Hospital, ICU Bed 4"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City / District *</Label>
                <Input
                  value={requestData.city}
                  onChange={(e) => setRequestData({ ...requestData, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <select
                  className="w-full h-10 px-3 border rounded-md bg-white text-sm"
                  value={requestData.urgencyLevel}
                  onChange={(e) => setRequestData({ ...requestData, urgencyLevel: e.target.value })}
                >
                  <option>Immediate (Next 2-4 hrs)</option>
                  <option>Within 24 Hours</option>
                  <option>Scheduled Surgery</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white h-11 text-base">
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Broadcasting SOS..." : "Broadcast Emergency Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}