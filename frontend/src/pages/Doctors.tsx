import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DoctorCard, { DoctorSlot } from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Users,
  Activity,
  LocateFixed,
  ArrowUpDown,
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";
import { db } from "@/firebaseconfig";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

interface DoctorData {
  id: string;
  name: string;
  gender?: "male" | "female";
  specialty: string;
  hospital: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  fee: number;
  distanceKm: number;
  avatar: string;
  degrees?: string;
  languages?: string[];
  consultationType?: "online" | "in-person" | "both";
  slots: DoctorSlot[];
}

const SPECIALTIES = [
  "All Specialties",
  "Dermatology",
  "Neurology",
  "General Medicine",
  "Orthopedics",
  "Cardiology",
  "Pediatrics",
  "Ophthalmology",
];

const DEFAULT_DOCTORS: DoctorData[] = [
  {
    id: "doc_kanika_derma",
    name: "Dr. Kanika Roy",
    gender: "female",
    specialty: "Dermatology",
    hospital: "Apollo Hospitals Sector 26",
    degrees: "MBBS, MD (DERMATOLOGY & LEPROSY), DNB",
    experienceYears: 10,
    rating: 4.9,
    reviewsCount: 312,
    fee: 1000,
    distanceKm: 1.8,
    avatar: "/hero-doctor.png",
    languages: ["English", "Hindi"],
    consultationType: "both",
    slots: [
      { time: "12:10 PM", isFull: false },
      { time: "12:20 PM", isFull: false },
      { time: "12:30 PM", isFull: false },
      { time: "12:40 PM", isFull: false },
    ],
  },
  {
    id: "doc_suresh_neuro",
    name: "Dr. Suresh Rao",
    gender: "male",
    specialty: "Neurology",
    hospital: "City Central Super Speciality",
    degrees: "MBBS, DM (Neurology)",
    experienceYears: 18,
    rating: 4.8,
    reviewsCount: 428,
    fee: 1200,
    distanceKm: 3.2,
    avatar: "/doctors-team.jpg",
    languages: ["English", "Hindi", "Punjabi"],
    consultationType: "both",
    slots: [
      { time: "10:00 AM", isFull: false },
      { time: "10:30 AM", isFull: false },
    ],
  },
  {
    id: "doc_neha_general",
    name: "Dr. Neha Kapoor",
    gender: "female",
    specialty: "General Medicine",
    hospital: "Sunrise Multispecialty Hospital",
    degrees: "MBBS, MD (Internal Medicine)",
    experienceYears: 8,
    rating: 4.7,
    reviewsCount: 195,
    fee: 500,
    distanceKm: 2.1,
    avatar: "/hero-doctor.png",
    languages: ["English", "Hindi"],
    consultationType: "both",
    slots: [
      { time: "02:00 PM", isFull: false },
      { time: "02:30 PM", isFull: false },
    ],
  },
  {
    id: "doc_manpreet_ortho",
    name: "Dr. Manpreet Singh",
    gender: "male",
    specialty: "Orthopedics",
    hospital: "Metro Bone & Joint Institute",
    degrees: "MBBS, MS (Orthopedics)",
    experienceYears: 15,
    rating: 4.9,
    reviewsCount: 512,
    fee: 800,
    distanceKm: 4.5,
    avatar: "/doctors-team.jpg",
    languages: ["English", "Hindi", "Punjabi"],
    consultationType: "both",
    slots: [
      { time: "04:00 PM", isFull: false },
      { time: "04:30 PM", isFull: false },
    ],
  },
];

