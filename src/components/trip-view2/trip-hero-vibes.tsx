"use client";

import { Trip, Traveler } from "@/lib/types";
import { format, differenceInDays, parseISO } from "date-fns";
import { ChevronDown, Pencil, Plane, Hotel, CheckSquare, Package, FileText, Phone, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TripStats } from "./trip-hero";
import { useEffect, useState, useContext } from "react";
import { ManageTravelersModal } from "./manage-travelers-modal";
import { useRouter } from "next/navigation";
import { useTripData } from "./trip-data-provider";

interface TripHeroVibesProps {
  trip: Trip;
  travelers?: Traveler[];
  stats?: TripStats;
  isOwner?: boolean;
  tripId?: string;
  currentUserId?: string;
  currentUserEmail?: string;
}

const travelerEmoji: Record<string, string> = {
  ADULT: "👤",
  SENIOR: "👵",
  CHILD: "👦",
  INFANT: "👶",
};

// Custom hook for scroll position
function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

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

// Get destination-specific gradient and vibe
function getDestinationVibe(destinations: string[]): {
  gradient: string;
  pattern: string;
  emoji: string;
  accentColor: string;
  textColor: string;
} {
  const searchString = destinations.join(" ").toLowerCase();

  // Beach destinations (Thailand, Bali, etc.)
  if (searchString.includes("thailand") || searchString.includes("phuket") || searchString.includes("bali") || searchString.includes("maldives") || searchString.includes("hawaii")) {
    return {
      gradient: "from-cyan-400 via-teal-500 to-blue-600",
      pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C13.431 60 0 46.569 0 30 0 13.431 13.431 0 30 0zm0 10c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20z' fill='%23fff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
      emoji: "🇹🇭",
      accentColor: "cyan-300",
      textColor: "white",
    };
  }

  // Japan
  if (searchString.includes("japan") || searchString.includes("tokyo") || searchString.includes("kyoto")) {
    return {
      gradient: "from-pink-300 via-rose-400 to-red-500",
      pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20z' fill='%23fff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
      emoji: "🇯🇵",
      accentColor: "pink-200",
      textColor: "white",
    };
  }

  // France/Paris
  if (searchString.includes("france") || searchString.includes("paris")) {
    return {
      gradient: "from-indigo-400 via-purple-500 to-pink-500",
      pattern: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.03'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      emoji: "🇫🇷",
      accentColor: "purple-200",
      textColor: "white",
    };
  }

  // Default tropical/travel vibe
  return {
    gradient: "from-teal-500 via-emerald-600 to-cyan-700",
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    emoji: "🌍",
    accentColor: "teal-200",
    textColor: "white",
  };
}

// Beach Element Components - Outline/Stroke style with scroll-based animations

// Outline-style Seashell (scallop shell)
function Seashell({ className, scrollY, speed = 0.1, rotateSpeed = 0.05 }: { className?: string; scrollY: number; speed?: number; rotateSpeed?: number }) {
  const translateY = scrollY * speed;
  const rotate = scrollY * rotateSpeed;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) rotate(${rotate}deg)` }}
    >
      <svg className="w-16 h-16 md:w-24 md:h-24" viewBox="0 0 100 100">
        {/* Main shell outline */}
        <path
          d="M50,85 C25,85 10,65 10,45 C10,25 25,10 50,10 C75,10 90,25 90,45 C90,65 75,85 50,85"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Shell ridges */}
        <path d="M50,10 Q50,45 50,85" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50,10 Q35,45 25,80" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50,10 Q65,45 75,80" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50,10 Q25,35 15,60" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50,10 Q75,35 85,60" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Base curve */}
        <path d="M20,75 Q50,95 80,75" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

// Outline-style Starfish
function Starfish({ className, scrollY, speed = 0.15, rotateSpeed = 0.08 }: { className?: string; scrollY: number; speed?: number; rotateSpeed?: number }) {
  const translateY = scrollY * speed;
  const rotate = scrollY * rotateSpeed;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) rotate(${rotate}deg)` }}
    >
      <svg className="w-20 h-20 md:w-28 md:h-28" viewBox="0 0 100 100">
        {/* Main star outline */}
        <path
          d="M50,5 L56,38 L88,38 L62,58 L72,92 L50,72 L28,92 L38,58 L12,38 L44,38 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Center circle */}
        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Texture dots on arms */}
        <circle cx="50" cy="22" r="2" fill="currentColor" />
        <circle cx="72" cy="48" r="2" fill="currentColor" />
        <circle cx="64" cy="76" r="2" fill="currentColor" />
        <circle cx="36" cy="76" r="2" fill="currentColor" />
        <circle cx="28" cy="48" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

