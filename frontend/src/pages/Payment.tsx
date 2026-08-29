import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Payment = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = sessionStorage.getItem("paymentCompleted");
    if (checkPaymentStatus === "true") {
      setPaymentCompleted(true);
    }
  }, []);

  const appointmentDetails = {
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "March 15, 2025",
    time: "10:00 AM",
    consultationFee: 500,
    platformFee: 50,
  };

  const total = appointmentDetails.consultationFee + appointmentDetails.platformFee;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      sessionStorage.setItem("paymentCompleted", "true");
      setPaymentCompleted(true);
      toast.success("Payment Successful!", {
        description: "Your appointment has been confirmed. Redirecting to your dashboard...",
      });
      setTimeout(() => {
        navigate("/patient-dashboard");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Complete Payment
            </h1>
            <p className="text-muted-foreground">
              Secure payment powered by Razorpay
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Appointment Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
                <CardDescription>Review your booking details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor</span>
                    <span className="font-medium">{appointmentDetails.doctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialty</span>
                    <Badge variant="secondary">{appointmentDetails.specialty}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{appointmentDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{appointmentDetails.time}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span>₹{appointmentDetails.consultationFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span>₹{appointmentDetails.platformFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your payment option</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">UPI</p>
                        <p className="text-sm text-muted-foreground">Pay via UPI apps</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">Net Banking</p>
                        <p className="text-sm text-muted-foreground">Pay via your bank</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handlePayment}
                    size="lg"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Pay ₹{total}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secured by SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
