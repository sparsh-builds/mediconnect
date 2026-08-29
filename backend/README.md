# MediConnect — Backend Integration Guide

This package contains:

```
mediconnect-backend/
├── firestore.rules        # Production security rules (RBAC)
├── functions/
│   ├── index.js           # 3 callable Cloud Functions (transactional)
│   └── package.json
├── seed.js                 # Populates demo data + demo accounts
├── package.json            # Deps for seed.js
└── README.md                # You are here
```

## Schema note

The rules and seed script assume `hospitals/{id}` and `bloodbanks/{id}` each
have a `userId` field pointing at the Firebase Auth UID that manages that
facility — mirroring the `doctors.userId` field already in your spec. Add
this field if it isn't already in your data model; it's what lets a hospital
or blood bank account prove ownership of "their" document.

## 1. Prerequisites

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # select your Firebase project
```

## 2. Deploy Firestore security rules

```bash
# from the mediconnect-backend/ directory
firebase deploy --only firestore:rules
```

Firebase CLI expects the rules file referenced in `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

## 3. Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

This deploys three callable (HTTPS) functions in the `asia-south1` region:
`bookAppointmentWithLock`, `updateBedInventory`, `deductBloodStock`.

## 4. Run the seed script

```bash
# from the mediconnect-backend/ root
# 1. Download a service account key:
#    Firebase Console > Project Settings > Service Accounts > Generate new private key
#    Save it as ./serviceAccountKey.json (add to .gitignore!)
npm install
npm run seed
```

This creates 3 demo Auth accounts (one doctor, one hospital admin, one blood
bank admin — printed credentials at the end), 6 doctors, 3 hospitals, and 3
blood banks, all cross-linked so the RBAC rules above are immediately
testable.

**Never commit `serviceAccountKey.json`.**

## 5. Calling the functions from React

Install/confirm the Firebase Client SDK, then:

```ts
// firebase.ts
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app, "asia-south1"); // match deployed region
```

### Booking a slot

```ts
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const bookAppointment = httpsCallable(functions, "bookAppointmentWithLock");

async function handleBook() {
  try {
    const result = await bookAppointment({
      doctorId: "doc_mehta_cardio",
      slotTime: "09:00 AM",
      date: "March 15, 2026",
      symptoms: "Chest tightness for 2 days",
      patientName: user.displayName,
      patientEmail: user.email,
      patientPhone: user.phoneNumber,
    });
    console.log(result.data); // { success: true, appointment: {...} }
  } catch (err: any) {
    // err.code === 'failed-precondition' -> slot just got taken; refresh & retry
    // err.code === 'permission-denied'   -> role check failed
    console.error(err.code, err.message);
  }
}
```

### Admitting / discharging a bed

```ts
const updateBedInventory = httpsCallable(functions, "updateBedInventory");

await updateBedInventory({
  hospitalId: "hosp_city_general",
  bedType: "icu",      // "icu" | "oxygen" | "general"
  action: "admit",      // "admit" | "discharge"
});
```

### Deducting blood stock

```ts
const deductBloodStock = httpsCallable(functions, "deductBloodStock");

await deductBloodStock({
  bankId: "bb_lifeline",
  bloodGroup: "O+",
  units: 2,
});
```

## 6. Frontend real-time subscriptions (unchanged)

Your existing Firestore Client SDK `onSnapshot` listeners on `doctors`,
`hospitals`, and `bloodbanks` keep working as-is — the Cloud Functions write
to the same documents your listeners already watch, so bed counts, blood
stock, and slot availability update in real time on every connected client
the moment a transaction commits.

## 7. Why the concurrency-critical writes go through Cloud Functions, not client rules

Firestore security rules can validate a single document's shape at write
time, but they can't safely express "read the current value, check a
condition against it, and write a different derived value" as one atomic
unit the way `runTransaction` can — and they have no way to *retry* on
contention. Routing `bookAppointmentWithLock`, `updateBedInventory`, and
`deductBloodStock` through server-side transactions is what actually
prevents double-booking, negative bed counts, and over-drawn blood stock
under concurrent load; the security rules remain in place as a second layer
that blocks any client from bypassing this logic with a raw write.
