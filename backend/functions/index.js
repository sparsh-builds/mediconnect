/**
 * MediConnect — Cloud Functions
 * ----------------------------------------------------------------------------
 * Three callable functions, each wrapping a Firestore `runTransaction` so
 * concurrent requests can never corrupt shared state:
 *
 *   1. bookAppointmentWithLock  — OPD slot booking (prevents double-booking)
 *   2. updateBedInventory       — ICU/oxygen/general bed admit/discharge
 *   3. deductBloodStock         — blood bank stock deduction
 *
 * All three are implemented as `onCall` functions so the React frontend can
 * invoke them directly via the Firebase Client SDK's `httpsCallable`, with
 * `context.auth` already populated and verified by the platform.
 * ----------------------------------------------------------------------------
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "asia-south1", maxInstances: 20 });

// ----------------------------------------------------------------------------
// Shared helpers
// ----------------------------------------------------------------------------

/** Throws if the caller isn't signed in; returns the uid. */
function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to perform this action.");
  }
  return request.auth.uid;
}

/** Loads the caller's role from users/{uid}. */
async function getRole(uid, txn) {
  const ref = db.collection("users").doc(uid);
  const snap = txn ? await txn.get(ref) : await ref.get();
  if (!snap.exists) throw new HttpsError("permission-denied", "User profile not found.");
  return snap.data().role;
}

// ----------------------------------------------------------------------------
// 1. bookAppointmentWithLock
// ----------------------------------------------------------------------------
/**
 * Input:
 * {
 *   doctorId: string,
 *   slotTime: string,        // must match an entry in doctors.slots[].time
 *   date: string,             // e.g. "March 15, 2026"
 *   symptoms?: string,
 *   patientName: string,
 *   patientEmail: string,
 *   patientPhone: string
 * }
 *
 * Behavior:
 *  - Reads the doctor doc inside the transaction.
 *  - Finds the slot matching slotTime; throws 'failed-precondition' if it's
 *    already full or doesn't exist.
 *  - Flips that slot's isFull -> true within the SAME transaction.
 *  - Creates the appointment document.
 *  - Firestore transactions use optimistic concurrency: if two clients race
 *    for the same slot, whichever transaction commits second will detect
 *    the doctor doc changed underneath it and automatically retry — on
 *    retry it will see isFull === true and reject with 'failed-precondition'.
 *    This is what prevents double-booking without a distributed lock.
 */
