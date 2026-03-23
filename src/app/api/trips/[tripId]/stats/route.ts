import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TripStats } from "@/components/trip-view2/trip-hero";

function generatePendingActions(
  flights: { status?: string }[],
  hotels: { status?: string }[],
  todos: { completed?: boolean; priority?: string; title?: string }[],
  packingItems: { checked?: boolean }[],
  documentsCount: number
): string[] {
  const actions: string[] = [];

  const unconfirmedFlights = flights.filter(f => f.status !== "CONFIRMED").length;
  if (unconfirmedFlights > 0) {
    actions.push(`${unconfirmedFlights} flight${unconfirmedFlights > 1 ? 's' : ''} need confirmation`);
  }

  const unconfirmedHotels = hotels.filter(h => h.status !== "CONFIRMED").length;
  if (unconfirmedHotels > 0) {
    actions.push(`${unconfirmedHotels} hotel${unconfirmedHotels > 1 ? 's' : ''} need confirmation`);
  }

  // Prioritize HIGH priority todos
  const incompleteTodos = todos.filter(t => !t.completed);
  const urgentTodos = incompleteTodos.filter(t => t.priority === "HIGH");
  const regularTodos = incompleteTodos.filter(t => t.priority !== "HIGH");

  // Show urgent todos individually with marker
  urgentTodos.slice(0, 3).forEach(t => {
    actions.push(`🔴 ${t.title || "Urgent task"}`);
  });
  if (urgentTodos.length > 3) {
    actions.push(`+${urgentTodos.length - 3} more urgent items`);
  }

  // Show count of remaining regular todos
  if (regularTodos.length > 0) {
    actions.push(`${regularTodos.length} todo${regularTodos.length > 1 ? 's' : ''} remaining`);
  }

  const unpackedItems = packingItems.filter(p => !p.checked).length;
  if (unpackedItems > 0) {
    actions.push(`${unpackedItems} item${unpackedItems > 1 ? 's' : ''} to pack`);
  }

  if (documentsCount === 0) {
    actions.push("No documents uploaded");
  }

  return actions;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: trip } = await supabase
      .from("trips")
      .select("owner_id")
      .eq("id", tripId)
      .single();

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.owner_id !== user.id) {
      // Check if user is a traveler
      const { data: traveler } = await supabase
        .from("travelers")
        .select("id")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .single();

      if (!traveler) {
        return NextResponse.json(
          { error: "Not authorized to view this trip" },
          { status: 403 }
        );
      }
    }

    // Fetch all data needed for stats in parallel
    const [
      { data: bookings },
      { data: todos },
      { data: packingItems },
      { data: documents },
      { data: emergencyContacts },
    ] = await Promise.all([
      supabase.from("bookings").select("type, status").eq("trip_id", tripId),
      supabase.from("trip_todos").select("completed, priority, title").eq("trip_id", tripId),
      supabase.from("packing_items").select("checked").eq("trip_id", tripId),
      supabase.from("documents").select("id").eq("trip_id", tripId),
      supabase.from("emergency_contacts").select("id").eq("trip_id", tripId),
    ]);

    const flights = (bookings || []).filter(b => b.type === "FLIGHT");
    const hotels = (bookings || []).filter(b => b.type === "HOTEL");
    const finalTodos = todos || [];
    const finalPackingItems = packingItems || [];
    const finalDocuments = documents || [];
    const finalEmergencyContacts = emergencyContacts || [];

    const stats: TripStats = {
      flights: {
        total: flights.length,
        confirmed: flights.filter(f => f.status === "CONFIRMED").length,
      },
      hotels: {
        total: hotels.length,
        confirmed: hotels.filter(h => h.status === "CONFIRMED").length,
      },
      todos: {
        total: finalTodos.length,
        completed: finalTodos.filter(t => t.completed).length,
      },
      packing: {
        total: finalPackingItems.length,
        checked: finalPackingItems.filter(p => p.checked).length,
      },
      documents: finalDocuments.length,
      emergencyContacts: finalEmergencyContacts.length,
      pendingActions: generatePendingActions(
        flights,
        hotels,
        finalTodos,
        finalPackingItems,
        finalDocuments.length
      ),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching trip stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip stats" },
      { status: 500 }
    );
  }
}
