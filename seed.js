const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
const auth = getAuth();
const now = new Date().toISOString();

const DEMO_PASSWORD = "MediConnect@2026";

const demoAccounts = [
  { email: "dr.mehta@mediconnect.demo", role: "doctor", name: "Dr. Anjali Mehta" },
  { email: "cityhospital@mediconnect.demo", role: "hospital", name: "City General Hospital Admin" },
  { email: "lifeline.bloodbank@mediconnect.demo", role: "bloodbank", name: "Lifeline Blood Bank Admin" },
  { email: "patient@mediconnect.demo", role: "patient", name: "Rahul Verma" },
];

async function ensureAuthUser({ email, role, name }) {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      userRecord = await auth.createUser({ email, password: DEMO_PASSWORD, displayName: name });
    } else {
      throw err;
    }
  }

  await db.collection("users").doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email,
      role,
      name,
      phone: "+91-9876543210",
      createdAt: now,
    },
    { merge: true }
  );

  return userRecord.uid;
}

function getDoctorDataList(doctorOwnerUid) {
  return [
    {
      id: "doc_kanika_derma",
      userId: doctorOwnerUid,
      name: "Dr Kanika Roy",
      specialty: "Dermatology",
      hospital: "Apollo Hospitals Sector 26",
      hospitalAddress: "Apollo Hospitals Road, Block E, Gautam Buddh Nagar, Sector 26, Sonipat, 131001",
      degrees: "MBBS, MD (DERMATOLOGY & LEPROSY), DNB",
      experienceYears: 10,
      rating: 4.9,
      reviewsCount: 312,
      fee: 1000,
      distanceKm: 1.8,
      languages: ["English", "Hindi"],
      registrationNo: "DMC/R/22219",
      consultationType: "both",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
      about: "Dr Kanika Roy is a leading consultant dermatologist specializing in procedural dermatology, trichology, and advanced laser therapies.",
      slots: [
        { time: "12:10 PM", isFull: false },
        { time: "12:20 PM", isFull: false },
        { time: "12:30 PM", isFull: false },
        { time: "12:40 PM", isFull: false },
        { time: "12:50 PM", isFull: true },
        { time: "01:00 PM", isFull: false },
      ],
      isApproved: true,
      updatedAt: now,
    },
    {
      id: "doc_suresh_neuro",
      userId: "seed_doc_suresh",
      name: "Dr Suresh Rao",
      specialty: "Neurology",
      hospital: "City Central Super Speciality",
      hospitalAddress: "Civil Hospital Road, Model Town, Sonipat, 131001",
      degrees: "MBBS, DM (Neurology), Fellowship in Stroke Care",
      experienceYears: 18,
      rating: 4.8,
      reviewsCount: 428,
      fee: 1200,
      distanceKm: 3.2,
      languages: ["English", "Hindi", "Punjabi"],
      registrationNo: "HN/MED/88491",
      consultationType: "both",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
      about: "Dr Suresh Rao has extensive clinical tenure treating complex stroke management, neuro-muscular disorders, and neuro-rehabilitation.",
      slots: [
        { time: "10:00 AM", isFull: false },
        { time: "10:30 AM", isFull: false },
        { time: "11:00 AM", isFull: true },
      ],
      isApproved: true,
      updatedAt: now,
    },
    {
      id: "doc_neha_general",
      userId: "seed_doc_neha",
      name: "Dr Neha Kapoor",
      specialty: "General Medicine",
      hospital: "Sunrise Multispecialty Hospital",
      hospitalAddress: "GT Road, Murthal Highway Junction, Sonipat",
      degrees: "MBBS, MD (Internal Medicine)",
      experienceYears: 8,
      rating: 4.7,
      reviewsCount: 195,
      fee: 500,
      distanceKm: 2.1,
      languages: ["English", "Hindi"],
      registrationNo: "DMC/R/49102",
      consultationType: "both",
      avatar: "https://images.unsplash.com/photo-1594824813686-f41b2723c3b0?auto=format&fit=crop&q=80&w=600",
      about: "Focuses on evidence-based treatment of metabolic disorders, hypertension, preventative healthcare, and fever management.",
      slots: [
        { time: "02:00 PM", isFull: false },
        { time: "02:30 PM", isFull: false },
        { time: "03:00 PM", isFull: false },
      ],
      isApproved: true,
      updatedAt: now,
    },
    {
      id: "doc_manpreet_ortho",
      userId: "seed_doc_manpreet",
      name: "Dr Manpreet Singh",
      specialty: "Orthopedics",
      hospital: "Metro Bone & Joint Institute",
      hospitalAddress: "Sector 14 Main Boulevard, Sonipat",
      degrees: "MBBS, MS (Orthopedics), MCh (Joint Replacement)",
      experienceYears: 15,
      rating: 4.9,
      reviewsCount: 512,
      fee: 800,
      distanceKm: 4.5,
      languages: ["English", "Hindi", "Punjabi"],
      registrationNo: "PMC/ORTHO/1029",
      consultationType: "both",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
      about: "Chief orthopedic surgeon specializing in robotic knee arthroplasty, sports injury reconstruction, and arthroscopy.",
      slots: [
        { time: "04:00 PM", isFull: false },
        { time: "04:30 PM", isFull: false },
      ],
      isApproved: true,
      updatedAt: now,
    }
  ];
}

