import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { db } from "@/firebaseconfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";

interface DoctorRecord {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  isApproved?: boolean;
  userId?: string;
}

interface UserRecord {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  createdAt?: string;
}

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsSnap, usersSnap, apptsSnap] = await Promise.all([
        getDocs(collection(db, "doctors")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "appointments")),
      ]);

      const docList: DoctorRecord[] = [];
      docsSnap.forEach((d) => docList.push({ id: d.id, ...d.data() } as DoctorRecord));

      const userList: UserRecord[] = [];
      usersSnap.forEach((u) => userList.push({ id: u.id, ...u.data() } as UserRecord));

      setDoctors(docList);
      setUsers(userList);
      setAppointmentsCount(apptsSnap.size);
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleDoctorApproval = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "doctors", id), {
        isApproved: !currentStatus,
      });
      toast.success(!currentStatus ? "Doctor approved!" : "Doctor approval revoked");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  const pendingDoctors = doctors.filter((d) => !d.isApproved);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-6xl flex-1">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Admin Console</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Platform verification and user registry</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Registered Users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">{pendingDoctors.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-amber-500/40" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Consultations</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{appointmentsCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600/40" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="doctors">
          <TabsList className="mb-4">
            <TabsTrigger value="doctors">Doctor Directory ({doctors.length})</TabsTrigger>
            <TabsTrigger value="users">All Users ({users.length})</TabsTrigger>
          </TabsList>

          {/* Doctor Management Tab */}
          <TabsContent value="doctors" className="space-y-3">
            {doctors.length === 0 ? (
              <p className="text-center py-10 text-xs text-muted-foreground">No doctors registered in database.</p>
            ) : (
              doctors.map((docItem) => (
                <Card key={docItem.id} className="border">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{docItem.name}</h3>
                        <Badge className={docItem.isApproved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"}>
                          {docItem.isApproved ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{docItem.specialty} • {docItem.hospital}</p>
                    </div>

                    <Button
                      variant={docItem.isApproved ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleDoctorApproval(docItem.id, !!docItem.isApproved)}
                      className={!docItem.isApproved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    >
                      {docItem.isApproved ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1.5 text-rose-500" /> Revoke Verification
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Specialist
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* User Directory Tab */}
          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b bg-muted/50 text-muted-foreground uppercase">
                      <tr>
                        <th className="p-3.5 font-semibold">User</th>
                        <th className="p-3.5 font-semibold">Email</th>
                        <th className="p-3.5 font-semibold">Role</th>
                        <th className="p-3.5 font-semibold">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/20">
                          <td className="p-3.5 font-medium">{u.name || "Anonymous User"}</td>
                          <td className="p-3.5 text-muted-foreground">{u.email}</td>
                          <td className="p-3.5">
                            <Badge variant="outline" className="capitalize text-[11px]">
                              {u.role || "patient"}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-muted-foreground">{u.phone || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;