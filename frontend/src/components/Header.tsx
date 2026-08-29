import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Menu, LogOut, BedDouble, Droplets, Calendar, User } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (logout) await logout();
    navigate("/auth");
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case "doctor":
        return "/doctor-dashboard";
      case "hospital":
        return "/hospital-dashboard";
      case "bloodbank":
        return "/bloodbank-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/patient-dashboard";
    }
  };

  // Direct OPD to /doctors catalogue
  const navLinks = [
    { label: "OPD Booking", path: "/doctors", icon: Calendar },
    { label: "Hospital Beds", path: "/hospitals", icon: BedDouble },
    { label: "Blood Bank", path: "/bloodbanks", icon: Droplets },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground leading-none">MediConnect</span>
            <span className="text-xs text-muted-foreground">Unified Healthcare Portal</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path}>
                <Button variant="ghost" className="text-sm font-medium gap-1.5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {link.label}
                </Button>
              </Link>
            );
          })}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <Button variant="outline" size="sm" asChild>
                <Link to={getDashboardPath()} className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{user.role} Portal</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="ml-4">
              <Button size="sm">Login / Sign Up</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="border-t my-2 pt-4">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to={getDashboardPath()} onClick={() => setIsOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        <span className="capitalize">{user.role} Portal</span>
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Login / Sign Up</Button>
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;