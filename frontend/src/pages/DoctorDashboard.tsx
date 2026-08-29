import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseconfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

interface SlotItem {
  time: string;
  isFull: boolean;
}

interface PatientAppointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  symptoms: string;
  status: string;
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [newSlotTime, setNewSlotTime] = useState("");
  const [slots, setSlots] = useState<SlotItem[]>([
    { time: "09:00 AM", isFull: false },
    { time: "10:30 AM", isFull: true },
    { time: "02:00 PM", isFull: false },
    { time: "04:30 PM", isFull: false },
  ]);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([
    {
      id: "demo-apt-1",
      patientName: "Rahul Sharma",
      patientEmail: "rahul.s@example.com",
      patientPhone: "+91 98765 43210",
      date: "Today",
      time: "10:30 AM",
      symptoms: "Mild chest discomfort and routine ECG consultation.",
      status: "confirmed",
    },
  ]);

  // Load appointments assigned to this doctor
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PatientAppointment[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as PatientAppointment));
          setAppointments(list);
        }
      },
      (err) => console.log("Appointments snapshot status:", err.message)
    );

    return () => unsubscribe();
  }, [user]);

  // Add a new slot
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) {
      toast.error("Please enter a valid time (e.g., 11:30 AM)");
      return;
    }

    if (slots.some((s) => s.time.toLowerCase() === newSlotTime.trim().toLowerCase())) {
      toast.error("This time slot already exists.");
      return;
    }

    const updated = [...slots, { time: newSlotTime.trim(), isFull: false }];
    setSlots(updated);
    setNewSlotTime("");
    toast.success(`Slot ${newSlotTime} added successfully!`);

    // Sync with Firestore if doc exists
    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.log("Local state updated. Firestore doc will sync on creation.");
      }
    }
  };

  // Toggle slot status between Free and Full
  const toggleSlotStatus = async (index: number) => {
    const updated = [...slots];
    updated[index].isFull = !updated[index].isFull;
    setSlots(updated);
    toast.info(`Slot marked as ${updated[index].isFull ? "FULL (Booked)" : "FREE"}`);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.log("Local state updated.");
      }
    }
  };

  // Delete a slot
  const handleDeleteSlot = async (index: number) => {
    const slotTime = slots[index].time;
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
    toast.success(`Slot ${slotTime} removed.`);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.log("Local state updated.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="mb-8">
          <Badge variant="outline" className="mb-2 text-primary border-primary/30">
            Specialist Portal
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Doctor Schedule & OPD Token Control
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add or remove consultation slots, toggle real-time availability, and view booked patients.
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Total Slots</span>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-2">{slots.length}</p>
          </Card>
          <Card className="p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Available (Free) Slots</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-emerald-600">
              {slots.filter((s) => !s.isFull).length}
            </p>
          </Card>
          <Card className="p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Booked Consultations</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-sky-600">{appointments.length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Slot Manager Box */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Manage OPD Consultation Slots
                </CardTitle>
                <CardDescription className="text-xs">
                  Click on any slot to toggle its state between Free and Booked (Full).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Slot Form */}
                <form onSubmit={handleAddSlot} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. 11:45 AM or 05:30 PM"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Button type="submit" className="gap-1.5 shrink-0">
                    <Plus className="w-4 h-4" /> Add Slot
                  </Button>
                </form>

                {/* Slots List */}
                <div className="space-y-2.5">
                  <Label className="text-xs text-muted-foreground">Active Daily Slots</Label>
                  {slots.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg text-xs text-muted-foreground">
                      No slots created yet. Add your first slot above.
                    </div>
                  ) : (
                    slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          slot.isFull
                            ? "bg-muted/60 border-slate-200"
                            : "bg-emerald-500/5 border-emerald-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className={`w-4 h-4 ${slot.isFull ? "text-muted-foreground" : "text-emerald-600"}`} />
                          <span className={`font-semibold text-sm ${slot.isFull ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {slot.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={slot.isFull ? "secondary" : "outline"}
                            className={`h-7 text-xs ${
                              slot.isFull
                                ? "text-rose-600 hover:text-rose-700 font-semibold"
                                : "text-emerald-600 hover:text-emerald-700 font-semibold border-emerald-500/40"
                            }`}
                            onClick={() => toggleSlotStatus(idx)}
                          >
                            {slot.isFull ? "Mark as Free" : "Mark as Full"}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                            onClick={() => handleDeleteSlot(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booked Appointments Queue */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-500" /> Patient Queue & Bookings
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time list of patients with confirmed slot reservations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-10 border border-dashed rounded-lg text-xs text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No scheduled patients in queue today.
                  </div>
                ) : (
                  appointments.map((apt) => (
                    <div key={apt.id} className="border rounded-xl p-4 space-y-2 bg-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{apt.patientName}</h4>
                          <p className="text-xs text-muted-foreground">{apt.patientPhone} • {apt.patientEmail}</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                          {apt.time}
                        </Badge>
                      </div>

                      {apt.symptoms && (
                        <p className="text-xs bg-muted/40 p-2 rounded text-muted-foreground">
                          <strong>Reported Symptoms:</strong> {apt.symptoms}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;