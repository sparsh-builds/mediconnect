/**
 * MediConnect — Firestore Seed Script
 * ----------------------------------------------------------------------------
 * Populates:
 *   - Auth users + users/{uid} docs for 3 demo accounts (1 doctor, 1 hospital,
 *     1 blood bank owner) so RBAC in firestore.rules is testable out of the box.
 *   - 6 verified doctors (with slots)
 *   - 3 hospitals (with ICU/oxygen/general bed telemetry)
 *   - 3 blood banks (with full 8-group inventories)
 *
 * Usage:
 *   1. Download a service account key from
 *      Firebase Console > Project Settings > Service Accounts > Generate new private key
 *   2. Save it as ./serviceAccountKey.json in this directory (DO NOT commit it).
 *   3. npm install
 *   4. npm run seed
 *
 * Safe to re-run: it upserts by fixed doc IDs, so re-running just overwrites
 * the same seed records rather than duplicating them.
 * ----------------------------------------------------------------------------
 */

const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

const now = admin.firestore.FieldValue.serverTimestamp();

// ----------------------------------------------------------------------------
// Demo auth accounts (so hospital/doctor/bloodbank ownership rules work)
// ----------------------------------------------------------------------------
const DEMO_PASSWORD = "MediConnect@2026"; // change immediately after first login

const demoAccounts = [
  { email: "dr.mehta@mediconnect.demo", role: "doctor", name: "Dr. Anjali Mehta" },
  { email: "cityhospital@mediconnect.demo", role: "hospital", name: "City General Hospital Admin" },
  { email: "lifeline.bloodbank@mediconnect.demo", role: "bloodbank", name: "Lifeline Blood Bank Admin" },
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
      phone: "+91-9000000000",
      createdAt: now,
    },
    { merge: true }
  );

  return userRecord.uid;
}

// ----------------------------------------------------------------------------
// Data builders
// ----------------------------------------------------------------------------

function buildDoctors(doctorOwnerUid, hospitalIds) {
  return [
    {
      id: "doc_mehta_cardio",
      userId: doctorOwnerUid, // this one is wired to a real auth account for RBAC testing
      name: "Dr. Anjali Mehta",
      specialty: "Cardiology",
      hospital: "City General Hospital",
      hospitalId: hospitalIds.city,
      rating: 4.9,
      reviewsCount: 482,
      experienceYears: 14,
      fee: 900,
      distanceKm: 2.3,
      avatar: "https://i.pravatar.cc/150?img=47",
      slots: [
        { time: "09:00 AM", isFull: false },
        { time: "09:30 AM", isFull: false },
        { time: "10:00 AM", isFull: true },
        { time: "10:30 AM", isFull: false },
      ],
    },
    {
      id: "doc_rao_neuro",
      userId: "seed_doc_rao_placeholder",
      name: "Dr. Suresh Rao",
      specialty: "Neurology",
      hospital: "Sunrise Multispecialty Hospital",
      hospitalId: hospitalIds.sunrise,
      rating: 4.7,
      reviewsCount: 311,
      experienceYears: 19,
      fee: 1200,
      distanceKm: 5.1,
      avatar: "https://i.pravatar.cc/150?img=12",
      slots: [
        { time: "11:00 AM", isFull: false },
        { time: "11:30 AM", isFull: false },
        { time: "12:00 PM", isFull: false },
      ],
    },
    {
      id: "doc_kapoor_general",
      userId: "seed_doc_kapoor_placeholder",
      name: "Dr. Neha Kapoor",
      specialty: "General Medicine",
      hospital: "City General Hospital",
      hospitalId: hospitalIds.city,
      rating: 4.6,
      reviewsCount: 205,
      experienceYears: 9,
      fee: 500,
      distanceKm: 2.3,
      avatar: "https://i.pravatar.cc/150?img=32",
      slots: [
        { time: "02:00 PM", isFull: false },
        { time: "02:30 PM", isFull: false },
        { time: "03:00 PM", isFull: true },
      ],
    },
    {
      id: "doc_singh_ortho",
      userId: "seed_doc_singh_placeholder",
      name: "Dr. Manpreet Singh",
      specialty: "Orthopedics",
      hospital: "Sunrise Multispecialty Hospital",
      hospitalId: hospitalIds.sunrise,
      rating: 4.8,
      reviewsCount: 398,
      experienceYears: 16,
      fee: 800,
      distanceKm: 5.1,
      avatar: "https://i.pravatar.cc/150?img=51",
      slots: [
        { time: "10:00 AM", isFull: false },
        { time: "10:30 AM", isFull: false },
      ],
    },
    {
      id: "doc_iyer_pedia",
      userId: "seed_doc_iyer_placeholder",
      name: "Dr. Lakshmi Iyer",
      specialty: "Pediatrics",
      hospital: "Green Valley Hospital",
      hospitalId: hospitalIds.greenValley,
      rating: 4.9,
      reviewsCount: 560,
      experienceYears: 12,
      fee: 600,
      distanceKm: 8.7,
      avatar: "https://i.pravatar.cc/150?img=25",
      slots: [
        { time: "09:00 AM", isFull: false },
        { time: "09:30 AM", isFull: true },
        { time: "04:00 PM", isFull: false },
      ],
    },
    {
      id: "doc_bose_ophthal",
      userId: "seed_doc_bose_placeholder",
      name: "Dr. Arindam Bose",
      specialty: "Ophthalmology",
      hospital: "Green Valley Hospital",
      hospitalId: hospitalIds.greenValley,
      rating: 4.5,
      reviewsCount: 178,
      experienceYears: 7,
      fee: 450,
      distanceKm: 8.7,
      avatar: "https://i.pravatar.cc/150?img=15",
      slots: [
        { time: "01:00 PM", isFull: false },
        { time: "01:30 PM", isFull: false },
      ],
    },
  ];
}