// Outline-style Coconut (tilted with husk texture)
function Coconut({ className, scrollY, speed = 0.12, swaySpeed = 0.03 }: { className?: string; scrollY: number; speed?: number; swaySpeed?: number }) {
  const translateY = scrollY * speed;
  const sway = Math.sin(scrollY * swaySpeed) * 5;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) translateX(${sway}px) rotate(-15deg)` }}
    >
      <svg className="w-20 h-20 md:w-28 md:h-28" viewBox="0 0 100 100">
        {/* Main coconut outline */}
        <ellipse cx="50" cy="55" rx="38" ry="32" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* Inner shell line */}
        <ellipse cx="50" cy="55" rx="30" ry="25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Three eyes/pores */}
        <circle cx="40" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="60" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="62" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Husk texture lines */}
        <path d="M15,45 Q25,55 20,70" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M85,45 Q75,55 80,70" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Outline-style Coconut Drink
function CoconutDrink({ className, scrollY, speed = 0.08, swaySpeed = 0.02 }: { className?: string; scrollY: number; speed?: number; swaySpeed?: number }) {
  const translateY = scrollY * speed;
  const sway = Math.sin(scrollY * swaySpeed) * 3;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) rotate(${sway}deg)` }}
    >
      <svg className="w-18 h-22 md:w-24 md:h-28" viewBox="0 0 100 120">
        {/* Coconut half shell */}
        <path
          d="M15,60 Q15,95 50,95 Q85,95 85,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {/* Top opening */}
        <ellipse cx="50" cy="60" rx="35" ry="12" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Drink surface */}
        <ellipse cx="50" cy="60" rx="28" ry="8" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
        {/* Straw */}
        <line x1="62" y1="20" x2="55" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Small umbrella */}
        <path d="M70,25 Q78,15 86,25" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="78" y1="15" x2="78" y2="35" stroke="currentColor" strokeWidth="1.5" />
        {/* Decorative leaf */}
        <path d="M30,50 Q25,40 35,35" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Outline-style Sunglasses (keeping for section decorators)
function Sunglasses({ className, scrollY, speed = 0.1, rotateSpeed = 0.02 }: { className?: string; scrollY: number; speed?: number; rotateSpeed?: number }) {
  const translateY = scrollY * speed;
  const rotate = Math.sin(scrollY * rotateSpeed) * 3;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) rotate(${rotate}deg)` }}
    >
      <svg className="w-16 h-10 md:w-24 md:h-14" viewBox="0 0 120 50">
        {/* Left lens */}
        <ellipse cx="30" cy="27" rx="22" ry="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* Right lens */}
        <ellipse cx="90" cy="27" rx="22" ry="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* Bridge */}
        <path d="M52,27 Q60,20 68,27" stroke="currentColor" strokeWidth="2.5" fill="none" />
        {/* Temple arms */}
        <line x1="8" y1="20" x2="3" y2="15" stroke="currentColor" strokeWidth="2" />
        <line x1="112" y1="20" x2="117" y2="15" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

// Outline-style Sandcastle
function Sandcastle({ className, scrollY, speed = 0.05 }: { className?: string; scrollY: number; speed?: number }) {
  const translateY = scrollY * speed;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px)` }}
    >
      <svg className="w-24 h-24 md:w-32 md:h-32" viewBox="0 0 100 100">
        {/* Base */}
        <path d="M10,90 L20,60 L80,60 L90,90 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Main tower */}
        <rect x="35" y="30" width="30" height="35" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M35,30 L50,15 L65,30 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Side towers */}
        <rect x="15" y="45" width="18" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M15,45 L24,35 L33,45 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="67" y="45" width="18" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M67,45 L76,35 L85,45 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Windows */}
        <rect x="45" y="42" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="20" y="50" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="74" y="50" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Flags */}
        <line x1="50" y1="15" x2="50" y2="5" stroke="#8b4513" strokeWidth="2" />
        <path d="M50,5 L60,10 L50,12" fill="#ff6b6b" />
      </svg>
    </div>
  );
}

