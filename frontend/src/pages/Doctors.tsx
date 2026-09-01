import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DoctorCard, { DoctorSlot } from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Users,
  LocateFixed,
  ArrowUpDown,
  Sparkles,
  Loader2,
  CalendarCheck,
  Stethoscope,
  ShieldCheck,
  X,
  Video,
  Building2,
  CheckCircle2,
  Star,
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
            const resolvedGender: "male" | "female" =
              data.gender ||
              (data.name?.toLowerCase().includes("kanika") || data.name?.toLowerCase().includes("neha")
                ? "female"
                : "male");

            list.push({
              id: docSnap.id,
              name: data.name || "Doctor",
              gender: resolvedGender,
              specialty: data.specialty || "General Medicine",
              hospital: data.hospital || "City Hospital",
              rating: data.rating || 4.9,
              reviewsCount: data.reviewsCount || 100,
              experienceYears: data.experienceYears || 5,
              fee: data.fee || 800,
              distanceKm: data.distanceKm || 2.5,
              avatar: data.avatar || (resolvedGender === "female" ? "/hero-doctor.png" : "/doctors-team.jpg"),
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
        } catch {
          setDoctors(DEFAULT_DOCTORS);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleFindNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocationActive(true);
      setDoctors((prev) =>
        prev.map((d) => ({
          ...d,
          distanceKm: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
        }))
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setUserLocationActive(true);
        setDoctors((prev) =>
          prev.map((d) => ({
            ...d,
            distanceKm: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
          }))
        );
      },
      () => {
        setUserLocationActive(true);
        setDoctors((prev) =>
          prev.map((d) => ({
            ...d,
            distanceKm: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
          }))
        );
      },
      { timeout: 4000 }
    );
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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedSpecialty !== "All Specialties") count++;
    if (consultationMode !== "all") count++;
    if (genderFilter !== "all") count++;
    if (languageFilter !== "all") count++;
    if (minExperience > 0) count++;
    if (maxFee < 2000) count++;
    if (onlyAvailable) count++;
    if (userLocationActive) count++;
    return count;
  }, [
    searchQuery,
    selectedSpecialty,
    consultationMode,
    genderFilter,
    languageFilter,
    minExperience,
    maxFee,
    onlyAvailable,
    userLocationActive,
  ]);

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
      return 0;
    });

  const FilterContent = (
    <div className="space-y-6">
      {/* Consultation Format */}
      <div className="space-y-2.5">
        <Label className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Consultation Format
        </Label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-300">
          {[
            { id: "all", label: "All" },
            { id: "online", label: "Video", icon: Video },
            { id: "in-person", label: "Clinic", icon: Building2 },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`text-xs py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                consultationMode === mode.id
                  ? "bg-slate-950 text-white font-extrabold shadow-sm"
                  : "text-slate-800 font-bold hover:text-black hover:bg-slate-200/70"
              }`}
              onClick={() => setConsultationMode(mode.id as any)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Practitioner Gender */}
      <div className="space-y-2.5">
        <Label className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Doctor Gender
        </Label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-300">
          {[
            { id: "all", label: "Any" },
            { id: "female", label: "Female" },
            { id: "male", label: "Male" },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              className={`text-xs py-2 px-1 rounded-lg transition-all ${
                genderFilter === g.id
                  ? "bg-slate-950 text-white font-extrabold shadow-sm"
                  : "text-slate-800 font-bold hover:text-black hover:bg-slate-200/70"
              }`}
              onClick={() => setGenderFilter(g.id as any)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Language Spoken
        </Label>
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value as any)}
          className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs text-slate-950 bg-white font-bold hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Punjabi">Punjabi</option>
        </select>
      </div>

      {/* Experience Threshold */}
      <div className="space-y-2.5 bg-slate-100 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center text-xs">
          <Label className="font-extrabold text-slate-900">Minimum Experience</Label>
          <span className="text-sky-900 font-black bg-sky-200 px-2 py-0.5 rounded-md text-xs">
            {minExperience}+ Years
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="2"
          value={minExperience}
          onChange={(e) => setMinExperience(parseInt(e.target.value))}
          className="w-full accent-sky-700 h-2 bg-slate-300 rounded-lg cursor-pointer"
        />
      </div>

      {/* Fee Slider */}
      <div className="space-y-2.5 bg-slate-100 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center text-xs">
          <Label className="font-extrabold text-slate-900">Max Consultation Fee</Label>
          <span className="text-emerald-950 font-black bg-emerald-200 px-2.5 py-0.5 rounded-md text-xs">
            ₹{maxFee}
          </span>
        </div>
        <input
          type="range"
          min="300"
          max="2000"
          step="100"
          value={maxFee}
          onChange={(e) => setMaxFee(parseInt(e.target.value))}
          className="w-full accent-emerald-700 h-2 bg-slate-300 rounded-lg cursor-pointer"
        />
      </div>

      {/* Availability Toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-3 p-3.5 rounded-xl bg-sky-50 border-2 border-sky-300 cursor-pointer group hover:bg-sky-100 transition-all">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="rounded border-slate-400 text-sky-700 focus:ring-sky-600 h-4 w-4 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-950">
              Only Show Open Slots
            </span>
            <span className="text-[11px] text-slate-700 font-medium">Hide doctors with fully booked slots</span>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-16">
        {/* Hospital-Style High-Impact Hero Section */}
        <section className="bg-slate-950 text-white pt-10 pb-12 border-b-2 border-slate-800 shadow-md">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Heading & Search */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-950/80 px-4 py-1.5 text-xs font-bold text-sky-300 shadow-inner">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Real-Time Verified OPD Tokens & Queue Tracking
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                  Find & Book Top{" "}
                  <span className="text-sky-400 underline decoration-sky-500 underline-offset-4">
                    Specialist Doctors
                  </span>
                </h1>

                <p className="text-slate-200 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
                  Guaranteed consultation slots, live queue synchronization, and direct telemetry updates across partnered hospitals.
                </p>

                {/* Search Bar Container */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Search doctor name, hospital, condition, or specialty..."
                      className="pl-12 h-14 bg-slate-900 border-2 border-slate-700 text-white placeholder:text-slate-400 rounded-2xl text-sm font-medium focus:border-sky-400 focus:ring-2 focus:ring-sky-400 shadow-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className={`h-14 px-6 rounded-2xl text-xs font-extrabold transition-all border-2 ${
                      userLocationActive
                        ? "bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-700"
                        : "bg-slate-900 border-slate-600 text-white hover:bg-slate-800"
                    }`}
                    onClick={handleFindNearMe}
                  >
                    <LocateFixed className="w-4 h-4 mr-2 text-sky-400" />
                    {userLocationActive ? "Near Me Active" : "Find Near Me"}
                  </Button>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>100% Verified Credentials</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-sky-400" />
                    <span>Instant Token Lock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-300" />
                    <span>In-Person & Video</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Doctor Showcase Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-teal-500 rounded-3xl blur-md opacity-30"></div>

                  <Card className="relative bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative h-60 w-full overflow-hidden bg-slate-800">
                      <img
                        src="/doctors-team.jpg"
                        alt="Specialist Medical Team"
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                      
                      <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1 flex items-center gap-1.5 border-none shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 Verified OPD Staff
                      </Badge>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="/hero-doctor.png"
                          alt="Senior Physician"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-sky-400 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-white truncate">Top Medical Board</h4>
                          <p className="text-xs text-sky-400 font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400" /> 4.9 Average Patient Rating
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                          <span className="text-[11px] text-slate-400 block font-semibold">Specialists Active</span>
                          <span className="text-sm font-black text-white">{doctors.length}+ Available</span>
                        </div>
                        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                          <span className="text-[11px] text-slate-400 block font-semibold">Avg. Token Wait</span>
                          <span className="text-sm font-black text-emerald-400">Zero Line</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Directory Layout */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Desktop Filters Panel */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24">
              <Card className="shadow-md border border-slate-300 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sky-100 text-sky-900 rounded-xl">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-950">Filters</h3>
                        <p className="text-xs text-slate-600 font-semibold">Refine doctor search</p>
                      </div>
                    </div>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="h-8 px-2.5 text-xs text-sky-800 hover:text-sky-950 hover:bg-sky-100 font-extrabold rounded-lg"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset ({activeFiltersCount})
                      </Button>
                    )}
                  </div>

                  {FilterContent}
                </CardContent>
              </Card>
            </div>

            {/* Results Area */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Specialty Chips Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {SPECIALTIES.map((spec) => {
                  const isSelected = selectedSpecialty === spec;
                  return (
                    <button
                      key={spec}
                      type="button"
                      className={`text-xs shrink-0 h-9 px-4 rounded-xl transition-all font-bold flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-slate-950 text-white shadow-md scale-[1.02] border border-slate-950"
                          : "bg-white border-2 border-slate-300 text-slate-800 hover:bg-slate-200"
                      }`}
                      onClick={() => setSelectedSpecialty(spec)}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>

              {/* Sort & Counter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-950">
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? "Doctor" : "Doctors"} Available
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden h-9 text-xs font-black rounded-xl border-slate-300 bg-slate-50"
                    onClick={() => setMobileFilterOpen(true)}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-sky-700" />
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </Button>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <ArrowUpDown className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="text-xs text-slate-700 font-bold">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-black text-slate-950 bg-slate-100 border border-slate-300 rounded-lg p-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="fee_asc">Fee: Low to High</option>
                    <option value="exp_desc">Experience: High to Low</option>
                    <option value="rating_desc">Rating: Highest First</option>
                    <option value="distance">Distance: Nearest First</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border-2 border-slate-300 shadow-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-700" />
                  <p className="text-xs font-extrabold text-slate-800">Loading specialist availability...</p>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <Card className="text-center py-16 border-2 border-slate-300 bg-white rounded-2xl shadow-sm">
                  <CardContent className="space-y-4 max-w-md mx-auto">
                    <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-950">No doctors match your criteria</h3>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        Try adjusting fee ranges, format, or resetting filters.
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={resetFilters}
                      className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-black rounded-xl px-5 h-10"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset All Filters
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

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-end lg:hidden">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-sky-700" />
                  <h3 className="font-black text-base text-slate-950">Filters</h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {FilterContent}
            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl text-xs font-black h-11 border-2 border-slate-300"
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button
                variant="default"
                className="flex-1 rounded-xl text-xs font-black h-11 bg-slate-950 hover:bg-slate-900 text-white"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Doctors;