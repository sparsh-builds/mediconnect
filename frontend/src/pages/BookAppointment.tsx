import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Languages,
  MapPin,
  Share2,
  Stethoscope,
  ShieldCheck,
  Navigation,
  CalendarCheck,
  Video,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

const DATES = [
  { day: "Sun", date: "30", full: "Sunday, Aug 30" },
  { day: "Mon", date: "31", full: "Monday, Aug 31" },
  { day: "Tue", date: "1", full: "Tuesday, Sep 1" },
  { day: "Wed", date: "2", full: "Wednesday, Sep 2" },
];

const DEFAULT_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:15 AM",
  "12:10 PM",
  "12:30 PM",
  "02:00 PM",
  "03:15 PM",
  "04:30 PM",
];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const doctorId = searchParams.get("id") || "doc_kanika_derma";
  const [doctorName, setDoctorName] = useState(searchParams.get("name") || "Dr. Kanika Roy");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "Dermatology");
  const [hospital, setHospital] = useState(searchParams.get("hospital") || "Apollo Hospitals Sector 26");
  const [avatar, setAvatar] = useState(searchParams.get("avatar") || "/hero-doctor.png");
  const [fee, setFee] = useState(Number(searchParams.get("fee")) || 1000);
  const [degrees, setDegrees] = useState("MBBS, MD (DERMATOLOGY & LEPROSY), DNB");
  const [registrationNo, setRegistrationNo] = useState("DMC/R/22219");
  const [languages, setLanguages] = useState(["English", "Hindi"]);
  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);

  const [consultationMode, setConsultationMode] = useState<"visit" | "online">("visit");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_SLOTS[0]);
  const [activeInfoTab, setActiveInfoTab] = useState<"about" | "edu" | "reg">("about");

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const docRef = doc(db, "doctors", doctorId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const d = snap.data();
          if (d.name) setDoctorName(d.name);
          if (d.specialty) setSpecialty(d.specialty);
          if (d.hospital) setHospital(d.hospital);
          if (d.avatar) setAvatar(d.avatar);
          if (d.fee) setFee(d.fee);
          if (d.degrees) setDegrees(d.degrees);
          if (d.registrationNo) setRegistrationNo(d.registrationNo);
          if (d.languages) setLanguages(d.languages);
          if (d.slots && d.slots.length > 0) {
            const open = d.slots.filter((s: any) => !s.isFull).map((s: any) => s.time);
            if (open.length > 0) {
              setSlots(open);
              setSelectedSlot(open[0]);
            }
          }
        }
      } catch (e) {
        console.log("Using URL query parameter fallback.");
      }
    };
    fetchDoctorProfile();
  }, [doctorId]);

  const handleSchedule = () => {
    if (!selectedSlot) {
      toast.error("Please pick an available consultation window.");
      return;
    }

    const payload = {
      doctorId,
      doctor: doctorName,
      specialty,
      hospital,
      consultationMode: consultationMode === "visit" ? "In-Clinic Visit" : "Online Video Call",
      date: DATES[selectedDateIndex].full,
      time: selectedSlot,
      fee,
      patientId: user?.uid || "guest",
      patientEmail: user?.email || "patient@mediconnect.demo",
      patientName: user?.name || user?.email?.split("@")[0] || "Rahul Verma",
      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem("pendingBooking", JSON.stringify(payload));
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Doctor Profile & Clinical Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Doctor clinical profile copied!");
                }}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <img
                    src={avatar || "/hero-doctor.png"}
                    alt={doctorName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top border border-slate-100 shadow-inner bg-slate-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/hero-doctor.png";
                    }}
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-400 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    VERIFIED MD
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 pr-6">
                  <h1 className="text-2xl font-bold text-slate-900">{doctorName}</h1>
                  <p className="text-sm font-semibold text-sky-800">{specialty}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{degrees}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Languages className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Verified Facility Card */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{hospital}</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-5 leading-relaxed">
                    Main Medical Complex, Sector 26, Sonipat, 131001
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sky-700 hover:text-sky-800 text-xs font-semibold gap-1 shrink-0"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital)}`,
                      "_blank"
                    )
                  }
                >
                  <Navigation className="w-3.5 h-3.5" /> Directions
                </Button>
              </div>
            </div>

            {/* Credential Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex gap-2 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    activeInfoTab === "about"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveInfoTab("about")}
                >
                  Doctor Profile
                </button>
                <button
                  type="button"
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    activeInfoTab === "edu"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveInfoTab("edu")}
                >
                  Qualifications
                </button>
                <button
                  type="button"
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    activeInfoTab === "reg"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveInfoTab("reg")}
                >
                  Medical Registry
                </button>
              </div>

              {activeInfoTab === "about" && (
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    • {doctorName} is a certified specialist at {hospital}. Practicing clinical diagnostics and patient-first medical treatments.
                  </p>
                  <p>• Verified token consultation fee: ₹{fee} (Includes digital entry pass).</p>
                </div>
              )}

              {activeInfoTab === "edu" && (
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <span>Education Qualifications</span>
                  </div>
                  <p className="pl-6 text-slate-600">{degrees}</p>
                </div>
              )}

              {activeInfoTab === "reg" && (
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>State Medical Council Registration</span>
                  </div>
                  <p className="pl-6 text-slate-600">{registrationNo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Slot Selection Matrix */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
              
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 border-b border-slate-200 text-center text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  className={`py-3.5 border-b-2 transition-colors ${
                    consultationMode === "visit"
                      ? "border-emerald-600 text-emerald-800 bg-emerald-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => setConsultationMode("visit")}
                >
                  In-Clinic OPD
                </button>
                <button
                  type="button"
                  className={`py-3.5 border-b-2 transition-colors ${
                    consultationMode === "online"
                      ? "border-sky-600 text-sky-800 bg-sky-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => setConsultationMode("online")}
                >
                  Video Telehealth
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-800">
                    {consultationMode === "visit" ? "Hospital In-Person Slot" : "Telehealth Video Window"}
                  </span>
                  <span className="text-2xl font-black text-slate-900">₹{fee}</span>
                </div>

                {/* Date Selectors */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Select Date</span>
                  <div className="grid grid-cols-4 gap-2">
                    {DATES.map((d, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          selectedDateIndex === idx
                            ? "bg-slate-900 border-slate-900 text-white font-bold shadow-xs"
                            : "border-slate-200 text-slate-700 hover:border-slate-300 font-medium bg-white"
                        }`}
                        onClick={() => setSelectedDateIndex(idx)}
                      >
                        <span className={`text-[10px] uppercase ${selectedDateIndex === idx ? "text-slate-300" : "text-slate-400"}`}>
                          {d.day}
                        </span>
                        <span className="text-lg leading-tight">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Available Consultation Slots</span>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`py-2 px-1 text-[11px] rounded-lg border transition-all ${
                          selectedSlot === slot
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs"
                            : "border-slate-200 text-slate-700 hover:border-slate-300 bg-white"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <Button
                  onClick={handleSchedule}
                  className="w-full h-12 bg-slate-900 hover:bg-sky-900 text-white font-bold rounded-xl shadow-md text-sm"
                >
                  Lock Slot & Proceed to Pay
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant Verified Digital OPD Pass</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointment;