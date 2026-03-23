import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ApplyRequest, ApplyResponse, ProposedChange, AgentSuggestion } from "@/lib/agent/types";
import { findMatchingBooking } from "@/lib/agent/smart-linking";
import { generateFlightTodos, generateHotelTodos } from "@/lib/agent/auto-todos";

// Common airport codes mapped to destinations
const AIRPORT_TO_DESTINATION: Record<string, string[]> = {
  // Thailand
  "bkk": ["thailand", "bangkok"],
  "dmk": ["thailand", "bangkok"],
  "hkt": ["thailand", "phuket"],
  "cnx": ["thailand", "chiang mai"],
  "usm": ["thailand", "koh samui", "samui"],
  // Sri Lanka
  "cmb": ["sri lanka", "colombo"],
  "hri": ["sri lanka", "hambantota"],
  // Indonesia
  "dps": ["indonesia", "bali", "denpasar"],
  "cgk": ["indonesia", "jakarta"],
  // Vietnam
  "sgn": ["vietnam", "ho chi minh", "saigon"],
  "han": ["vietnam", "hanoi"],
  // Japan
  "nrt": ["japan", "tokyo", "narita"],
  "hnd": ["japan", "tokyo", "haneda"],
  "kix": ["japan", "osaka"],
  // Singapore
  "sin": ["singapore"],
  // Malaysia
  "kul": ["malaysia", "kuala lumpur"],
  // India
  "del": ["india", "delhi", "new delhi"],
  "bom": ["india", "mumbai", "bombay"],
  // Maldives
  "mle": ["maldives", "male"],
};

// Check if an airport code matches a destination
function isAirportInDestination(airportCode: string, destination: string): boolean {
  const code = airportCode.toLowerCase();
  const dest = destination.toLowerCase();

  // Check our mapping
  const mappedDestinations = AIRPORT_TO_DESTINATION[code];
  if (mappedDestinations) {
    return mappedDestinations.some(d => dest.includes(d) || d.includes(dest));
  }

  // Fallback: check if the airport code letters appear in destination
  return dest.includes(code);
}

