import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Calendar,
  BedDouble,
  Droplets,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* Dynamic Pitch Hero with Media & Telemetry */}
        <HeroSection />

        {/* Feature Highlights / Problem Solving Grid */}
        <section className="py-20 container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-2 text-primary border-primary/30">
              Core Modules
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Built to Solve Critical Healthcare Bottlenecks
            </h2>
            <p className="text-muted-foreground text-base mt-2">
              Synchronizing fragmented hospital systems into a unified, high-availability platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Module 1: OPD Booking */}
            <Card className="border hover:border-sky-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">OPD Queue Optimization</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Eliminates crowded hospital lobbies by providing real-time slot selection, dynamic distance filtering, and digital consultation tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" /> Filter by distance, rating & fees
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" /> Doctor-controlled live slot status
                  </li>
                </ul>
                <Button className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold" asChild>
                  <Link to="/doctors">
                    Explore OPD Doctors <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Module 2: Bed Tracker */}
            <Card className="border hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <BedDouble className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Hospital Bed Telemetry</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Live tracking across ICU, Oxygen-supported, and General Wards to prevent emergency patient turnaround during critical hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time capacity monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Hospital staff dashboard updates
                  </li>
                </ul>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold" asChild>
                  <Link to="/hospitals">
                    Track Live Beds <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Module 3: Blood Bank */}
            <Card className="border hover:border-rose-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Emergency Blood Inventory</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Instant group-wise search ($A^+$, $B^+$, $AB^-$, $O^-$) connected to regional blood bank centers with automated inventory deduction.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-500" /> Unit-level real-time availability
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-500" /> Direct emergency center dispatch
                  </li>
                </ul>
                <Button className="w-full bg-rose-500 hover:bg-rose-400 text-white font-semibold" asChild>
                  <Link to="/bloodbanks">
                    Check Blood Stock <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;