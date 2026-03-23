import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/trips/[tripId]/travelers/[travelerId] - Update a traveler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; travelerId: string }> }
) {
  const { tripId, travelerId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns this trip
  const { data: trip } = await supabase
    .from("trips")
    .select("owner_id")
    .eq("id", tripId)
    .single();

  if (!trip || trip.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, type, age, email, phone, dietary, mobility, notes } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (age !== undefined) updateData.age = age;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (dietary !== undefined) updateData.dietary = dietary;
  if (mobility !== undefined) updateData.mobility = mobility;
  if (notes !== undefined) updateData.notes = notes;

  const { data, error } = await supabase
    .from("travelers")
    .update(updateData)
    .eq("id", travelerId)
    .eq("trip_id", tripId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/trips/[tripId]/travelers/[travelerId] - Remove a traveler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; travelerId: string }> }
) {
  const { tripId, travelerId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns this trip
  const { data: trip } = await supabase
    .from("trips")
    .select("owner_id")
    .eq("id", tripId)
    .single();

  if (!trip || trip.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("travelers")
    .delete()
    .eq("id", travelerId)
    .eq("trip_id", tripId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
