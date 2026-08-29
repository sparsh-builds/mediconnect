import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MapPin, Mail, FileText, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebaseconfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface AppointmentItem {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  location?: string;
  paymentStatus?: string;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AppointmentItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as AppointmentItem);
        });

        // Demo fallback if no appointments exist yet
        if (list.length === 0) {
          setAppointments([
            {
              id: "demo-1",
              doctor: "Dr. Sarah Johnson",
              specialty: "Cardiology",
              date: "Tomorrow",
              time: "10:00 AM",
              status: "confirmed",
              location: "Room 301, General Wing",
              paymentStatus: "paid",
            },
          ]);
        } else {
          setAppointments(list);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore read error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
              Patient Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your scheduled appointments and medical records</p>
          </div>
          <Button asChild>
            <Link to="/book" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Book Appointment
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Info Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">{user?.email?.split("@")[0] || "Patient User"}</p>
                    <p className="text-xs text-muted-foreground">UID: {user?.uid?.slice(0, 8) || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{user?.email || "patient@example.com"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Registered Facility</p>
                      <p className="text-sm font-medium">MediConnect Central Network</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-2" disabled>
                  <FileText className="w-4 h-4 mr-2" />
                  E-Prescriptions (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Consultations</CardTitle>
                <CardDescription>Real-time booking and queue status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No active consultations found.</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <Card key={appointment.id} className="border">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                {appointment.doctor}
                              </h3>
                              <p className="text-primary text-sm font-medium">{appointment.specialty}</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{appointment.time}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                {appointment.status.toUpperCase()}
                              </Badge>
                              {appointment.paymentStatus && (
                                <Badge variant="secondary" className="text-xs">
                                  Payment: {appointment.paymentStatus.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;