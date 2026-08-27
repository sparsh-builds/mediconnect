import { Separator } from "@/components/ui/separator";
import { Activity, Hospital, Heart, Users, Code, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">HealthFinder</h3>
                <p className="text-xs text-muted-foreground">
                  Emergency Healthcare Locator
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting you to healthcare when it matters most. Find nearby
              hospitals, check bed availability, and locate blood banks instantly.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Available 24/7</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <nav className="space-y-3">
              <a href="/" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Activity className="w-4 h-4" />
                <span>Home</span>
              </a>
              <a href="/hospitals" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Hospital className="w-4 h-4" />
                <span>Find Hospitals</span>
              </a>
              <a href="/bloodbanks" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                <span>Find Blood Banks</span>
              </a>
              <a href="/admin" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Users className="w-4 h-4" />
                <span>Admin Portal</span>
              </a>
              <a href="/developer" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Code className="w-4 h-4" />
                <span>API Documentation</span>
              </a>
            </nav>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Emergency Contacts</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emergency" />
                <div>
                  <p className="text-sm font-medium text-foreground">Emergency: 911</p>
                  <p className="text-xs text-muted-foreground">Life-threatening emergencies</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-emergency" />
                <div>
                  <p className="text-sm font-medium text-foreground">Blood Emergency</p>
                  <p className="text-xs text-muted-foreground">1-800-RED-CROSS</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Hospital className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Health Info</p>
                  <p className="text-xs text-muted-foreground">1-800-CDC-INFO</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact & Support</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">gargsparsh12@gmail.com</p>
                  <p className="text-xs text-muted-foreground">General inquiries</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">+91-7906396140</p>
                  <p className="text-xs text-muted-foreground">Technical support</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">24/7 Service</p>
                  <p className="text-xs text-muted-foreground">Nationwide coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
            <p>© 2024 HealthFinder. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">HIPAA Compliance</a>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
