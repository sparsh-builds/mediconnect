import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom Ambulance Icon
const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

interface Props {
  ambulanceId: string;
}

export default function AmbulanceTrackerMap({ ambulanceId }: Props) {
  const [position, setPosition] = useState<[number, number]>([28.9931, 77.0151]);
  const [pathHistory, setPathHistory] = useState<[number, number][]>([]);
  const [driverInfo, setDriverInfo] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "ambulances", ambulanceId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentLocation?.lat && data.currentLocation?.lng) {
          const newCoords: [number, number] = [
            data.currentLocation.lat,
            data.currentLocation.lng,
          ];
          setPosition(newCoords);
          setPathHistory((prev) => [...prev, newCoords]);
          setDriverInfo(data);
        }
      }
    });

    return () => unsub();
  }, [ambulanceId]);

  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <MapContainer center={position} zoom={14} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {/* Live Moving Ambulance Marker */}
        <Marker position={position} icon={ambulanceIcon}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold">{driverInfo?.vehicleNumber || "Ambulance"}</p>
              <p>Driver: {driverInfo?.driverName}</p>
              <p>Status: <span className="text-emerald-600 font-semibold">{driverInfo?.status}</span></p>
            </div>
          </Popup>
        </Marker>

        {/* Trajectory Trail */}
        <Polyline positions={pathHistory} color="#ef4444" weight={4} dashArray="6, 8" />
      </MapContainer>
    </div>
  );
}