import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DoctorCard, { DoctorSlot } from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, RotateCcw, MapPin, Star, Users } from "lucide-react";
import { db } from "@/firebaseconfig";
import { collection, onSnapshot } from "firebase/firestore";

interface DoctorData {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  fee: number;
  distanceKm: number;
  avatar: string;
  slots: DoctorSlot[];
}

const INITIAL_DOCTORS: DoctorData[] = [
  {
    id: "dr-johnson",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    hospital: "City Central Hospital",
    rating: 4.9,
    reviewsCount: 142,
    experienceYears: 12,
    fee: 500,
    distanceKm: 2.4,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    slots: [
      { time: "09:00 AM", isFull: false },
      { time: "10:30 AM", isFull: true },
      { time: "02:00 PM", isFull: false },
    ],
  },
  {
    id: "dr-chen",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    hospital: "Apex Multispeciality Center",
    rating: 4.8,
    reviewsCount: 98,
    experienceYears: 10,
    fee: 700,
    distanceKm: 4.8,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    slots: [
      { time: "10:00 AM", isFull: false },
      { time: "11:30 AM", isFull: false },
    ],
  },
];

const SPECIALTIES = ["All", "Cardiology", "Neurology", "General Medicine", "Orthopedics", "Pediatrics", "Ophthalmology"];

const Doctors = () => {
  const [doctors, setDoctors] = useState<DoctorData[]>(INITIAL_DOCTORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [maxFee, setMaxFee] = useState<number>(1000);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "doctors"),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: DoctorData[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as DoctorData);
          });
          setDoctors(list);
        }
      },
      (err) => console.log("Static doctor fallback:", err.message)
    );
    return () => unsubscribe();
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("All");
    setMaxDistance(10);
    setMinRating(0);
    setOnlyAvailable(false);
    setMaxFee(1000);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All" || doc.specialty === selectedSpecialty;
    const matchesDistance = doc.distanceKm <= maxDistance;
    const matchesRating = doc.rating >= minRating;
    const matchesFee = doc.fee <= maxFee;
    const matchesAvailability = !onlyAvailable || doc.slots.some((s) => !s.isFull);

    return matchesSearch && matchesSpecialty && matchesDistance && matchesRating && matchesFee && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* Banner with Doctor Team Image */}
        <section className="relative overflow-hidden bg-slate-950 text-white py-14 border-b">
          <div className="absolute inset-0 z-0 opacity-25">
            <img src="/doctors-team.jpg" alt="Medical Specialists Team" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-6xl">
            <div className="max-w-2xl space-y-3">
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                <Users className="w-3.5 h-3.5 mr-1.5" /> Verified Medical Board
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                OPD Specialist Panel & Live Queue
              </h1>
              <p className="text-slate-300 text-sm">
                Schedule consultations directly with credentialed surgeons and physicians. Filter by hospital distance, rating, and fee structure.
              </p>
            </div>
          </div>
        </section>

        {/* Directory & Filters */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 shadow-sm border">
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
                    </h3>
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
                      <RotateCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> Max Radius</Label>
                      <span className="text-primary">{maxDistance} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" /> Minimum Rating
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[0, 4.5, 4.8].map((rate) => (
                        <Button
                          key={rate}
                          type="button"
                          variant={minRating === rate ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setMinRating(rate)}
                        >
                          {rate === 0 ? "Any" : `${rate}+ ★`}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <Label>Max Fee</Label>
                      <span className="text-primary">₹{maxFee}</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="1000"
                      step="50"
                      value={maxFee}
                      onChange={(e) => setMaxFee(parseInt(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={onlyAvailable}
                        onChange={(e) => setOnlyAvailable(e.target.checked)}
                        className="rounded border-slate-300 text-primary h-4 w-4"
                      />
                      <span>Only open slots</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Doctor Cards */}
            <div className="lg:col-span-3 space-y-6">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search doctor name, hospital, or specialty..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {SPECIALTIES.map((spec) => (
                  <Button
                    key={spec}
                    size="sm"
                    variant={selectedSpecialty === spec ? "default" : "outline"}
                    className="rounded-full text-xs shrink-0 h-7"
                    onClick={() => setSelectedSpecialty(spec)}
                  >
                    {spec}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => (
                  <DoctorCard key={doc.id} {...doc} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Doctors;