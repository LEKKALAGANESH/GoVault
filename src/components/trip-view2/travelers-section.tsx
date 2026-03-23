"use client";

import { Traveler, TravelerType } from "@/lib/types";
import { Users, Mail, Phone, Lock } from "lucide-react";

interface TravelersSectionProps {
  travelers: Traveler[];
  hidePrivateInfo?: boolean; // Hide email, phone, age for public view
  loginUrl?: string; // URL to redirect for login (for locked fields)
}

const travelerEmoji: Record<TravelerType, string> = {
  ADULT: "👤",
  SENIOR: "👵",
  CHILD: "👦",
  INFANT: "👶",
};

const travelerTypeLabels: Record<TravelerType, string> = {
  ADULT: "Adult",
  SENIOR: "Senior",
  CHILD: "Child",
  INFANT: "Infant",
};

export function TravelersSection({ travelers, hidePrivateInfo = false, loginUrl }: TravelersSectionProps) {
  if (!travelers || travelers.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-white">
            <Users className="w-6 h-6 inline-block mr-2 text-teal-300" />
            Who&apos;s <span className="text-teal-300">Traveling</span>
          </h2>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6">
          <p className="text-white/60 text-sm text-center mb-6">
            {travelers.length} traveler{travelers.length !== 1 ? "s" : ""} on this trip
          </p>

          <div className="space-y-3">
            {travelers.map((traveler) => (
              <div
                key={traveler.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar/Emoji */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    {travelerEmoji[traveler.type] || "👤"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-lg truncate">
                      {traveler.name}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-white/60 flex-wrap">
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">
                        {travelerTypeLabels[traveler.type]}
                      </span>
                      {!hidePrivateInfo && traveler.age && (
                        <span>• {traveler.age} yrs</span>
                      )}
                    </div>
                  </div>

                  {/* Contact info - show lock when hidden */}
                  <div className="hidden sm:flex flex-col gap-1 text-right">
                    {hidePrivateInfo ? (
                      (traveler.email || traveler.phone) && (
                        <a
                          href={loginUrl || "/login"}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white/60 transition-colors"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Login for contact</span>
                        </a>
                      )
                    ) : (
                      <>
                        {traveler.email && (
                          <span className="flex items-center gap-1.5 text-xs text-white/50">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[180px]">{traveler.email}</span>
                          </span>
                        )}
                        {traveler.phone && (
                          <span className="flex items-center gap-1.5 text-xs text-white/50">
                            <Phone className="w-3.5 h-3.5" />
                            {traveler.phone}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile contact info - show lock when hidden */}
                {(traveler.email || traveler.phone) && (
                  <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3 text-xs text-white/50">
                    {hidePrivateInfo ? (
                      <a
                        href={loginUrl || "/login"}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white/60 transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Login to view contact</span>
                      </a>
                    ) : (
                      <>
                        {traveler.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{traveler.email}</span>
                          </span>
                        )}
                        {traveler.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {traveler.phone}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
