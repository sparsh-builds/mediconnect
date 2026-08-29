import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// Replace Supabase import:
// import { supabase } from "@/integrations/supabase/client";

// Use Firebase Firestore instead:
import { db } from "@/firebaseconfig";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     setLoading(true);
//     // const [{ data: docs }, { data: profs }, { data: appts }] = await Promise.all([
//     //   supabase.from("doctor_profiles").select("*"),
//     //   supabase.from("profiles").select("*"),
//     //   supabase.from("appointments").select("*").order("created_at", { ascending: false }).limit(50),
//     // ]);
//     setDoctors(docs ?? []);
//     setUsers(profs ?? []);
//     setAppointments(appts ?? []);
//     setLoading(false);
//   };

  useEffect(() => { fetchData(); }, []);

  const handleApproveDoctor = async (id: string) => {
    const { error } = await supabase.from("doctor_profiles").update({ is_approved: true }).eq("id", id);
    if (error) { toast.error("Failed to approve"); return; }
    toast.success("Doctor approved!");
    fetchData();
  };

  const handleRevokeDoctor = async (id: string) => {
    const { error } = await supabase.from("doctor_profiles").update({ is_approved: false }).eq("id", id);
    if (error) { toast.error("Failed to revoke"); return; }
    toast.success("Doctor approval revoked");
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const pendingDoctors = doctors.filter(d => !d.is_approved);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage users, doctors, and platform activity</p>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-primary">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-primary/30" />
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Doctors</p>
                <p className="text-3xl font-bold text-primary">{pendingDoctors.length}</p>
              </div>
              <UserCheck className="w-10 h-10 text-primary/30" />
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold text-primary">{appointments.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-primary/30" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="doctors">
          <TabsList>
            <TabsTrigger value="doctors">Doctor Approvals</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-4 mt-4">
            {doctors.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No doctors registered yet</p>
            ) : doctors.map((doc) => (
              <Card key={doc.id} className="border-2">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{users.find(u => u.user_id === doc.user_id)?.full_name || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground">{users.find(u => u.user_id === doc.user_id)?.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{doc.specialization}</Badge>
                      <Badge className={doc.is_approved ? "bg-secondary text-secondary-foreground" : "bg-yellow-100 text-yellow-800"}>
                        {doc.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!doc.is_approved ? (
                      <Button onClick={() => handleApproveDoctor(doc.id)} size="sm">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    ) : (
                      <Button variant="destructive" size="sm" onClick={() => handleRevokeDoctor(doc.id)}>
                        <XCircle className="w-4 h-4 mr-1" /> Revoke
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Phone</th>
                        <th className="text-left p-4 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b last:border-0">
                          <td className="p-4">{u.full_name}</td>
                          <td className="p-4">{u.email}</td>
                          <td className="p-4">{u.phone || "—"}</td>
                          <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
