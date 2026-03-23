"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon, Loader2, MapPin, X, Sparkles } from "lucide-react";
import { cn, generateTripSlug, generateUniqueSlug } from "@/lib/utils";

const OCCASION_SUGGESTIONS = [
  "Anniversary",
  "Birthday",
  "Honeymoon",
  "Family Vacation",
  "Friends Trip",
  "Solo Adventure",
  "Business + Leisure",
  "Babymoon",
];

export default function NewTripPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const handleAddDestination = () => {
    if (destinationInput.trim() && !destinations.includes(destinationInput.trim())) {
      setDestinations([...destinations, destinationInput.trim()]);
      setDestinationInput("");
    }
  };

  const handleRemoveDestination = (dest: string) => {
    setDestinations(destinations.filter((d) => d !== dest));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDestination();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || destinations.length === 0 || !dateRange.from || !dateRange.to) {
      return;
    }

    setLoading(true);

    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      router.push("/login");
      return;
    }

    // Generate a unique slug for the trip
    const baseSlug = generateTripSlug(name, dateRange.from);

    // Check for existing slugs that start with this base
    const { data: existingTrips } = await supabase
      .from("trips")
      .select("slug")
      .like("slug", `${baseSlug}%`);

    const existingSlugs = existingTrips?.map((t) => t.slug) || [];
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    const { data, error } = await supabase
      .from("trips")
      .insert({
        slug,
        name,
        occasion: occasion || null,
        destinations,
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
        status: "PLANNING",
        owner_id: user.user.id,
        budget_currency: "INR",
        home_currency: "INR",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating trip:", error);
      setLoading(false);
      return;
    }

    // Add the creator as a traveler (organizer)
    const userName = user.user.user_metadata?.full_name ||
                     user.user.user_metadata?.name ||
                     user.user.email?.split("@")[0] ||
                     "Organizer";

    await supabase.from("travelers").insert({
      trip_id: data.id,
      user_id: user.user.id,
      name: userName,
      email: user.user.email,
      is_organizer: true,
    });

    setLoading(false);
    router.push(`/trips/${data.slug}`);
  };

  const isValid = name && destinations.length > 0 && dateRange.from && dateRange.to;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/trips"
          className="inline-flex items-center text-muted-foreground hover:text-navy mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Trips
        </Link>
        <h1 className="text-3xl font-bold text-navy">Create a New Trip</h1>
        <p className="text-muted-foreground mt-1">
          Set up your next adventure in minutes
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Name */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Label htmlFor="name" className="text-base font-medium text-navy">
            Trip Name
          </Label>
          <Input
            id="name"
            placeholder="e.g., Thailand Family Adventure"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-12 text-lg"
            required
          />
        </div>

        {/* Occasion */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Label className="text-base font-medium text-navy flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" />
            Special Occasion
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Optional, but adds a personal touch
          </p>
          <Input
            placeholder="e.g., 10th Anniversary"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="mb-3 h-11"
          />
          <div className="flex flex-wrap gap-2">
            {OCCASION_SUGGESTIONS.map((sug) => (
              <Button
                key={sug}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full",
                  occasion === sug && "bg-gold/20 border-gold text-navy"
                )}
                onClick={() => setOccasion(occasion === sug ? "" : sug)}
              >
                {sug}
              </Button>
            ))}
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Label className="text-base font-medium text-navy">
            Destinations
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Add one or more destinations
          </p>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Add a destination"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-11"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddDestination}
              disabled={!destinationInput.trim()}
            >
              Add
            </Button>
          </div>
          {destinations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {destinations.map((dest) => (
                <span
                  key={dest}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal/10 text-teal rounded-full text-sm"
                >
                  <MapPin className="w-3 h-3" />
                  {dest}
                  <button
                    type="button"
                    onClick={() => handleRemoveDestination(dest)}
                    className="ml-1 hover:bg-teal/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Label className="text-base font-medium text-navy">
            Travel Dates
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Select your trip dates
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-11",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Pick your travel dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-teal hover:bg-teal-dark text-white"
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Trip"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
