import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodBankFinder from "@/components/BloodBankFinder";
import DonorRegistration from "@/components/DonorRegistration";
import EmergencyBloodRequest from "@/components/EmergencyBloodRequest";
import { Droplet, UserPlus, AlertTriangle } from "lucide-react";

export default function BloodBanks() {
  const [activeTab, setActiveTab] = useState<"stock" | "register" | "sos">("stock");

  const tabs = [
    { id: "stock", label: "Live Blood Stock", icon: Droplet, badge: "Live" },
    { id: "register", label: "Become a Donor", icon: UserPlus, badge: "Volunteer" },
    { id: "sos", label: "Emergency SOS Request", icon: AlertTriangle, badge: "Urgent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Flipkart-Style Sticky Switcher Bar */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-red-600"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? "bg-white/20 text-white" : "bg-red-50 text-red-600"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content View */}
      <main className="flex-1">
        {activeTab === "stock" && <BloodBankFinder />}
        {activeTab === "register" && <DonorRegistration />}
        {activeTab === "sos" && <EmergencyBloodRequest />}
      </main>

      <Footer />
    </div>
  );
}