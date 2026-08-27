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
  Hospital,
  Search,
  Filter,
  LocateFixed,
  Ambulance,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToHospitals((data) => {
      setHospitals(data);
    });
    return () => unsubscribe();
  }, []);

  const getBedAvailabilityColor = (available?: number, total?: number) => {
    if (!available || !total) return "border-gray-300 text-gray-500";
    const percentage = (available / total) * 100;
    if (percentage > 30) return "border-green-500 text-green-600 bg-green-50";
    if (percentage > 10) return "border-yellow-500 text-yellow-600 bg-yellow-50";
    return "border-red-500 text-red-600 bg-red-50";
  };

  const getBedAvailabilityPercentage = (available?: number, total?: number) => {
    if (!available || !total) return 0;
    return (available / total) * 100;
  };

  // Distance calculator and sorting
  const sortHospitalsByDistance = useCallback((list: HospitalType[], lat: number, lng: number) => {
    return [...list].sort((a, b) => {
      const distA = a.lat && a.lng ? getDistance(lat, lng, a.lat, a.lng) : Number.POSITIVE_INFINITY;
      const distB = b.lat && b.lng ? getDistance(lat, lng, b.lat, b.lng) : Number.POSITIVE_INFINITY;
      return distA - distB;
    });
  }, []);

  // Near Me trigger with browser Geolocation and IP fallback
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

  // Filter and sort pipeline
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
    <>
      <Header />

      {/* Hero Search Section */}
      <div className="bg-blue-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">Live Hospital Bed Availability</h1>
            <p className="text-blue-100 max-w-xl mx-auto text-base md:text-lg">
              Check real-time ICU, ventilator, and general bed capacity before heading to emergency care.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white p-4 md:p-6 rounded-2xl shadow-xl text-gray-800">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by hospital name, city, or pincode..."
                  className="pl-10 h-12 text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className={`flex-1 h-11 ${userLat ? "border-blue-600 text-blue-600 bg-blue-50" : ""}`}
                onClick={handleSearchMyLocation}
              >
                <LocateFixed className="w-4 h-4 mr-2" />
                {userLat ? "Location Active (Sorted by Distance)" : "Find Near Me"}
              </Button>

              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter Options
                {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Bed Capacity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "high", "medium", "low"].map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={bedFilter === type ? "default" : "outline"}
                        className="capitalize text-xs"
                        onClick={() => setBedFilter(type)}
                      >
                        {type === "all" ? "All" : `${type} stock`}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Emergency Unit
                  </label>
                  <div className="flex gap-2">
                    {["all", "open", "closed"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={emergencyFilter === status ? "default" : "outline"}
                        className="capitalize text-xs"
                        onClick={() => setEmergencyFilter(status)}
                      >
                        {status === "all" ? "All" : `ER ${status}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hospital Cards List */}
      <section className="py-12 bg-gray-50 min-h-[500px]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {filteredHospitals.length} {filteredHospitals.length === 1 ? "Facility" : "Facilities"} Listed
            </h2>
          </div>

          {filteredHospitals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Hospital className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">No facilities found</h3>
                <p className="text-sm text-gray-500">Try changing your search terms or filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredHospitals.map((hospital) => {
                const bedPercentage = getBedAvailabilityPercentage(hospital.availableBeds, hospital.totalBeds);
                const bedColor = getBedAvailabilityColor(hospital.availableBeds, hospital.totalBeds);
                const distanceKm =
                  userLat && userLng && hospital.lat && hospital.lng
                    ? getDistance(userLat, userLng, hospital.lat, hospital.lng).toFixed(1)
                    : null;

                return (
                  <Card key={hospital.id} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
                    <div
                      className={`h-1.5 w-full ${
                        bedPercentage >= 30 ? "bg-emerald-500" : bedPercentage >= 10 ? "bg-amber-500" : "bg-red-500"
                      }`}
                    />

                    <CardHeader className="pb-2 pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                              {hospital.name}
                            </CardTitle>
                            {hospital.emergencyOpen ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                                <Ambulance className="w-3 h-3 mr-1" /> ER Open
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">ER Full / Closed</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {hospital.location} {hospital.pincode ? `(${hospital.pincode})` : ""}
                            </span>
                            {distanceKm && (
                              <span className="flex items-center gap-1 font-semibold text-blue-600">
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
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="text-xs text-gray-500 font-medium">Available General</div>
                          <div className="text-xl font-bold text-gray-900 mt-1">
                            {hospital.availableBeds || 0}
                            <span className="text-xs text-gray-400 font-normal"> / {hospital.totalBeds || 0}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                          <div className="text-xs text-red-600 font-medium">ICU Beds</div>
                          <div className="text-xl font-bold text-red-700 mt-1">{hospital.icuBeds || 0}</div>
                        </div>

                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <div className="text-xs text-blue-600 font-medium">Ventilators</div>
                          <div className="text-xl font-bold text-blue-700 mt-1">{hospital.ventilatorBeds || 0}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="text-xs text-gray-500 font-medium">Wait Time</div>
                          <div className="text-xl font-bold text-gray-900 mt-1">
                            {hospital.waitTime ? `${hospital.waitTime}m` : "Minimal"}
                          </div>
                        </div>
                      </div>

                      {expandedHospital === hospital.id && (
                        <div className="p-4 bg-gray-50 rounded-lg text-xs space-y-2 mb-4 border">
                          {hospital.specialties && hospital.specialties.length > 0 && (
                            <div>
                              <span className="font-semibold text-gray-700">Specialties: </span>
                              <span>{hospital.specialties.join(", ")}</span>
                            </div>
                          )}
                          {hospital.notes && (
                            <div>
                              <span className="font-semibold text-gray-700">Facility Notice: </span>
                              <span>{hospital.notes}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-gray-700">Last Verified: </span>
                            <span>{new Date(hospital.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          onClick={() => openGoogleMaps(hospital)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Navigation className="w-4 h-4 mr-2" /> Get Directions
                        </Button>
                        {hospital.phone && (
                          <Button
                            variant="outline"
                            className="flex-1 border-gray-300"
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
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Hospitals;