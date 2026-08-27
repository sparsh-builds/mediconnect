import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Hospital, Heart, Bed, Droplets, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-gradient-hero text-primary-foreground py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Healthcare
            <span className="block text-4xl md:text-5xl mt-2">When You Need It</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Locate nearby hospitals, check bed availability, and find blood banks instantly. 
            Your health emergency is our priority.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-card/95 backdrop-blur-sm shadow-strong">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Enter your location or ZIP code" 
                    className="pl-10"
                  />
                </div>
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-card/90 backdrop-blur-sm shadow-medium hover:shadow-strong transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Hospital className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Find Hospitals</h3>
              <p className="text-muted-foreground mb-4">
                Locate nearby hospitals with real-time information and directions.
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={() => window.location.href = '/hospitals'}
              >
                View Hospitals
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm shadow-medium hover:shadow-strong transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Bed className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Check Bed Availability</h3>
              <p className="text-muted-foreground mb-4">
                View real-time bed availability including ICU, general, and emergency beds.
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-success group-hover:text-success-foreground transition-colors"
                onClick={() => window.location.href = '/hospitals'}
              >
                Check Availability
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-sm shadow-medium hover:shadow-strong transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-emergency-soft rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Droplets className="w-8 h-8 text-emergency" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Blood Banks</h3>
              <p className="text-muted-foreground mb-4">
                Find blood banks and check availability of different blood types.
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-emergency group-hover:text-emergency-foreground transition-colors"
                onClick={() => window.location.href = '/bloodbanks'}
              >
                Find Blood Banks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;