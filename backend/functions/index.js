const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const cors = require("cors")({ origin: true });
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Firebase Admin with explicit project context to avoid credential lookup timeouts
if (!getApps().length) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "bedtracker-web",
  });
}

const db = getFirestore();

// Safe fallback credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_TW4jooL98dxxpy";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "TEiQ193RrHpnoVJN2AoBaygA";

const getRazorpayInstance = () =>
  new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

/**
 * 1. RAZORPAY: Create Official Order ID
 */
exports.createRazorpayOrder = onRequest(
  { region: "asia-south1", cors: true },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

      const { amount, currency = "INR", receipt } = req.body;
      if (!amount || isNaN(amount)) return res.status(400).json({ error: "Valid amount required" });

      try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create({
          amount: Math.round(Number(amount) * 100),
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        });
        return res.status(200).json(order);
      } catch (err) {
        console.error("Razorpay order error:", err);
        return res.status(500).json({ error: err.message || "Failed to create order" });
      }
    });
  }
);

/**
 * 2. OPD BOOKING: Concurrency Slot Lock & Token Generation
 */
exports.bookAppointmentWithLock = onRequest(
  { region: "asia-south1", cors: true },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

      const {
        doctorId,
        doctorName,
        specialty,
        hospital,
        slotTime,
        date,
        patientId,
        patientName,
        patientEmail,
        patientPhone,
        consultationMode,
        fee,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      } = req.body;

      if (!patientEmail || !slotTime) {
        return res.status(400).json({ error: "Missing required booking details." });
      }

      // Verify HMAC signature if order was passed
      if (razorpayOrderId && razorpaySignature && razorpayPaymentId) {
        const expectedSignature = crypto
          .createHmac("sha256", RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest("hex");

        if (expectedSignature !== razorpaySignature) {
          return res.status(400).json({ error: "Signature verification failed." });
        }
      }

      const doctorRef = doctorId ? db.collection("doctors").doc(doctorId) : null;
      const appointmentRef = db.collection("appointments").doc();
      const tokenId = `MC-${Math.floor(100000 + Math.random() * 900000)}`;

      try {
        const result = await db.runTransaction(async (transaction) => {
          if (doctorRef) {
            const docSnap = await transaction.get(doctorRef);
            if (docSnap.exists) {
              const slots = docSnap.data().slots || [];
              const targetIdx = slots.findIndex((s) => s.time === slotTime);

              if (targetIdx !== -1) {
                if (slots[targetIdx].isFull) {
                  throw new Error("This consultation slot has already been reserved.");
                }
                slots[targetIdx].isFull = true;
                transaction.update(doctorRef, { slots, updatedAt: new Date().toISOString() });
              }
            }
          }

          const payload = {
            id: appointmentRef.id,
            tokenId,
            doctorId: doctorId || "doc_general",
            doctor: doctorName || "Specialist",
            specialty: specialty || "General Medicine",
            hospital: hospital || "Hospital Center",
            patientId: patientId || "guest",
            patientName: patientName || patientEmail.split("@")[0],
            patientEmail,
            patientPhone: patientPhone || "+91-9876543210",
            consultationMode: consultationMode || "In-Clinic Visit",
            date: date || "Today",
            time: slotTime,
            fee: Number(fee) || 1000,
            paymentStatus: "paid",
            status: "confirmed",
            razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
            createdAt: new Date().toISOString(),
          };

          transaction.set(appointmentRef, payload);
          return payload;
        });

        return res.status(200).json({ success: true, appointment: result });
      } catch (err) {
        return res.status(409).json({ error: err.message });
      }
    });
  }
);

/**
 * 3. HOSPITAL TELEMETRY: Bed Counter Admission/Discharge
 */
exports.updateBedInventory = onRequest(
  { region: "asia-south1", cors: true },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

      const { hospitalId, bedType, action } = req.body;
      if (!hospitalId || !["icu", "oxygen", "general"].includes(bedType)) {
        return res.status(400).json({ error: "Invalid hospital ID or bed type." });
      }

      const hospRef = db.collection("hospitals").doc(hospitalId);

      try {
        await db.runTransaction(async (transaction) => {
          const hospDoc = await transaction.get(hospRef);
          if (!hospDoc.exists) throw new Error("Hospital record not found.");

          const currentBeds = hospDoc.data().beds || {};
          const bedStat = currentBeds[bedType] || { total: 10, available: 5 };

          if (action === "admit") {
            if (bedStat.available <= 0) throw new Error(`No ${bedType.toUpperCase()} beds available.`);
            bedStat.available -= 1;
          } else if (action === "discharge") {
            if (bedStat.available >= bedStat.total) throw new Error(`Beds already at max capacity.`);
            bedStat.available += 1;
          }

          currentBeds[bedType] = bedStat;
          const totalAvailable =
            (currentBeds.icu?.available || 0) +
            (currentBeds.oxygen?.available || 0) +
            (currentBeds.general?.available || 0);

          transaction.update(hospRef, {
            beds: currentBeds,
            availableBeds: totalAvailable,
            icuBeds: currentBeds.icu?.available || 0,
            updatedAt: new Date().toISOString(),
          });
        });

        return res.status(200).json({ success: true, message: "Bed telemetry updated." });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    });
  }
);

/**
 * 4. BLOOD BANK: Stock Reservation
 */
exports.deductBloodStock = onRequest(
  { region: "asia-south1", cors: true },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

      const { bloodBankId, bloodGroup, units = 1 } = req.body;
      const bankRef = db.collection("bloodbanks").doc(bloodBankId);

      try {
        await db.runTransaction(async (transaction) => {
          const bankDoc = await transaction.get(bankRef);
          if (!bankDoc.exists) throw new Error("Blood bank not found.");

          const stock = bankDoc.data().stock || bankDoc.data().bloodStock || {};
          const available = stock[bloodGroup] || 0;

          if (available < Number(units)) {
            throw new Error(`Insufficient units for ${bloodGroup}. Available: ${available}`);
          }

          stock[bloodGroup] = available - Number(units);
          transaction.update(bankRef, { stock, bloodStock: stock, updatedAt: new Date().toISOString() });
        });

        return res.status(200).json({ success: true, message: `Deducted ${units} units of ${bloodGroup}` });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    });
  }
);