// Helper function to upload document and link to booking
async function uploadDocumentForBooking(
  tripId: string,
  bookingId: string,
  document: { base64: string; mimeType: string; filename: string },
  bookingType: "FLIGHT" | "HOTEL" | "ACTIVITY"
): Promise<string | null> {
  try {
    const serviceClient = createServiceClient();

    // Decode base64 to buffer
    const buffer = Buffer.from(document.base64, "base64");

    // Generate storage path
    const timestamp = Date.now();
    const extension = document.filename.split(".").pop() || "pdf";
    const safeFileName = document.filename.replace(/[^a-zA-Z0-9-_.]/g, "_").substring(0, 50);
    const storagePath = `${tripId}/${bookingId}/${timestamp}-${safeFileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await serviceClient.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: document.mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Document upload error:", uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from("documents")
      .getPublicUrl(storagePath);

    // Determine category based on booking type - use categories that match the UI
    // FLIGHT → BOARDING_PASS or E_TICKET, HOTEL → CONFIRMATION, ACTIVITY → VOUCHER
    const category = bookingType === "FLIGHT" ? "E_TICKET" : bookingType === "HOTEL" ? "CONFIRMATION" : "VOUCHER";

    // Create document record linked to booking
    const { data: doc, error: dbError } = await serviceClient
      .from("documents")
      .insert({
        trip_id: tripId,
        booking_id: bookingId,
        name: document.filename,
        file_url: urlData.publicUrl,
        file_type: document.mimeType,
        category,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Document DB insert error:", dbError);
      // Clean up uploaded file
      await serviceClient.storage.from("documents").remove([storagePath]);
      return null;
    }

    return doc.id;
  } catch (error) {
    console.error("Document upload failed:", error);
    return null;
  }
}

// Structured logging for apply changes
function logApplyEvent(event: string, data: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    service: "trip-agent-apply",
    event,
    ...data,
  }));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const startTime = Date.now();
  let userId: string | null = null;

  try {
    const { tripId } = await params;
    const body: ApplyRequest = await request.json();

    logApplyEvent("apply_request_received", {
      tripId,
      changesCount: body.changes?.length || 0,
      changeTypes: body.changes?.map(c => c.tool) || [],
    });

    // Verify user is authenticated and owns the trip
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logApplyEvent("auth_failed", { tripId, reason: "no_user" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;
    logApplyEvent("user_authenticated", { tripId, userId: user.id, userEmail: user.email });

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id, start_date")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.owner_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to edit this trip" }, { status: 403 });
    }

    // Apply each change
    const applied: ApplyResponse["applied"] = [];
    const errors: string[] = [];

    for (const change of body.changes) {
      try {
        const result = await applyChange(supabase, tripId, trip.start_date, change);
        applied.push(result);

        // If a booking was created and we have a document, upload and link it
        if (body.document && result.id && (change.tool === "parse_flight" || change.tool === "parse_hotel" || change.tool === "parse_activity")) {
          const bookingType = change.tool === "parse_flight" ? "FLIGHT" : change.tool === "parse_hotel" ? "HOTEL" : "ACTIVITY";
          const documentId = await uploadDocumentForBooking(tripId, result.id, body.document, bookingType);
          if (documentId) {
            logApplyEvent("document_uploaded", {
              tripId,
              bookingId: result.id,
              documentId,
              filename: body.document.filename,
            });
          } else {
            logApplyEvent("document_upload_failed", {
              tripId,
              bookingId: result.id,
              filename: body.document.filename,
              tool: change.tool,
            });
          }
        } else if (body.document && !result.id) {
          logApplyEvent("document_upload_skipped_no_id", {
            tripId,
            filename: body.document.filename,
            tool: change.tool,
          });
        }
      } catch (error) {
        errors.push(`${change.tool}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Collect all warnings and suggestions from applied changes
    const allWarnings: string[] = [];
    const allSuggestions: AgentSuggestion[] = [];
    for (const appliedChange of applied) {
      if (appliedChange.warnings) {
        allWarnings.push(...appliedChange.warnings);
      }
      if (appliedChange.suggestions) {
        allSuggestions.push(...appliedChange.suggestions);
      }
    }

    const response: ApplyResponse = {
      success: errors.length === 0,
      message: errors.length === 0
        ? (allWarnings.length > 0 ? "Changes applied with warnings" : "All changes applied successfully")
        : "Some changes failed",
      applied,
      errors: errors.length > 0 ? errors : undefined,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
      suggestions: allSuggestions.length > 0 ? allSuggestions : undefined,
    };

    const totalDuration = Date.now() - startTime;
    logApplyEvent("apply_completed", {
      tripId,
      userId,
      success: errors.length === 0,
      totalDurationMs: totalDuration,
      appliedCount: applied.length,
      errorsCount: errors.length,
      appliedTypes: applied.map(a => a.tool),
    });

    return NextResponse.json(response);
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logApplyEvent("apply_failed", {
      tripId: "unknown",
      userId,
      success: false,
      totalDurationMs: totalDuration,
      error: errorMessage,
    });

    console.error("Apply API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to apply changes",
        applied: [],
        errors: [errorMessage],
      } as ApplyResponse,
      { status: 500 }
    );
  }
}

