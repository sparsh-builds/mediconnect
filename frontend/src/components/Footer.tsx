import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Activity, Hospital, Heart, Users, Code, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground leading-none">MediConnect</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Unified Healthcare Portal</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Consolidated emergency network tracking hospital bed availability, digital OPD consultation scheduling, and live blood bank inventory.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Telemetry 24/7</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Quick Links</h4>
            <nav className="space-y-2.5 text-sm">
              <Link to="/book" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Activity className="w-4 h-4" />
                <span>Book OPD Slot</span>
              </Link>
              <Link to="/hospitals" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Hospital className="w-4 h-4" />
                <span>Hospital Bed Tracker</span>
              </Link>
              <Link to="/bloodbanks" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                <span>Blood Bank Inventory</span>
              </Link>
              <Link to="/developer" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Code className="w-4 h-4" />
                <span>Developer API Docs</span>
              </Link>
            </nav>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Emergency Numbers</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-rose-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">National Emergency: 112</p>
                  <p className="text-xs text-muted-foreground">Ambulance & Emergency Response</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Blood Helpline: 104 / 1910</p>
                  <p className="text-xs text-muted-foreground">Central Blood Transfusion Council</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Support & Portal</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@mediconnect.health</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Central Medical Council Network</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MediConnect. All rights reserved.</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;