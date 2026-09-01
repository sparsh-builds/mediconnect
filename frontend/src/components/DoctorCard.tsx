import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Video,
  Building2,
  Lock,
  CreditCard,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface DoctorSlot {
  time: string;
  isFull: boolean;
}

interface DoctorCardProps {
  id: string;
  name: string;
  gender?: "male" | "female";
  specialty: string;
  hospital: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  fee: number;
  distanceKm: number;
  avatar: string;
  degrees?: string;
  languages?: string[];
  consultationType?: "online" | "in-person" | "both";
  slots: DoctorSlot[];
  requiresOfflinePrepay?: boolean;
}

export default function DoctorCard({
  id,
  name,
  specialty,
  hospital,
  rating,
  reviewsCount,
  experienceYears,
  fee,
  distanceKm,
  avatar,
  degrees,
  languages,
  consultationType = "both",
  slots = [],
  requiresOfflinePrepay = false,
}: DoctorCardProps) {
  const { user } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationMode, setConsultationMode] = useState<"in-person" | "online">("in-person");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachRecords, setAttachRecords] = useState(true);

  // Patient Booking Form
  const [patientName, setPatientName] = useState(user?.name || "");
  const [patientEmail, setPatientEmail] = useState(user?.email || "patient@mediconnect.demo");
  const [patientPhone, setPatientPhone] = useState("+91-9876543210");

  const isPrepaymentMandatory = consultationMode === "online" || requiresOfflinePrepay;

  const handleOpenBookingModal = (time: string) => {
    setSelectedSlot(time);
    setIsCheckoutOpen(true);
  };

  const handleBookingExecution = async () => {
    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim()) {
      toast.error("Please fill in all patient details.");
      return;
    }

    setIsProcessing(true);

    const bookingPayload = {
      doctorId: id,
      doctorName: name,
      specialty,
      hospital,
      slotTime: selectedSlot,
      date: "Today",
      patientName,
      patientEmail,
      patientPhone,
      consultationMode: consultationMode === "online" ? "Online Video Call" : "In-Clinic Visit",
      fee,
      records: attachRecords
        ? [
            {
              id: `rec_${Date.now()}`,
              title: "Recent Lab Test & Medical History",
              fileUrl: "#",
              uploadedAt: new Date().toLocaleDateString(),
            },
          ]
        : [],
    };

    try {
      if (isPrepaymentMandatory) {
        // 1. Fetch Razorpay Order from Cloud Function
        const orderRes = await fetch(
          "http://127.0.0.1:5001/bedtracker-web/asia-south1/createRazorpayOrder",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: fee }),
          }
        );

        if (!orderRes.ok) throw new Error("Could not initialize payment order.");
        const order = await orderRes.json();

        // 2. Launch Razorpay Checkout Modal
        const options = {
          key: "rzp_test_TW4jooL98dxxpy",
          amount: order.amount,
          currency: order.currency,
          name: "MediConnect Healthcare",
          description: `OPD Consultation Token - ${name}`,
          order_id: order.id,
          handler: async function (response: any) {
            try {
              const confirmRes = await fetch(
                "http://127.0.0.1:5001/bedtracker-web/asia-south1/bookAppointmentWithLock",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...bookingPayload,
                    paymentStatus: "paid",
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                }
              );

              const confirmData = await confirmRes.json();
              if (!confirmRes.ok) throw new Error(confirmData.error || "Booking recording failed.");

              sessionStorage.setItem("lastConfirmedToken", JSON.stringify(confirmData.appointment));
              toast.success(`Booking Confirmed! Your Token: ${confirmData.appointment.tokenId}`);
              setIsCheckoutOpen(false);
            } catch (err: any) {
              toast.error(err.message || "Failed to finalize appointment.");
            }
          },
          prefill: {
            name: patientName,
            email: patientEmail,
            contact: patientPhone,
          },
          theme: { color: "#020617" },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
      } else {
        // Direct Pay-at-Desk In-Clinic Token Generation
        const confirmRes = await fetch(
          "http://127.0.0.1:5001/bedtracker-web/asia-south1/bookAppointmentWithLock",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bookingPayload,
              paymentStatus: "pay_at_hospital",
            }),
          }
        );

        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) throw new Error(confirmData.error || "Failed to record booking.");

        sessionStorage.setItem("lastConfirmedToken", JSON.stringify(confirmData.appointment));
        toast.success(`Token #${confirmData.appointment.tokenId} generated! Pay at hospital desk.`);
        setIsCheckoutOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Unable to proceed with appointment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="border-2 border-slate-300 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            
            {/* Avatar & Quick Stats */}
            <div className="relative shrink-0">
              <img
                src={avatar || "/hero-doctor.png"}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 bg-slate-100 shadow-sm"
              />
              <Badge className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-black border-none px-2 py-0.5">
                <Star className="w-3 h-3 fill-white mr-0.5" /> {rating}
              </Badge>
            </div>

            {/* Doctor Info Details */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-base font-black text-slate-950">{name}</h3>
                  <p className="text-xs font-bold text-sky-800">{specialty}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-slate-950">₹{fee}</span>
                  <span className="text-[10px] text-slate-500 font-bold block">per consultation</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-semibold truncate">{degrees}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-bold pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> {hospital}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {distanceKm} km away
                </span>
                <span className="text-slate-400">•</span>
                <span>{experienceYears}+ yrs exp</span>
              </div>

              {/* Consultation Format Badges */}
              <div className="flex items-center gap-2 pt-1">
                {consultationType === "both" || consultationType === "online" ? (
                  <Badge className="bg-blue-100 text-blue-950 border border-blue-300 text-[10px] font-black">
                    <Video className="w-3 h-3 mr-1" /> Video Call
                  </Badge>
                ) : null}
                {consultationType === "both" || consultationType === "in-person" ? (
                  <Badge className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-black">
                    <Building2 className="w-3 h-3 mr-1" /> In-Clinic
                  </Badge>
                ) : null}
                {requiresOfflinePrepay && (
                  <Badge variant="outline" className="text-[10px] font-bold border-amber-400 text-amber-900 bg-amber-50">
                    <Lock className="w-3 h-3 mr-1" /> Advance Prepay Required
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Slot Grid Bar */}
          <div className="mt-5 pt-4 border-t-2 border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-700" /> Available OPD Tokens Today
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                {slots.filter((s) => !s.isFull).length} slots open
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {slots.map((slot, idx) => (
                <Button
                  key={idx}
                  disabled={slot.isFull}
                  variant={slot.isFull ? "secondary" : "outline"}
                  className={`text-xs font-black h-9 rounded-xl transition-all ${
                    slot.isFull
                      ? "opacity-40 line-through bg-slate-100 border-slate-200"
                      : "border-2 border-slate-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                  }`}
                  onClick={() => handleOpenBookingModal(slot.time)}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking & Prepayment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-300 shadow-2xl overflow-hidden">
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">OPD Appointment Checkout</h3>
                <p className="text-xs text-slate-300 font-medium">Slot: {selectedSlot} • {name}</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Consultation Format Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-900">Consultation Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 ${
                      consultationMode === "in-person"
                        ? "bg-slate-950 text-white border-slate-950"
                        : "border-slate-300 text-slate-700"
                    }`}
                    onClick={() => setConsultationMode("in-person")}
                  >
                    <Building2 className="w-3.5 h-3.5" /> In-Clinic Visit
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 ${
                      consultationMode === "online"
                        ? "bg-slate-950 text-white border-slate-950"
                        : "border-slate-300 text-slate-700"
                    }`}
                    onClick={() => setConsultationMode("online")}
                  >
                    <Video className="w-3.5 h-3.5" /> Video Call
                  </button>
                </div>
              </div>

              {/* Patient Details Form */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Patient Full Name</Label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="text-xs font-bold border-2 border-slate-300 mt-1"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                  <Input
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="text-xs font-bold border-2 border-slate-300 mt-1"
                    placeholder="patient@gmail.com"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Contact Number</Label>
                  <Input
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="text-xs font-bold border-2 border-slate-300 mt-1"
                    placeholder="+91-9876543210"
                  />
                </div>
              </div>

              {/* Attach Medical Vault Checkbox */}
              <div className="p-3 bg-sky-50 rounded-xl border-2 border-sky-200">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-900">
                  <input
                    type="checkbox"
                    checked={attachRecords}
                    onChange={(e) => setAttachRecords(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-400 text-sky-700"
                  />
                  <span>Attach Patient Medical Vault Records</span>
                </label>
              </div>

              {/* Payment Summary Box */}
              <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-xl border-2 border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-600 block">Total Fee</span>
                  <span className="font-black text-slate-950 text-base">₹{fee}</span>
                </div>
                <Badge className={isPrepaymentMandatory ? "bg-slate-950 text-white" : "bg-emerald-600 text-white"}>
                  {isPrepaymentMandatory ? "Online Prepayment Required" : "Pay at Hospital Desk"}
                </Badge>
              </div>

              {/* Submit / Pay Button */}
              <Button
                disabled={isProcessing}
                className="w-full text-xs font-black h-12 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl shadow-md"
                onClick={handleBookingExecution}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : isPrepaymentMandatory ? (
                  <CreditCard className="w-4 h-4 mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {isPrepaymentMandatory ? `Pay ₹${fee} & Confirm Token` : "Confirm Token (Pay Later)"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}