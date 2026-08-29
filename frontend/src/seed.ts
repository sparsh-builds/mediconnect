import { db } from "@/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

export const seedDatabase = async () => {
  // 1. Seed Hospitals & Bed Capacity
  const hospitals = [
    {
      name: "City Care Multispeciality Hospital",
      location: "Sector 14, Central District",
      contact: "+91 98765 43210",
      beds: {
        icu: { total: 20, available: 4 },
        oxygen: { total: 50, available: 12 },
        general: { total: 120, available: 35 },
      },
    },
    {
      name: "Apollo Lifeline Medical Center",
      location: "Civil Lines, North Campus",
      contact: "+91 98111 22334",
      beds: {
        icu: { total: 15, available: 2 },
        oxygen: { total: 30, available: 8 },
        general: { total: 80, available: 19 },
      },
    },
  ];

  for (const h of hospitals) {
    await addDoc(collection(db, "hospitals"), h);
  }

  // 2. Seed Blood Bank Units
  const bloodBanks = [
    {
      name: "Red Cross Central Blood Center",
      location: "Ring Road, Metro Gate 2",
      contact: "+91 99887 76655",
      stock: {
        "A+": 18,
        "A-": 4,
        "B+": 25,
        "B-": 6,
        "AB+": 10,
        "AB-": 2,
        "O+": 32,
        "O-": 5,
      },
    },
  ];

  for (const b of bloodBanks) {
    await addDoc(collection(db, "bloodbanks"), b);
  }

  console.log("Database seeded successfully!");
};