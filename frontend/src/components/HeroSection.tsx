import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BedDouble,
  Droplets,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Users,
} from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white py-16 lg:py-24">
      {/* Subtle Glow Backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Problem & Value Pitch */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              NABH-Standard Unified Healthcare Infrastructure
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Eliminating Healthcare Latency: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                OPD, Live Beds & Blood
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              MediConnect solves emergency resource fragmentation by bridging OPD queues, real-time ICU/Oxygen bed availability, and blood bank inventory into a synchronized public portal.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-500/20 gap-2" asChild>
                <Link to="/doctors">
                  <Calendar className="w-4 h-4" /> Book OPD Consultation
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/60 text-white hover:bg-slate-800 gap-2" asChild>
                <Link to="/hospitals">
                  <BedDouble className="w-4 h-4 text-emerald-400" /> Bed Tracker
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/60 text-white hover:bg-slate-800 gap-2" asChild>
                <Link to="/bloodbanks">
                  <Droplets className="w-4 h-4 text-rose-400" /> Blood Bank
                </Link>
              </Button>
            </div>

            {/* Proof Points */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg">
              <div>
                <p className="text-2xl font-bold text-sky-400">0 min</p>
                <p className="text-xs text-slate-400">Physical Queue Wait</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">Real-Time</p>
                <p className="text-xs text-slate-400">ICU Bed Tracking</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-400">100%</p>
                <p className="text-xs text-slate-400">Verified Blood Stock</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Overlaid Telemetry Cards */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Doctor Visual */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl bg-slate-800/40 backdrop-blur-sm">
                <img
                  src="/hero-doctor.png"
                  alt="Verified OPD Specialist"
                  className="w-full h-[420px] object-cover object-top"
                  onError={(e) => {
                    // Fallback in case local file name is different
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating Metric 1: OPD Status */}
              <div className="absolute -bottom-4 -left-4 bg-slate-900/95 border border-slate-700 p-3.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Instant OPD Token</p>
                  <p className="text-[10px] text-slate-400">Slot confirmed digitally</p>
                </div>
              </div>

              {/* Floating Metric 2: Live Doctor Badge */}
              <div className="absolute -top-3 -right-3 bg-slate-900/95 border border-emerald-500/40 p-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold text-white">NABH Verified MDs</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;