// Outline-style Beach Ball
function BeachBall({ className, scrollY, speed = 0.18, rotateSpeed = 0.15 }: { className?: string; scrollY: number; speed?: number; rotateSpeed?: number }) {
  const translateY = scrollY * speed;
  const rotate = scrollY * rotateSpeed;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) rotate(${rotate}deg)` }}
    >
      <svg className="w-14 h-14 md:w-20 md:h-20" viewBox="0 0 100 100">
        {/* Main circle */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* Segment lines */}
        <path d="M50,5 Q75,50 50,95" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M50,5 Q25,50 50,95" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M5,50 Q50,25 95,50" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M5,50 Q50,75 95,50" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Highlight arc */}
        <path d="M30,25 Q40,20 45,30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Outline-style Flip Flop
function FlipFlop({ className, scrollY, speed = 0.1, isLeft = true }: { className?: string; scrollY: number; speed?: number; isLeft?: boolean }) {
  const translateY = scrollY * speed;
  const rotate = isLeft ? -15 : 15;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) rotate(${rotate}deg)` }}
    >
      <svg className="w-12 h-16 md:w-16 md:h-22" viewBox="0 0 60 100" style={{ transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)' }}>
        {/* Sole outline */}
        <ellipse cx="30" cy="60" rx="25" ry="35" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* Y-strap */}
        <path d="M15,40 Q30,20 30,50" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M45,40 Q30,20 30,50" fill="none" stroke="currentColor" strokeWidth="3" />
        {/* Toe post */}
        <circle cx="30" cy="50" r="3" fill="currentColor" />
        {/* Texture lines */}
        <line x1="15" y1="60" x2="45" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="12" y1="72" x2="48" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
      </svg>
    </div>
  );
}

// Outline-style Beach Umbrella
function BeachUmbrella({ className, scrollY, speed = 0.06, swaySpeed = 0.01 }: { className?: string; scrollY: number; speed?: number; swaySpeed?: number }) {
  const translateY = scrollY * speed;
  const sway = Math.sin(scrollY * swaySpeed) * 2;

  return (
    <div
      className={`pointer-events-none transition-transform duration-75 ${className}`}
      style={{ transform: `translateY(${translateY}px) rotate(${sway}deg)` }}
    >
      <svg className="w-20 h-28 md:w-28 md:h-40" viewBox="0 0 100 140">
        {/* Pole */}
        <line x1="50" y1="45" x2="50" y2="135" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Canopy outline */}
        <path d="M10,48 Q50,5 90,48" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10,48 Q50,58 90,48" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Canopy ribs */}
        <path d="M50,10 L50,48" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25,32 L35,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M75,32 L65,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Scalloped edge */}
        <path d="M10,48 Q20,55 30,48 Q40,55 50,48 Q60,55 70,48 Q80,55 90,48" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Top finial */}
        <circle cx="50" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

