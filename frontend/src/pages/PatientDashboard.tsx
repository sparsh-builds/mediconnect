import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Building2,
  Video,
  UserCheck,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseconfig";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
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
  createdAt?: any;
}

const PatientDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Check if there is a newly confirmed booking in session
    const lastConfirmed = sessionStorage.getItem("lastConfirmedToken");
    const cachedAppt: Appointment | null = lastConfirmed ? JSON.parse(lastConfirmed) : null;

    if (!user) {
      if (cachedAppt) setAppointments([cachedAppt]);
      setLoading(false);
      return;
    }

    // Subscribe to real-time appointments for this patient
    const apptsRef = collection(db, "appointments");
    
    // Query by either user.uid or user.email
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

        if (list.length === 0 && cachedAppt) {
          list.push(cachedAppt);
        }

        setAppointments(list);
        setLoading(false);
      },
      async (err) => {
        console.warn("Real-time listener fallback, attempting full fetch:", err);
        try {
          const allDocs = await getDocs(apptsRef);
          const fallbackList: Appointment[] = [];
          allDocs.forEach((docSnap) => {
            const data = docSnap.data() as Appointment;
            fallbackList.push({ id: docSnap.id, ...data });
          });
          setAppointments(fallbackList.length > 0 ? fallbackList : cachedAppt ? [cachedAppt] : []);
        } catch (e) {
          if (cachedAppt) setAppointments([cachedAppt]);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleDownloadToken = (appt: Appointment) => {
    toast.success(`Digital OPD Token #${appt.tokenId || "MC-789012"} saved to downloads.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl flex-1">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Patient Care Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {user?.name || user?.email?.split("@")[0] || "Rahul"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage verified OPD tokens, consult schedules, and live queue status.
            </p>
          </div>

          <Link to="/doctors">
            <Button className="bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-xl text-xs sm:text-sm h-11 px-5 shadow-xs">
              <Calendar className="w-4 h-4 mr-2" /> Book New Consultation
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs text-slate-500">Retrieving confirmed appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          /* Empty State */
          <Card className="border border-slate-200 bg-white text-center py-14 shadow-xs">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No active appointments found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You do not have any scheduled consultations. Search specialist doctors to allocate an OPD digital token.
                </p>
              </div>
              <Link to="/doctors">
                <Button variant="outline" className="text-xs border-slate-300">
                  Find a Doctor
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Active Appointment Cards Grid */
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Your Scheduled Tokens ({appointments.length})
            </h2>

            {appointments.map((appt, idx) => {
              const isOnline = appt.consultationMode?.toLowerCase().includes("online");
              const tokenCode = appt.tokenId || `MC-${900120 + idx}`;

              return (
                <Card
                  key={appt.id || idx}
                  className="border border-slate-200/90 shadow-sm bg-white overflow-hidden rounded-2xl"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400" />

                  <CardHeader className="p-5 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md tracking-wider">
                          TOKEN: {tokenCode}
                        </span>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed & Paid
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs gap-1">
                            <Video className="w-3.5 h-3.5" /> Online Video Call
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> In-Clinic Visit
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                      {/* Doctor Info */}
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">Specialist</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">{appt.doctor}</p>
                        <p className="text-xs text-sky-700 font-medium">{appt.specialty}</p>
                      </div>

                      {/* Schedule Window */}
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">Schedule</p>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" /> {appt.date}
                        </p>
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5" /> {appt.time}
                        </p>
                      </div>

                      {/* Location Facility */}
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">Hospital Facility</p>
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{appt.hospital}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 pl-5">Sector 26, Sonipat</p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>NABH Verified digital queue entry pass</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial text-xs h-9 border-slate-200"
                          onClick={() => handleDownloadToken(appt)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Save Token Pass
                        </Button>

                        {isOnline ? (
                          <Button
                            size="sm"
                            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                            onClick={() =>
                              toast.info("Connecting to secure encrypted telehealth room...")
                            }
                          >
                            <Video className="w-3.5 h-3.5 mr-1.5" /> Join Video Call
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 sm:flex-initial bg-sky-700 hover:bg-sky-800 text-white text-xs h-9"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  appt.hospital
                                )}`,
                                "_blank"
                              )
                            }
                          >
                            <Navigation className="w-3.5 h-3.5 mr-1.5" /> Directions
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;