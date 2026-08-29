import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebaseconfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  role: "patient" | "doctor" | "hospital" | "bloodbank" | "admin";
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              role: data.role || "patient",
            });
          } else {
            // Check blood_banks fallback
            const bankDoc = await getDoc(doc(db, "blood_banks", fbUser.uid));
            if (bankDoc.exists()) {
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                role: "bloodbank",
              });
            } else {
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                role: "patient",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            role: "patient",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, role: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
      email,
      role,
      createdAt: new Date().toISOString(),
    });
    setUser({
      uid: res.user.uid,
      email: res.user.email,
      role: role as UserProfile["role"],
    });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("userType");
    localStorage.removeItem("uid");
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
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