exports.bookAppointmentWithLock = onCall(async (request) => {
  const uid = requireAuth(request);
  const { doctorId, slotTime, date, symptoms, patientName, patientEmail, patientPhone } =
    request.data || {};

  if (!doctorId || !slotTime || !date || !patientName || !patientEmail || !patientPhone) {
    throw new HttpsError(
      "invalid-argument",
      "doctorId, slotTime, date, patientName, patientEmail, and patientPhone are required."
    );
  }

  const doctorRef = db.collection("doctors").doc(doctorId);
  const appointmentRef = db.collection("appointments").doc(); // pre-generated ID

  const result = await db.runTransaction(async (txn) => {
    const role = await getRole(uid, txn);
    if (role !== "patient" && role !== "admin") {
      throw new HttpsError("permission-denied", "Only patients can book appointments.");
    }

    const doctorSnap = await txn.get(doctorRef);
    if (!doctorSnap.exists) {
      throw new HttpsError("not-found", `Doctor ${doctorId} does not exist.`);
    }

    const doctor = doctorSnap.data();
    const slots = Array.isArray(doctor.slots) ? [...doctor.slots] : [];
    const slotIndex = slots.findIndex((s) => s.time === slotTime);

    if (slotIndex === -1) {
      throw new HttpsError("not-found", `Slot "${slotTime}" does not exist for this doctor.`);
    }
    if (slots[slotIndex].isFull) {
      throw new HttpsError(
        "failed-precondition",
        `Slot "${slotTime}" was just booked by someone else. Please pick another slot.`
      );
    }

    // Atomically flip the slot within the transaction.
    slots[slotIndex] = { ...slots[slotIndex], isFull: true };
    txn.update(doctorRef, { slots });

    // Create the appointment in the same transaction/commit.
    const appointmentData = {
      id: appointmentRef.id,
      patientId: uid,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      date,
      time: slotTime,
      symptoms: symptoms || "",
      status: "confirmed",
      paymentStatus: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    txn.set(appointmentRef, appointmentData);

    return appointmentData;
  });

  return { success: true, appointment: result };
});

// ----------------------------------------------------------------------------
// 2. updateBedInventory
// ----------------------------------------------------------------------------
/**
 * Input:
 * {
 *   hospitalId: string,
 *   bedType: "icu" | "oxygen" | "general",
 *   action: "admit" | "discharge"    // admit: available -1, discharge: available +1
 * }
 *
 * Behavior:
 *  - Runs inside a transaction so the read-check-write is atomic.
 *  - 'admit' cannot push available below 0.
 *  - 'discharge' cannot push available above total.
 *  - Caller must be role 'hospital' and own this hospital doc, or 'admin'.
 */
const VALID_BED_TYPES = ["icu", "oxygen", "general"];

exports.updateBedInventory = onCall(async (request) => {
  const uid = requireAuth(request);
  const { hospitalId, bedType, action } = request.data || {};

  if (!hospitalId || !VALID_BED_TYPES.includes(bedType) || !["admit", "discharge"].includes(action)) {
    throw new HttpsError(
      "invalid-argument",
      `hospitalId is required; bedType must be one of ${VALID_BED_TYPES.join(", ")}; action must be 'admit' or 'discharge'.`
    );
  }

  const hospitalRef = db.collection("hospitals").doc(hospitalId);

  const result = await db.runTransaction(async (txn) => {
    const role = await getRole(uid, txn);
    const hospitalSnap = await txn.get(hospitalRef);

    if (!hospitalSnap.exists) {
      throw new HttpsError("not-found", `Hospital ${hospitalId} does not exist.`);
    }
    const hospital = hospitalSnap.data();

    if (role !== "admin" && !(role === "hospital" && hospital.userId === uid)) {
      throw new HttpsError("permission-denied", "You may only update your own hospital's bed inventory.");
    }

    const bed = hospital.beds?.[bedType];
    if (!bed) {
      throw new HttpsError("failed-precondition", `Bed type "${bedType}" is not configured for this hospital.`);
    }

    const delta = action === "admit" ? -1 : 1;
    const newAvailable = bed.available + delta;

    if (newAvailable < 0) {
      throw new HttpsError("failed-precondition", `No available ${bedType} beds to admit into.`);
    }
    if (newAvailable > bed.total) {
      throw new HttpsError("failed-precondition", `Cannot discharge beyond total ${bedType} capacity.`);
    }

    txn.update(hospitalRef, {
      [`beds.${bedType}.available`]: newAvailable,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { bedType, available: newAvailable, total: bed.total };
  });

  return { success: true, ...result };
});

// ----------------------------------------------------------------------------
// 3. deductBloodStock
// ----------------------------------------------------------------------------
/**
 * Input:
 * {
 *   bankId: string,
 *   bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
 *   units: number    // positive integer, units to deduct
 * }
 *
 * Behavior:
 *  - Validates requested units <= available stock BEFORE deducting, inside
 *    a transaction, so two simultaneous requests can never both succeed
 *    and drive stock negative.
 *  - Caller must be role 'bloodbank' and own this bank doc, or 'admin'.
 */
const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

exports.deductBloodStock = onCall(async (request) => {
  const uid = requireAuth(request);
  const { bankId, bloodGroup, units } = request.data || {};

  if (!bankId || !VALID_BLOOD_GROUPS.includes(bloodGroup) || !Number.isInteger(units) || units <= 0) {
    throw new HttpsError(
      "invalid-argument",
      `bankId is required; bloodGroup must be one of ${VALID_BLOOD_GROUPS.join(", ")}; units must be a positive integer.`
    );
  }

  const bankRef = db.collection("bloodbanks").doc(bankId);

  const result = await db.runTransaction(async (txn) => {
    const role = await getRole(uid, txn);
    const bankSnap = await txn.get(bankRef);

    if (!bankSnap.exists) {
      throw new HttpsError("not-found", `Blood bank ${bankId} does not exist.`);
    }
    const bank = bankSnap.data();

    if (role !== "admin" && !(role === "bloodbank" && bank.userId === uid)) {
      throw new HttpsError("permission-denied", "You may only deduct stock from your own blood bank.");
    }

    const available = bank.stock?.[bloodGroup] ?? 0;
    if (units > available) {
      throw new HttpsError(
        "failed-precondition",
        `Requested ${units} units of ${bloodGroup} but only ${available} available.`
      );
    }

    const newStock = available - units;
    txn.update(bankRef, {
      [`stock.${bloodGroup}`]: newStock,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { bloodGroup, remaining: newStock };
  });

  return { success: true, ...result };
});
