import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOpenRouterClient, DEFAULT_MODEL } from "@/lib/agent/client";

interface GenerateContentRequest {
  contentType: "phrases" | "packing" | "emergency" | "todos" | "all";
  travelers?: Array<{
    name: string;
    age?: number;
    nationality?: string;
  }>;
  originCountry?: string;
}

const CONTENT_GENERATION_PROMPT = `You are a travel preparation assistant for GoVault. Generate personalized travel content based on the trip details provided.

IMPORTANT: Return ONLY valid JSON. Do not include any explanation text before or after the JSON.

Trip Details:
- Destination: {destinations}
- Dates: {startDate} to {endDate}
- Duration: {duration} days
- Travelers: {travelers}
- Origin Country: {originCountry}

Based on this information, generate the following content:

{contentRequest}

Return the response as a JSON object with the appropriate keys based on what was requested.`;

const PHRASES_PROMPT = `
"phrases": An array of 10-15 essential phrases for the destination. Each phrase should have:
  - "english": The English phrase
  - "local_text": The phrase in the local language/script
  - "pronunciation": How to pronounce it phonetically
Include: greetings, thank you, please, excuse me, how much, where is, help, numbers 1-5, yes/no, delicious/good`;

const PACKING_PROMPT = `
"packing": An array of packing items organized by category. Consider:
  - Season/weather at destination during travel dates
  - Local customs and dress codes (temple visits, religious sites)
  - Activities typical for the destination
  - Ages of travelers (baby items, senior needs)
  Each item: { "category": "essentials|documents|medical|electronics|clothing|baby|senior|beach_temple", "item": "item name" }
  Include 20-30 items covering all categories.`;

const EMERGENCY_PROMPT = `
"emergency": An array of emergency contacts for the destination:
  - Local emergency number (police, ambulance)
  - Tourist police
  - Nearest embassy/consulate for traveler's origin country
  - Hospital recommendations
  Each: { "category": "emergency|hospital|embassy|police", "label": "Name", "phone": "number", "notes": "optional notes" }`;

const TODOS_PROMPT = `
"todos": An array of pre-trip todos considering:
  - Visa requirements for {originCountry} citizens traveling to {destinations}
  - Currency exchange recommendations
  - Travel insurance
  - Vaccination/health requirements
  - Registration with embassy
  - Phone/data plans
  - Booking recommendations
  Each: { "category": "documents|bookings|health|money|packing", "title": "todo item", "description": "optional details", "priority": "HIGH|MEDIUM|LOW" }`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body: GenerateContentRequest = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch trip details
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, name, start_date, end_date, destinations, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Fetch existing travelers from the trip
    const { data: existingTravelers } = await supabase
      .from("travelers")
      .select("name, email")
      .eq("trip_id", tripId);

    // Calculate trip duration
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Build traveler info
    type TravelerInfo = { name: string; age?: number; nationality?: string };
    const travelers: TravelerInfo[] = body.travelers && body.travelers.length > 0
      ? body.travelers
      : existingTravelers?.map(t => ({ name: t.name })) || [{ name: "Adult traveler" }];

    const travelerDescription = travelers
      .map((t: TravelerInfo) => {
        let desc = t.name;
        if (t.age) desc += ` (age ${t.age})`;
        if (t.nationality) desc += ` from ${t.nationality}`;
        return desc;
      })
      .join(", ");

    // Build content request based on type
    let contentRequest = "";
    if (body.contentType === "all") {
      contentRequest = [PHRASES_PROMPT, PACKING_PROMPT, EMERGENCY_PROMPT, TODOS_PROMPT].join("\n\n");
    } else if (body.contentType === "phrases") {
      contentRequest = PHRASES_PROMPT;
    } else if (body.contentType === "packing") {
      contentRequest = PACKING_PROMPT;
    } else if (body.contentType === "emergency") {
      contentRequest = EMERGENCY_PROMPT;
    } else if (body.contentType === "todos") {
      contentRequest = TODOS_PROMPT;
    }

    // Replace placeholders
    const destinations = trip.destinations?.join(", ") || "Unknown";
    const originCountry = body.originCountry || "United States";

    const prompt = CONTENT_GENERATION_PROMPT
      .replace("{destinations}", destinations)
      .replace("{startDate}", trip.start_date)
      .replace("{endDate}", trip.end_date)
      .replace("{duration}", String(duration))
      .replace("{travelers}", travelerDescription)
      .replace("{originCountry}", originCountry)
      .replace("{contentRequest}", contentRequest)
      .replace(/\{originCountry\}/g, originCountry)
      .replace(/\{destinations\}/g, destinations);

    // Call OpenRouter
    const openai = createOpenRouterClient();
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a travel preparation expert. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    // Parse the JSON response
    let generatedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse generated content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      tripInfo: {
        destinations,
        duration,
        startDate: trip.start_date,
        endDate: trip.end_date,
      },
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