const Doctors = () => {
  const [doctors, setDoctors] = useState<DoctorData[]>(DEFAULT_DOCTORS);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [consultationMode, setConsultationMode] = useState<"all" | "online" | "in-person">("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male">("all");
  const [languageFilter, setLanguageFilter] = useState<"all" | "English" | "Hindi" | "Punjabi">("all");
  const [minExperience, setMinExperience] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxFee, setMaxFee] = useState<number>(2000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"relevance" | "fee_asc" | "exp_desc" | "rating_desc" | "distance">("relevance");
  const [userLocationActive, setUserLocationActive] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "doctors"),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: DoctorData[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || "Doctor",
              gender: data.gender || (data.name?.toLowerCase().includes("kanika") || data.name?.toLowerCase().includes("neha") ? "female" : "male"),
              specialty: data.specialty || "General Medicine",
              hospital: data.hospital || "City Hospital",
              rating: data.rating || 4.9,
              reviewsCount: data.reviewsCount || 100,
              experienceYears: data.experienceYears || 5,
              fee: data.fee || 800,
              distanceKm: data.distanceKm || 2.5,
              avatar: data.avatar || "/hero-doctor.png",
              degrees: data.degrees || "MBBS, MD",
              languages: data.languages || ["English", "Hindi"],
              consultationType: data.consultationType || "both",
              slots: data.slots || [],
            });
          });
          setDoctors(list);
        }
        setLoading(false);
      },
      async () => {
        try {
          const docsSnap = await getDocs(collection(db, "doctors"));
          if (!docsSnap.empty) {
            const list: DoctorData[] = [];
            docsSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as DoctorData));
            setDoctors(list);
          }
        } catch (e) {
          setDoctors(DEFAULT_DOCTORS);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleFindNearMe = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setUserLocationActive(true);
          setDoctors((prev) =>
            prev.map((d) => ({ ...d, distanceKm: parseFloat((Math.random() * 3 + 0.5).toFixed(1)) }))
          );
        },
        () => alert("Location access denied or unavailable.")
      );
    }
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("All Specialties");
    setConsultationMode("all");
    setGenderFilter("all");
    setLanguageFilter("all");
    setMinExperience(0);
    setMinRating(0);
    setMaxFee(2000);
    setOnlyAvailable(false);
    setSortBy("relevance");
    setUserLocationActive(false);
  };

  const filteredDoctors = doctors
    .filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === "All Specialties" ||
        doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

      const matchesMode =
        consultationMode === "all" ||
        doc.consultationType === "both" ||
        doc.consultationType === consultationMode;

      const matchesGender = genderFilter === "all" || doc.gender === genderFilter;

      const matchesLanguage =
        languageFilter === "all" || (doc.languages && doc.languages.includes(languageFilter));

      const matchesExperience = doc.experienceYears >= minExperience;
      const matchesRating = doc.rating >= minRating;
      const matchesFee = doc.fee <= maxFee;
      const matchesAvailability = !onlyAvailable || (doc.slots && doc.slots.some((s) => !s.isFull));

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesMode &&
        matchesGender &&
        matchesLanguage &&
        matchesExperience &&
        matchesRating &&
        matchesFee &&
        matchesAvailability
      );
    })
    .sort((a, b) => {
      if (sortBy === "fee_asc") return a.fee - b.fee;
      if (sortBy === "exp_desc") return b.experienceYears - a.experienceYears;
      if (sortBy === "rating_desc") return b.rating - a.rating;
      if (sortBy === "distance") return a.distanceKm - b.distanceKm;
      return 0; // relevance
    });

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* Hub Search Hero */}
        <section className="bg-slate-900 text-white py-12 border-b border-slate-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
                <Activity className="w-3.5 h-3.5 animate-pulse text-sky-400" /> Real-Time OPD Token Scheduling
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Find and Book Top Clinical Specialists
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm">
                Real-time queue verification, guaranteed on-time consultation slots, and direct hospital telemetry.
              </p>

              {/* Primary Search & Geo Action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search doctor name, hospital, condition, or specialty..."
                    className="pl-10 h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 rounded-xl text-xs sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className={`h-12 px-5 border-slate-700 rounded-xl text-xs font-semibold ${
                    userLocationActive ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-800 text-slate-200"
                  }`}
                  onClick={handleFindNearMe}
                >
                  <LocateFixed className="w-4 h-4 mr-2 text-sky-400" />
                  {userLocationActive ? "Near Me Active" : "Find Near Me"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Layout */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Advanced Filters Panel */}
            <div className="lg:col-span-4">
              <Card className="sticky top-20 shadow-xs border border-slate-200/90 bg-white rounded-2xl">
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-slate-900">
                      <SlidersHorizontal className="w-4 h-4 text-sky-600" /> Refine Registry
                    </h3>
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs text-slate-500">
                      <RotateCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                  </div>

                  {/* Consultation Format */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Consultation Format</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: "all", label: "All" },
                        { id: "online", label: "Video" },
                        { id: "in-person", label: "In-Clinic" },
                      ].map((mode) => (
                        <Button
                          key={mode.id}
                          size="sm"
                          variant={consultationMode === mode.id ? "default" : "outline"}
                          className={`text-[11px] h-8 ${
                            consultationMode === mode.id ? "bg-slate-900 text-white font-bold" : "text-slate-600 border-slate-200"
                          }`}
                          onClick={() => setConsultationMode(mode.id as any)}
                        >
                          {mode.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Gender */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Practitioner Gender</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: "all", label: "Any" },
                        { id: "female", label: "Female" },
                        { id: "male", label: "Male" },
                      ].map((g) => (
                        <Button
                          key={g.id}
                          size="sm"
                          variant={genderFilter === g.id ? "default" : "outline"}
                          className={`text-[11px] h-8 ${
                            genderFilter === g.id ? "bg-slate-900 text-white font-bold" : "text-slate-600 border-slate-200"
                          }`}
                          onClick={() => setGenderFilter(g.id as any)}
                        >
                          {g.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Language Spoken</Label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value as any)}
                      className="w-full h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-800 bg-white"
                    >
                      <option value="all">All Languages</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Punjabi">Punjabi</option>
                    </select>
                  </div>

                  {/* Experience Threshold */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <Label className="text-slate-700">Experience</Label>
                      <span className="text-sky-700 font-bold">{minExperience}+ Years</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="2"
                      value={minExperience}
                      onChange={(e) => setMinExperience(parseInt(e.target.value))}
                      className="w-full accent-sky-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Fee Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <Label className="text-slate-700">Max Fee</Label>
                      <span className="text-sky-700 font-bold">₹{maxFee}</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="2000"
                      step="100"
                      value={maxFee}
                      onChange={(e) => setMaxFee(parseInt(e.target.value))}
                      className="w-full accent-sky-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Availability Toggle */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={onlyAvailable}
                        onChange={(e) => setOnlyAvailable(e.target.checked)}
                        className="rounded border-slate-300 text-sky-600 h-4 w-4"
                      />
                      <span>Only open slots today</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Doctors Results & Sort Controller */}
            <div className="lg:col-span-8 space-y-5">
              {/* Specialty Chips Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SPECIALTIES.map((spec) => (
                  <Button
                    key={spec}
                    size="sm"
                    variant={selectedSpecialty === spec ? "default" : "outline"}
                    className={`rounded-full text-xs shrink-0 h-8 px-3.5 transition-all ${
                      selectedSpecialty === spec
                        ? "bg-slate-900 text-white font-semibold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedSpecialty(spec)}
                  >
                    {spec}
                  </Button>
                ))}
              </div>

              {/* Sort & Counter Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="font-semibold text-slate-800">
                  Showing {filteredDoctors.length} verified doctors
                </span>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border-none bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="fee_asc">Fee: Low to High</option>
                    <option value="exp_desc">Experience: High to Low</option>
                    <option value="rating_desc">Rating: Highest First</option>
                    <option value="distance">Distance: Nearest First</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                  <p className="text-xs text-slate-500">Fetching specialist credentials...</p>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <Card className="text-center py-14 border border-slate-200 bg-white rounded-2xl">
                  <CardContent className="space-y-3">
                    <Users className="w-10 h-10 mx-auto text-slate-400" />
                    <h3 className="text-base font-bold text-slate-900">No doctors match all selected criteria</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try resetting filters or adjusting maximum consultation fee.
                    </p>
                    <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
                      Reset All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredDoctors.map((doc) => (
                    <DoctorCard key={doc.id} {...doc} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Doctors;