function WaveElement({ className, scrollY, speed = 0.08 }: { className?: string; scrollY: number; speed?: number }) {
  const translateX = Math.sin(scrollY * 0.01) * 20;
  const translateY = scrollY * speed;

  return (
    <div
      className={`pointer-events-none transition-transform duration-100 ${className}`}
      style={{ transform: `translateX(${translateX}px) translateY(${translateY}px)` }}
    >
      <svg className="w-32 h-16 md:w-48 md:h-24" viewBox="0 0 200 80" preserveAspectRatio="none">
        <path
          d="M0,40 Q25,20 50,40 T100,40 T150,40 T200,40 L200,80 L0,80 Z"
          fill="rgba(255,255,255,0.2)"
        />
        <path
          d="M0,50 Q25,30 50,50 T100,50 T150,50 T200,50 L200,80 L0,80 Z"
          fill="rgba(255,255,255,0.15)"
        />
      </svg>
    </div>
  );
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
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="6" fill="none" className="text-white/20" />
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

export function TripHeroVibes({ trip, travelers: initialTravelers = [], stats: propStats, isOwner = false, tripId, currentUserId, currentUserEmail }: TripHeroVibesProps) {
  const scrollY = useScrollPosition();
  const router = useRouter();
  const [travelers, setTravelers] = useState(initialTravelers);

  // Use stats and trip metadata from context if available (for real-time updates), fallback to props
  const tripData = useTripData();
  const stats = tripData.stats ?? propStats;

  // Use refreshed trip metadata if available, otherwise use props
  // Use parseISO for date strings to avoid timezone issues (new Date("2026-01-23") treats it as UTC midnight)
  const rawStartDate = tripData.tripMetadata?.start_date ?? trip.start_date;
  const rawEndDate = tripData.tripMetadata?.end_date ?? trip.end_date;
  const startDate = typeof rawStartDate === 'string' ? parseISO(rawStartDate) : new Date(rawStartDate);
  const endDate = typeof rawEndDate === 'string' ? parseISO(rawEndDate) : new Date(rawEndDate);

  const handleTravelersChange = (updatedTravelers: Traveler[]) => {
    setTravelers(updatedTravelers);
    router.refresh();
  };
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntil = differenceInDays(startDate, new Date());
  const isActive = daysUntil <= 0 && differenceInDays(new Date(), endDate) <= 0;
  const isPast = differenceInDays(new Date(), endDate) > 0;

  const readiness = stats ? calculateReadiness(stats) : 0;
  const vibe = getDestinationVibe(trip.destinations);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background based on destination */}
      <div className={`absolute inset-0 bg-gradient-to-br ${vibe.gradient}`}>
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-100"
          style={{ backgroundImage: vibe.pattern }}
        />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>

      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/3 rounded-full blur-2xl" />
      </div>

      {/* ===== BEACH ELEMENTS - Centered, moving down on scroll ===== */}

      {/* Sun - Top Right (outline style) */}
      <div
        className="absolute top-8 right-8 md:top-12 md:right-16 pointer-events-none text-white/40"
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      >
        <svg className="w-16 h-16 md:w-24 md:h-24" viewBox="0 0 100 100">
          {/* Sun rays - outline */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="15"
              x2="50"
              y2="5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${i * 30} 50 50)`}
            />
          ))}
          {/* Sun circle - outline */}
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Seashell - Left of center, starts mid-screen */}
      <Seashell
        className="absolute top-1/3 left-[15%] md:left-[20%] text-white/35"
        scrollY={scrollY}
        speed={0.12}
        rotateSpeed={0.04}
      />

      {/* Starfish - Right of center */}
      <Starfish
        className="absolute top-[40%] right-[15%] md:right-[18%] text-white/30"
        scrollY={scrollY}
        speed={0.15}
        rotateSpeed={-0.05}
      />

      {/* Tilted Coconut - Lower left */}
      <Coconut
        className="absolute top-[55%] left-[10%] md:left-[12%] text-white/25 hidden md:block"
        scrollY={scrollY}
        speed={0.1}
        swaySpeed={0.02}
      />

      {/* Ocean waves at bottom - outline style */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          className="w-full h-16 md:h-24"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ transform: `translateY(${scrollY * 0.02}px)` }}
        >
          {/* Wave outlines */}
          <path
            d="M0,40 Q180,10 360,40 T720,40 T1080,40 T1440,40"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <path
            d="M0,55 Q180,30 360,55 T720,55 T1080,55 T1440,55"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
          <path
            d="M0,70 Q180,50 360,70 T720,70 T1080,70 T1440,70"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Single Palm tree silhouette - left side */}
      <div
        className="absolute bottom-0 left-2 md:left-8 pointer-events-none opacity-20"
        style={{ transform: `translateY(${scrollY * 0.02}px)` }}
      >
        <svg className="w-16 h-32 md:w-24 md:h-48 text-black" viewBox="0 0 100 200">
          <path
            d="M50,200 Q45,150 50,100 Q55,50 50,100"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M50,100 Q30,80 10,90" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50,100 Q70,80 90,90" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50,100 Q20,70 5,60" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50,100 Q80,70 95,60" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50,100 Q50,50 50,40" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Edit button for owners */}
      {isOwner && (
        <div className="absolute top-4 left-4 z-20">
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
          <div className="flex items-center justify-center gap-3 text-5xl mb-6">
            <span className="animate-bounce">✈️</span>
            <span>{vibe.emoji}</span>
          </div>

          {/* Trip Name */}
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl text-white font-bold mb-3 drop-shadow-lg">
            {trip.name}
          </h1>

          {trip.occasion && (
            <p className="text-xl md:text-2xl text-white/80 font-medium mb-8">
              {trip.occasion}
            </p>
          )}

          {/* Trip Info Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <Calendar className="w-4 h-4" />
                {format(startDate, "MMM d")} – {format(endDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {trip.destinations.join(" → ")}
              </span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <Users className="w-4 h-4" />
                {nights + 1} Days / {nights} Nights
              </span>
            </div>
          </div>

          {/* Status badge */}
          {isActive && (
            <div className="inline-block mb-8">
              <div className="bg-green-500/30 backdrop-blur-md px-6 py-2.5 rounded-full border border-green-400/40">
                <span className="flex items-center gap-2 text-green-300 font-semibold text-lg">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  Trip in Progress!
                </span>
              </div>
            </div>
          )}

          {isPast && (
            <div className="inline-block mb-8">
              <div className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20">
                <span className="text-white/70 font-medium text-lg">Trip Completed</span>
              </div>
            </div>
          )}

          {/* Readiness ring */}
          {stats && !isPast && (
            <div className="mb-10">
              <div className="inline-block bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Trip Readiness</p>
                <ReadinessRing percentage={readiness} daysUntil={daysUntil} isActive={isActive} />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10 max-w-2xl mx-auto">
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
            <div className="bg-rose-500/20 backdrop-blur-md border border-rose-400/30 rounded-2xl p-5 mb-10 max-w-md mx-auto">
              <p className="text-rose-300 font-semibold text-sm mb-3 uppercase tracking-wide flex items-center justify-center gap-2">
                <span>⚠️</span> Action Required
              </p>
              <ul className="text-left text-white/90 text-sm space-y-2">
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
          <div className="flex justify-center gap-3 flex-wrap items-center">
            {travelers.map((traveler) => (
              <span
                key={traveler.id}
                className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full text-white font-medium border border-white/20"
              >
                {travelerEmoji[traveler.type] || "👤"} {traveler.name}
              </span>
            ))}
            {/* Edit Travelers Button - for owners */}
            {isOwner && tripId && (
              <ManageTravelersModal
                tripId={tripId}
                tripName={trip.name}
                travelers={travelers}
                onTravelersChange={handleTravelersChange}
                currentUserId={currentUserId}
                currentUserEmail={currentUserEmail}
                triggerButton={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 gap-1.5"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 animate-bounce">
        <ChevronDown className="w-8 h-8" />
      </div>
    </section>
  );
}

// Export beach elements for use in other sections
export { Seashell, Starfish, Coconut, CoconutDrink, Sunglasses, Sandcastle, BeachBall, FlipFlop, BeachUmbrella, WaveElement, useScrollPosition };
