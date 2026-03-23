"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./share-button";
import type { Traveler } from "@/lib/types";

interface TripActionsProps {
  tripId: string;
  tripSlug: string;
  tripName: string;
  initialTravelers: Traveler[];
  isOwner: boolean;
  currentUserId?: string;
  currentUserEmail?: string;
}

export function TripActions({ tripId, tripSlug, tripName, initialTravelers, isOwner, currentUserId, currentUserEmail }: TripActionsProps) {
  const [travelers, setTravelers] = useState(initialTravelers);
  const router = useRouter();

  const handleTravelerEmailUpdate = async (travelerId: string, email: string) => {
    const res = await fetch(`/api/trips/${tripId}/travelers/${travelerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Failed to update email");
    }

    const updated = await res.json();
    setTravelers(travelers.map((t) => (t.id === travelerId ? updated : t)));
    router.refresh();
  };

  return (
    <div className="flex gap-2 items-center">
      <ShareButton
        tripSlug={tripSlug}
        tripName={tripName}
        travelers={travelers}
        onTravelerEmailUpdate={isOwner ? handleTravelerEmailUpdate : undefined}
        currentUserId={currentUserId}
        currentUserEmail={currentUserEmail}
      />
      <Button variant="ghost" size="icon" className="rounded-full">
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}
