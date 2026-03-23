"use client";

import { Booking, Document } from "@/lib/types";
import { format } from "date-fns";
import { Plane, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { BookingDocuments } from "./booking-documents";

interface FlightCardProps {
  booking: Booking;
  variant?: "outbound" | "internal" | "return";
  hidePrivateInfo?: boolean; // Hide PNR, ticket numbers for public view
  documents?: Document[];
  tripId?: string;
  isOwner?: boolean;
  loginUrl?: string; // URL to redirect for login (for locked fields)
}

const variantStyles = {
  outbound: "bg-gradient-to-r from-coral to-[#c4644a]",
  internal: "bg-gradient-to-r from-gold to-[#b8923f]",
  return: "bg-gradient-to-r from-teal to-[#0f4d4d]",
};

export function FlightCard({
  booking,
  variant = "outbound",
  hidePrivateInfo = false,
  documents = [],
  tripId,
  isOwner = false,
  loginUrl,
}: FlightCardProps) {
  const departureTime = booking.departure_time
    ? format(new Date(booking.departure_time), "HH:mm")
    : "--:--";
  const arrivalTime = booking.arrival_time
    ? format(new Date(booking.arrival_time), "HH:mm")
    : "--:--";
  const flightDate = booking.departure_time
    ? format(new Date(booking.departure_time), "EEEE, MMM d, yyyy")
    : "Date TBD";

  const duration = booking.departure_time && booking.arrival_time
    ? calculateDuration(new Date(booking.departure_time), new Date(booking.arrival_time))
    : null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className={`p-5 ${variantStyles[variant]} text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-xl">{booking.airline || "Airline TBD"}</div>
            <div className="text-sm text-white/80 mt-0.5 flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md font-mono">
                {booking.flight_number || "TBD"}
              </span>
            </div>
          </div>
          {booking.status === "CONFIRMED" ? (
            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/30">
              <CheckCircle className="w-3.5 h-3.5" /> Confirmed
            </span>
          ) : (
            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/30">
              <AlertCircle className="w-3.5 h-3.5" /> To Book
            </span>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="p-6 grid grid-cols-3 items-center bg-gradient-to-b from-gray-50/50 to-white">
        <div className="text-center">
          <div className="text-3xl font-bold text-navy">{booking.departure_airport || "---"}</div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Departure</div>
          <div className="text-lg font-semibold text-teal mt-1">{departureTime}</div>
        </div>
        <div className="text-center relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="relative bg-white p-2 rounded-full inline-block shadow-sm border border-gray-100">
            <Plane className="w-6 h-6 text-teal rotate-90" />
          </div>
          {duration && (
            <div className="text-xs text-gray-500 mt-2 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{duration}</div>
          )}
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-navy">{booking.arrival_airport || "---"}</div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Arrival</div>
          <div className="text-lg font-semibold text-teal mt-1">{arrivalTime}</div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-3 border-t border-dashed border-gray-200">
        <div className="flex justify-between py-2">
          <span className="text-gray-500 text-sm">Date</span>
          <span className="font-medium text-navy text-sm">{flightDate}</span>
        </div>
        <div className="flex justify-between items-center py-2 bg-teal/5 -mx-5 px-5 border-y border-teal/10">
          <span className="text-gray-500 text-sm">PNR / Booking Ref</span>
          {hidePrivateInfo ? (
            <a
              href={loginUrl || "/login"}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login to view</span>
            </a>
          ) : (
            <span className={`font-mono font-bold text-sm px-3 py-1 rounded-lg ${booking.confirmation_number ? "text-teal bg-teal/10" : "text-gray-400 bg-gray-100"}`}>
              {booking.confirmation_number || "—"}
            </span>
          )}
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500 text-sm">Seats</span>
          {hidePrivateInfo ? (
            <a
              href={loginUrl || "/login"}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-sm text-slate-500 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Login</span>
            </a>
          ) : (
            <span className="font-medium text-navy text-sm bg-gray-100 px-2 py-0.5 rounded">
              {booking.seats || "Not assigned"}
            </span>
          )}
        </div>

        {/* Documents Section */}
        {tripId && (documents.length > 0 || isOwner) && (
          <BookingDocuments
            documents={documents}
            tripId={tripId}
            bookingId={booking.id}
            bookingType="FLIGHT"
            isOwner={isOwner}
            compact
          />
        )}
      </div>
    </div>
  );
}

function calculateDuration(departure: Date, arrival: Date): string {
  const diff = arrival.getTime() - departure.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
