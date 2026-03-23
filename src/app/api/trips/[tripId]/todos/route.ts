import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface TodoInput {
  title: string;
  category?: string;
  description?: string;
  due_date?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
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

    // Get the max order for this category
    const todos: TodoInput[] = body.todos || [];
    if (todos.length === 0) {
      return NextResponse.json(
        { error: "No todos provided" },
        { status: 400 }
      );
    }

    // Get current max order for the trip
    const { data: existingTodos } = await supabase
      .from("trip_todos")
      .select("order")
      .eq("trip_id", tripId)
      .order("order", { ascending: false })
      .limit(1);

    let nextOrder = (existingTodos?.[0]?.order ?? -1) + 1;

    // Create the todos
    const todosToInsert = todos.map((todo) => ({
      trip_id: tripId,
      title: todo.title,
      category: todo.category || "bookings",
      description: todo.description || null,
      due_date: todo.due_date || null,
      priority: todo.priority || "MEDIUM",
      completed: false,
      order: nextOrder++,
    }));

    const { data: createdTodos, error: insertError } = await supabase
      .from("trip_todos")
      .insert(todosToInsert)
      .select();

    if (insertError) {
      console.error("Error creating todos:", insertError);
      return NextResponse.json(
        { error: "Failed to create todos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      todos: createdTodos,
      count: createdTodos?.length || 0,
    });
  } catch (error) {
    console.error("Todos creation error:", error);
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

    // Verify trip access (owner or traveler)
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
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

    const { data: todos, error: fetchError } = await supabase
      .from("trip_todos")
      .select("*")
      .eq("trip_id", tripId)
      .order("order", { ascending: true });

    if (fetchError) {
      console.error("Error fetching todos:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch todos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, todos });
  } catch (error) {
    console.error("Todos fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