function buildHospitals(hospitalOwnerUid) {
  return [
    {
      id: "hosp_city_general",
      userId: hospitalOwnerUid, // wired to a real auth account for RBAC testing
      name: "City General Hospital",
      location: "MG Road, Bengaluru",
      contact: "+91-80-4000-1000",
      beds: {
        icu: { total: 20, available: 4 },
        oxygen: { total: 40, available: 15 },
        general: { total: 120, available: 38 },
      },
      updatedAt: now,
    },
    {
      id: "hosp_sunrise_multi",
      userId: "seed_hosp_sunrise_placeholder",
      name: "Sunrise Multispecialty Hospital",
      location: "Andheri West, Mumbai",
      contact: "+91-22-6100-2000",
      beds: {
        icu: { total: 15, available: 2 },
        oxygen: { total: 30, available: 9 },
        general: { total: 90, available: 21 },
      },
      updatedAt: now,
    },
    {
      id: "hosp_green_valley",
      userId: "seed_hosp_greenvalley_placeholder",
      name: "Green Valley Hospital",
      location: "Sector 21, Sonipat",
      contact: "+91-130-255-3000",
      beds: {
        icu: { total: 10, available: 6 },
        oxygen: { total: 25, available: 18 },
        general: { total: 60, available: 33 },
      },
      updatedAt: now,
    },
  ];
}

function buildBloodBanks(bloodBankOwnerUid) {
  return [
    {
      id: "bb_lifeline",
      userId: bloodBankOwnerUid, // wired to a real auth account for RBAC testing
      name: "Lifeline Blood Bank",
      location: "MG Road, Bengaluru",
      contact: "+91-80-4000-5000",
      stock: { "A+": 42, "A-": 8, "B+": 35, "B-": 6, "AB+": 12, "AB-": 3, "O+": 60, "O-": 14 },
      updatedAt: now,
    },
    {
      id: "bb_redcross_mumbai",
      userId: "seed_bb_redcross_placeholder",
      name: "Red Cross Regional Blood Bank",
      location: "Andheri West, Mumbai",
      contact: "+91-22-6100-5000",
      stock: { "A+": 30, "A-": 5, "B+": 28, "B-": 4, "AB+": 9, "AB-": 2, "O+": 50, "O-": 10 },
      updatedAt: now,
    },
    {
      id: "bb_greenvalley",
      userId: "seed_bb_greenvalley_placeholder",
      name: "Green Valley Community Blood Bank",
      location: "Sector 21, Sonipat",
      contact: "+91-130-255-5000",
      stock: { "A+": 18, "A-": 3, "B+": 15, "B-": 2, "AB+": 5, "AB-": 1, "O+": 25, "O-": 6 },
      updatedAt: now,
    },
  ];
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
  console.log("Creating demo auth accounts + user profiles...");
  const [doctorOwnerUid, hospitalOwnerUid, bloodBankOwnerUid] = await Promise.all(
    demoAccounts.map(ensureAuthUser)
  );
  console.log("  doctor owner uid:     ", doctorOwnerUid);
  console.log("  hospital owner uid:   ", hospitalOwnerUid);
  console.log("  blood bank owner uid: ", bloodBankOwnerUid);

  const hospitalIds = { city: "hosp_city_general", sunrise: "hosp_sunrise_multi", greenValley: "hosp_green_valley" };

  console.log("\nSeeding hospitals...");
  const hospitals = buildHospitals(hospitalOwnerUid);
  await Promise.all(hospitals.map((h) => db.collection("hospitals").doc(h.id).set(h, { merge: true })));
  console.log(`  ${hospitals.length} hospitals written.`);

  console.log("\nSeeding doctors...");
  const doctors = buildDoctors(doctorOwnerUid, hospitalIds);
  await Promise.all(doctors.map((d) => db.collection("doctors").doc(d.id).set(d, { merge: true })));
  console.log(`  ${doctors.length} doctors written.`);

  console.log("\nSeeding blood banks...");
  const bloodBanks = buildBloodBanks(bloodBankOwnerUid);
  await Promise.all(bloodBanks.map((b) => db.collection("bloodbanks").doc(b.id).set(b, { merge: true })));
  console.log(`  ${bloodBanks.length} blood banks written.`);

  console.log("\n✅ Seed complete.");
  console.log("\nDemo login credentials (change after first login):");
  demoAccounts.forEach((a) => console.log(`  ${a.role.padEnd(10)} -> ${a.email} / ${DEMO_PASSWORD}`));

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
