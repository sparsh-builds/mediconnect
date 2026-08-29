import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, CheckCircle2, Info, Loader2, ShieldCheck, Clock, Building2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseconfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const preSelectedDoctor = searchParams.get("doctor") || "";
  const preSelectedName = searchParams.get("name") || "";
  const preSelectedSpecialty = searchParams.get("specialty") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    doctor: preSelectedName || preSelectedDoctor || "Dr. Sarah Johnson",
    specialty: preSelectedSpecialty || "Cardiology",
    timeSlot: "10:00 AM",
    symptoms: "",
  });

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  useEffect(() => {
    if (preSelectedName) {
      setFormData((prev) => ({
        ...prev,
        doctor: preSelectedName,
        specialty: preSelectedSpecialty || "Cardiology",
      }));
    }
  }, [preSelectedName, preSelectedSpecialty]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Please select a date for your appointment.");
      return;
    }
    if (!formData.timeSlot) {
      toast.error("Please select a time slot.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user?.uid || "guest",
        patientName: formData.name,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        doctor: formData.doctor,
        specialty: formData.specialty,
        date: format(date, "PPP"),
        time: formData.timeSlot,
        symptoms: formData.symptoms,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: serverTimestamp(),
      });

      toast.success("Appointment booked successfully!", {
        description: "Redirecting to your dashboard...",
      });

      setTimeout(() => {
        navigate("/patient-dashboard");
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-5xl flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Visual Card: Clinic Facility Image */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="overflow-hidden border shadow-md">
              <div className="relative h-56 bg-slate-900">
                <img
                  src="/clinic-facility.jpg"
                  alt="Modern OPD Medical Center"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-bold text-sm">NABH Accredited Clinical Suites</p>
                  <p className="text-[11px] text-slate-300">Sterilized modern consulting rooms</p>
                </div>
              </div>

              <CardContent className="p-4 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Digital Token Queue Verification</span>
                </div>
                <p>
                  Your consultation token guarantees entry within your scheduled 30-minute window without lobby waiting.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-7">
            <Card className="shadow-md border">
              <CardHeader>
                <CardTitle className="text-xl">Book Consultation Token</CardTitle>
                <CardDescription>
                  {preSelectedName ? `Scheduling with ${preSelectedName}` : "Choose your specialist and appointment slot"}
                </CardDescription>
                {preSelectedName && (
                  <Alert className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Booking appointment with <strong>{preSelectedName}</strong> ({preSelectedSpecialty})
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold">Patient Name *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold">Phone *</Label>
                      <Input
                        id="phone"
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">Email *</Label>
                    <Input
                      id="email"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Specialist Doctor</Label>
                      <Input value={formData.doctor} disabled className="bg-muted text-xs font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-xs font-normal", !date && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {date ? format(date, "PPP") : <span>Pick Date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Time Slot *</Label>
                    <Select value={formData.timeSlot} onValueChange={(val) => handleChange("timeSlot", val)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00 AM">09:00 AM (Morning)</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM (Morning)</SelectItem>
                        <SelectItem value="02:00 PM">02:00 PM (Afternoon)</SelectItem>
                        <SelectItem value="04:30 PM">04:30 PM (Evening)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="symptoms" className="text-xs font-semibold">Symptoms (Optional)</Label>
                    <Textarea
                      id="symptoms"
                      rows={2}
                      placeholder="Brief details about your symptoms..."
                      value={formData.symptoms}
                      onChange={(e) => handleChange("symptoms", e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full font-semibold" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Confirm OPD Appointment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointment;