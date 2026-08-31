import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebaseconfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type UserRole = "patient" | "doctor" | "hospital" | "bloodbank" | "admin";

export interface UserProfile {
  uid: string;
  email: string | null;
  name?: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (email: string, password: string, role: UserRole, name?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    try {
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: fbUser.uid,
          email: fbUser.email,
          name: data.name || fbUser.displayName || "User",
          role: (data.role as UserRole) || "patient",
        };
      }

      // Check bloodbanks fallback
      const bankDoc = await getDoc(doc(db, "bloodbanks", fbUser.uid));
      if (bankDoc.exists()) {
        return {
          uid: fbUser.uid,
          email: fbUser.email,
          name: bankDoc.data().name || "Blood Bank Staff",
          role: "bloodbank",
        };
      }

      // Check hospitals fallback
      const hospDoc = await getDoc(doc(db, "hospitals", fbUser.uid));
      if (hospDoc.exists()) {
        return {
          uid: fbUser.uid,
          email: fbUser.email,
          name: hospDoc.data().name || "Hospital Staff",
          role: "hospital",
        };
      }

      // Default fallback
      return {
        uid: fbUser.uid,
        email: fbUser.email,
        name: "Patient",
        role: "patient",
      };
    } catch (err) {
      console.error("Failed to load user document:", err);
      return {
        uid: fbUser.uid,
        email: fbUser.email,
        name: "User",
        role: "patient",
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser);
        setUser(profile);
        localStorage.setItem("userType", profile.role);
        localStorage.setItem("uid", profile.uid);
      } else {
        setUser(null);
        localStorage.removeItem("userType");
        localStorage.removeItem("uid");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await fetchUserProfile(res.user);
    setUser(profile);
    localStorage.setItem("userType", profile.role);
    localStorage.setItem("uid", profile.uid);
    return profile;
  };

  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    name?: string
  ): Promise<UserProfile> => {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const uid = res.user.uid;
    const displayName = name || email.split("@")[0];

    // 1. Create Core User Document
    await setDoc(doc(db, "users", uid), {
      uid,
      email: email.trim(),
      name: displayName,
      role,
      createdAt: serverTimestamp(),
    });

    // 2. Initialize Parent Collection Documents for RBAC Dashboard Access
    if (role === "hospital") {
      await setDoc(doc(db, "hospitals", uid), {
        id: uid,
        userId: uid,
        name: displayName,
        location: "Central Medical District",
        contact: "+91-80-4000-1000",
        emergencyOpen: true,
        beds: {
          icu: { total: 10, available: 5 },
          oxygen: { total: 20, available: 12 },
          general: { total: 50, available: 25 },
        },
        availableBeds: 42,
        totalBeds: 80,
        icuBeds: 5,
        ventilatorBeds: 3,
        updatedAt: new Date().toISOString(),
      });
    } else if (role === "bloodbank") {
      const initialStock = { "A+": 10, "A-": 4, "B+": 12, "B-": 3, "AB+": 6, "AB-": 2, "O+": 15, "O-": 5 };
      await setDoc(doc(db, "bloodbanks", uid), {
        id: uid,
        userId: uid,
        name: displayName,
        location: "Regional Blood Center",
        contact: "+91-80-4000-5000",
        stock: initialStock,
        updatedAt: new Date().toISOString(),
      });
    } else if (role === "doctor") {
      await setDoc(doc(db, "doctors", uid), {
        id: uid,
        userId: uid,
        name: displayName.startsWith("Dr.") ? displayName : `Dr. ${displayName}`,
        specialty: "General Medicine",
        hospital: "City General Hospital",
        rating: 5.0,
        reviewsCount: 1,
        experienceYears: 5,
        fee: 500,
        distanceKm: 2.5,
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        slots: [
          { time: "09:00 AM", isFull: false },
          { time: "10:30 AM", isFull: false },
          { time: "02:00 PM", isFull: false },
        ],
      });
    }

    const newProfile: UserProfile = {
      uid,
      email: res.user.email,
      name: displayName,
      role,
    };

    setUser(newProfile);
    localStorage.setItem("userType", role);
    localStorage.setItem("uid", uid);
    return newProfile;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem("userType");
    localStorage.removeItem("uid");
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        userRole: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};