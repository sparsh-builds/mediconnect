import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Clock,
  Hospital as HospitalIcon,
  Search,
  Filter,
  LocateFixed,
  Ambulance,
  ChevronDown,
  ChevronUp,
  Navigation,
  Activity,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  subscribeToHospitals,
  getDistance,
  Hospital as HospitalType,
} from "@/services/hospitalService";

const Hospitals = () => {
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<HospitalType[]>([]);
  const [search, setSearch] = useState("");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bedFilter, setBedFilter] = useState("all");
  const [emergencyFilter, setEmergencyFilter] = useState("all");
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToHospitals((data) => {
      setHospitals(data);
    });
    return () => unsubscribe();
  }, []);

  const getBedAvailabilityPercentage = (available?: number, total?: number) => {
    if (!available || !total) return 0;
    return (available / total) * 100;
  };

  const sortHospitalsByDistance = useCallback((list: HospitalType[], lat: number, lng: number) => {
    return [...list].sort((a, b) => {
      const distA = a.lat && a.lng ? getDistance(lat, lng, a.lat, a.lng) : Number.POSITIVE_INFINITY;
      const distB = b.lat && b.lng ? getDistance(lat, lng, b.lat, b.lng) : Number.POSITIVE_INFINITY;
      return distA - distB;
    });
  }, []);

  const handleSearchMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        async (err) => {
          console.warn("Browser GPS unavailable, trying IP fallback:", err);
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            if (data.latitude && data.longitude) {
              setUserLat(parseFloat(data.latitude));
              setUserLng(parseFloat(data.longitude));
            }
          } catch (ipErr) {
            console.error("IP Geolocation failed:", ipErr);
            alert("Could not detect location. Please search by city name.");
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    let result = [...hospitals];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(term) ||
          (h.location && h.location.toLowerCase().includes(term)) ||
          (h.pincode && h.pincode.includes(term))
      );
    }

    if (bedFilter !== "all") {
      result = result.filter((hospital) => {
        const percentage = getBedAvailabilityPercentage(hospital.availableBeds, hospital.totalBeds);
        if (bedFilter === "high") return percentage >= 30;
        if (bedFilter === "medium") return percentage >= 10 && percentage < 30;
        if (bedFilter === "low") return percentage < 10;
        return true;
      });
    }

    if (emergencyFilter !== "all") {
      result = result.filter((hospital) => {
        if (emergencyFilter === "open") return hospital.emergencyOpen;
        if (emergencyFilter === "closed") return !hospital.emergencyOpen;
        return true;
      });
    }

    if (userLat !== null && userLng !== null) {
      result = sortHospitalsByDistance(result, userLat, userLng);
    }

    setFilteredHospitals(result);
  }, [hospitals, search, bedFilter, emergencyFilter, userLat, userLng, sortHospitalsByDistance]);

  const openGoogleMaps = (hospital: HospitalType) => {
    let url = "";
    if (hospital.lat && hospital.lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${hospital.name} ${hospital.location || ""}`
      )}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* Vibrant Showcase Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white py-12 lg:py-16 border-b border-slate-800">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Heading, Telemetry, and Search Console */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Real-Time Regional Bed Telemetry
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                  Live Hospital Bed & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
                    ICU Availability
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Track verified ICU, Ventilator, and General ward capacity across city facilities in real time to prevent critical emergency delays.
                </p>

                {/* Search Console */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-md space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search by hospital name, city, or pincode..."
                        className="pl-10 h-11 bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shrink-0 shadow-md shadow-blue-600/20">
                      <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 h-10 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        userLat
                          ? "border-emerald-500 text-emerald-400 bg-emerald-950/40"
                          : "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
                      }`}
                      onClick={handleSearchMyLocation}
                    >
                      <LocateFixed className="w-3.5 h-3.5 text-blue-400" />
                      <span>{userLat ? "Sorted by Distance" : "Find Near Me"}</span>
                    </button>

                    <button
                      type="button"
                      className="flex-1 h-10 px-3 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-all"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-3.5 h-3.5 text-blue-400" />
                      <span>Filter Options</span>
                      {showFilters ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  </div>

                  {/* Filter Drawer */}
                  {showFilters && (
                    <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Bed Stock Level
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {["all", "high", "medium", "low"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              className={`capitalize px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                bedFilter === type
                                  ? "bg-blue-600 text-white border-blue-500 font-semibold"
                                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                              }`}
                              onClick={() => setBedFilter(type)}
                            >
                              {type === "all" ? "All" : `${type} stock`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Emergency Unit (ER)
                        </label>
                        <div className="flex gap-1.5">
                          {["all", "open", "closed"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              className={`capitalize px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                emergencyFilter === status
                                  ? "bg-blue-600 text-white border-blue-500 font-semibold"
                                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                              }`}
                              onClick={() => setEmergencyFilter(status)}
                            >
                              {status === "all" ? "All" : `ER ${status}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Full-Clarity Hero Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-800 group">
                  <img
                    src="/hospital-bed.jpg"
                    alt="Hospital ICU & Bed Facilities"
                    className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 right-3 bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold text-white">Live Sync 24/7</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">NABH Standard ICUs</p>
                      <p className="text-[11px] text-slate-300">Oxygen & Ventilator equipped</p>
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      Verified
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Hospital Telemetry Cards List */}
        <section className="py-10 container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {filteredHospitals.length} {filteredHospitals.length === 1 ? "Facility" : "Facilities"} Connected
            </h2>
          </div>

          {filteredHospitals.length === 0 ? (
            <Card className="text-center py-12 border">
              <CardContent>
                <HospitalIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">No facilities found</h3>
                <p className="text-sm text-muted-foreground">Try changing your search terms or filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredHospitals.map((hospital) => {
                const bedPercentage = getBedAvailabilityPercentage(hospital.availableBeds, hospital.totalBeds);
                const distanceKm =
                  userLat && userLng && hospital.lat && hospital.lng
                    ? getDistance(userLat, userLng, hospital.lat, hospital.lng).toFixed(1)
                    : null;

                return (
                  <Card key={hospital.id} className="overflow-hidden border hover:shadow-lg transition">
                    <div
                      className={`h-1.5 w-full ${
                        bedPercentage >= 30 ? "bg-emerald-500" : bedPercentage >= 10 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    />

                    <CardHeader className="pb-2 pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg font-bold text-foreground">
                              {hospital.name}
                            </CardTitle>
                            {hospital.emergencyOpen ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                                <Ambulance className="w-3 h-3 mr-1" /> ER Open
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">ER Full / Closed</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {hospital.location} {hospital.pincode ? `(${hospital.pincode})` : ""}
                            </span>
                            {distanceKm && (
                              <span className="flex items-center gap-1 font-semibold text-primary">
                                <Clock className="w-3.5 h-3.5" />
                                {distanceKm} km away
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedHospital(expandedHospital === hospital.id ? null : hospital.id || "")}
                        >
                          {expandedHospital === hospital.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 bg-muted/40 rounded-lg border">
                          <div className="text-xs text-muted-foreground font-medium">Available General</div>
                          <div className="text-xl font-bold text-foreground mt-1">
                            {hospital.availableBeds || 0}
                            <span className="text-xs text-muted-foreground font-normal"> / {hospital.totalBeds || 0}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                          <div className="text-xs text-rose-600 font-medium">ICU Beds</div>
                          <div className="text-xl font-bold text-rose-600 mt-1">{hospital.icuBeds || 0}</div>
                        </div>

                        <div className="p-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
                          <div className="text-xs text-sky-600 font-medium">Ventilators</div>
                          <div className="text-xl font-bold text-sky-600 mt-1">{hospital.ventilatorBeds || 0}</div>
                        </div>

                        <div className="p-3 bg-muted/40 rounded-lg border">
                          <div className="text-xs text-muted-foreground font-medium">Wait Time</div>
                          <div className="text-xl font-bold text-foreground mt-1">
                            {hospital.waitTime ? `${hospital.waitTime}m` : "Minimal"}
                          </div>
                        </div>
                      </div>

                      {expandedHospital === hospital.id && (
                        <div className="p-4 bg-muted/40 rounded-lg text-xs space-y-2 mb-4 border">
                          {hospital.specialties && hospital.specialties.length > 0 && (
                            <div>
                              <span className="font-semibold text-foreground">Specialties: </span>
                              <span className="text-muted-foreground">{hospital.specialties.join(", ")}</span>
                            </div>
                          )}
                          {hospital.notes && (
                            <div>
                              <span className="font-semibold text-foreground">Facility Notice: </span>
                              <span className="text-muted-foreground">{hospital.notes}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-foreground">Last Verified: </span>
                            <span className="text-muted-foreground">
                              {hospital.lastUpdated ? new Date(hospital.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live Sync"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          onClick={() => openGoogleMaps(hospital)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          <Navigation className="w-4 h-4 mr-2" /> Get Directions
                        </Button>
                        {hospital.phone && (
                          <Button
                            variant="outline"
                            className="flex-1 border"
                            onClick={() => (window.location.href = `tel:${hospital.phone}`)}
                          >
                            <Phone className="w-4 h-4 mr-2 text-emerald-600" /> Call {hospital.phone}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Hospitals;