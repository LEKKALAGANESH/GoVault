import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

// GET /api/trips/[tripId]/documents/[documentId] - Get a single document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; documentId: string }> }
) {
  const { tripId, documentId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
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

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("trip_id", tripId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Generate signed URL for the document (1 hour expiry)
  const serviceClient = createServiceClient();
  let storagePath = data.storage_path;
  if (!storagePath && data.file_url) {
    // Legacy: extract path from public URL
    const pathMatch = data.file_url.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
    storagePath = pathMatch ? pathMatch[1] : null;
  }

  if (storagePath) {
    const { data: signedUrlData } = await serviceClient.storage
      .from("documents")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    return NextResponse.json({
      ...data,
      file_url: signedUrlData?.signedUrl || data.file_url,
    });
  }

  return NextResponse.json(data);
}

// PATCH /api/trips/[tripId]/documents/[documentId] - Update document metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; documentId: string }> }
) {
  const { tripId, documentId } = await params;
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

  const serviceClient = createServiceClient();

  const body = await request.json();
  const { name, category, booking_id } = body;

  const updates: Record<string, string | null> = {};
  if (name !== undefined) updates.name = name;
  if (category !== undefined) updates.category = category;
  if (booking_id !== undefined) updates.booking_id = booking_id;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await serviceClient
    .from("documents")
    .update(updates)
    .eq("id", documentId)
    .eq("trip_id", tripId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/trips/[tripId]/documents/[documentId] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; documentId: string }> }
) {
  const { tripId, documentId } = await params;
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

  const serviceClient = createServiceClient();

  // Get document to find storage path
  const { data: document } = await serviceClient
    .from("documents")
    .select("file_url, storage_path")
    .eq("id", documentId)
    .eq("trip_id", tripId)
    .single();

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Get storage path (prefer storage_path, fallback to extracting from URL for legacy docs)
  let storagePath = document.storage_path;
  if (!storagePath && document.file_url) {
    // Legacy: extract path from public URL
    try {
      const url = new URL(document.file_url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
      storagePath = pathMatch ? pathMatch[1] : null;
    } catch {
      // URL parsing failed, skip storage deletion
    }
  }

  if (storagePath) {
    // Delete from storage
    const { error: storageError } = await serviceClient.storage
      .from("documents")
      .remove([storagePath]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Continue with DB delete even if storage delete fails
    }
  }

  // Delete from database
  const { error } = await serviceClient
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("trip_id", tripId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
