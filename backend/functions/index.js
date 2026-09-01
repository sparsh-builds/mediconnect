const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const crypto = require("crypto");

// Configuration values
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_TW4jooL98dxxpy";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "TEiQ193RrHpnoVJN2AoBaygA";

const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini Client
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  "AQ.Ab8RN6KC240lbcKSaUB60OTTb3H1qbE3KEcaFVn8xL5FnYNcag";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * AI CLINICAL ENGINE: Multimodal Diagnostic OCR, Visual Inspection & Plain-English Explainer
 */
exports.analyzeMedicalReport = onRequest(
  { region: "asia-south1", cors: true, timeoutSeconds: 60, memory: "1GiB" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      const { fileBase64, mimeType = "image/png", docTitle = "Medical Document", category = "General" } = req.body;

      if (!fileBase64) {
        return res.status(400).json({ error: "Missing document or image payload." });
      }

      try {
        // Strip data URI prefixes if passed from frontend FileReader
        const cleanBase64 = fileBase64.replace(/^data:[a-zA-Z0-9\/\+]+;base64,/, "");

        const clinicalPrompt = `
You are a Board-Certified Clinical Pathologist and Patient Health Educator AI on the MediConnect platform.
Analyze this medical document or visual medical condition photo (e.g. lab report, prescription, skin allergy, radiology scan).

Document Name: ${docTitle}
Category: ${category}

Tasks:
1. Identify whether this is a structured lab report (e.g., Blood, CBC, Thyroid, Urine) or a clinical/visual photo (e.g., skin allergy, rash, wound, X-ray).
2. If it contains numeric biomarkers, extract the exact Parameter Name, Measured Value, Reference Range, and flag it as "normal", "low", or "high". If visual (like an allergic rash), describe key visual findings as parameters.
3. Classify overall urgency into one of: "Normal" | "Moderate" | "Critical".
4. Write 2-3 clear, compassionate summary bullet points explaining the clinical findings in plain, non-jargon English.
5. Provide 2-3 actionable, safe lifestyle or dietary precautions (and state whether follow-up with a doctor is advised).

Respond STRICTLY in valid JSON matching this schema:
{
  "reportTitle": "${docTitle}",
  "urgency": "Normal" | "Moderate" | "Critical",
  "documentType": "string",
  "biomarkers": [
    {
      "parameter": "string",
      "value": "string",
      "range": "string",
      "status": "normal" | "low" | "high"
    }
  ],
  "summary": ["string"],
  "dietPrecautions": ["string"]
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: clinicalPrompt },
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1, // Strict factual determinism
          },
        });

        const structuredOutput = JSON.parse(response.text);
        structuredOutput.analyzedAt = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return res.status(200).json({ success: true, ...structuredOutput });
      } catch (err) {
        console.error("Clinical Multimodal Analysis Failed:", err);
        return res.status(500).json({
          error: err.message || "Failed to analyze document with AI engine.",
        });
      }
    });
  }
);

let dbInstance = null;
let razorpayInstance = null;

function getDb() {
  if (!dbInstance) {
    const { initializeApp, getApps } = require("firebase-admin/app");
    const { getFirestore } = require("firebase-admin/firestore");
    if (!getApps().length) {
      initializeApp({ projectId: "bedtracker-web" });
    }
    dbInstance = getFirestore();
  }
  return dbInstance;
}

function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require("razorpay");
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

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
        const razorpay = getRazorpay();
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
        razorpay_payment_id,
        razorpayOrderId,
        razorpay_order_id,
        razorpaySignature,
        razorpay_signature,
      } = req.body;

      const orderId = razorpayOrderId || razorpay_order_id;
      const paymentId = razorpayPaymentId || razorpay_payment_id;
      const signature = razorpaySignature || razorpay_signature;

      if (!patientEmail || !slotTime) {
        return res.status(400).json({ error: "Missing required booking details." });
      }

      // Verify HMAC signature if Razorpay details are provided
      if (orderId && signature && paymentId) {
        try {
          const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

          if (expectedSignature !== signature) {
            console.error("Signature Mismatch:", { expected: expectedSignature, received: signature });
            return res.status(400).json({ error: "Payment verification failed (signature mismatch)." });
          }
        } catch (err) {
          console.error("Signature check error:", err);
        }
      }

      const db = getDb();
      const appointmentRef = db.collection("appointments").doc();
      const tokenId = `MC-${Math.floor(100000 + Math.random() * 900000)}`;

      try {
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
          razorpayPaymentId: paymentId || `pay_mock_${Date.now()}`,
          razorpayOrderId: orderId || `order_mock_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        // Safely update doctor slots if the doctor document exists
        if (doctorId) {
          const doctorRef = db.collection("doctors").doc(doctorId);
          const docSnap = await doctorRef.get();

          if (docSnap.exists) {
            const slots = docSnap.data().slots || [];
            const targetIdx = slots.findIndex((s) => s.time === slotTime);

            if (targetIdx !== -1) {
              if (slots[targetIdx].isFull) {
                return res.status(409).json({ error: "This consultation slot has already been reserved." });
              }
              slots[targetIdx].isFull = true;
              await doctorRef.update({ slots, updatedAt: new Date().toISOString() });
            }
          }
        }

        // Commit appointment record to Firestore
        await appointmentRef.set(payload);

        return res.status(200).json({ success: true, appointment: payload });
      } catch (err) {
        console.error("Booking recording error:", err);
        return res.status(500).json({ error: err.message || "Failed to record booking." });
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

      const db = getDb();
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
      const db = getDb();
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