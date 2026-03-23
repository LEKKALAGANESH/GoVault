import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "./activity-card";
import { EnergyBadge } from "./energy-badge";
import {
  ChevronRight,
  Plus,
  MapPin,
  Clock,
} from "lucide-react";
import type { ItineraryDay, Activity } from "@/lib/types";

interface DayCardProps {
  tripId: string;
  dayNumber: number;
  date: Date;
  day: (ItineraryDay & { activities: Activity[] }) | null;
}

export function DayCard({ tripId, dayNumber, date, day }: DayCardProps) {
  const hasContent = day && (day.title || day.activities?.length > 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Day Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Date Circle */}
          <div className="w-14 h-14 rounded-xl bg-teal/10 flex flex-col items-center justify-center">
            <span className="text-xs text-teal font-medium uppercase">
              {format(date, "EEE")}
            </span>
            <span className="text-xl font-bold text-teal">
              {format(date, "d")}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-navy">
                Day {dayNumber}
                {day?.title && (
                  <span className="text-muted-foreground font-normal">
                    {" "}— {day.title}
                  </span>
                )}
              </h3>
              {day?.energy_level && <EnergyBadge level={day.energy_level} />}
            </div>
            {day?.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {day.location}
              </p>
            )}
          </div>
        </div>

        <Link href={`/trips/${tripId}/itinerary/day/${dayNumber}`}>
          <Button variant="ghost" size="sm">
            {hasContent ? "View" : "Plan"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Day Content */}
      {hasContent ? (
        <div className="p-4">
          {/* Summary Box */}
          {day.summary && (
            <div className="mb-4 p-3 bg-gold/10 rounded-lg border-l-4 border-gold">
              <p className="text-sm text-navy">{day.summary}</p>
            </div>
          )}

          {/* Activities Preview */}
          {day.activities && day.activities.length > 0 && (
            <div className="space-y-3">
              {day.activities.slice(0, 3).map((activity) => (
                <ActivityCard key={activity.id} activity={activity} compact />
              ))}

              {day.activities.length > 3 && (
                <Link
                  href={`/trips/${tripId}/itinerary/day/${dayNumber}`}
                  className="block text-center py-2 text-sm text-teal hover:text-teal-dark"
                >
                  +{day.activities.length - 3} more activities
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-3">No plans for this day yet</p>
          <Link href={`/trips/${tripId}/itinerary/day/${dayNumber}/edit`}>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add activities
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
