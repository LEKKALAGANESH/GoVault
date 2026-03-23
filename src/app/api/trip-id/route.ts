import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("id, name")
    .eq("name", "Thailand 2026")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "No trip found with name 'Thailand 2026'" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: data.name,
    id: data.id,
  });
}