function getHospitalDataList(hospitalOwnerUid) {
  return [
    {
      id: "hosp_city_general",
      userId: hospitalOwnerUid,
      name: "City General Hospital",
      location: "Sector 26, Sonipat",
      pincode: "131001",
      contact: "+91-130-255-1000",
      phone: "+91-130-255-1000",
      emergencyOpen: true,
      totalBeds: 180,
      availableBeds: 46,
      icuBeds: 6,
      ventilatorBeds: 4,
      beds: {
        icu: { total: 20, available: 6 },
        oxygen: { total: 40, available: 16 },
        general: { total: 120, available: 24 },
      },
      specialties: ["Emergency Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics"],
      notes: "NABH Accredited level-1 emergency trauma care facility with 24/7 in-house MRI, CT, and Blood Storage.",
      updatedAt: now,
      lastUpdated: now,
    },
    {
      id: "hosp_sunrise_multi",
      userId: "seed_hosp_sunrise",
      name: "Sunrise Multispecialty Hospital",
      location: "Murthal Road, Sonipat",
      pincode: "131027",
      contact: "+91-130-248-2000",
      phone: "+91-130-248-2000",
      emergencyOpen: true,
      totalBeds: 135,
      availableBeds: 32,
      icuBeds: 3,
      ventilatorBeds: 2,
      beds: {
        icu: { total: 15, available: 3 },
        oxygen: { total: 30, available: 9 },
        general: { total: 90, available: 20 },
      },
      specialties: ["General Medicine", "Pulmonology", "Gastroenterology"],
      notes: "24/7 triage admitting oxygen and critical ICU transfers with zero queuing delay.",
      updatedAt: now,
      lastUpdated: now,
    }
  ];
}

function getBloodBankDataList(bloodBankOwnerUid) {
  return [
    {
      id: "bb_lifeline",
      userId: bloodBankOwnerUid,
      name: "Lifeline Regional Blood Center",
      location: "Civil Lines, Sonipat",
      contact: "+91-130-255-5000",
      stock: { "A+": 42, "A-": 8, "B+": 35, "B-": 6, "AB+": 12, "AB-": 3, "O+": 60, "O-": 14 },
      bloodStock: { "A+": 42, "A-": 8, "B+": 35, "B-": 6, "AB+": 12, "AB-": 3, "O+": 60, "O-": 14 },
      updatedAt: now,
    },
    {
      id: "bb_redcross",
      userId: "seed_bb_redcross",
      name: "Red Cross Community Blood Bank",
      location: "Model Town, Sonipat",
      contact: "+91-130-248-5000",
      stock: { "A+": 28, "A-": 4, "B+": 30, "B-": 5, "AB+": 8, "AB-": 2, "O+": 45, "O-": 9 },
      bloodStock: { "A+": 28, "A-": 4, "B+": 30, "B-": 5, "AB+": 8, "AB-": 2, "O+": 45, "O-": 9 },
      updatedAt: now,
    }
  ];
}

async function seedDemoAppointments(patientUid) {
  const appointments = [
    {
      patientId: patientUid,
      patientName: "Rahul Verma",
      patientEmail: "patient@mediconnect.demo",
      patientPhone: "+91-9876543210",
      doctor: "Dr Kanika Roy",
      specialty: "Dermatology",
      hospital: "Apollo Hospitals Sector 26",
      consultationMode: "In-Clinic Visit",
      date: "Sunday, Aug 30",
      time: "12:10 PM",
      fee: 1000,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: now,
    }
  ];

  for (const appt of appointments) {
    await db.collection("appointments").add(appt);
  }
}

async function main() {
  console.log("⚡ [MediConnect] Bootstrapping Auth Accounts...");
  const [doctorUid, hospitalUid, bloodBankUid, patientUid] = await Promise.all(
    demoAccounts.map(ensureAuthUser)
  );

  console.log("⚡ [MediConnect] Seeding Doctors...");
  const doctors = getDoctorDataList(doctorUid);
  await Promise.all(doctors.map((d) => db.collection("doctors").doc(d.id).set(d, { merge: true })));

  console.log("⚡ [MediConnect] Seeding Hospitals...");
  const hospitals = getHospitalDataList(hospitalUid);
  await Promise.all(hospitals.map((h) => db.collection("hospitals").doc(h.id).set(h, { merge: true })));

  console.log("⚡ [MediConnect] Seeding Blood Banks...");
  const bloodBanks = getBloodBankDataList(bloodBankUid);
  await Promise.all(bloodBanks.map((b) => db.collection("bloodbanks").doc(b.id).set(b, { merge: true })));

  console.log("⚡ [MediConnect] Seeding Demo Appointments...");
  await seedDemoAppointments(patientUid);

  console.log("\n✅ [MediConnect] Database Seeding Finished Successfully.");
  console.log("==========================================================");
  demoAccounts.forEach((acc) => {
    console.log(`  ${acc.role.padEnd(10)} : ${acc.email.padEnd(35)} (pass: ${DEMO_PASSWORD})`);
  });
  console.log("==========================================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});