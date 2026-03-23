"use client";

import { Trip, Traveler } from "@/lib/types";
import { format, differenceInDays } from "date-fns";
import { ChevronDown, Pencil, Plane, Hotel, CheckSquare, Package, FileText, Phone, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UnsplashImage } from "@/lib/unsplash";

export interface TripStats {
  flights: { total: number; confirmed: number };
  hotels: { total: number; confirmed: number };
  todos: { total: number; completed: number };
  packing: { total: number; checked: number };
  documents: number;
  emergencyContacts: number;
  pendingActions: string[];
}

interface TripHeroProps {
  trip: Trip;
  travelers?: Traveler[];
  stats?: TripStats;
  isOwner?: boolean;
  backgroundImages?: UnsplashImage[];
}

const travelerEmoji: Record<string, string> = {
  ADULT: "👤",
  SENIOR: "👵",
  CHILD: "👦",
  INFANT: "👶",
};

function calculateReadiness(stats: TripStats): number {
  if (!stats) return 0;

  let score = 0;
  let maxScore = 0;

  if (stats.flights.total > 0) {
    score += (stats.flights.confirmed / stats.flights.total) * 30;
    maxScore += 30;
  }

  if (stats.hotels.total > 0) {
    score += (stats.hotels.confirmed / stats.hotels.total) * 25;
    maxScore += 25;
  }

  if (stats.todos.total > 0) {
    score += (stats.todos.completed / stats.todos.total) * 20;
    maxScore += 20;
  }

  if (stats.packing.total > 0) {
    score += (stats.packing.checked / stats.packing.total) * 15;
    maxScore += 15;
  }

  if (stats.documents > 0) {
    score += 5;
  }
  maxScore += 5;

  if (stats.emergencyContacts > 0) {
    score += 5;
  }
  maxScore += 5;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

function ReadinessRing({ percentage, daysUntil, isActive }: { percentage: number; daysUntil: number; isActive: boolean }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = () => {
    if (isActive) return "text-green-400";
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getStatusText = () => {
    if (isActive) return "Live!";
    if (percentage >= 80) return "Ready";
    if (percentage >= 50) return "Almost";
    return "Planning";
  };

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-white/20"
        />
        {/* Progress circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          className={getStatusColor()}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {isActive ? "NOW" : daysUntil > 0 ? daysUntil : 0}
        </span>
        {!isActive && (
          <span className="text-[10px] text-white/70 uppercase tracking-widest font-medium">
            {daysUntil === 1 ? "day" : "days"}
          </span>
        )}
        <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
          isActive ? "bg-green-500/30 text-green-300" :
          percentage >= 80 ? "bg-green-500/30 text-green-300" :
          percentage >= 50 ? "bg-amber-500/30 text-amber-300" :
          "bg-rose-500/30 text-rose-300"
        }`}>
          {percentage}% {getStatusText()}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  total,
  suffix = "",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  total?: number;
  suffix?: string;
}) {
  const displayValue = total !== undefined ? `${value}/${total}` : `${value}${suffix}`;
  const isComplete = total !== undefined ? value >= total : value > 0;

  return (
    <div className={`flex flex-col items-center p-3 rounded-xl backdrop-blur-md border transition-all ${
      isComplete
        ? "bg-white/15 border-white/30"
        : "bg-white/10 border-white/20"
    }`}>
      <Icon className={`w-5 h-5 mb-1 ${isComplete ? "text-green-400" : "text-white/70"}`} />
      <span className="text-lg font-bold text-white">{displayValue}</span>
      <span className="text-[10px] text-white/60 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function getDestinationEmoji(destinations: string[]): string {
  const searchString = destinations.join(" ").toLowerCase();
  if (searchString.includes("thailand") || searchString.includes("phuket") || searchString.includes("bangkok")) return "🇹🇭";
  if (searchString.includes("japan") || searchString.includes("tokyo") || searchString.includes("kyoto")) return "🇯🇵";
  if (searchString.includes("france") || searchString.includes("paris")) return "🇫🇷";
  if (searchString.includes("italy") || searchString.includes("rome") || searchString.includes("venice")) return "🇮🇹";
  if (searchString.includes("spain") || searchString.includes("barcelona") || searchString.includes("madrid")) return "🇪🇸";
  if (searchString.includes("uk") || searchString.includes("london") || searchString.includes("england")) return "🇬🇧";
  if (searchString.includes("usa") || searchString.includes("america") || searchString.includes("new york")) return "🇺🇸";
  if (searchString.includes("india") || searchString.includes("delhi") || searchString.includes("mumbai")) return "🇮🇳";
  if (searchString.includes("australia") || searchString.includes("sydney")) return "🇦🇺";
  if (searchString.includes("singapore")) return "🇸🇬";
  if (searchString.includes("dubai") || searchString.includes("uae")) return "🇦🇪";
  if (searchString.includes("bali") || searchString.includes("indonesia")) return "🇮🇩";
  if (searchString.includes("vietnam") || searchString.includes("hanoi")) return "🇻🇳";
  if (searchString.includes("korea") || searchString.includes("seoul")) return "🇰🇷";
  return "🌍";
}

export function TripHero({ trip, travelers = [], stats, isOwner = false, backgroundImages = [] }: TripHeroProps) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntil = differenceInDays(startDate, new Date());
  const isActive = daysUntil <= 0 && differenceInDays(new Date(), endDate) <= 0;
  const isPast = differenceInDays(new Date(), endDate) > 0;

  const readiness = stats ? calculateReadiness(stats) : 0;
  const destinationEmoji = getDestinationEmoji(trip.destinations);

  // Responsive photo positions - scattered on left and right sides
  // Mobile: hidden, Desktop (lg): 6 photos (3 each side), 2xl+: 8 photos (4 each side)
  const photoPositions = [
    // Left side photos
    { side: 'left', top: '5%', left: '3%', rotate: -6, showAt: 'lg' },
    { side: 'left', top: '35%', left: '4%', rotate: 5, showAt: 'lg' },
    { side: 'left', top: '65%', left: '2%', rotate: -4, showAt: 'lg' },
    { side: 'left', top: '85%', left: '5%', rotate: 3, showAt: '2xl' },
    // Right side photos
    { side: 'right', top: '8%', right: '3%', rotate: 5, showAt: 'lg' },
    { side: 'right', top: '38%', right: '4%', rotate: -6, showAt: 'lg' },
    { side: 'right', top: '68%', right: '3%', rotate: 4, showAt: 'lg' },
    { side: 'right', top: '88%', right: '4%', rotate: -5, showAt: '2xl' },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/85 to-emerald-700/90">
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Side photos - hidden on mobile, 4 on lg screens, 6 on 2xl screens */}
      {backgroundImages.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {photoPositions.map((pos, idx) => {
            const img = backgroundImages[idx % backgroundImages.length];
            // Determine visibility class based on showAt
            const visibilityClass = pos.showAt === '2xl' ? 'hidden 2xl:block' : 'hidden lg:block';

            return (
              <div
                key={`photo-${idx}`}
                className={`absolute ${visibilityClass}`}
                style={{
                  width: '16vw',
                  top: pos.top,
                  ...(pos.side === 'left' ? { left: pos.left } : { right: pos.right }),
                  transform: `rotate(${pos.rotate}deg)`,
                }}
              >
                <div className="bg-white p-[0.4vw] rounded-xl shadow-2xl">
                  <img
                    src={img.regular || img.thumb}
                    alt={img.alt}
                    className="w-full aspect-[4/3] object-cover rounded-lg"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit button for owners */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <Link href={`/trips/${trip.id}/edit`}>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shadow-lg bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit Trip
            </Button>
          </Link>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          {/* Flag and Plane */}
          <div className="flex items-center justify-center gap-3 text-4xl mb-4">
            <span>✈️</span>
            <span>{destinationEmoji}</span>
          </div>

          {/* Trip Name */}
          <h1 className="font-playfair text-4xl md:text-6xl text-white font-bold mb-2 drop-shadow-lg">
            {trip.name}
          </h1>

          {trip.occasion && (
            <p className="text-xl md:text-2xl text-white/80 font-medium mb-6">
              {trip.occasion}
            </p>
          )}

          {/* Trip Info Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="flex items-center gap-1.5 text-white text-sm font-medium">
                <Calendar className="w-4 h-4" />
                {format(startDate, "MMM d")} – {format(endDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="flex items-center gap-1.5 text-white text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {trip.destinations.join(" → ")}
              </span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="flex items-center gap-1.5 text-white text-sm font-medium">
                <Users className="w-4 h-4" />
                {nights + 1} Days / {nights} Nights
              </span>
            </div>
          </div>

          {/* Status badge */}
          {isActive && (
            <div className="inline-block mb-6">
              <div className="bg-green-500/30 backdrop-blur-md px-5 py-2 rounded-full border border-green-400/40">
                <span className="flex items-center gap-2 text-green-300 font-semibold">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Trip in Progress!
                </span>
              </div>
            </div>
          )}

          {isPast && (
            <div className="inline-block mb-6">
              <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20">
                <span className="text-white/70 font-medium">Trip Completed</span>
              </div>
            </div>
          )}

          {/* Readiness ring */}
          {stats && !isPast && (
            <div className="mb-8">
              <div className="inline-block bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Trip Readiness</p>
                <ReadinessRing percentage={readiness} daysUntil={daysUntil} isActive={isActive} />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8 max-w-2xl mx-auto">
              <StatCard icon={Plane} label="Flights" value={stats.flights.confirmed} total={stats.flights.total} />
              <StatCard icon={Hotel} label="Hotels" value={stats.hotels.confirmed} total={stats.hotels.total} />
              <StatCard icon={CheckSquare} label="Todos" value={stats.todos.completed} total={stats.todos.total} />
              <StatCard icon={Package} label="Packed" value={stats.packing.total > 0 ? Math.round((stats.packing.checked / stats.packing.total) * 100) : 0} suffix="%" />
              <StatCard icon={FileText} label="Docs" value={stats.documents} />
              <StatCard icon={Phone} label="SOS" value={stats.emergencyContacts} />
            </div>
          )}

          {/* Pending actions - Owner only */}
          {isOwner && stats && stats.pendingActions.length > 0 && (
            <div className="bg-rose-500/20 backdrop-blur-md border border-rose-400/30 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <p className="text-rose-300 font-semibold text-sm mb-2 uppercase tracking-wide flex items-center justify-center gap-2">
                <span>⚠️</span> Action Required
              </p>
              <ul className="text-left text-white/90 text-sm space-y-1.5">
                {stats.pendingActions.slice(0, 3).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
                {stats.pendingActions.length > 3 && (
                  <li className="text-white/50 text-xs mt-2 pl-4">
                    +{stats.pendingActions.length - 3} more items
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Travelers */}
          {travelers.length > 0 && (
            <div className="flex justify-center gap-2 flex-wrap">
              {travelers.map((traveler) => (
                <span
                  key={traveler.id}
                  className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium border border-white/20 text-sm"
                >
                  {travelerEmoji[traveler.type] || "👤"} {traveler.name}
                  {isOwner && traveler.age && traveler.type !== "ADULT" && (
                    <span className="text-white/60 ml-1">
                      ({traveler.type === "INFANT" ? `${traveler.age}mo` : traveler.age})
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo credit */}
      {backgroundImages.length > 0 && (
        <div className="absolute bottom-2 right-4 text-white/40 text-[10px] z-20">
          Photos from Unsplash
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 animate-bounce">
        <ChevronDown className="w-8 h-8" />
      </div>
    </section>
  );
}
