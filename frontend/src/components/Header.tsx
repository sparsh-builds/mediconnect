import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Activity, Users, Code, Hospital } from "lucide-react";

import { LocateFixed } from "lucide-react";


const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ✅ Logo is now a Link */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MediConnect</h1>
              <p className="text-xs text-muted-foreground">Emergency Healthcare Locator</p>
            </div>
          </Link>

          {/* ✅ Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/hospitals"
              className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Hospital className="w-4 h-4" />
              <span>Hospitals</span>
            </Link>

            <Link
              to="/bloodbanks"
              className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Heart className="w-4 h-4" />
              <span>Blood Banks</span>
            </Link>

            <Link
              to="/admin"
              className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Users className="w-4 h-4" />
              <span>Admin</span>
            </Link>

            <Link
              to="/developer"
              className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Code className="w-4 h-4" />
              <span>Developer</span>
            </Link>

            <Button
  variant="secondary"
  className="hidden md:flex items-center space-x-2"
  onClick={() => {
    // Dispatch a custom event so Hospitals.tsx can listen for it
    window.dispatchEvent(new Event("search-my-location"));
  }}
>
  <LocateFixed className="w-4 h-4" />
  <span>Near Me</span>
</Button>

          </nav>

          {/* Mobile Menu Button (Optional) */}
          <Button variant="outline" className="md:hidden">
            Menu
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
