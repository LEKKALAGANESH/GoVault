import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { MapPin, Calendar, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Trip, Traveler, TripTodo, Booking } from "@/lib/types";

interface TripCardData extends Trip {
  travelers?: Traveler[];
  trip_todos?: TripTodo[];
  bookings?: Booking[];
  itinerary_nights?: { location: string; nights: number }[];
}

interface TripCardProps {
  trip: TripCardData;
  isActive?: boolean;
  isPast?: boolean;
  variant?: "default" | "compact";
}

const travelerColors = [
  "bg-teal text-white",
  "bg-coral text-white",
  "bg-gold text-navy",
  "bg-navy text-white",
  "bg-purple-500 text-white",
  "bg-pink-500 text-white",
];

export function TripCard({ trip, isActive, isPast, variant = "default" }: TripCardProps) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration = differenceInDays(endDate, startDate);
  const daysUntil = differenceInDays(startDate, new Date());

  const getCountdownText = () => {
    if (isActive) return "Happening now!";
    if (isPast) {
      const daysAgo = Math.abs(differenceInDays(new Date(), endDate));
      if (daysAgo < 30) return `${daysAgo} days ago`;
      if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`;
      return `${Math.floor(daysAgo / 365)} year${Math.floor(daysAgo / 365) > 1 ? "s" : ""} ago`;
    }
    if (daysUntil === 0) return "Starts today!";
    if (daysUntil === 1) return "Starts tomorrow";
    return `In ${daysUntil} days`;
  };

  const getStatusBadge = () => {
    if (isActive) return { label: "Live", className: "bg-green-500 text-white" };
    if (isPast) return { label: "Completed", className: "bg-muted text-muted-foreground" };

    // Smart status based on bookings
    const flights = trip.bookings?.filter(b => b.type === "FLIGHT") || [];
    const hotels = trip.bookings?.filter(b => b.type === "HOTEL") || [];
    const hasFlights = flights.length > 0;
    const hasHotels = hotels.length > 0;

    if (hasFlights && hasHotels) {
      return { label: "Ready", className: "bg-green-100 text-green-700 border border-green-200" };
    }
    if (hasFlights || hasHotels) {
      return { label: "Booking", className: "bg-blue-100 text-blue-700 border border-blue-200" };
    }
    return { label: "Planning", className: "bg-gold/20 text-gold border border-gold/30" };
  };

  // Format location with nights (e.g., "4N Phuket → 3N Bangkok")
  const formatLocationWithNights = () => {
    if (trip.itinerary_nights && trip.itinerary_nights.length > 0) {
      return trip.itinerary_nights
        .map((item) => `${item.nights}N ${item.location}`)
        .join(" → ");
    }
    // Fallback to simple destination list with total nights
    if (trip.destinations.length === 1) {
      return `${duration}N ${trip.destinations[0]}`;
    }
    return trip.destinations.join(" → ");
  };

  // Get next incomplete todo
  const nextTodo = trip.trip_todos?.find((todo) => !todo.completed);
  const incompleteTodosCount = trip.trip_todos?.filter((todo) => !todo.completed).length || 0;

  const statusBadge = getStatusBadge();

  return (
    <Link href={`/trips/${trip.slug}`} className="block">
      <article
        className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
          isActive ? "ring-2 ring-teal ring-offset-2" : ""
        } ${isPast ? "opacity-90 hover:opacity-100" : ""}`}
      >
        {/* Next Action Banner - Only for upcoming trips with todos */}
        {!isPast && nextTodo && (
          <div className="bg-gold/10 px-4 py-2 text-sm flex items-center gap-2 border-b border-gold/20">
            <span className="text-gold">📋</span>
            <span className="text-gold font-medium">Next:</span>
            <span className="text-navy truncate">{nextTodo.title}</span>
          </div>
        )}

        {/* Cover Image */}
        <div className="relative h-40 bg-gradient-to-br from-teal to-teal-dark overflow-hidden">
          {trip.cover_image ? (
            <img
              src={trip.cover_image}
              alt={trip.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                isPast ? "saturate-[0.8]" : ""
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30">
                {trip.destinations[0]?.toLowerCase().includes("beach") ||
                trip.destinations[0]?.toLowerCase().includes("island")
                  ? "🏝️"
                  : trip.destinations[0]?.toLowerCase().includes("mountain")
                  ? "🏔️"
                  : "✈️"}
              </span>
            </div>
          )}

          {/* Status Badge */}
          {statusBadge && (
            <Badge className={`absolute top-3 right-3 ${statusBadge.className}`}>
              {statusBadge.label}
            </Badge>
          )}

          {/* Weather (placeholder - could be dynamic) */}
          {!isPast && (
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1 shadow-sm">
              <Sun className="w-3 h-3 text-gold" />
              <span className="font-medium">32°C</span>
            </div>
          )}

          {/* Travelers Avatars */}
          {trip.travelers && trip.travelers.length > 0 && (
            <div className="absolute bottom-3 left-3 flex">
              {trip.travelers.slice(0, 4).map((traveler, index) => (
                <Avatar
                  key={traveler.id}
                  className={`w-7 h-7 border-2 border-white shadow-sm ${
                    index > 0 ? "-ml-2" : ""
                  }`}
                >
                  <AvatarFallback
                    className={`text-xs font-medium ${travelerColors[index % travelerColors.length]}`}
                  >
                    {traveler.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {trip.travelers.length > 4 && (
                <Avatar className="w-7 h-7 border-2 border-white shadow-sm -ml-2">
                  <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                    +{trip.travelers.length - 4}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col min-h-[180px]">
          {/* Title Row */}
          <div className="flex items-start gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-navy text-lg group-hover:text-teal transition-colors">
              {trip.name}
            </h3>
            {trip.occasion && (
              <Badge variant="secondary" className="bg-gold/15 text-gold text-xs font-medium">
                {trip.occasion}
              </Badge>
            )}
          </div>

          {/* Location with Nights */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-coral" />
            <span className="truncate">{formatLocationWithNights()}</span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm mb-auto">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </span>
            </div>
            <span
              className={`font-medium ${
                isActive
                  ? "text-green-600"
                  : isPast
                  ? "text-muted-foreground"
                  : daysUntil <= 7
                  ? "text-coral"
                  : "text-teal"
              }`}
            >
              {getCountdownText()}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-border">
            <QuickActionButton icon="🗓" label="Itinerary" />
            <QuickActionButton icon="✈️" label="Flights" />
            <QuickActionButton icon="🏨" label="Hotels" />
            {!isPast && incompleteTodosCount > 0 && (
              <QuickActionButton
                icon="📋"
                label={`To Do (${incompleteTodosCount})`}
                highlighted
              />
            )}
            {isPast && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>📸</span>
                <span>View memories</span>
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function QuickActionButton({
  icon,
  label,
  highlighted = false,
}: {
  icon: string;
  label: string;
  highlighted?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
        highlighted
          ? "bg-teal text-white"
          : "bg-muted/50 text-muted-foreground hover:bg-teal/10 hover:text-teal"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
