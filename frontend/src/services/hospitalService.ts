import { db, auth } from "@/firebaseconfig";
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  DocumentData,
  query 
} from "firebase/firestore";
import { getPreciseDistance } from "geolib";

export interface Hospital {
  id?: string;
  name: string;
  location: string;
  pincode: string;
  phone: string;
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  ventilatorBeds: number;
  privateBeds: number;
  emergencyOpen: boolean;
  lat: number;
  lng: number;
  lastUpdated: string;
  waitTime?: number;
  specialties?: string[];
  notes?: string;
  rating?: number;
  reviewsCount?: number;
}

export const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  try {
    const distanceMeters = getPreciseDistance(
      { latitude: lat1, longitude: lng1 },
      { latitude: lat2, longitude: lng2 }
    );
    return distanceMeters / 1000;
  } catch (error) {
    console.error("Error calculating distance:", error);
    return 0;
  }
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  if (lat1 === null || lng1 === null || lat2 === undefined || lng2 === undefined) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const normalizeHospital = (docSnap: DocumentData): Hospital => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || "",
    location: data.location || "",
    pincode: data.pincode || "",
    phone: data.phone || "",
    totalBeds: data.totalBeds || (data.beds ? (data.beds.general?.total || 0) + (data.beds.icu?.total || 0) : 0),
    availableBeds: data.availableBeds || (data.beds ? (data.beds.general?.available || 0) + (data.beds.icu?.available || 0) : 0),
    icuBeds: data.icuBeds || (data.beds?.icu?.available || 0),
    ventilatorBeds: data.ventilatorBeds || (data.beds?.oxygen?.available || 0),
    privateBeds: data.privateBeds || 0,
    emergencyOpen: data.emergencyOpen !== undefined ? data.emergencyOpen : true,
    lat: data.lat || 0,
    lng: data.lng || 0,
    lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate().toISOString() : data.lastUpdated || new Date().toISOString(),
    waitTime: data.waitTime || 0,
    specialties: data.specialties || [],
    notes: data.notes || "",
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || 0,
  };
};

export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    const snapshot = await getDocs(collection(db, "hospitals"));
    return snapshot.docs.map(normalizeHospital);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return [];
  }
};

export const subscribeToHospitals = (callback: (data: Hospital[]) => void) => {
  try {
    const q = query(collection(db, "hospitals"));
    return onSnapshot(
      q,
      (snapshot) => {
        const hospitals: Hospital[] = [];
        snapshot.forEach((docSnap) => {
          hospitals.push(normalizeHospital(docSnap));
        });
        callback(hospitals);
      },
      (error) => {
        console.error("Error in hospitals subscription:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up hospitals subscription:", error);
    return () => {};
  }
};

export const subscribeToHospital = (hospitalId: string, callback: (hospital: Hospital) => void) => {
  try {
    return onSnapshot(
      doc(db, "hospitals", hospitalId),
      (docSnap) => {
        if (docSnap.exists()) {
          callback(normalizeHospital(docSnap));
        }
      },
      (error) => {
        console.error("Error in hospital subscription:", error);
      }
    );
  } catch (error) {
    console.error("Error setting up hospital subscription:", error);
    return () => {};
  }
};

export const addHospital = async (hospital: Omit<Hospital, "id">): Promise<string | null> => {
  try {
    if (!auth.currentUser) throw new Error("User must be authenticated");
    const docRef = await addDoc(collection(db, "hospitals"), {
      ...hospital,
      lastUpdated: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding hospital:", error);
    return null;
  }
};

export const updateHospital = async (hospitalId: string, data: Partial<Hospital>): Promise<boolean> => {
  try {
    if (!auth.currentUser) throw new Error("User must be authenticated");
    const hospitalRef = doc(db, "hospitals", hospitalId);
    await updateDoc(hospitalRef, {
      ...data,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating hospital:", error);
    return false;
  }
};