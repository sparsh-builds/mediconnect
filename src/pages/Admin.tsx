// src/pages/Admin.tsx
import { useState } from "react";
import HospitalLogin from "@/components/HospitalLogin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Hospital, Heart, UserCog } from "lucide-react";

const Admin = () => {
  const [loginType, setLoginType] = useState<"hospital" | "bloodbank" | "admin" | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        {!loginType ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Select Login Type</h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setLoginType("hospital")}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Hospital className="w-5 h-5" /> Hospital Staff
              </button>
              <button
                onClick={() => setLoginType("bloodbank")}
                className="px-6 py-4 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
              >
                <Heart className="w-5 h-5" /> Blood Bank Staff
              </button>
              <button
                onClick={() => setLoginType("admin")}
                className="px-6 py-4 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
              >
                <UserCog className="w-5 h-5" /> System Admin
              </button>
            </div>
          </div>
        ) : (
          <HospitalLogin loginType={loginType} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Admin;