async function applyChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tripId: string,
  tripStartDate: string,
  change: ProposedChange
): Promise<ApplyResponse["applied"][0]> {
  const { tool, data } = change;

  switch (tool) {
    case "parse_flight": {
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          trip_id: tripId,
          type: "FLIGHT",
          status: "CONFIRMED",
          airline: data.airline,
          flight_number: data.flight_number,
          departure_airport: data.departure_airport,
          arrival_airport: data.arrival_airport,
          departure_time: data.departure_time,
          arrival_time: data.arrival_time,
          confirmation_number: data.confirmation_number,
          seats: data.seats,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      // Auto-generate todos for this flight
      await generateFlightTodos(supabase, tripId, booking.id, {
        airline: data.airline as string | undefined,
        flight_number: data.flight_number as string | undefined,
        departure_airport: data.departure_airport as string | undefined,
        arrival_airport: data.arrival_airport as string | undefined,
        departure_time: data.departure_time as string | undefined,
        status: "CONFIRMED",
      });

      return { tool, result: "created", id: booking.id };
    }

    case "parse_hotel": {
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          trip_id: tripId,
          type: "HOTEL",
          status: "CONFIRMED",
          hotel_name: data.hotel_name,
          address: data.address,
          check_in: data.check_in,
          check_out: data.check_out,
          room_type: data.room_type,
          confirmation_number: data.confirmation_number,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      // Auto-generate todos for this hotel
      await generateHotelTodos(supabase, tripId, booking.id, {
        hotel_name: data.hotel_name as string | undefined,
        check_in: data.check_in as string | undefined,
        check_out: data.check_out as string | undefined,
        status: "CONFIRMED",
      });

      return { tool, result: "created", id: booking.id };
    }

    case "parse_activity": {
      // Create an activity booking (stored as a general booking with type ACTIVITY)
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          trip_id: tripId,
          type: "ACTIVITY",
          status: "CONFIRMED",
          hotel_name: data.activity_name, // Reusing hotel_name field for activity name
          address: data.location,
          check_in: data.date, // Using check_in for activity date
          confirmation_number: data.confirmation_number,
          notes: data.notes,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      // Create a todo to remind about this activity
      if (data.activity_name && data.date) {
        await supabase.from("trip_todos").insert({
          trip_id: tripId,
          title: `${data.activity_name}`,
          description: `${data.time ? `Time: ${data.time}` : ""}${data.location ? ` | Location: ${data.location}` : ""}${data.notes ? ` | Notes: ${data.notes}` : ""}`,
          category: "activities",
          completed: false,
          order: 0,
        });
      }

      return { tool, result: "created", id: booking.id };
    }

    case "parse_itinerary_text": {
      const days = data.days as Array<{
        day_number: number;
        date?: string;
        title: string;
        location?: string;
        summary?: string;
        activities: Array<{
          time?: string;
          title: string;
          description?: string;
          location?: string;
          tips?: string;
          tags?: string[];
        }>;
      }>;

      // Calculate dates based on trip start date
      const startDate = new Date(tripStartDate);

      // Get day numbers we're about to insert
      const newDayNumbers = days.map(d => d.day_number);

      // Check for existing days with same day_numbers
      const { data: existingDays } = await supabase
        .from("itinerary_days")
        .select("id, day_number")
        .eq("trip_id", tripId)
        .in("day_number", newDayNumbers);

      // Delete existing days that will be replaced (cascade deletes activities)
      if (existingDays && existingDays.length > 0) {
        const existingDayIds = existingDays.map(d => d.id);

        // First delete activities for these days
        await supabase
          .from("activities")
          .delete()
          .in("day_id", existingDayIds);

        // Then delete the days themselves
        await supabase
          .from("itinerary_days")
          .delete()
          .in("id", existingDayIds);
      }

      for (const day of days) {
        // Calculate date for this day
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + day.day_number - 1);

        // Insert day
        const { data: createdDay, error: dayError } = await supabase
          .from("itinerary_days")
          .insert({
            trip_id: tripId,
            day_number: day.day_number,
            date: day.date || dayDate.toISOString().split("T")[0],
            title: day.title,
            location: day.location,
            summary: day.summary,
            energy_level: "MEDIUM",
          })
          .select("id")
          .single();

        if (dayError) throw new Error(dayError.message);

        // Insert activities for this day with smart linking
        if (day.activities && day.activities.length > 0) {
          for (let index = 0; index < day.activities.length; index++) {
            const activity = day.activities[index];

            // Smart linking: try to find a matching booking for each activity
            const bookingId = await findMatchingBooking(supabase, tripId, {
              title: activity.title,
              description: activity.description,
              location: activity.location,
              time: activity.time,
            });

            const { error: activityError } = await supabase
              .from("activities")
              .insert({
                day_id: createdDay.id,
                time: activity.time,
                title: activity.title,
                description: activity.description,
                location: activity.location,
                tips: activity.tips,
                status: "CONFIRMED",
                order: index + 1,
                tags: activity.tags || [],
                booking_id: bookingId, // Smart linked booking
              });

            if (activityError) throw new Error(activityError.message);
          }
        }
      }

      return { tool, result: "created" };
    }

    case "add_day": {
      // Calculate date based on day number
      const startDate = new Date(tripStartDate);
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + (data.day_number as number) - 1);

      const { data: day, error } = await supabase
        .from("itinerary_days")
        .insert({
          trip_id: tripId,
          day_number: data.day_number,
          date: (data.date as string) || dayDate.toISOString().split("T")[0],
          title: data.title,
          location: data.location,
          summary: data.summary,
          energy_level: "MEDIUM",
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      return { tool, result: "created", id: day.id };
    }

    case "update_day": {
      // Validate day_id is a UUID, not a date string
      const dayId = data.day_id as string;
      if (!dayId || dayId.includes("T") || dayId.match(/^\d{4}-\d{2}-\d{2}/)) {
        throw new Error("Invalid day_id: expected a UUID, not a date string. Use the day's id from the context.");
      }

      const updateData: Record<string, unknown> = {};
      if (data.date) {
        // Validate date format (YYYY-MM-DD)
        const dateStr = data.date as string;
        if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Convert ISO datetime to date-only format
          const dateOnly = dateStr.split("T")[0];
          updateData.date = dateOnly;
        } else {
          updateData.date = dateStr;
        }
      }
      if (data.title) updateData.title = data.title;
      if (data.location) updateData.location = data.location;
      if (data.summary) updateData.summary = data.summary;
      if (data.energy_level) updateData.energy_level = data.energy_level;

      const { error } = await supabase
        .from("itinerary_days")
        .update(updateData)
        .eq("id", dayId)
        .eq("trip_id", tripId);

      if (error) throw new Error(error.message);
      return { tool, result: "updated", id: dayId };
    }

    case "delete_day": {
      // Validate day_id is a UUID, not a date string
      const dayId = data.day_id as string;
      if (!dayId || dayId.includes("T") || dayId.match(/^\d{4}-\d{2}-\d{2}/)) {
        throw new Error("Invalid day_id: expected a UUID, not a date string. Use the day's UUID from the context.");
      }

      // Check if day exists first
      const { data: existingDay } = await supabase
        .from("itinerary_days")
        .select("id")
        .eq("id", dayId)
        .eq("trip_id", tripId)
        .single();

      // If day doesn't exist, treat as already deleted - success
      if (!existingDay) {
        return { tool, result: "deleted", id: dayId };
      }

      const { error } = await supabase
        .from("itinerary_days")
        .delete()
        .eq("id", dayId)
        .eq("trip_id", tripId);

      if (error) throw new Error(error.message);
      return { tool, result: "deleted", id: dayId };
    }

    case "add_activity": {
      // Find the day by day_number
      const { data: day, error: dayError } = await supabase
        .from("itinerary_days")
        .select("id")
        .eq("trip_id", tripId)
        .eq("day_number", data.day_number)
        .single();

      if (dayError || !day) throw new Error("Day not found");

      // Get current max order for the day
      const { data: existingActivities } = await supabase
        .from("activities")
        .select("order")
        .eq("day_id", day.id)
        .order("order", { ascending: false })
        .limit(1);

      const maxOrder = existingActivities?.[0]?.order || 0;

      // Smart linking: try to find a matching booking
      const bookingId = await findMatchingBooking(supabase, tripId, {
        title: data.title as string,
        description: data.description as string | undefined,
        location: data.location as string | undefined,
        time: data.time as string | undefined,
      });

      const { data: activity, error } = await supabase
        .from("activities")
        .insert({
          day_id: day.id,
          time: data.time,
          end_time: data.end_time,
          title: data.title,
          description: data.description,
          location: data.location,
          location_url: data.location_url,
          tips: data.tips,
          tags: data.tags || [],
          status: "CONFIRMED",
          order: maxOrder + 1,
          booking_id: bookingId, // Smart linked booking
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      return { tool, result: "created", id: activity.id, linkedBookingId: bookingId || undefined };
    }

    case "update_activity": {
      const updateData: Record<string, unknown> = {};
      if (data.time !== undefined) updateData.time = data.time;
      if (data.end_time !== undefined) updateData.end_time = data.end_time;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.location_url !== undefined) updateData.location_url = data.location_url;
      if (data.tips !== undefined) updateData.tips = data.tips;
      if (data.tags !== undefined) updateData.tags = data.tags;

      // Verify activity belongs to this trip
      const { data: activity, error: fetchError } = await supabase
        .from("activities")
        .select("day_id, itinerary_days!inner(trip_id)")
        .eq("id", data.activity_id)
        .single();

      if (fetchError || !activity) throw new Error("Activity not found");

      const { error } = await supabase
        .from("activities")
        .update(updateData)
        .eq("id", data.activity_id);

      if (error) throw new Error(error.message);
      return { tool, result: "updated", id: data.activity_id as string };
    }

    case "delete_activity": {
      // Validate activity_id is a UUID
      const activityId = data.activity_id as string;
      if (!activityId || activityId.includes("T") || activityId.match(/^\d{4}-\d{2}-\d{2}/)) {
        throw new Error("Invalid activity_id: expected a UUID. Use the activity's UUID from the context.");
      }

      // Verify activity belongs to this trip
      const { data: activity, error: fetchError } = await supabase
        .from("activities")
        .select("day_id, itinerary_days!inner(trip_id)")
        .eq("id", activityId)
        .single();

      // If activity doesn't exist, it may have been deleted with its parent day - treat as success
      if (fetchError || !activity) {
        return { tool, result: "deleted", id: activityId };
      }

      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);

      if (error) throw new Error(error.message);
      return { tool, result: "deleted", id: activityId };
    }

    case "move_activity": {
      // Find the target day
      const { data: targetDay, error: dayError } = await supabase
        .from("itinerary_days")
        .select("id")
        .eq("trip_id", tripId)
        .eq("day_number", data.to_day_number)
        .single();

      if (dayError || !targetDay) throw new Error("Target day not found");

      // Get current max order for the target day
      const { data: existingActivities } = await supabase
        .from("activities")
        .select("order")
        .eq("day_id", targetDay.id)
        .order("order", { ascending: false })
        .limit(1);

      const newOrder = data.new_order || (existingActivities?.[0]?.order || 0) + 1;

      const { error } = await supabase
        .from("activities")
        .update({
          day_id: targetDay.id,
          order: newOrder,
        })
        .eq("id", data.activity_id);

      if (error) throw new Error(error.message);
      return { tool, result: "updated", id: data.activity_id as string };
    }

    case "delete_booking": {
      const bookingId = data.booking_id as string;
      if (!bookingId) {
        throw new Error("booking_id is required");
      }

      // Verify booking belongs to this trip
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("id", bookingId)
        .eq("trip_id", tripId)
        .single();

      // If booking doesn't exist, treat as already deleted
      if (!booking) {
        return { tool, result: "deleted", id: bookingId };
      }

      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId)
        .eq("trip_id", tripId);

      if (error) throw new Error(error.message);
      return { tool, result: "deleted", id: bookingId };
    }

    case "delete_all_bookings": {
      const bookingType = data.booking_type as string;

      let query = supabase
        .from("bookings")
        .delete()
        .eq("trip_id", tripId);

      if (bookingType && bookingType !== "ALL") {
        query = query.eq("type", bookingType);
      }

      const { error } = await query;
      if (error) throw new Error(error.message);
      return { tool, result: "deleted" };
    }

    case "delete_todo": {
      const todoId = data.todo_id as string;
      if (!todoId) {
        throw new Error("todo_id is required");
      }

      // Verify todo belongs to this trip
      const { data: todo } = await supabase
        .from("trip_todos")
        .select("id")
        .eq("id", todoId)
        .eq("trip_id", tripId)
        .single();

      // If todo doesn't exist, treat as already deleted
      if (!todo) {
        return { tool, result: "deleted", id: todoId };
      }

      const { error } = await supabase
        .from("trip_todos")
        .delete()
        .eq("id", todoId)
        .eq("trip_id", tripId);

      if (error) throw new Error(error.message);
      return { tool, result: "deleted", id: todoId };
    }

    case "delete_all_todos": {
      const category = data.category as string | undefined;

      let query = supabase
        .from("trip_todos")
        .delete()
        .eq("trip_id", tripId);

      if (category) {
        query = query.eq("category", category);
      }

      const { error } = await query;
      if (error) throw new Error(error.message);
      return { tool, result: "deleted" };
    }

    case "generate_packing_list": {
      const items = data.items as Array<{ category: string; item: string }>;

      // Delete existing packing items for this trip first
      await supabase
        .from("packing_items")
        .delete()
        .eq("trip_id", tripId);

      // Insert new packing items
      const packingItems = items.map((item, index) => ({
        trip_id: tripId,
        category: item.category,
        item: item.item,
        checked: false,
        order: index + 1,
      }));

      const { error } = await supabase
        .from("packing_items")
        .insert(packingItems);

      if (error) throw new Error(error.message);
      return { tool, result: "created" };
    }

    case "generate_phrases": {
      const phrases = data.phrases as Array<{
        english: string;
        local_text: string;
        pronunciation?: string;
      }>;

      // Delete existing phrases for this trip first
      await supabase
        .from("phrases")
        .delete()
        .eq("trip_id", tripId);

      // Insert new phrases
      const phraseItems = phrases.map((phrase, index) => ({
        trip_id: tripId,
        english: phrase.english,
        local_text: phrase.local_text,
        pronunciation: phrase.pronunciation,
        order: index + 1,
      }));

      const { error } = await supabase
        .from("phrases")
        .insert(phraseItems);

      if (error) throw new Error(error.message);
      return { tool, result: "created" };
    }

    case "update_trip_dates": {
      const updateData: Record<string, unknown> = {};
      if (data.start_date) updateData.start_date = data.start_date;
      if (data.end_date) updateData.end_date = data.end_date;

      if (Object.keys(updateData).length === 0) {
        throw new Error("No dates provided to update");
      }

      // Update the trip dates
      const { data: updatedTrip, error: updateError } = await supabase
        .from("trips")
        .update(updateData)
        .eq("id", tripId)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);

      // If start_date changed, recalculate all itinerary day dates
      if (data.start_date) {
        const newStartDate = new Date(data.start_date as string);

        // Get all days for this trip
        const { data: days } = await supabase
          .from("itinerary_days")
          .select("id, day_number")
          .eq("trip_id", tripId)
          .order("day_number", { ascending: true });

        if (days && days.length > 0) {
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

      // Check for booking conflicts (date and location)
      const warnings: string[] = [];
      const suggestions: AgentSuggestion[] = [];
      const newStartDate = new Date(updatedTrip.start_date);
      const newEndDate = new Date(updatedTrip.end_date);
      const tripDestinations = (updatedTrip.destinations as string[]) || [];

      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, type, airline, flight_number, hotel_name, departure_time, arrival_time, check_in, check_out, departure_airport, arrival_airport, address")
        .eq("trip_id", tripId);

      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          let hasDateConflict = false;
          let hasLocationConflict = false;

          if (booking.type === "FLIGHT") {
            const departureDate = booking.departure_time ? new Date(booking.departure_time) : null;
            const arrivalDate = booking.arrival_time ? new Date(booking.arrival_time) : null;
            const flightDesc = `${booking.airline || ""} ${booking.flight_number || ""}`.trim() || "Flight";

            // Check date conflicts
            if (departureDate && (departureDate < newStartDate || departureDate > newEndDate)) {
              warnings.push(`⚠️ ${flightDesc} departs on ${departureDate.toISOString().split("T")[0]} - outside new trip dates`);
              hasDateConflict = true;
            }
            if (arrivalDate && (arrivalDate < newStartDate || arrivalDate > newEndDate)) {
              warnings.push(`⚠️ ${flightDesc} arrives on ${arrivalDate.toISOString().split("T")[0]} - outside new trip dates`);
              hasDateConflict = true;
            }

            // Check location conflicts - arrival airport should match one of the destinations
            if (booking.arrival_airport && tripDestinations.length > 0) {
              const arrivalAirport = booking.arrival_airport.toLowerCase();
              const matchesDestination = tripDestinations.some(dest => {
                const destLower = dest.toLowerCase();
                // Check if airport code or city name is in destinations
                return destLower.includes(arrivalAirport) ||
                       arrivalAirport.includes(destLower) ||
                       isAirportInDestination(arrivalAirport, destLower);
              });
              if (!matchesDestination) {
                warnings.push(`⚠️ ${flightDesc} arrives at ${booking.arrival_airport} - doesn't match trip destinations (${tripDestinations.join(", ")})`);
                hasLocationConflict = true;
              }
            }

            // Add suggestion to remove if there's a conflict
            if (hasDateConflict || hasLocationConflict) {
              suggestions.push({
                type: "remove_booking",
                title: `Remove ${flightDesc}?`,
                description: hasLocationConflict
                  ? `This flight goes to ${booking.arrival_airport}, which doesn't match your trip to ${tripDestinations.join(", ")}`
                  : `This flight is scheduled outside your new trip dates`,
                data: { bookingId: booking.id, bookingType: "FLIGHT", description: flightDesc },
              });
            }
          } else if (booking.type === "HOTEL") {
            const checkInDate = booking.check_in ? new Date(booking.check_in) : null;
            const checkOutDate = booking.check_out ? new Date(booking.check_out) : null;
            const hotelDesc = booking.hotel_name || "Hotel";

            // Check date conflicts
            if (checkInDate && (checkInDate < newStartDate || checkInDate > newEndDate)) {
              warnings.push(`⚠️ ${hotelDesc} check-in on ${checkInDate.toISOString().split("T")[0]} - outside new trip dates`);
              hasDateConflict = true;
            }
            if (checkOutDate && (checkOutDate < newStartDate || checkOutDate > newEndDate)) {
              warnings.push(`⚠️ ${hotelDesc} check-out on ${checkOutDate.toISOString().split("T")[0]} - outside new trip dates`);
              hasDateConflict = true;
            }

            // Check location conflicts for hotels
            if (booking.address && tripDestinations.length > 0) {
              const hotelAddress = booking.address.toLowerCase();
              const matchesDestination = tripDestinations.some(dest => {
                const destLower = dest.toLowerCase();
                return hotelAddress.includes(destLower) || destLower.includes(hotelAddress.split(",")[0]);
              });
              if (!matchesDestination) {
                warnings.push(`⚠️ ${hotelDesc} is located at "${booking.address}" - doesn't seem to match trip destinations (${tripDestinations.join(", ")})`);
                hasLocationConflict = true;
              }
            }

            // Add suggestion to remove if there's a conflict
            if (hasDateConflict || hasLocationConflict) {
              suggestions.push({
                type: "remove_booking",
                title: `Remove ${hotelDesc}?`,
                description: hasLocationConflict
                  ? `This hotel doesn't appear to be in ${tripDestinations.join(" or ")}`
                  : `This hotel booking is outside your new trip dates`,
                data: { bookingId: booking.id, bookingType: "HOTEL", description: hotelDesc },
              });
            }
          }
        }
      }

      return {
        tool,
        result: "updated",
        id: tripId,
        warnings: warnings.length > 0 ? warnings : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    }

    case "delete_all_packing": {
      // Delete all packing items for this trip
      const { error, count } = await supabase
        .from("packing_items")
        .delete()
        .eq("trip_id", tripId);

      if (error) throw error;

      return {
        tool,
        result: "deleted",
        id: tripId,
      };
    }

    case "delete_all_phrases": {
      // Delete all phrases for this trip
      const { error, count } = await supabase
        .from("phrases")
        .delete()
        .eq("trip_id", tripId);

      if (error) throw error;

      return {
        tool,
        result: "deleted",
        id: tripId,
      };
    }

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}
