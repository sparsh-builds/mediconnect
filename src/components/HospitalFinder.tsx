import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hospital, MapPin, Phone, Bed, Users, Clock } from "lucide-react";

const mockHospitals = [
  {
    id: 1,
    name: "City General Hospital",
    address: "123 Health Street, Downtown",
    distance: "0.5 miles",
    phone: "(555) 123-4567",
    status: "open",
    beds: {
      icu: { available: 5, total: 20 },
      general: { available: 15, total: 50 },
      emergency: { available: 3, total: 10 }
    }
  },
  {
    id: 2,
    name: "St. Mary's Medical Center",
    address: "456 Care Avenue, Midtown",
    distance: "1.2 miles",
    phone: "(555) 987-6543",
    status: "open",
    beds: {
      icu: { available: 2, total: 15 },
      general: { available: 8, total: 40 },
      emergency: { available: 1, total: 8 }
    }
  },
  {
    id: 3,
    name: "Metro Emergency Hospital",
    address: "789 Emergency Blvd, Uptown",
    distance: "2.1 miles",
    phone: "(555) 456-7890",
    status: "busy",
    beds: {
      icu: { available: 0, total: 12 },
      general: { available: 5, total: 35 },
      emergency: { available: 2, total: 6 }
    }
  }
];

const HospitalFinder = () => {
  const getBedAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 30) return "success";
    if (percentage > 10) return "warning";
    return "emergency";
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nearby Hospitals
          </h2>
          <p className="text-xl text-muted-foreground">
            Real-time hospital information and bed availability
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {mockHospitals.map((hospital) => (
            <Card key={hospital.id} className="shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center">
                      <Hospital className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{hospital.name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{hospital.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{hospital.distance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={hospital.status === "open" ? "default" : "secondary"}
                    className={hospital.status === "open" ? "bg-success text-success-foreground" : ""}
                  >
                    {hospital.status === "open" ? "Open" : "Busy"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">ICU Beds</span>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{hospital.beds.icu.available}</span>
                      <span className="text-sm text-muted-foreground">/ {hospital.beds.icu.total}</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-auto ${
                          getBedAvailabilityColor(hospital.beds.icu.available, hospital.beds.icu.total) === "success" 
                            ? "border-success text-success" 
                            : getBedAvailabilityColor(hospital.beds.icu.available, hospital.beds.icu.total) === "warning"
                            ? "border-warning text-warning"
                            : "border-emergency text-emergency"
                        }`}
                      >
                        Available
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">General</span>
                      <Bed className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{hospital.beds.general.available}</span>
                      <span className="text-sm text-muted-foreground">/ {hospital.beds.general.total}</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-auto ${
                          getBedAvailabilityColor(hospital.beds.general.available, hospital.beds.general.total) === "success" 
                            ? "border-success text-success" 
                            : getBedAvailabilityColor(hospital.beds.general.available, hospital.beds.general.total) === "warning"
                            ? "border-warning text-warning"
                            : "border-emergency text-emergency"
                        }`}
                      >
                        Available
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Emergency</span>
                      <Hospital className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{hospital.beds.emergency.available}</span>
                      <span className="text-sm text-muted-foreground">/ {hospital.beds.emergency.total}</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-auto ${
                          getBedAvailabilityColor(hospital.beds.emergency.available, hospital.beds.emergency.total) === "success" 
                            ? "border-success text-success" 
                            : getBedAvailabilityColor(hospital.beds.emergency.available, hospital.beds.emergency.total) === "warning"
                            ? "border-warning text-warning"
                            : "border-emergency text-emergency"
                        }`}
                      >
                        Available
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-gradient-primary hover:opacity-90 flex-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call {hospital.phone}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HospitalFinder;