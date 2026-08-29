import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC3bMhw-g_Uyr8dxuagQITG323gCYm4eGg",
  authDomain: "bedtracker-web.firebaseapp.com",
  projectId: "bedtracker-web",
  storageBucket: "bedtracker-web.firebasestorage.app",
  messagingSenderId: "274937092452",
  appId: "1:274937092452:web:592c6a7ea2ca43b4e34271",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, "asia-south1");

export default app;