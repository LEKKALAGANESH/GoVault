import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Fetch trip with days
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*, itinerary_days(id, day_number, date, title, location)")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if user has access (owner or shared)
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

    return NextResponse.json({
      trip: {
        id: trip.id,
        name: trip.name,
        start_date: trip.start_date,
        end_date: trip.end_date,
        destinations: trip.destinations,
      },
      days: trip.itinerary_days?.sort(
        (a: { day_number: number }, b: { day_number: number }) =>
          a.day_number - b.day_number
      ),
    });
  } catch (error) {
    console.error("Trip fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this trip" },
        { status: 403 }
      );
    }

    // Build update object with only allowed fields
    const updateData: Record<string, unknown> = {};
    if (body.destinations !== undefined) {
      updateData.destinations = body.destinations;
    }
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.start_date !== undefined) {
      updateData.start_date = body.start_date;
    }
    if (body.end_date !== undefined) {
      updateData.end_date = body.end_date;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updatedTrip, error: updateError } = await supabase
      .from("trips")
      .update(updateData)
      .eq("id", tripId)
      .select()
      .single();

    // If start_date changed, recalculate all itinerary day dates
    if (updateData.start_date && !updateError && updatedTrip) {
      const newStartDate = new Date(updateData.start_date as string);

      // Get all days for this trip
      const { data: days } = await supabase
        .from("itinerary_days")
        .select("id, day_number")
        .eq("trip_id", tripId)
        .order("day_number", { ascending: true });

      if (days && days.length > 0) {
        // Update each day's date based on its day_number
        for (const day of days) {
          const dayDate = new Date(newStartDate);
          dayDate.setDate(dayDate.getDate() + day.day_number - 1);
          const formattedDate = dayDate.toISOString().split("T")[0];

          await supabase
            .from("itinerary_days")
            .update({ date: formattedDate })
            .eq("id", day.id);
        }
      }
    }

    if (updateError) {
      console.error("Error updating trip:", updateError);
      return NextResponse.json(
        { error: "Failed to update trip" },
        { status: 500 }
      );
    }

    // Check for booking date conflicts if dates changed
    const warnings: string[] = [];
    if ((updateData.start_date || updateData.end_date) && updatedTrip) {
      const newStartDate = new Date(updatedTrip.start_date);
      const newEndDate = new Date(updatedTrip.end_date);

      // Fetch all bookings for this trip
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, type, airline, flight_number, hotel_name, departure_time, arrival_time, check_in, check_out")
        .eq("trip_id", tripId);

      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          if (booking.type === "FLIGHT") {
            // Check flight dates
            const departureDate = booking.departure_time ? new Date(booking.departure_time) : null;
            const arrivalDate = booking.arrival_time ? new Date(booking.arrival_time) : null;

            if (departureDate && (departureDate < newStartDate || departureDate > newEndDate)) {
              const flightDesc = `${booking.airline || ""} ${booking.flight_number || ""}`.trim() || "Flight";
              warnings.push(`${flightDesc} departs on ${departureDate.toISOString().split("T")[0]} which is outside your new trip dates`);
            }
            if (arrivalDate && (arrivalDate < newStartDate || arrivalDate > newEndDate)) {
              const flightDesc = `${booking.airline || ""} ${booking.flight_number || ""}`.trim() || "Flight";
              warnings.push(`${flightDesc} arrives on ${arrivalDate.toISOString().split("T")[0]} which is outside your new trip dates`);
            }
          } else if (booking.type === "HOTEL") {
            // Check hotel dates
            const checkInDate = booking.check_in ? new Date(booking.check_in) : null;
            const checkOutDate = booking.check_out ? new Date(booking.check_out) : null;

            if (checkInDate && (checkInDate < newStartDate || checkInDate > newEndDate)) {
              const hotelDesc = booking.hotel_name || "Hotel";
              warnings.push(`${hotelDesc} check-in on ${checkInDate.toISOString().split("T")[0]} is outside your new trip dates`);
            }
            if (checkOutDate && (checkOutDate < newStartDate || checkOutDate > newEndDate)) {
              const hotelDesc = booking.hotel_name || "Hotel";
              warnings.push(`${hotelDesc} check-out on ${checkOutDate.toISOString().split("T")[0]} is outside your new trip dates`);
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      trip: updatedTrip,
      ...(warnings.length > 0 && { warnings }),
    });
  } catch (error) {
    console.error("Trip update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
