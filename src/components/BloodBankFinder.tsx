import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Phone, Clock, Droplets, Navigation, Search } from "lucide-react";

interface BloodBankData {
  id: string;
  bankInfo: {
    name: string;
    address: string;
    city?: string;
    phone: string;
    hours: string;
    lat?: number;
    lng?: number;
  };
  bloodStock: Record<string, number>;
  lastUpdated?: string;
}

const BloodBankFinder = () => {
  const [bloodBanks, setBloodBanks] = useState<BloodBankData[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<BloodBankData[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState<string>("ALL");

  useEffect(() => {
    const q = query(collection(db, "blood_banks"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const banks: BloodBankData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          bankInfo: doc.data().bankInfo || { name: "Unnamed Bank", address: "", phone: "", hours: "24/7" },
          bloodStock: doc.data().bloodStock || {},
          lastUpdated: doc.data().lastUpdated,
        }));
        setBloodBanks(banks);
        setFilteredBanks(banks);
      },
      (err) => console.error("Error fetching live blood banks:", err)
    );

    return () => unsubscribe();
  }, []);

  // Filter pipeline
  useEffect(() => {
    let result = [...bloodBanks];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bankInfo.name?.toLowerCase().includes(term) ||
          b.bankInfo.address?.toLowerCase().includes(term) ||
          b.bankInfo.city?.toLowerCase().includes(term)
      );
    }

    if (selectedBloodType !== "ALL") {
      result = result.filter((b) => (b.bloodStock?.[selectedBloodType] || 0) > 0);
    }

    setFilteredBanks(result);
  }, [search, selectedBloodType, bloodBanks]);

  const getBloodBadge = (units: number) => {
    if (units >= 15) return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">{units} units</Badge>;
    if (units > 0) return <Badge className="bg-amber-100 text-amber-800 border-amber-300">{units} units</Badge>;
    return <Badge variant="outline" className="text-gray-400 border-gray-200">0 units</Badge>;
  };

  const openGoogleMaps = (bank: BloodBankData) => {
    const queryStr = `${bank.bankInfo.name} ${bank.bankInfo.address} ${bank.bankInfo.city || ""}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`, "_blank");
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Live Blood Availability</h2>
          <p className="text-gray-500">Find blood banks and check real-time unit counts across all blood groups</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by city, area, or facility name..."
              className="pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Filter By Required Blood Group
            </span>
            <div className="flex flex-wrap gap-2">
              {["ALL", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={selectedBloodType === type ? "default" : "outline"}
                  className={selectedBloodType === type ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  onClick={() => setSelectedBloodType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Blood Bank Cards */}
        {filteredBanks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Droplets className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">No blood banks matching this criteria</h3>
              <p className="text-sm text-gray-500">Try choosing a different blood group filter or search term.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBanks.map((bank) => (
              <Card key={bank.id} className="border shadow-xs hover:shadow-md transition">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{bank.bankInfo.name}</CardTitle>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1 flex-wrap">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{bank.bankInfo.address || bank.bankInfo.city || "Location available on map"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{bank.bankInfo.hours || "24/7"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => {
                        const units = bank.bloodStock?.[type] || 0;
                        const isHighlighted = selectedBloodType === type;
                        return (
                          <div
                            key={type}
                            className={`p-2.5 rounded-lg border text-center ${
                              isHighlighted ? "bg-red-50/70 border-red-300 ring-1 ring-red-400" : "bg-gray-50/80"
                            }`}
                          >
                            <div className="text-sm font-bold text-gray-800 mb-1">{type}</div>
                            {getBloodBadge(units)}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button onClick={() => openGoogleMaps(bank)} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                      <Navigation className="w-4 h-4 mr-2" /> Get Directions
                    </Button>
                    {bank.bankInfo.phone && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => (window.location.href = `tel:${bank.bankInfo.phone}`)}
                      >
                        <Phone className="w-4 h-4 mr-2 text-emerald-600" /> Call {bank.bankInfo.phone}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BloodBankFinder;