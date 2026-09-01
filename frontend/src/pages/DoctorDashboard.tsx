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
  FileText,
  CreditCard,
  Eye,
  ExternalLink,
  Lock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseconfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";

interface SlotItem {
  time: string;
  isFull: boolean;
}

interface MedicalRecord {
  id: string;
  title: string;
  fileUrl: string;
  uploadedAt: string;
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
  paymentStatus: string;
  status: string;
  records?: MedicalRecord[];
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [newSlotTime, setNewSlotTime] = useState("");
  const [requiresOfflinePrepay, setRequiresOfflinePrepay] = useState(false);
  const [slots, setSlots] = useState<SlotItem[]>([
    { time: "12:10 PM", isFull: true },
    { time: "12:20 PM", isFull: false },
    { time: "12:30 PM", isFull: false },
    { time: "12:40 PM", isFull: false },
    { time: "12:50 PM", isFull: false },
    { time: "01:00 PM", isFull: false },
  ]);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<{
    patientName: string;
    records: MedicalRecord[];
  } | null>(null);

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

    if (user?.uid) {
      const docRef = doc(db, "doctors", user.uid);
      const unsubDoc = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.slots) setSlots(data.slots);
          if (typeof data.requiresOfflinePrepay === "boolean") {
            setRequiresOfflinePrepay(data.requiresOfflinePrepay);
          }
        }
      });
      return () => {
        unsubscribe();
        unsubDoc();
      };
    }

    return () => unsubscribe();
  }, [user]);

  const handleTogglePrepayRule = async () => {
    const nextVal = !requiresOfflinePrepay;
    setRequiresOfflinePrepay(nextVal);
    toast.success(
      nextVal
        ? "Advance payment enabled for In-Clinic appointments."
        : "In-Clinic visits now permit Pay-at-Desk."
    );

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { requiresOfflinePrepay: nextVal });
      } catch (err) {
        console.warn("Updated local state.");
      }
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) {
      toast.error("Please enter a valid slot time (e.g. 03:30 PM)");
      return;
    }

    if (slots.some((s) => s.time.toLowerCase() === newSlotTime.trim().toLowerCase())) {
      toast.error("This slot already exists.");
      return;
    }

    const updated = [...slots, { time: newSlotTime.trim(), isFull: false }];
    setSlots(updated);
    setNewSlotTime("");
    toast.success(`Slot ${newSlotTime} registered.`);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.warn("Updated locally.");
      }
    }
  };

  const toggleSlotStatus = async (index: number) => {
    const updated = [...slots];
    updated[index].isFull = !updated[index].isFull;
    setSlots(updated);
    toast.info(`Slot is now ${updated[index].isFull ? "FULL" : "OPEN"}`);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.warn("Updated locally.");
      }
    }
  };

  const handleDeleteSlot = async (index: number) => {
    const slotTime = slots[index].time;
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
    toast.success(`Slot ${slotTime} deleted.`);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, "doctors", user.uid), { slots: updated });
      } catch (err) {
        console.warn("Updated locally.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge className="bg-sky-100 text-sky-950 border border-sky-300 text-xs font-black mb-2">
              Clinical Control Suite
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
              Doctor Schedule & OPD Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
              Configure OPD booking rules, view patient medical vaults, and manage live queue tokens.
            </p>
          </div>
        </div>

        {/* Prepayment Policy Controller Card */}
        <Card className="mb-8 border-2 border-slate-300 bg-white rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-950 text-white p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-sky-400" />
                <div>
                  <CardTitle className="text-sm font-black text-white">
                    Consultation Payment Policies
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-300">
                    Mandatory video call prepayments and custom in-clinic billing configurations.
                  </CardDescription>
                </div>
              </div>

              <Badge className="bg-sky-900 border border-sky-400 text-sky-200 text-xs font-bold">
                Automated Gateway Engine
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video Policy: Fixed Prepayment */}
            <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-black text-slate-900">Video Consultations</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Prepayment is mandatory before generating a video call token.
                </p>
              </div>
              <Badge className="bg-slate-900 text-white font-bold text-[10px] shrink-0">
                <Lock className="w-3 h-3 mr-1" /> Always Prepay
              </Badge>
            </div>

            {/* Offline In-Clinic Policy: Doctor Toggle */}
            <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-900">In-Clinic OPD Visits</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {requiresOfflinePrepay
                    ? "Advance prepayment required from patient."
                    : "Pay-at-Desk permitted on clinic arrival."}
                </p>
              </div>
              <Button
                size="sm"
                variant={requiresOfflinePrepay ? "default" : "outline"}
                className={`text-xs font-black rounded-xl h-8 shrink-0 ${
                  requiresOfflinePrepay
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border-2 border-slate-300 text-slate-800"
                }`}
                onClick={handleTogglePrepayRule}
              >
                {requiresOfflinePrepay ? "Advance Prepay ON" : "Pay at Desk"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Slots Manager */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 border-slate-300 bg-white rounded-2xl shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-200">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-950">
                  <Clock className="w-4 h-4 text-sky-700" /> OPD Consultation Slots
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 font-semibold">
                  Add or toggle availability for instant queue token booking.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <form onSubmit={handleAddSlot} className="flex gap-2">
                  <Input
                    placeholder="e.g. 03:40 PM"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="text-xs border-2 border-slate-300 font-bold"
                  />
                  <Button type="submit" className="gap-1 text-xs font-black h-10 bg-slate-950 hover:bg-slate-800 text-white px-4 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Slot
                  </Button>
                </form>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 text-xs transition-all ${
                        slot.isFull
                          ? "bg-slate-100 border-slate-300 text-slate-500"
                          : "bg-emerald-50 border-emerald-300 text-slate-950 font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${slot.isFull ? "text-slate-400" : "text-emerald-600"}`} />
                        <span className={slot.isFull ? "line-through font-medium" : "font-black"}>{slot.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={slot.isFull ? "secondary" : "outline"}
                          className="h-7 text-[11px] font-black rounded-lg"
                          onClick={() => toggleSlotStatus(idx)}
                        >
                          {slot.isFull ? "Mark Open" : "Mark Full"}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-slate-400 hover:text-rose-600"
                          onClick={() => handleDeleteSlot(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Queue & Medical History Vault */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-2 border-slate-300 bg-white rounded-2xl shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-200">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-950">
                  <Users className="w-4 h-4 text-sky-700" /> Patient Queue & History Access
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 font-semibold">
                  Review booked patient tokens and inspect attached medical records.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 max-h-[500px] overflow-y-auto">
                {appointments.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    No patient consultations in queue.
                  </div>
                ) : (
                  appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border-2 border-slate-200 rounded-2xl p-4 space-y-3 bg-white shadow-xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black bg-slate-950 text-white px-2 py-0.5 rounded-md">
                              {apt.tokenId || "MC-100234"}
                            </span>
                            <h4 className="font-black text-sm text-slate-950">{apt.patientName}</h4>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-1">
                            {apt.patientPhone} • {apt.patientEmail}
                          </p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black">
                          {apt.time}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">
                            {apt.consultationMode?.toLowerCase().includes("online") ? "Video Call" : "In-Clinic"}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-black text-slate-900">₹{apt.fee || 1000}</span>
                          <Badge variant="outline" className="text-[10px] font-bold border-slate-300">
                            {apt.paymentStatus || "Paid"}
                          </Badge>
                        </div>

                        {/* Medical Vault Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-black h-8 rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-950 hover:bg-sky-100"
                          onClick={() =>
                            setSelectedPatientRecords({
                              patientName: apt.patientName,
                              records: apt.records || [
                                {
                                  id: "rec_1",
                                  title: "Blood Chemistry & CBC Report",
                                  fileUrl: "#",
                                  uploadedAt: "Today, 10:30 AM",
                                },
                                {
                                  id: "rec_2",
                                  title: "Previous Prescription (General Medicine)",
                                  fileUrl: "#",
                                  uploadedAt: "Yesterday",
                                },
                              ],
                            })
                          }
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 text-sky-700" />
                          View Medical History ({apt.records?.length || 2})
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Patient Medical Records Modal */}
      {selectedPatientRecords && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-300 shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-950 text-white p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" /> Patient Medical Vault
                </CardTitle>
                <CardDescription className="text-xs text-slate-300">
                  Attached records for {selectedPatientRecords.patientName}
                </CardDescription>
              </div>
              <button
                onClick={() => setSelectedPatientRecords(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {selectedPatientRecords.records.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No previous records uploaded by this patient.
                </p>
              ) : (
                selectedPatientRecords.records.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-950">{rec.title}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{rec.uploadedAt}</p>
                    </div>
                    <Button
                      size="sm"
                      className="text-xs font-black h-8 rounded-xl bg-slate-950 hover:bg-slate-800 text-white"
                      onClick={() => toast.info(`Accessing record: ${rec.title}`)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Inspect
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DoctorDashboard;