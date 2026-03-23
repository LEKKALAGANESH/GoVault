"use client";

import { Booking, Document } from "@/lib/types";
import { format, differenceInDays } from "date-fns";
import { MapPin, Phone, Lock } from "lucide-react";
import { BookingDocuments } from "./booking-documents";

interface HotelCardProps {
  booking: Booking;
  variant?: "phuket" | "bangkok";
  documents?: Document[];
  tripId?: string;
  isOwner?: boolean;
  hidePrivateInfo?: boolean; // Hide confirmation numbers for public view
  loginUrl?: string; // URL to redirect for login (for locked fields)
}

const variantStyles = {
  phuket: "bg-gradient-to-r from-coral to-[#c4644a]",
  bangkok: "bg-gradient-to-r from-gold to-[#b8923f]",
};

export function HotelCard({
  booking,
  variant = "phuket",
  documents = [],
  tripId,
  isOwner = false,
  hidePrivateInfo = false,
  loginUrl,
}: HotelCardProps) {
  const checkIn = booking.check_in ? new Date(booking.check_in) : null;
  const checkOut = booking.check_out ? new Date(booking.check_out) : null;
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const dateRange = checkIn && checkOut
    ? `${format(checkIn, "MMM d")} - ${format(checkOut, "MMM d, yyyy")}`
    : "Dates TBD";

  // Create Google Maps URL from address
  const mapsUrl = booking.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`
    : null;

  const mapsEmbedUrl = booking.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(booking.address)}&output=embed`
    : null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className={`p-6 ${variantStyles[variant]} text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-white/80 mb-1.5 flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-md">
                {dateRange}
              </span>
            </div>
            <h3 className="font-playfair text-2xl font-semibold">
              {booking.hotel_name || "Hotel TBD"}
            </h3>
          </div>
          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
            {nights} {nights === 1 ? "Night" : "Nights"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Room type */}
        {booking.room_type && (
          <div className="font-semibold text-teal mb-4 p-3 bg-teal/5 rounded-xl border border-teal/10 flex items-center gap-2">
            <span className="text-lg">🛏️</span>
            {booking.room_type}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 bg-gray-50/50 rounded-xl p-4">
          {booking.confirmation_number && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 text-sm">Confirmation #</span>
              {hidePrivateInfo ? (
                <a
                  href={loginUrl || "/login"}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login to view</span>
                </a>
              ) : (
                <span className="font-mono font-bold text-teal text-sm bg-teal/10 px-3 py-1 rounded-lg">
                  {booking.confirmation_number}
                </span>
              )}
            </div>
          )}
          {checkIn && (
            <div className="flex justify-between items-center py-2 border-t border-gray-200/50">
              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Check-in
              </span>
              <span className="font-medium text-navy text-sm">
                {format(checkIn, "EEE, MMM d")} • 2:00 PM
              </span>
            </div>
          )}
          {checkOut && (
            <div className="flex justify-between items-center py-2 border-t border-gray-200/50">
              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                Check-out
              </span>
              <span className="font-medium text-navy text-sm">
                {format(checkOut, "EEE, MMM d")} • 11:00 AM
              </span>
            </div>
          )}
        </div>

        {/* Map */}
        {mapsEmbedUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              src={mapsEmbedUrl}
              width="100%"
              height="180"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${booking.hotel_name}`}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-teal to-teal-dark text-white text-center py-2.5 px-4 rounded-xl text-sm font-semibold hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MapPin className="w-4 h-4" /> Directions
            </a>
          )}
          <button className="flex-1 bg-gray-100 text-navy text-center py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" /> Call
          </button>
        </div>

        {/* Documents Section */}
        {tripId && (documents.length > 0 || isOwner) && (
          <BookingDocuments
            documents={documents}
            tripId={tripId}
            bookingId={booking.id}
            bookingType="HOTEL"
            isOwner={isOwner}
            compact
          />
        )}
      </div>
    </div>
  );
}
