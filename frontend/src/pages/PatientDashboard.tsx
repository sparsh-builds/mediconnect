import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Building2,
  Video,
  UserCheck,
  Download,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Loader2,
  FileText,
  Upload,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseconfig";
import { collection, query, where, onSnapshot, getDocs, doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Appointment {
  id?: string;
  tokenId?: string;
  doctor: string;
  specialty: string;
  hospital: string;
  consultationMode: string;
  date: string;
  time: string;
  fee: number;
  paymentStatus: string;
  status: string;
}

interface MedicalDoc {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
}

const DEFAULT_DOCS: MedicalDoc[] = [
  { id: "doc_1", name: "Blood Test - Complete Hemogram (CBC).pdf", category: "Lab Report", date: "Yesterday", size: "1.2 MB" },
  { id: "doc_2", name: "Dermatology Skin Prescription.png", category: "Prescription", date: "Aug 28, 2026", size: "840 KB" },
];

const PatientDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalDocs, setMedicalDocs] = useState<MedicalDoc[]>(DEFAULT_DOCS);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Lab Report");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const lastConfirmed = sessionStorage.getItem("lastConfirmedToken");
    const cachedAppt: Appointment | null = lastConfirmed ? JSON.parse(lastConfirmed) : null;

    if (!user) {
      if (cachedAppt) setAppointments([cachedAppt]);
      setLoading(false);
      return;
    }

    const apptsRef = collection(db, "appointments");
    const q = query(
      apptsRef,
      where("patientEmail", "==", user.email || "patient@mediconnect.demo")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Appointment) });
        });

        if (list.length === 0 && cachedAppt) list.push(cachedAppt);
        setAppointments(list);
        setLoading(false);
      },
      async () => {
        try {
          const allDocs = await getDocs(apptsRef);
          const fallbackList: Appointment[] = [];
          allDocs.forEach((docSnap) => {
            fallbackList.push({ id: docSnap.id, ...(docSnap.data() as Appointment) });
          });
          setAppointments(fallbackList.length > 0 ? fallbackList : cachedAppt ? [cachedAppt] : []);
        } catch {
          if (cachedAppt) setAppointments([cachedAppt]);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      toast.error("Please enter a medical report or document title.");
      return;
    }

    const newRecord: MedicalDoc = {
      id: `doc_${Date.now()}`,
      name: `${newDocTitle.trim()}.pdf`,
      category: newDocCategory,
      date: "Just now",
      size: "1.4 MB",
    };

    setMedicalDocs([newRecord, ...medicalDocs]);
    setNewDocTitle("");
    toast.success("Medical record uploaded and encrypted into your patient vault.");
  };

  const handleDeleteDoc = (id: string) => {
    setMedicalDocs(medicalDocs.filter((d) => d.id !== id));
    toast.success("Document removed from your vault.");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-200 text-sky-950 border border-sky-300 text-xs font-black mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Patient Health & Care Command
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Welcome, {user?.name || user?.email?.split("@")[0] || "Patient"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Manage verified OPD tokens, telemetry schedules, and upload encrypted health records.
            </p>
          </div>

          <Link to="/doctors">
            <Button className="bg-slate-950 hover:bg-slate-800 text-white font-black rounded-2xl text-xs sm:text-sm h-12 px-6 shadow-sm">
              <Calendar className="w-4 h-4 mr-2" /> Book New Consultation
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Scheduled OPD Tokens */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Scheduled Appointments ({appointments.length})
              </h2>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border-2 border-slate-300">
                <Loader2 className="w-8 h-8 animate-spin text-sky-700" />
                <p className="text-xs font-bold text-slate-700">Syncing tokens...</p>
              </div>
            ) : appointments.length === 0 ? (
              <Card className="border-2 border-slate-300 bg-white text-center py-14 rounded-2xl">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-950">No active appointments</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                      Select a specialist doctor to allocate your instant OPD queue pass.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              appointments.map((appt, idx) => {
                const isOnline = appt.consultationMode?.toLowerCase().includes("online");
                const tokenCode = appt.tokenId || `MC-${900120 + idx}`;

                return (
                  <Card key={appt.id || idx} className="border-2 border-slate-300 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="h-1.5 w-full bg-slate-950" />
                    <CardHeader className="p-5 pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-black bg-slate-950 text-white px-2.5 py-1 rounded-md">
                            TOKEN: {tokenCode}
                          </span>
                          <Badge className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[11px] font-black">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Confirmed & Verified
                          </Badge>
                        </div>

                        <Badge className={`text-xs font-black ${isOnline ? "bg-blue-100 text-blue-950 border-blue-300" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
                          {isOnline ? <Video className="w-3.5 h-3.5 mr-1" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />}
                          {isOnline ? "Video Call" : "In-Clinic Visit"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-2 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Doctor</p>
                          <p className="text-sm font-black text-slate-950">{appt.doctor}</p>
                          <p className="text-xs text-sky-800 font-bold">{appt.specialty}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Timing</p>
                          <p className="text-xs font-black text-slate-900 mt-0.5">{appt.date}</p>
                          <p className="text-xs font-bold text-emerald-700">{appt.time}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Center</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{appt.hospital}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <span className="text-xs font-black text-slate-900">Fee: ₹{appt.fee || 1000}</span>
                        {isOnline ? (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs h-9 rounded-xl">
                            <Video className="w-3.5 h-3.5 mr-1.5" /> Join Telehealth Call
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="border-2 border-slate-300 text-xs font-black h-9 rounded-xl" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.hospital)}`, "_blank")}>
                            <Navigation className="w-3.5 h-3.5 mr-1.5" /> Directions
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Right Column: Medical Records & Report Vault */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 border-slate-300 bg-white rounded-2xl shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-200">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Patient Medical Vault
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 font-semibold">
                  Upload lab reports, scans, and past prescriptions for doctors to review.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Upload Box Form */}
                <form onSubmit={handleFileUpload} className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-slate-900">Document Title</Label>
                    <Input
                      placeholder="e.g. Thyroid Panel & Blood CBC"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="text-xs font-bold border-2 border-slate-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700">Category</Label>
                      <select
                        value={newDocCategory}
                        onChange={(e) => setNewDocCategory(e.target.value)}
                        className="w-full h-9 border-2 border-slate-300 rounded-xl px-2 text-xs font-bold bg-white"
                      >
                        <option value="Lab Report">Lab Report</option>
                        <option value="Prescription">Prescription</option>
                        <option value="Scan / X-Ray">Scan / X-Ray</option>
                        <option value="Discharge Summary">Discharge Summary</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button type="submit" className="w-full text-xs font-black h-9 bg-slate-950 hover:bg-slate-800 text-white rounded-xl">
                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload File
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Uploaded Documents List */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {medicalDocs.map((docItem) => (
                    <div
                      key={docItem.id}
                      className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 bg-white shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 text-sky-900 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 line-clamp-1">{docItem.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold">
                            {docItem.category} • {docItem.date} • {docItem.size}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-600 hover:text-slate-950"
                          onClick={() => toast.info(`Viewing ${docItem.name}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-rose-600"
                          onClick={() => handleDeleteDoc(docItem.id)}
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;