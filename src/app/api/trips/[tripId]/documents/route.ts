import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

// GET /api/trips/[tripId]/documents - Get all documents for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
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
    .eq("trip_id", tripId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }

  // Generate signed URLs for each document (1 hour expiry)
  const serviceClient = createServiceClient();
  const documentsWithSignedUrls = await Promise.all(
    (data || []).map(async (doc) => {
      // Extract storage path from the stored URL or use storage_path if available
      let storagePath = doc.storage_path;
      if (!storagePath && doc.file_url) {
        // Legacy: extract path from public URL
        const pathMatch = doc.file_url.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
        storagePath = pathMatch ? pathMatch[1] : null;
      }

      if (storagePath) {
        const { data: signedUrlData } = await serviceClient.storage
          .from("documents")
          .createSignedUrl(storagePath, 3600); // 1 hour expiry

        return {
          ...doc,
          file_url: signedUrlData?.signedUrl || doc.file_url,
        };
      }
      return doc;
    })
  );

  return NextResponse.json(documentsWithSignedUrls);
}

// POST /api/trips/[tripId]/documents - Upload a new document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
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

  // Use service client for storage/DB operations (bypasses RLS since we verified ownership above)
  const serviceClient = createServiceClient();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const category = formData.get("category") as string | null;
    const bookingId = formData.get("booking_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPG, PNG, WebP, HEIC" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "pdf";
    const safeFileName = name.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50);
    const folder = bookingId || "general";
    const storagePath = `${tripId}/${folder}/${timestamp}-${safeFileName}.${extension}`;

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (using service client to bypass RLS)
    const { error: uploadError } = await serviceClient.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Generate a signed URL for immediate use (1 hour expiry)
    const { data: signedUrlData } = await serviceClient.storage
      .from("documents")
      .createSignedUrl(storagePath, 3600);

    // Create document record in database with storage path (not public URL)
    const { data: document, error: dbError } = await serviceClient
      .from("documents")
      .insert({
        trip_id: tripId,
        booking_id: bookingId || null,
        name,
        file_url: signedUrlData?.signedUrl || storagePath, // Signed URL for immediate response
        storage_path: storagePath, // Store path for future signed URL generation
        file_type: file.type,
        category: category || "OTHER",
      })
      .select()
      .single();

    if (dbError) {
      // Try to clean up uploaded file if DB insert fails
      await serviceClient.storage.from("documents").remove([storagePath]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
