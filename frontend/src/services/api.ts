import { functions } from "@/firebaseconfig";
import { httpsCallable } from "firebase/functions";

// 1. Transactional Slot Booking
export const bookAppointmentWithLock = async (payload: {
  doctorId: string;
  slotTime: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  symptoms?: string;
}) => {
  const callFn = httpsCallable(functions, "bookAppointmentWithLock");
  const result = await callFn(payload);
  return result.data;
};

// 2. Bed Telemetry Updater
export const updateBedInventory = async (payload: {
  hospitalId: string;
  bedType: "icu" | "oxygen" | "general";
  delta: number; // +1 or -1
}) => {
  const callFn = httpsCallable(functions, "updateBedInventory");
  const result = await callFn(payload);
  return result.data;
};

// 3. Blood Stock Deduction
export const deductBloodStock = async (payload: {
  bloodBankId: string;
  bloodGroup: string;
  units: number;
}) => {
  const callFn = httpsCallable(functions, "deductBloodStock");
  const result = await callFn(payload);
  return result.data;
};