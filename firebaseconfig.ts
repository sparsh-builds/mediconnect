// src/firebaseconfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Add this import

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3bMhw-g_Uyr8dxuagQITG323gCYm4eGg",
  authDomain: "bedtracker-web.firebaseapp.com",
  projectId: "bedtracker-web",
  storageBucket: "bedtracker-web.firebasestorage.app",
  messagingSenderId: "274937092452",
  appId: "1:274937092452:web:592c6a7ea2ca43b4e34271",
};

// Initialize Firebase only once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app); // Add this export

console.log("🔥 Firebase App initialized:", app.name);
console.log("📦 Firestore initialized successfully");
console.log("🔐 Authentication initialized successfully");