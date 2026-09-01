import { db } from "@/firebaseconfig";
import { doc, setDoc } from "firebase/firestore";

export async function seedProductionDatabase() {
  // 1. Seed Real Doctors
  const doctors = [
    {
      id: "doc_kanika_derma",
      name: "Dr. Kanika Roy",
      gender: "female",
      specialty: "Dermatology",
      hospital: "Apollo Hospitals Sector 26",
      degrees: "MBBS, MD (Dermatology), DNB",
      experienceYears: 10,
      rating: 4.9,
      reviewsCount: 312,
      fee: 1000,
      distanceKm: 1.8,
      avatar: "/hero-doctor.png",
      languages: ["English", "Hindi"],
      consultationType: "both",
      requiresOfflinePrepay: false,
      slots: [
        { time: "12:10 PM", isFull: false },
        { time: "12:20 PM", isFull: false },
        { time: "12:30 PM", isFull: false },
        { time: "12:40 PM", isFull: false },
      ],
    },
    {
      id: "doc_suresh_neuro",
      name: "Dr. Suresh Rao",
      gender: "male",
      specialty: "Neurology",
      hospital: "City Central Super Speciality",
      degrees: "MBBS, DM (Neurology)",
      experienceYears: 18,
      rating: 4.8,
      reviewsCount: 428,
      fee: 1200,
      distanceKm: 3.2,
      avatar: "/doctors-team.jpg",
      languages: ["English", "Hindi", "Punjabi"],
      consultationType: "both",
      requiresOfflinePrepay: true,
      slots: [
        { time: "10:00 AM", isFull: false },
        { time: "10:30 AM", isFull: false },
        { time: "11:00 AM", isFull: false },
      ],
    },
  ];

  for (const docData of doctors) {
    await setDoc(doc(db, "doctors", docData.id), docData);
  }

  // 2. Seed Real Hospitals
  const hospitals = [
    {
      id: "hosp_apollo_01",
      name: "Apollo Hospitals Sector 26",
      address: "Sector 26, Medical Enclave",
      phone: "+91-11-26825555",
      availableBeds: 28,
      icuBeds: 6,
      beds: {
        icu: { available: 6, total: 20 },
        general: { available: 18, total: 50 },
        oxygen: { available: 4, total: 15 },
      },
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const hosp of hospitals) {
    await setDoc(doc(db, "hospitals", hosp.id), hosp);
  }

  // 3. Seed Regional Blood Banks
  const bloodbanks = [
    {
      id: "bank_central_01",
      name: "Rotary Central Blood Bank",
      address: "Civil Hospital Road, Zone 1",
      phone: "+91-9811223344",
      stock: {
        "A+": 14,
        "A-": 4,
        "B+": 22,
        "B-": 3,
        "AB+": 9,
        "AB-": 2,
        "O+": 31,
        "O-": 5,
      },
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const bank of bloodbanks) {
    await setDoc(doc(db, "bloodbanks", bank.id), bank);
  }

  // 4. Seed Active Ambulance Stream
  await setDoc(doc(db, "ambulances", "amb_delhi_01"), {
    id: "amb_delhi_01",
    driverName: "Ramesh Sharma",
    phone: "+91-9876543210",
    vehicleNumber: "HR-10-AB-4491",
    hospital: "Apollo Hospitals Sector 26",
    lat: 28.9880,
    lng: 77.0190,
    speed: 45,
    status: "En Route to Emergency",
    updatedAt: new Date().toISOString(),
  });

  console.log("Production database successfully seeded!");
}