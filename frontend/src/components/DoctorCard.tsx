import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MapPin, Clock, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface DoctorSlot {
  time: string;
  isFull: boolean;
}

export interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  fee: number;
  distanceKm: number;
  avatar: string;
  slots: DoctorSlot[];
}

const DoctorCard = ({
  id,
  name,
  specialty,
  hospital,
  experienceYears,
  rating,
  reviewsCount,
  fee,
  distanceKm,
  avatar,
  slots = [],
}: DoctorCardProps) => {
  const freeSlots = slots.filter((s) => !s.isFull);
  const isAvailable = freeSlots.length > 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border flex flex-col justify-between">
      <div>
        {/* Card Header Media */}
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

          {/* Availability Badge */}
          <Badge
            className={`absolute top-3 right-3 shadow-md ${
              isAvailable
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-rose-500 hover:bg-rose-600 text-white"
            }`}
          >
            {isAvailable ? `${freeSlots.length} Slots Open` : "Fully Booked"}
          </Badge>

          {/* Distance Indicator */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-400" />
            <span>{distanceKm} km away</span>
          </div>
        </div>

        {/* Doctor Details */}
        <CardContent className="p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {rating} ({reviewsCount})
              </span>
              <span className="text-sm font-bold text-foreground">₹{fee}</span>
            </div>

            <h3 className="font-bold text-lg text-foreground mt-1.5 leading-snug">{name}</h3>
            <p className="text-xs font-semibold text-primary">{specialty} • {experienceYears}+ yrs exp</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
              <Building2 className="w-3.5 h-3.5" /> {hospital}
            </p>
          </div>

          {/* Slot Preview Pills */}
          <div className="pt-2 border-t text-xs">
            <p className="text-muted-foreground mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" /> Today's Slot Status:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {slots.slice(0, 3).map((slot, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    slot.isFull
                      ? "bg-muted text-muted-foreground line-through"
                      : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                  }`}
                >
                  {slot.time}
                </span>
              ))}
              {slots.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{slots.length - 3} more
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </div>

      {/* Action CTA */}
      <CardFooter className="p-5 pt-0">
        <Link
          to={`/book?doctor=${id}&name=${encodeURIComponent(name)}&specialty=${encodeURIComponent(
            specialty
          )}`}
          className="w-full"
        >
          <Button className="w-full font-medium" disabled={!isAvailable}>
            <Calendar className="w-4 h-4 mr-2" />
            {isAvailable ? "Book Consultation" : "No Slots Available"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;