import { Badge } from "@/components/ui/badge";
import { Battery, BatteryLow, BatteryFull } from "lucide-react";
import type { EnergyLevel } from "@/lib/types";

interface EnergyBadgeProps {
  level: EnergyLevel;
}

export function EnergyBadge({ level }: EnergyBadgeProps) {
  const config: Record<
    EnergyLevel,
    { icon: React.ReactNode; label: string; className: string }
  > = {
    LOW: {
      icon: <BatteryLow className="w-3 h-3" />,
      label: "Easy Day",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    MEDIUM: {
      icon: <Battery className="w-3 h-3" />,
      label: "Moderate",
      className: "bg-amber-100 text-amber-800 border-amber-300",
    },
    HIGH: {
      icon: <BatteryFull className="w-3 h-3" />,
      label: "Active Day",
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const { icon, label, className } = config[level];

  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      {icon}
      <span className="text-xs">{label}</span>
    </Badge>
  );
}
