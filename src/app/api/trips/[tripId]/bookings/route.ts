import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface HotelBookingInput {
  hotel_name: string;
  check_in?: string;
  check_out?: string;
  address?: string;
  room_type?: string;
  confirmation_number?: string;
  notes?: string;
}

interface FlightBookingInput {
  airline?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_time?: string;
  arrival_time?: string;
  confirmation_number?: string;
  seats?: string;
  notes?: string;
}

export async function POST(
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

    // Handle batch creation of bookings
    const bookings = body.bookings || [body];
    const createdBookings = [];
    const errors = [];

    for (const booking of bookings) {
      const bookingType = booking.type || "HOTEL";

      let bookingData: Record<string, unknown> = {
        trip_id: tripId,
        type: bookingType,
        status: booking.status || "PENDING",
        notes: booking.notes,
        confirmation_number: booking.confirmation_number,
      };

      if (bookingType === "HOTEL") {
        const hotelData = booking as HotelBookingInput;
        bookingData = {
          ...bookingData,
          hotel_name: hotelData.hotel_name,
          check_in: hotelData.check_in,
          check_out: hotelData.check_out,
          address: hotelData.address,
          room_type: hotelData.room_type,
        };
      } else if (bookingType === "FLIGHT") {
        const flightData = booking as FlightBookingInput;
        bookingData = {
          ...bookingData,
          airline: flightData.airline,
          flight_number: flightData.flight_number,
          departure_airport: flightData.departure_airport,
          arrival_airport: flightData.arrival_airport,
          departure_time: flightData.departure_time,
          arrival_time: flightData.arrival_time,
          seats: flightData.seats,
        };
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        errors.push({ booking: bookingData, error: error.message });
      } else {
        createdBookings.push(data);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      bookings: createdBookings,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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

    // Verify user has access to this trip (owner or traveler)
    const { data: trip } = await supabase
      .from("trips")
      .select("owner_id")
      .eq("id", tripId)
      .single();

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.owner_id !== user.id) {
      // Check if user is a traveler on this trip
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

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

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

    // Verify booking belongs to this trip
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, trip_id")
      .eq("id", bookingId)
      .eq("trip_id", tripId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Delete the booking
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deletedId: bookingId });
  } catch (error) {
    console.error("Booking deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
