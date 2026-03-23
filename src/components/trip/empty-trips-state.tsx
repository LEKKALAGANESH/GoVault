"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Plane, MapPin, Calendar, Users, Sparkles } from "lucide-react";

export function EmptyTripsState() {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coral/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center py-16 px-4 max-w-2xl mx-auto">
        {/* Animated illustration */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center">
                <Plane className="w-5 h-5 text-teal" />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <div className="w-10 h-10 bg-coral/20 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-coral" />
              </div>
            </div>
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-navy/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-navy" />
              </div>
            </div>
          </div>

          {/* Center globe */}
          <div className="absolute inset-6 bg-gradient-to-br from-teal to-teal-dark rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl">🌍</span>
          </div>
        </div>

        {/* Text content */}
        <h2 className="font-serif text-3xl font-bold text-navy mb-3">
          Your Next Adventure Starts Here
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Create your first trip and start organizing flights, hotels, itineraries,
          and everything you need for an unforgettable journey.
        </p>

        {/* CTA Button */}
        <Link href="/trips/new">
          <Button size="lg" className="bg-teal hover:bg-teal-dark text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Trip
          </Button>
        </Link>

        {/* Feature highlights */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 text-left">
          <FeatureCard
            icon="✈️"
            title="Manage Bookings"
            description="Keep all your flights, hotels, and reservations in one place"
          />
          <FeatureCard
            icon="📅"
            title="Build Day-by-Day Itineraries"
            description="Organize your days with activities, restaurants, and must-sees"
          />
          <FeatureCard
            icon="🧳"
            title="Pack & Prepare"
            description="Packing checklists, survival tips, and emergency contacts ready to go"
          />
        </div>

        {/* Sample destinations */}
        <div className="mt-16">
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Trending Destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Thailand 🇹🇭", "Japan 🇯🇵", "Bali 🇮🇩", "Europe 🇪🇺", "Maldives 🇲🇻", "Dubai 🇦🇪"].map(
              (destination) => (
                <span
                  key={destination}
                  className="px-4 py-2 bg-white rounded-full text-sm text-muted-foreground border border-border hover:border-teal hover:text-teal transition-colors cursor-default"
                >
                  {destination}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-semibold text-navy mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
