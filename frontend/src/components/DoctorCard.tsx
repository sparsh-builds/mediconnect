import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Star,
  ShieldCheck,
  Video,
  UserCheck,
  Clock,
  MapPin,
  CalendarCheck,
  ChevronRight,
  Languages,
} from "lucide-react";

export interface DoctorSlot {
  time: string;
  isFull: boolean;
}

export interface DoctorCardProps {
  id: string;
  name: string;
  gender?: "male" | "female";
  specialty: string;
  hospital: string;
  experienceYears: number;
  rating?: number;
  reviewsCount?: number;
  fee: number;
  distanceKm?: number;
  avatar?: string;
  degrees?: string;
  languages?: string[];
  consultationType?: "online" | "in-person" | "both";
  slots?: DoctorSlot[];
}

const DoctorCard = ({
  id,
  name,
  specialty,
  hospital,
  experienceYears,
  rating = 4.9,
  reviewsCount = 120,
  fee,
  distanceKm = 2.4,
  avatar = "/hero-doctor.png",
  degrees = "MBBS, MD",
  languages = ["English", "Hindi"],
  consultationType = "both",
  slots = [],
}: DoctorCardProps) => {
  const freeSlots = slots.filter((s) => !s.isFull);
  const nextAvailableSlot = freeSlots.length > 0 ? freeSlots[0].time : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Top Banner Accent */}
      <div className="bg-slate-900 px-5 py-2 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium tracking-wide">Live Token Queue Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{distanceKm} km away</span>
        </div>
      </div>

      <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Doctor Identity & Clinical Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="relative shrink-0">
            <img
              src={avatar || "/hero-doctor.png"}
              alt={name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover object-top border border-slate-100 bg-slate-50 shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/hero-doctor.png";
              }}
            />
            <div className="absolute -bottom-2 -right-1.5 bg-emerald-600 text-white p-1 rounded-lg border-2 border-white shadow-xs" title="Verified Practitioner">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-700 transition-colors">
                {name}
              </h3>
              <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 text-[10px] font-semibold px-2 py-0.5">
                {specialty}
              </Badge>
            </div>

            <p className="text-xs font-medium text-slate-600">
              {degrees} <span className="text-slate-400">•</span> <span className="font-semibold text-slate-800">{experienceYears}+ Yrs Practice</span>
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{hospital}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {rating} <span className="text-slate-400 font-normal">({reviewsCount})</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>{languages.join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Action Panel: Availability & Direct Booking CTA */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 gap-3 shrink-0">
          <div className="text-left md:text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Consultation Fee</span>
            <span className="text-2xl font-black text-slate-900">₹{fee}</span>
          </div>

          <Link
            to={`/book?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&specialty=${encodeURIComponent(
              specialty
            )}&fee=${fee}&hospital=${encodeURIComponent(hospital)}&avatar=${encodeURIComponent(avatar || "/hero-doctor.png")}`}
            className="w-auto"
          >
            <Button className="bg-slate-900 hover:bg-sky-800 text-white font-semibold px-5 h-11 rounded-xl flex items-center gap-2 shadow-xs text-xs">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Book Appointment</span>
              {nextAvailableSlot && (
                <span className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
                  {nextAvailableSlot}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mode Indicator Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {consultationType !== "in-person" && (
            <span className="inline-flex items-center gap-1 text-sky-700 font-medium text-[11px]">
              <Video className="w-3.5 h-3.5" /> Video Teleconsultation
            </span>
          )}
          {consultationType !== "online" && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
              <UserCheck className="w-3.5 h-3.5" /> In-Clinic Hospital Visit
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {freeSlots.length > 0 ? `${freeSlots.length} open slots today` : "No slots open today"}
        </span>
      </div>
    </div>
  );
};

export default DoctorCard;