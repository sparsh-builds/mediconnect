import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SpecialtyCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SpecialtyCard = ({ icon: Icon, title, description }: SpecialtyCardProps) => {
  return (
    <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-card border-border/50">
      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default SpecialtyCard;
