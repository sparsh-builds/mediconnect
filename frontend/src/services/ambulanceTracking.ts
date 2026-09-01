import { db } from "@/firebaseconfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

let watchId: number | null = null;

export function startAmbulanceBroadcasting(ambulanceId: string) {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude, heading, speed } = position.coords;

      const ambRef = doc(db, "ambulances", ambulanceId);
      await updateDoc(ambRef, {
        "currentLocation.lat": latitude,
        "currentLocation.lng": longitude,
        "currentLocation.heading": heading || 0,
        "currentLocation.speed": speed || 0,
        updatedAt: serverTimestamp(),
      });
    },
    (err) => console.error("GPS Watch Error:", err),
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000,
    }
  );
}

export function stopAmbulanceBroadcasting() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}