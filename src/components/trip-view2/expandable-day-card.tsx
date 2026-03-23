"use client";

import { useState } from "react";
import { format } from "date-fns";
import { EnergyBadge } from "@/components/itinerary/energy-badge";
import { ChevronDown, MapPin } from "lucide-react";
import type { ItineraryDay, Activity } from "@/lib/types";

interface ExpandableDayCardProps {
  day: ItineraryDay & { activities: Activity[] };
}

export function ExpandableDayCard({ day }: ExpandableDayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(day.date);
  const activities = day.activities || [];

  // Determine day theme based on location
  const getHeaderClass = () => {
    const location = day.location?.toLowerCase() || "";
    if (location.includes("phuket") || location.includes("karon")) {
      return "bg-gradient-to-r from-coral to-[#c4644a]";
    } else if (location.includes("bangkok")) {
      return "bg-gradient-to-r from-gold to-[#b8923f]";
    } else if (day.title?.toLowerCase().includes("fly") || day.title?.toLowerCase().includes("travel")) {
      return "bg-gradient-to-r from-blue-500 to-blue-600";
    }
    return "bg-gradient-to-r from-teal to-teal-dark";
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
      {/* Clickable Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`${getHeaderClass()} p-5 cursor-pointer transition-all hover:brightness-105`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Day number */}
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex flex-col items-center justify-center border border-white/30 shadow-lg">
              <span className="text-white/90 text-xs font-semibold tracking-wide">
                {format(date, "EEE").toUpperCase()}
              </span>
              <span className="text-white text-xl font-bold">
                {format(date, "d")}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white/90 text-xs font-medium">
                  Day {day.day_number}
                </span>
                {day.title && (
                  <h3 className="text-white font-semibold text-lg">{day.title}</h3>
                )}
              </div>
              {day.location && (
                <p className="text-white/80 text-sm flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {day.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {day.energy_level && (
              <EnergyBadge level={day.energy_level} />
            )}
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <ChevronDown
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
          {/* Day Summary */}
          {day.summary && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 text-sm mb-1.5">
                📋 Day Summary
              </h4>
              <p className="text-emerald-700 text-sm leading-relaxed">{day.summary}</p>
            </div>
          )}

          {/* Activities List */}
          {activities.length > 0 ? (
            <div>
              {activities
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((activity, idx) => (
                  <ActivityRow key={activity.id} activity={activity} isLast={idx === activities.length - 1} />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400">No activities planned yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  return (
    <div className={`flex gap-4 py-4 ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Time */}
      <div className="w-16 flex-shrink-0">
        {activity.time && (
          <span className="text-teal font-bold text-sm">
            {activity.time}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="font-semibold text-navy text-base">{activity.title}</h4>

        {activity.description && (
          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        )}

        {/* Tips - yellow background like the HTML */}
        {activity.tips && (
          <div className="mt-2 px-3 py-2 bg-amber-100 rounded-lg">
            <p className="text-sm text-amber-900">
              💡 {activity.tips}
            </p>
          </div>
        )}

        {/* Food recommendations - green background */}
        {activity.food_recommendations && (
          <div className="mt-2 px-3 py-2 bg-emerald-100 rounded-lg">
            <p className="text-sm text-emerald-900">
              🍽️ {activity.food_recommendations}
            </p>
          </div>
        )}

        {/* Location link */}
        {activity.location && (
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={activity.location_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
            >
              📍 {activity.location.length > 20 ? "Location" : activity.location}
            </a>
          </div>
        )}


        {/* Status badge */}
        {activity.status === "TENTATIVE" && (
          <span className="inline-block mt-2 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
            ⏳ Tentative
          </span>
        )}
      </div>
    </div>
  );
}
