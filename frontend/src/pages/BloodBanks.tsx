import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodBankFinder from "@/components/BloodBankFinder";
import DonorRegistration from "@/components/DonorRegistration";
import EmergencyBloodRequest from "@/components/EmergencyBloodRequest";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplet,
  UserPlus,
  AlertTriangle,
  Activity,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function BloodBanks() {
  const [activeTab, setActiveTab] = useState<"stock" | "register" | "sos">("stock");

  const tabs = [
    { id: "stock", label: "Live Blood Stock", icon: Droplet, badge: "Live" },
    { id: "register", label: "Become a Donor", icon: UserPlus, badge: "Volunteer" },
    { id: "sos", label: "Emergency SOS Request", icon: AlertTriangle, badge: "Urgent" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-rose-500 selection:text-white">
      <Header />

      {/* High-Contrast Pitch Dark Hero Section with Blood Bank Showcase */}
      <section className="bg-slate-950 text-white pt-10 pb-12 border-b-2 border-slate-800 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading, Emergency Context & Key Highlights */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-950/80 px-4 py-1.5 text-xs font-bold text-rose-300 shadow-inner">
                <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                Real-Time Regional Blood Bank & Donor Network
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                Emergency Blood & <br />
                <span className="text-rose-500 underline decoration-rose-600 underline-offset-4">
                  Plasma Stock Tracker
                </span>
              </h1>

              <p className="text-slate-200 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
                Check verified blood group unit levels in real-time, register as an urgent voluntary donor, or submit rapid emergency requests to nearby hospitals.
              </p>

              {/* Highlights Bar */}
              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Verified NABH Blood Banks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Sub-second Unit Updates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>24/7 Critical Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Column: Blood Bank Image Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Glowing Red Ambient Halo */}
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-amber-600 rounded-3xl blur-md opacity-30"></div>

                <Card className="relative bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative h-56 w-full overflow-hidden bg-slate-800">
                    <img
                      src="/blood-bank.png"
                      alt="Regional Blood Bank Inventory"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        // Safe fallback to clinic image if path differs
                        (e.target as HTMLImageElement).src = "/clinic-facility.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                    
                    <Badge className="absolute top-3 left-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1 flex items-center gap-1.5 border-none shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Inventory Stream
                    </Badge>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                          <Droplet className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Central Storage Network</h4>
                          <p className="text-[11px] text-slate-400 font-bold">All 8 Blood Groups Monitored</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-rose-500/50 text-rose-300 text-[10px] font-black">
                        LIVE TELEMETRY
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                      <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">O- Positive</span>
                        <span className="text-sm font-black text-emerald-400">Available</span>
                      </div>
                      <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">AB- Rare</span>
                        <span className="text-sm font-black text-amber-400">Low Stock</span>
                      </div>
                      <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Donors</span>
                        <span className="text-sm font-black text-white">450+ Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sticky Switcher Bar */}
      <div className="bg-white border-b-2 border-slate-300 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-[1.02]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-rose-600"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    isActive ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
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
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === "stock" && <BloodBankFinder />}
        {activeTab === "register" && <DonorRegistration />}
        {activeTab === "sos" && <EmergencyBloodRequest />}
      </main>

      <Footer />
    </div>
  );
}