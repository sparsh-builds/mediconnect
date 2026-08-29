import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Bed,
  Users,
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
  ShieldCheck,
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

  const getBedAvailabilityColor = (available?: number, total?: number) => {
    if (!available || !total) return "border-gray-300 text-gray-500";
    const percentage = (available / total) * 100;
    if (percentage > 30) return "border-emerald-500 text-emerald-600 bg-emerald-50";
    if (percentage > 10) return "border-amber-500 text-amber-600 bg-amber-50";
    return "border-rose-500 text-rose-600 bg-rose-50";
  };

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
        {/* High-Contrast Hero Banner */}
        <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-24 border-b border-slate-800">
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src="/hospital-bed.jpg"
              alt="ICU and Emergency Care Bed"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <div className="max-w-2xl space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Live Telemetry & Bed Occupancy Network
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Live Hospital Bed Availability
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Check real-time ICU, Ventilator, and General ward capacity across regional facilities to make informed emergency admissions without transit delays.
              </p>
            </div>

            {/* Form Widget */}
            <div className="max-w-3xl bg-slate-900/95 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by hospital name, city, or pincode..."
                    className="pl-10 h-12 bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button className="h-12 px-7 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shrink-0">
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  className={`flex-1 h-11 px-4 text-xs font-semibold rounded-xl border flex items-center justify-center transition-all ${
                    userLat
                      ? "border-emerald-500 text-emerald-400 bg-emerald-950/40"
                      : "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"
                  }`}
                  onClick={handleSearchMyLocation}
                >
                  <LocateFixed className="w-4 h-4 mr-2 text-blue-400" />
                  {userLat ? "Location Active (Sorted by Distance)" : "Find Near Me"}
                </button>

                <button
                  type="button"
                  className="flex-1 h-11 px-4 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2 text-blue-400" />
                  Filter Options
                  {showFilters ? <ChevronUp className="w-4 h-4 ml-1.5" /> : <ChevronDown className="w-4 h-4 ml-1.5" />}
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Bed Capacity
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["all", "high", "medium", "low"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`capitalize text-xs h-8 px-3 rounded-lg font-medium border transition-all ${
                            bedFilter === type
                              ? "bg-blue-600 text-white border-blue-500 font-semibold"
                              : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                          }`}
                          onClick={() => setBedFilter(type)}
                        >
                          {type === "all" ? "All" : `${type} stock`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Emergency Unit Status
                    </label>
                    <div className="flex gap-2">
                      {["all", "open", "closed"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`capitalize text-xs h-8 px-3 rounded-lg font-medium border transition-all ${
                            emergencyFilter === status
                              ? "bg-blue-600 text-white border-blue-500 font-semibold"
                              : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
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