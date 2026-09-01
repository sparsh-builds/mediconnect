import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Radio,
  Gauge,
  Clock,
  ShieldCheck,
  Building2,
  Play,
  Square,
  AlertCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { toast } from "sonner";

// Custom high-contrast marker icons
const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063176.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Auto-pan viewport smoothly as coords stream in
function MapRecenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(coords, { animate: true });
  }, [coords, map]);
  return null;
}

const DEFAULT_AMB_COORDS: [number, number] = [28.9880, 77.0190]; // Starting Point
const DESTINATION_COORDS: [number, number] = [28.9955, 77.0250]; // Apollo Hospitals Sonipat

export default function AmbulanceTracker() {
  const [ambPos, setAmbPos] = useState<[number, number]>(DEFAULT_AMB_COORDS);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [driverDetails, setDriverDetails] = useState<any>({
    driverName: "Ramesh Sharma",
    phone: "+91-9876543210",
    vehicleNumber: "HR-10-AB-4491",
    hospital: "Apollo Hospital Sector 26",
    speed: 48,
    status: "En Route to Emergency",
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(6);
  const intervalRef = useRef<any>(null);

  // 1. Fetch OSRM turn-by-turn road route between ambulance and hospital
  useEffect(() => {
    async function fetchRoadRoute() {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${ambPos[1]},${ambPos[0]};${DESTINATION_COORDS[1]},${DESTINATION_COORDS[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          setRoutePath(coords);
          setEtaMinutes(Math.max(1, Math.round(data.routes[0].duration / 60)));
        }
      } catch {
        // Fallback straight vector if network times out
        setRoutePath([ambPos, DESTINATION_COORDS]);
      }
    }
    fetchRoadRoute();
  }, [ambPos]);

  // 2. Real-time Firestore Telemetry Subscription
  useEffect(() => {
    const ambDocRef = doc(db, "ambulances", "amb_delhi_01");

    // Initialize document if absent
    setDoc(
      ambDocRef,
      {
        id: "amb_delhi_01",
        driverName: "Ramesh Sharma",
        phone: "+91-9876543210",
        vehicleNumber: "HR-10-AB-4491",
        hospital: "Apollo Hospital Sector 26",
        lat: DEFAULT_AMB_COORDS[0],
        lng: DEFAULT_AMB_COORDS[1],
        speed: 48,
        status: "En Route to Emergency",
      },
      { merge: true }
    );

    const unsub = onSnapshot(ambDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.lat && d.lng) {
          setAmbPos([d.lat, d.lng]);
        }
        setDriverDetails(d);
      }
    });

    return () => unsub();
  }, []);

  // 3. Driver Location GPS Broadcaster Simulator
  const toggleBroadcasterSimulation = () => {
    if (isBroadcasting) {
      clearInterval(intervalRef.current);
      setIsBroadcasting(false);
      toast.info("GPS Location Broadcaster Stopped");
    } else {
      setIsBroadcasting(true);
      toast.success("Broadcasting Real-Time Ambulance GPS Stream");

      intervalRef.current = setInterval(async () => {
        setAmbPos((prev) => {
          const nextLat = prev[0] + (DESTINATION_COORDS[0] - prev[0]) * 0.08;
          const nextLng = prev[1] + (DESTINATION_COORDS[1] - prev[1]) * 0.08;
          const newCoords: [number, number] = [nextLat, nextLng];

          updateDoc(doc(db, "ambulances", "amb_delhi_01"), {
            lat: nextLat,
            lng: nextLng,
            speed: Math.floor(Math.random() * 15 + 40),
            updatedAt: new Date().toISOString(),
          }).catch(() => {});

          return newCoords;
        });
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* Top Telemetry Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Badge className="bg-rose-100 text-rose-950 border-rose-300 text-xs font-black mb-2 gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Live Emergency GPS Telemetry
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
              Ambulance Path & Real-Time Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Live driver coordinates, turn-by-turn routing trajectory, and hospital ETA.
            </p>
          </div>

          {/* Broadcaster Controller Button */}
          <Button
            onClick={toggleBroadcasterSimulation}
            className={`h-11 px-5 rounded-xl font-black text-xs shadow-sm ${
              isBroadcasting
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-slate-950 hover:bg-slate-800 text-white"
            }`}
          >
            {isBroadcasting ? (
              <>
                <Square className="w-4 h-4 mr-2" /> Stop GPS Stream
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 text-emerald-400" /> Start Driver GPS Simulator
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Leaflet Map Viewer */}
          <div className="lg:col-span-8 bg-white p-3 rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
            <div className="h-[520px] w-full rounded-xl overflow-hidden relative z-0">
              <MapContainer center={ambPos} zoom={15} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                <MapRecenter coords={ambPos} />

                {/* Moving Ambulance Marker */}
                <Marker position={ambPos} icon={ambulanceIcon}>
                  <Popup>
                    <div className="text-xs font-bold p-1">
                      <p className="text-rose-600 font-black">{driverDetails.vehicleNumber}</p>
                      <p>Speed: {driverDetails.speed} km/h</p>
                      <p>Driver: {driverDetails.driverName}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Destination Hospital Marker */}
                <Marker position={DESTINATION_COORDS} icon={hospitalIcon}>
                  <Popup>
                    <div className="text-xs font-bold p-1">
                      <p className="text-slate-900 font-black">{driverDetails.hospital}</p>
                      <p className="text-emerald-700">Emergency Trauma Center</p>
                    </div>
                  </Popup>
                </Marker>

                {/* OSRM Route Polyline Path */}
                {routePath.length > 0 && (
                  <Polyline
                    positions={routePath}
                    pathOptions={{
                      color: "#dc2626",
                      weight: 5,
                      opacity: 0.85,
                      dashArray: "8, 6",
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Telemetry Status Cards */}
          <div className="lg:col-span-4 space-y-4">
            {/* ETA & Status Card */}
            <Card className="border-2 border-slate-300 bg-white rounded-2xl shadow-sm">
              <CardHeader className="p-5 pb-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Hospital Arrival ETA
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-950 border-emerald-300 text-xs font-black">
                    Active Transit
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-black text-slate-950 mt-1">
                  ~{etaMinutes} Mins
                </CardTitle>
                <CardDescription className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Optimal traffic corridor calculated
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Speed</span>
                    <span className="text-base font-black text-slate-950 flex items-center gap-1">
                      <Gauge className="w-4 h-4 text-sky-700" /> {driverDetails.speed} km/h
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Vehicle</span>
                    <span className="text-xs font-black text-slate-950 truncate block mt-1">
                      {driverDetails.vehicleNumber}
                    </span>
                  </div>
                </div>

                {/* Driver Identity Card */}
                <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-950">{driverDetails.driverName}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">Certified Emergency Pilot</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black h-8 rounded-lg"
                      onClick={() => window.open(`tel:${driverDetails.phone}`)}
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" /> Call Driver
                    </Button>
                  </div>
                </div>

                {/* Destination Facility */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                  <Building2 className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-950 block">Destination Facility</span>
                    <span className="text-slate-600 font-semibold">{driverDetails.hospital}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}