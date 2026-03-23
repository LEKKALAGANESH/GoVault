import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format, addDays, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DayCard } from "@/components/itinerary/day-card";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import type { Trip, ItineraryDay, Activity } from "@/lib/types";

interface PageProps {
  params: Promise<{ tripId: string }>;
}

export default async function ItineraryPage({ params }: PageProps) {
  const { tripId } = await params;
  const supabase = await createClient();

  // Fetch trip
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !trip) {
    notFound();
  }

  // Fetch itinerary days with activities
  const { data: days } = await supabase
    .from("itinerary_days")
    .select(`
      *,
      activities (*)
    `)
    .eq("trip_id", tripId)
    .order("day_number", { ascending: true });

  const typedTrip = trip as Trip;
  const startDate = new Date(typedTrip.start_date);
  const endDate = new Date(typedTrip.end_date);
  const totalDays = differenceInDays(endDate, startDate) + 1;

  // Generate all days even if not all have entries
  const allDays = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(startDate, i);
    const existingDay = (days as (ItineraryDay & { activities: Activity[] })[] | null)?.find(
      (d) => d.day_number === i + 1
    );
    return {
      dayNumber: i + 1,
      date,
      day: existingDay || null,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center text-muted-foreground hover:text-navy mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to {typedTrip.name}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy">Trip Itinerary</h1>
            <p className="text-muted-foreground mt-1">
              {format(startDate, "MMMM d")} - {format(endDate, "MMMM d, yyyy")} • {totalDays} days
            </p>
          </div>
          <Link href={`/trips/${tripId}/itinerary/edit`}>
            <Button className="bg-teal hover:bg-teal-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Day
            </Button>
          </Link>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="space-y-6">
        {allDays.map(({ dayNumber, date, day }) => (
          <DayCard
            key={dayNumber}
            tripId={tripId}
            dayNumber={dayNumber}
            date={date}
            day={day}
          />
        ))}
      </div>

      {/* Empty state for no content */}
      {(!days || days.length === 0) && (
        <div className="mt-8 text-center py-12 bg-white rounded-2xl">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-navy mb-2">
            Start Building Your Itinerary
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Add activities, tips, and restaurant recommendations to make your trip unforgettable.
          </p>
          <Link href={`/trips/${tripId}/itinerary/day/1/edit`}>
            <Button className="bg-teal hover:bg-teal-dark text-white">
              Plan Day 1
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
