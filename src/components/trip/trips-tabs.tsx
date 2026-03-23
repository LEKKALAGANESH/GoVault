"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { TripCard } from "./trip-card";
import type { Trip, Traveler, TripTodo, Booking } from "@/lib/types";

interface TripWithExtras extends Trip {
  travelers?: Traveler[];
  trip_todos?: TripTodo[];
  bookings?: Booking[];
  itinerary_nights?: { location: string; nights: number }[];
}

interface TripsTabsProps {
  upcomingTrips: TripWithExtras[];
  activeTrips: TripWithExtras[];
  pastTrips: TripWithExtras[];
  allTrips: TripWithExtras[];
}

type TabType = "upcoming" | "past" | "all";
type ViewType = "grid" | "list";

export function TripsTabs({
  upcomingTrips,
  activeTrips,
  pastTrips,
  allTrips,
}: TripsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [viewType, setViewType] = useState<ViewType>("grid");

  const tabs = [
    { id: "upcoming" as const, label: "Upcoming", count: upcomingTrips.length + activeTrips.length },
    { id: "past" as const, label: "Past", count: pastTrips.length },
    { id: "all" as const, label: "All", count: allTrips.length },
  ];

  const getTripsForTab = () => {
    switch (activeTab) {
      case "upcoming":
        return { active: activeTrips, trips: upcomingTrips };
      case "past":
        return { active: [], trips: pastTrips };
      case "all":
        return { active: [], trips: allTrips };
      default:
        return { active: [], trips: [] };
    }
  };

  const { active, trips } = getTripsForTab();

  return (
    <div>
      {/* Tabs & View Toggle */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-teal text-white"
                  : "bg-white text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-white/20"
                    : "bg-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex bg-white border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewType("grid")}
            className={`p-2 transition-colors ${
              viewType === "grid"
                ? "bg-teal text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType("list")}
            className={`p-2 transition-colors ${
              viewType === "list"
                ? "bg-teal text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Trips - Always show at top when on upcoming tab */}
      {activeTab === "upcoming" && active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Active Trip
          </h2>
          <div
            className={
              viewType === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {active.map((trip) => (
              <TripCard key={trip.id} trip={trip} isActive />
            ))}
          </div>
        </section>
      )}

      {/* Main Trip List */}
      {trips.length > 0 ? (
        <section>
          {activeTab === "upcoming" && active.length > 0 && (
            <h2 className="text-lg font-semibold text-navy mb-4">
              Upcoming Trips
            </h2>
          )}
          <div
            className={
              viewType === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {trips.map((trip) => {
              const isPastTrip = activeTab === "past" ||
                (activeTab === "all" && new Date(trip.end_date) < new Date());
              return (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isPast={isPastTrip}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {activeTab === "upcoming" && active.length === 0 && (
            <p>No upcoming trips yet. Create one to get started!</p>
          )}
          {activeTab === "past" && <p>No past trips to show.</p>}
          {activeTab === "all" && <p>No trips found.</p>}
        </div>
      )}
    </div>
  );
}
