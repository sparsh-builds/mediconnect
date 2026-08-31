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
  Users,
  Video,
  UserCheck,
  Calendar,
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
  getDocs,
} from "firebase/firestore";

interface SlotItem {
  time: string;
  isFull: boolean;
}

interface PatientAppointment {
  id: string;
  tokenId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  consultationMode: string;
  date: string;
  time: string;
  fee: number;
  status: string;
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [newSlotTime, setNewSlotTime] = useState("");
  const [slots, setSlots] = useState<SlotItem[]>([
    { time: "12:10 PM", isFull: true },
    { time: "12:20 PM", isFull: false },
    { time: "12:30 PM", isFull: false },
    { time: "12:40 PM", isFull: false },
    { time: "12:50 PM", isFull: false },
    { time: "01:00 PM", isFull: false },
  ]);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);

  // 1. Subscribe to real-time appointments for this doctor
  useEffect(() => {
    const apptsRef = collection(db, "appointments");

    const unsubscribe = onSnapshot(
      apptsRef,
      (snapshot) => {
        const list: PatientAppointment[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as PatientAppointment) });
        });
        setAppointments(list);
      },
      async () => {
        const allDocs = await getDocs(apptsRef);
        const fallbackList: PatientAppointment[] = [];
        allDocs.forEach((d) => fallbackList.push({ id: d.id, ...(d.data() as PatientAppointment) }));
        setAppointments(fallbackList);
      }
    );

    // 2. Fetch doctor's existing custom slots from Firestore if present
    if (user?.uid) {
      const docRef = doc(db, "doctors", user.uid);
      const unsubDoc = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().slots) {
          setSlots(docSnap.data().slots);
        }
      });
      return () => {
        unsubscribe();
        unsubDoc();
      };
    }

    return () => unsubscribe();
  }, [user]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) {
      toast.error("Please enter a valid time (e.g., 03:30 PM)");
      return;
    }

    if (slots.some((s) => s.time.toLowerCase() === newSlotTime.trim().toLowerCase())) {
      toast.error("This time slot already exists.");
      return;
    }

    const updated = [...slots, { time: newSlotTime.trim(), isFull: false }];
    setSlots(updated);
    setNewSlotTime("");
    toast.success(`Slot ${newSlotTime} added!`);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.log("Local state updated.");
      }
    }
  };

  const toggleSlotStatus = async (index: number) => {
    const updated = [...slots];
    updated[index].isFull = !updated[index].isFull;
    setSlots(updated);
    toast.info(`Slot marked as ${updated[index].isFull ? "FULL" : "AVAILABLE"}`);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.log("Local state updated.");
      }
    }
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-6xl flex-1">
        <div className="mb-8">
          <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold mb-2">
            Specialist Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Doctor Schedule & OPD Token Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage real-time consultation slots and oversee verified patient queue tokens.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Total Slots</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-bold mt-2 text-slate-900">{slots.length}</p>
          </Card>
          <Card className="p-5 border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Open Available Slots</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-emerald-600">
              {slots.filter((s) => !s.isFull).length}
            </p>
          </Card>
          <Card className="p-5 border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Active Patient Tokens</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-bold mt-2 text-sky-700">{appointments.length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Slots Manager */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="shadow-xs border border-slate-200/80 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" /> Manage Daily OPD Slots
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any slot button to toggle availability.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                <form onSubmit={handleAddSlot} className="flex gap-2">
                  <Input
                    placeholder="e.g. 02:45 PM"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" className="gap-1 text-xs h-9 bg-sky-700 hover:bg-sky-800">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </form>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Configured Slots</Label>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          slot.isFull
                            ? "bg-slate-50 border-slate-200 text-slate-400"
                            : "bg-emerald-50/50 border-emerald-200 text-slate-900 font-semibold"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`w-3.5 h-3.5 ${slot.isFull ? "text-slate-400" : "text-emerald-600"}`} />
                          <span className={slot.isFull ? "line-through" : ""}>{slot.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={slot.isFull ? "secondary" : "outline"}
                            className="h-7 text-[11px] font-bold"
                            onClick={() => toggleSlotStatus(idx)}
                          >
                            {slot.isFull ? "Mark Free" : "Mark Full"}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-400 hover:text-rose-600"
                            onClick={() => handleDeleteSlot(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Queue & Appointments */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="shadow-xs border border-slate-200/80 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600" /> Patient Consultation Queue
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time list of confirmed tokens and booked consultations.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 max-h-[460px] overflow-y-auto">
                {appointments.length === 0 ? (
                  <div className="text-center py-10 border border-dashed rounded-xl text-xs text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No scheduled patient tokens in queue.
                  </div>
                ) : (
                  appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white shadow-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                              {apt.tokenId || "MC-789012"}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900">{apt.patientName}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {apt.patientPhone} • {apt.patientEmail}
                          </p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          {apt.time}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-medium">
                          {apt.consultationMode?.toLowerCase().includes("online") ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-blue-600" /> Video Call
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> In-Clinic
                            </>
                          )}
                        </span>
                        <span className="font-bold text-slate-800">Fee: ₹{apt.fee || 1000}</span>
                      </div>
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