// src/services/hospitalService.ts
import { db, auth } from "../../firebaseconfig";
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

// Calculate distance between two coordinates in km using geolib
export const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  try {
    const distanceMeters = getPreciseDistance(
      { latitude: lat1, longitude: lng1 },
      { latitude: lat2, longitude: lng2 }
    );
    return distanceMeters / 1000; // convert to km
  } catch (error) {
    console.error("Error calculating distance:", error);
    return 0; // Return 0 if there's an error
  }
};

// Fallback distance calculation using Haversine formula
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  if (lat1 === null || lng1 === null || lat2 === undefined || lng2 === undefined) return 0;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper to normalize Firestore data
const normalizeHospital = (doc: DocumentData): Hospital => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || "",
    location: data.location || "",
    pincode: data.pincode || "",
    phone: data.phone || "",
    totalBeds: data.totalBeds || 0,
    availableBeds: data.availableBeds || 0,
    icuBeds: data.icuBeds || 0,
    ventilatorBeds: data.ventilatorBeds || 0,
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

// Fetch all hospitals once
export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    const snapshot = await getDocs(collection(db, "hospitals"));
    return snapshot.docs.map(normalizeHospital);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return [];
  }
};

// Subscribe to hospitals in real-time
export const subscribeToHospitals = (callback: (data: Hospital[]) => void) => {
  try {
    const q = query(collection(db, "hospitals"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hospitals: Hospital[] = [];
      snapshot.forEach((doc) => {
        hospitals.push(normalizeHospital(doc));
      });
      callback(hospitals);
    }, (error) => {
      console.error("Error in hospitals subscription:", error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up hospitals subscription:", error);
    // Return a no-op function for cleanup
    return () => {};
  }
};

// Subscribe to a specific hospital in real-time
export const subscribeToHospital = (hospitalId: string, callback: (hospital: Hospital) => void) => {
  try {
    const unsubscribe = onSnapshot(doc(db, "hospitals", hospitalId), (doc) => {
      if (doc.exists()) {
        callback(normalizeHospital(doc));
      }
    }, (error) => {
      console.error("Error in hospital subscription:", error);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up hospital subscription:", error);
    return () => {};
  }
};

// Add a new hospital
export const addHospital = async (hospital: Omit<Hospital, 'id'>): Promise<string | null> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to add a hospital");
    }
    
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

// Update hospital data
export const updateHospital = async (hospitalId: string, data: Partial<Hospital>): Promise<boolean> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to update hospital data");
    }
    
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