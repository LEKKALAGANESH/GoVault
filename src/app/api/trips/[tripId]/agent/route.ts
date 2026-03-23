import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOpenRouterClient, DEFAULT_MODEL, VISION_MODEL } from "@/lib/agent/client";
import { getToolsForAction } from "@/lib/agent/tools";
import { DOCUMENT_PARSE_PROMPT, ITINERARY_PARSE_PROMPT, getEditPrompt, getPackingPrompt, getPhrasesPrompt, getDocumentParsePromptWithContext, generateItineraryPromptForUser, type PackingContext, type DocumentParseContext, type ItineraryPromptContext } from "@/lib/agent/prompts";
import type { AgentRequest, AgentResponse, AgentSuggestion, ProposedChange, TripContext } from "@/lib/agent/types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Helper function to parse PDF using unpdf (better Next.js compatibility)
async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; numpages: number }> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8Array);
  const { text } = await extractText(pdf, { mergePages: true });
  return { text, numpages: pdf.numPages };
}

// Structured logging for agent usage analytics
function logAgentEvent(event: string, data: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    service: "trip-agent",
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
  let action: string | null = null;

  try {
    const { tripId } = await params;
    const body: AgentRequest = await request.json();
    action = body.action;

    logAgentEvent("request_received", {
      tripId,
      action: body.action,
      hasDocument: !!body.document,
      textLength: body.text?.length || 0,
      documentMimeType: body.document?.mimeType,
      documentFilename: body.document?.filename,
    });

    // Verify user is authenticated and owns the trip
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logAgentEvent("auth_failed", { tripId, reason: "no_user" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;
    logAgentEvent("user_authenticated", { tripId, userId: user.id, userEmail: user.email });

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, name, start_date, end_date, destinations, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.owner_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to edit this trip" }, { status: 403 });
    }

    // Initialize OpenRouter client
    const openai = createOpenRouterClient();

    // Get appropriate tools and prompt based on action type
    const tools = getToolsForAction(body.action);
    let systemPrompt: string;
    const messages: ChatCompletionMessageParam[] = [];

    // Track if this is a PDF that needs text extraction (not vision)
    let isPdfDocument = false;

    // Fetch travelers count for context
    const { data: travelers } = await supabase
      .from("travelers")
      .select("id, name, type, age")
      .eq("trip_id", tripId);

    const travelerCount = travelers?.length || 0;

    switch (body.action) {
      case "PARSE_DOCUMENT": {
        if (!body.document) {
          return NextResponse.json({ error: "Document is required for PARSE_DOCUMENT action" }, { status: 400 });
        }

        // Use context-aware prompt for validation
        const docContext: DocumentParseContext = {
          tripName: trip.name,
          destinations: trip.destinations || [],
          startDate: trip.start_date,
          endDate: trip.end_date,
          travelerCount,
        };
        systemPrompt = getDocumentParsePromptWithContext(docContext);

        // Check if document is a PDF - extract text instead of using vision
        if (body.document.mimeType === "application/pdf") {
          isPdfDocument = true;
          try {
            // Decode base64 to buffer and extract text
            const pdfBuffer = Buffer.from(body.document.base64, "base64");
            const pdfData = await parsePdfBuffer(pdfBuffer);
            const pdfText = pdfData.text;

            logAgentEvent("pdf_text_extracted", {
              tripId,
              filename: body.document.filename,
              textLength: pdfText.length,
              numPages: pdfData.numpages,
            });

            // Use text-based parsing for PDFs
            messages.push({
              role: "user",
              content: `Please extract the booking information from this document text:\n\n${pdfText}`,
            });
          } catch (pdfError) {
            logAgentEvent("pdf_parse_error", {
              tripId,
              filename: body.document.filename,
              error: pdfError instanceof Error ? pdfError.message : "Unknown error",
            });
            return NextResponse.json({
              success: false,
              message: "Couldn't read that PDF. Try uploading a screenshot or image version instead (PNG, JPG) 📄",
              proposedChanges: [],
            } as AgentResponse);
          }
        } else {
          // For images, use vision model
          messages.push({
            role: "user",
            content: [
              {
                type: "text",
                text: "Please extract the booking information from this document.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${body.document.mimeType};base64,${body.document.base64}`,
                },
              },
            ],
          });
        }
        break;
      }

      case "PARSE_ITINERARY": {
        // Sequential extraction with priority order:
        // 1. ITINERARY (days + activities) - PRIMARY, always extract first
        // 2. PACKING LIST - Extract from text + enhance with AI suggestions
        // 3. PHRASES - Extract from text + enhance with AI suggestions
        if (!body.text) {
          return NextResponse.json({ error: "Text is required for PARSE_ITINERARY action" }, { status: 400 });
        }

        const text = body.text;
        const parseModel = DEFAULT_MODEL;
        const allToolCalls: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> = [];

        // Content detection
        const hasDayContent = /day\s*\d|day\s*one|day\s*two|first\s*day|itinerary|schedule|morning|afternoon|evening/i.test(text);
        const hasPackingContent = /packing|pack|bring|essentials|luggage|items?\s*to\s*bring|clothing|toiletries/i.test(text);
        const hasPhrasesContent = /phrases|language|how\s*to\s*say|useful\s*words|local\s*expressions|sinhala|thai|hindi|basic\s*words/i.test(text);

        // Detect destination from text for enhancing packing/phrases
        const destinationMatch = text.match(/(?:trip to|visiting|going to|travel(?:ing)? to|in)\s+([A-Z][a-zA-Z\s]+?)(?:\s*[-–]\s*|\s*\n|$)/i);
        const detectedDestination = destinationMatch?.[1]?.trim() || trip.destinations?.[0] || "";

        console.log(`[Agent] Content detection - Days: ${hasDayContent}, Packing: ${hasPackingContent}, Phrases: ${hasPhrasesContent}`);
        console.log(`[Agent] Detected destination: ${detectedDestination || "unknown"}`);

        // ============================================================
        // PRIORITY 1: ITINERARY (days and activities)
        // This is the main content - always extract first
        // ============================================================
        if (hasDayContent) {
          console.log(`[Agent] PRIORITY 1: Extracting itinerary days...`);
          try {
            const itineraryTools = tools?.filter(t => t.type === "function" && t.function.name === "parse_itinerary_text");
            const itineraryCompletion = await openai.chat.completions.create({
              model: parseModel,
              messages: [
                {
                  role: "system",
                  content: `You are an itinerary parser. Extract the day-by-day schedule from travel text.

For each day, extract:
- day_number: The day number (1, 2, 3...)
- date: Date if mentioned (YYYY-MM-DD format)
- title: A descriptive title (e.g., "Arrival in Colombo", "Beach Day")
- location: Main location/city
- summary: Brief description of the day
- activities: Array of activities with time, title, description, location, tips

TIME CONVERSION - Convert vague times to 24-hour format:
- "Morning" → "09:00"
- "Afternoon" → "14:00"
- "Evening" → "18:00"
- "Breakfast" → "08:00"
- "Lunch" → "12:30"
- "Dinner" → "19:00"

Call parse_itinerary_text with ALL days in a single call.`
                },
                { role: "user", content: `Extract all days and activities from this itinerary:\n\n${text}` }
              ],
              tools: itineraryTools,
              tool_choice: { type: "function", function: { name: "parse_itinerary_text" } },
            });

            const calls = itineraryCompletion.choices[0]?.message?.tool_calls || [];
            if (calls.length > 0 && calls[0].type === "function") {
              allToolCalls.push({
                id: calls[0].id,
                type: "function",
                function: { name: calls[0].function.name, arguments: calls[0].function.arguments }
              });
              const args = JSON.parse(calls[0].function.arguments);
              console.log(`[Agent] ✓ Extracted ${args.days?.length || 0} days from itinerary`);
            }
          } catch (error) {
            console.error(`[Agent] ✗ Itinerary extraction failed:`, error);
          }
        }

        // ============================================================
        // PRIORITY 2: PACKING LIST
        // Step A: Extract items mentioned in the text
        // Step B: Enhance with AI suggestions for the destination
        // Step C: Combine into one consolidated list
        // ============================================================
        if (hasPackingContent) {
          console.log(`[Agent] PRIORITY 2: Processing packing list...`);

          let extractedItems: Array<{ category: string; item: string }> = [];
          let suggestedItems: Array<{ category: string; item: string }> = [];

          // Step A: Extract items explicitly mentioned in the text
          console.log(`[Agent]   Step A: Extracting packing items from text...`);
          try {
            const packingTools = tools?.filter(t => t.type === "function" && t.function.name === "generate_packing_list");
            const extractCompletion = await openai.chat.completions.create({
              model: parseModel,
              messages: [
                {
                  role: "system",
                  content: `Extract ONLY the packing items that are explicitly mentioned in the text. Do not add your own suggestions.

For each item found, specify:
- category: One of (Clothing, Toiletries, Electronics, Documents, Health & Safety, Beach/Temple, Miscellaneous)
- item: The exact item name from the text`
                },
                { role: "user", content: `Extract all packing items mentioned in this text:\n\n${text}` }
              ],
              tools: packingTools,
              tool_choice: { type: "function", function: { name: "generate_packing_list" } },
            });

            const calls = extractCompletion.choices[0]?.message?.tool_calls || [];
            if (calls.length > 0 && calls[0].type === "function") {
              const args = JSON.parse(calls[0].function.arguments);
              extractedItems = args.items || [];
              console.log(`[Agent]   ✓ Extracted ${extractedItems.length} items from text`);
            }
          } catch (error) {
            console.error(`[Agent]   ✗ Packing extraction failed:`, error);
          }

          // Step B: Get AI suggestions for the destination (if we know the destination)
          if (detectedDestination) {
            console.log(`[Agent]   Step B: Getting AI suggestions for ${detectedDestination}...`);
            try {
              const packingTools = tools?.filter(t => t.type === "function" && t.function.name === "generate_packing_list");
              const suggestCompletion = await openai.chat.completions.create({
                model: parseModel,
                messages: [
                  {
                    role: "system",
                    content: `You are a travel packing expert. Suggest essential packing items for the destination.

Consider:
- Climate and weather
- Cultural requirements (temple visits, dress codes)
- Common travel needs
- Health and safety items

For each item, specify:
- category: One of (Clothing, Toiletries, Electronics, Documents, Health & Safety, Beach/Temple, Miscellaneous)
- item: The item name

Suggest 15-25 essential items.`
                  },
                  { role: "user", content: `Suggest essential packing items for a trip to ${detectedDestination}.` }
                ],
                tools: packingTools,
                tool_choice: { type: "function", function: { name: "generate_packing_list" } },
              });

              const calls = suggestCompletion.choices[0]?.message?.tool_calls || [];
              if (calls.length > 0 && calls[0].type === "function") {
                const args = JSON.parse(calls[0].function.arguments);
                suggestedItems = args.items || [];
                console.log(`[Agent]   ✓ AI suggested ${suggestedItems.length} additional items`);
              }
            } catch (error) {
              console.error(`[Agent]   ✗ Packing suggestions failed:`, error);
            }
          }

          // Step C: Combine and deduplicate
          console.log(`[Agent]   Step C: Combining and deduplicating...`);
          const seenItems = new Set<string>();
          const combinedItems: Array<{ category: string; item: string }> = [];

          // Add extracted items first (user's items take priority)
          for (const item of extractedItems) {
            const key = item.item.toLowerCase().trim();
            if (!seenItems.has(key)) {
              seenItems.add(key);
              combinedItems.push(item);
            }
          }

          // Add suggested items that aren't duplicates
          for (const item of suggestedItems) {
            const key = item.item.toLowerCase().trim();
            if (!seenItems.has(key)) {
              seenItems.add(key);
              combinedItems.push(item);
            }
          }

          console.log(`[Agent]   ✓ Final packing list: ${combinedItems.length} items (${extractedItems.length} from text + ${combinedItems.length - extractedItems.length} AI suggestions)`);

          // Add to tool calls
          if (combinedItems.length > 0) {
            allToolCalls.push({
              id: `packing-${Date.now()}`,
              type: "function",
              function: {
                name: "generate_packing_list",
                arguments: JSON.stringify({ items: combinedItems })
              }
            });
          }
        }

        // ============================================================
        // PRIORITY 3: PHRASES
        // Step A: Extract phrases mentioned in the text
        // Step B: Enhance with AI suggestions for the destination
        // Step C: Combine into one consolidated list
        // ============================================================
        if (hasPhrasesContent) {
          console.log(`[Agent] PRIORITY 3: Processing phrases...`);

          let extractedPhrases: Array<{ english: string; local_text: string; pronunciation?: string }> = [];
          let suggestedPhrases: Array<{ english: string; local_text: string; pronunciation?: string }> = [];

          // Step A: Extract phrases explicitly mentioned in the text
          console.log(`[Agent]   Step A: Extracting phrases from text...`);
          try {
            const phrasesTools = tools?.filter(t => t.type === "function" && t.function.name === "generate_phrases");
            const extractCompletion = await openai.chat.completions.create({
              model: parseModel,
              messages: [
                {
                  role: "system",
                  content: `Extract ONLY the language phrases that are explicitly mentioned in the text. Do not add your own suggestions.

IMPORTANT - Use ROMANIZED text only, not native scripts:
- local_text: Use romanized/transliterated text that English speakers can read
- NEVER use native scripts - only Latin alphabet
- Examples: "Ayubowan" (Sinhala), "Gracias" (Spanish), "Bonjour" (French)
- pronunciation: Provide phonetic guide with syllable breaks

For each phrase found, extract:
- english: The English meaning
- local_text: ROMANIZED version of the phrase (Latin alphabet only)
- pronunciation: Phonetic pronunciation guide`
                },
                { role: "user", content: `Extract all local language phrases mentioned in this text:\n\n${text}` }
              ],
              tools: phrasesTools,
              tool_choice: { type: "function", function: { name: "generate_phrases" } },
            });

            const calls = extractCompletion.choices[0]?.message?.tool_calls || [];
            if (calls.length > 0 && calls[0].type === "function") {
              const args = JSON.parse(calls[0].function.arguments);
              extractedPhrases = args.phrases || [];
              console.log(`[Agent]   ✓ Extracted ${extractedPhrases.length} phrases from text`);
            }
          } catch (error) {
            console.error(`[Agent]   ✗ Phrases extraction failed:`, error);
          }

          // Step B: Get AI suggestions for the destination
          if (detectedDestination) {
            console.log(`[Agent]   Step B: Getting AI phrase suggestions for ${detectedDestination}...`);
            try {
              const phrasesTools = tools?.filter(t => t.type === "function" && t.function.name === "generate_phrases");
              const suggestCompletion = await openai.chat.completions.create({
                model: parseModel,
                messages: [
                  {
                    role: "system",
                    content: `You are a travel language expert. Suggest essential phrases for travelers.

Include phrases for:
- Greetings (hello, goodbye, thank you)
- Basic needs (water, food, bathroom)
- Directions (where is, left, right)
- Shopping (how much, too expensive)
- Emergency (help, hospital, police)

IMPORTANT - Use ROMANIZED text only, not native scripts:
- local_text: Use romanized/transliterated text that English speakers can read
- NEVER use native scripts - only Latin alphabet
- Examples: "Ayubowan" (Sinhala), "Gracias" (Spanish), "Bonjour" (French)
- pronunciation: Provide phonetic guide with syllable breaks

For each phrase, provide:
- english: The English meaning
- local_text: ROMANIZED version of the phrase (Latin alphabet only)
- pronunciation: Phonetic guide for English speakers

Suggest 10-15 essential phrases.`
                  },
                  { role: "user", content: `Suggest essential local language phrases for travelers visiting ${detectedDestination}.` }
                ],
                tools: phrasesTools,
                tool_choice: { type: "function", function: { name: "generate_phrases" } },
              });

              const calls = suggestCompletion.choices[0]?.message?.tool_calls || [];
              if (calls.length > 0 && calls[0].type === "function") {
                const args = JSON.parse(calls[0].function.arguments);
                suggestedPhrases = args.phrases || [];
                console.log(`[Agent]   ✓ AI suggested ${suggestedPhrases.length} additional phrases`);
              }
            } catch (error) {
              console.error(`[Agent]   ✗ Phrases suggestions failed:`, error);
            }
          }

          // Step C: Combine and deduplicate
          console.log(`[Agent]   Step C: Combining and deduplicating...`);
          const seenPhrases = new Set<string>();
          const combinedPhrases: Array<{ english: string; local_text: string; pronunciation?: string }> = [];

          // Add extracted phrases first (user's phrases take priority)
          for (const phrase of extractedPhrases) {
            const key = phrase.english.toLowerCase().trim();
            if (!seenPhrases.has(key)) {
              seenPhrases.add(key);
              combinedPhrases.push(phrase);
            }
          }

          // Add suggested phrases that aren't duplicates
          for (const phrase of suggestedPhrases) {
            const key = phrase.english.toLowerCase().trim();
            if (!seenPhrases.has(key)) {
              seenPhrases.add(key);
              combinedPhrases.push(phrase);
            }
          }

          console.log(`[Agent]   ✓ Final phrases list: ${combinedPhrases.length} phrases (${extractedPhrases.length} from text + ${combinedPhrases.length - extractedPhrases.length} AI suggestions)`);

          // Add to tool calls
          if (combinedPhrases.length > 0) {
            allToolCalls.push({
              id: `phrases-${Date.now()}`,
              type: "function",
              function: {
                name: "generate_phrases",
                arguments: JSON.stringify({ phrases: combinedPhrases })
              }
            });
          }
        }

        console.log(`[Agent] ============================================================`);
        console.log(`[Agent] EXTRACTION COMPLETE: ${allToolCalls.length} items (${allToolCalls.map(c => c.function.name).join(", ")})`);

        // Build response with all extracted tool calls
        const proposedChanges: ProposedChange[] = allToolCalls.map(toolCall => {
          const args = JSON.parse(toolCall.function.arguments);
          return {
            id: toolCall.id,
            tool: toolCall.function.name as ProposedChange["tool"],
            description: generateChangeDescription(toolCall.function.name, args),
            data: args,
          };
        });

        // Return response
        return NextResponse.json({
          success: true,
          message: proposedChanges.length > 0
            ? `Found ${proposedChanges.length} item(s) to add to your trip.`
            : "I couldn't spot any itinerary details in that text. Try pasting a day-by-day plan with dates and activities 📝",
          proposedChanges,
          suggestions: [],
        } as AgentResponse);
      }

      case "EDIT_ITINERARY":
        // Fetch current trip context
        const context = await getTripContext(supabase, tripId, trip);
        systemPrompt = getEditPrompt(context);
        if (!body.text) {
          return NextResponse.json({ error: "Text is required for EDIT_ITINERARY action" }, { status: 400 });
        }

        // Add conversation history for multi-turn context
        if (body.conversationHistory && body.conversationHistory.length > 0) {
          for (const historyMsg of body.conversationHistory) {
            messages.push({
              role: historyMsg.role,
              content: historyMsg.content,
            });
          }
        }

        // Add current user message
        messages.push({
          role: "user",
          content: body.text,
        });
        break;

      case "GENERATE_PACKING": {
        // Calculate trip duration
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Get travel month for seasonal packing
        const travelMonth = startDate.toLocaleString("en-US", { month: "long" });

        // Fetch travelers for this trip
        const { data: travelersData } = await supabase
          .from("travelers")
          .select("name, type, age")
          .eq("trip_id", tripId);

        // Fetch existing packing items
        const { data: existingPacking } = await supabase
          .from("packing_items")
          .select("category, item, packed")
          .eq("trip_id", tripId);

        const packingContext: PackingContext = {
          destinations: trip.destinations || [],
          tripDuration,
          travelMonth,
          travelers: travelersData?.map(t => ({
            name: t.name,
            type: t.type,
            age: t.age,
          })) || [{ name: "Traveler", type: "ADULT" }],
        };

        // Build a context-aware prompt
        let packingPromptContent = "Generate a packing checklist for this trip.";

        if (existingPacking && existingPacking.length > 0) {
          // Group existing items by category for the prompt
          const existingByCategory = existingPacking.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item.item);
            return acc;
          }, {} as Record<string, string[]>);

          const existingList = Object.entries(existingByCategory)
            .map(([cat, items]) => `${cat}: ${items.join(", ")}`)
            .join("\n");

          packingPromptContent = `The user already has ${existingPacking.length} packing items. Review their list and suggest any MISSING essential items they should add for ${trip.destinations?.join(", ") || "their trip"}.

EXISTING PACKING LIST:
${existingList}

Generate ONLY the missing/additional items that would complement their existing list. Focus on:
1. Destination-specific items they may have missed (cultural requirements, climate needs)
2. Essential travel items not in their list
3. Health & safety items

Do NOT include items they already have.`;
        }

        systemPrompt = getPackingPrompt(packingContext);
        messages.push({
          role: "user",
          content: packingPromptContent,
        });
        break;
      }

      case "GENERATE_PHRASES": {
        const phraseDestinations = trip.destinations || [];
        systemPrompt = getPhrasesPrompt(phraseDestinations);
        const destinationText = phraseDestinations.length > 0
          ? phraseDestinations.join(", ")
          : "the trip destination";
        messages.push({
          role: "user",
          content: `Generate essential local phrases for travelers visiting ${destinationText}. Use the local language(s) spoken there.`,
        });
        break;
      }

      case "GENERATE_TODOS": {
        // Use AI to intelligently analyze itinerary and generate comprehensive todos
        const { data: days } = await supabase
          .from("itinerary_days")
          .select("id, day_number, date, title, location, activities(id, time, title, description, location, tips, tags)")
          .eq("trip_id", tripId)
          .order("day_number");

        const { data: existingTodos } = await supabase
          .from("trip_todos")
          .select("title, category, completed")
          .eq("trip_id", tripId);

        const { data: existingBookings } = await supabase
          .from("bookings")
          .select("type, hotel_name, airline, flight_number, departure_airport, arrival_airport, check_in, check_out, departure_time")
          .eq("trip_id", tripId);

        const tripStartDate = new Date(trip.start_date);

        // Build itinerary context for AI analysis
        const itineraryContext = days?.map(day => {
          const dayDate = new Date(tripStartDate);
          dayDate.setDate(tripStartDate.getDate() + day.day_number - 1);
          return {
            day_number: day.day_number,
            date: dayDate.toISOString().split('T')[0],
            title: day.title,
            location: day.location,
            activities: (day.activities as Array<{ time?: string; title: string; description?: string; location?: string; tips?: string }>) || [],
          };
        }) || [];

        // Build existing bookings context
        const bookingsContext = existingBookings?.map(b => {
          if (b.type === "FLIGHT") {
            return `Flight: ${b.airline} ${b.flight_number} (${b.departure_airport}→${b.arrival_airport}) on ${b.departure_time?.split("T")[0] || "TBD"}`;
          } else if (b.type === "HOTEL") {
            return `Hotel: ${b.hotel_name} (${b.check_in} to ${b.check_out})`;
          }
          return `${b.type}: Unknown`;
        }).join("\n") || "No bookings yet";

        // Build existing todos context
        const todosContext = existingTodos?.map(t => `- ${t.title} (${t.category || "general"})${t.completed ? " ✓" : ""}`).join("\n") || "No existing todos";

        // Use AI to analyze and generate comprehensive todos
        const todoAnalysisPrompt = `Analyze this trip itinerary and generate a comprehensive list of things that need to be booked or prepared.

TRIP DETAILS:
- Destination: ${trip.destinations?.join(", ") || "Unknown"}
- Dates: ${trip.start_date} to ${trip.end_date}
- Duration: ${days?.length || 0} days

ITINERARY:
${JSON.stringify(itineraryContext, null, 2)}

ALREADY BOOKED:
${bookingsContext}

EXISTING TODOS:
${todosContext}

Generate todos for EVERYTHING that needs booking or preparation. Think comprehensively:

1. TRANSPORTATION:
   - Flights (if not booked and itinerary mentions arrival/departure)
   - Airport transfers (to/from airport to hotel)
   - Internal transfers between locations
   - Car rentals, private drivers, etc.

2. ACCOMMODATION:
   - Hotels/stays for each night (if not already booked)
   - Check if all nights are covered

3. ACTIVITIES & EXPERIENCES:
   - Safaris, tours, excursions (specify which one and where)
   - Cooking classes, diving, snorkeling
   - Museum tickets, attraction entries
   - Any "private" experiences (private tour, private class, etc.)

4. RESTAURANTS:
   - Popular/famous restaurants that may need reservations
   - Special dining experiences mentioned

5. PRACTICAL PREPARATION:
   - Visa requirements (if applicable for destination)
   - Travel insurance
   - Currency exchange
   - SIM card / data plan

For each todo, provide:
- title: Clear, specific title (e.g., "Book Private Jeep Safari at Udawalawe" not just "Book safari")
- day_number: Which day this is for (1, 2, 3...)
- priority: HIGH (book weeks ahead), MEDIUM (book days ahead), LOW (can do closer to date)
- book_by: When to book by (e.g., "2 weeks before trip", "1 week before", "day before")
- notes: Any helpful context (location, tips from itinerary, why it needs booking)
- category: "flights", "accommodation", "activities", "restaurants", "transport", "preparation"

IMPORTANT:
- Only suggest things NOT already in bookings or todos
- Be specific - include location/venue names from the itinerary
- For each activity, include WHEN it happens (Day X, date)

Return as JSON array of todo objects.`;

        try {
          const todoCompletion = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
              { role: "system", content: "You are a travel planning assistant. Analyze itineraries and generate comprehensive booking/preparation checklists. Return ONLY valid JSON array." },
              { role: "user", content: todoAnalysisPrompt }
            ],
            response_format: { type: "json_object" },
          });

          const todoResponse = todoCompletion.choices[0]?.message?.content || "{}";
          let parsedTodos: Array<{
            title: string;
            day_number?: number;
            priority: string;
            book_by?: string;
            notes?: string;
            category?: string;
          }> = [];

          try {
            const parsed = JSON.parse(todoResponse);
            parsedTodos = parsed.todos || parsed.items || (Array.isArray(parsed) ? parsed : []);
          } catch {
            console.error("[Agent] Failed to parse todo JSON:", todoResponse);
          }

          if (parsedTodos.length > 0) {
            // Convert to our todo format with proper dates
            const formattedTodos = parsedTodos.map(todo => {
              // Calculate due date based on day_number or book_by suggestion
              let dueDate = trip.start_date;
              if (todo.day_number && todo.day_number > 0) {
                const dayDate = new Date(tripStartDate);
                dayDate.setDate(tripStartDate.getDate() + todo.day_number - 1);
                dueDate = dayDate.toISOString().split('T')[0];
              }

              return {
                title: todo.title,
                due_date: dueDate,
                priority: todo.priority || "MEDIUM",
                category: todo.category || "bookings",
                notes: [
                  todo.notes,
                  todo.book_by ? `Book by: ${todo.book_by}` : null,
                  todo.day_number ? `Day ${todo.day_number}` : null,
                ].filter(Boolean).join(" | "),
              };
            });

            // Group by category for better presentation
            const byCategory = formattedTodos.reduce((acc, todo) => {
              const cat = todo.category || "other";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(todo);
              return acc;
            }, {} as Record<string, typeof formattedTodos>);

            const categoryDescriptions = Object.entries(byCategory)
              .map(([cat, todos]) => `${cat}: ${todos.length} items`)
              .join(", ");

            return NextResponse.json({
              success: true,
              message: `📋 Found **${formattedTodos.length} items** to book or prepare: ${categoryDescriptions}`,
              proposedChanges: [],
              suggestions: [{
                type: "create_todo",
                title: "Create booking & preparation checklist",
                description: `${formattedTodos.length} items: ${formattedTodos.slice(0, 5).map(t => t.title).join(", ")}${formattedTodos.length > 5 ? ` (+${formattedTodos.length - 5} more)` : ""}`,
                data: {
                  todos: formattedTodos,
                  category: "bookings",
                },
              }],
            } as AgentResponse);
          }
        } catch (error) {
          console.error("[Agent] Todo generation failed:", error);
        }

        // Fallback if AI analysis fails
        return NextResponse.json({
          success: true,
          message: existingTodos && existingTodos.length > 0
            ? `You already have ${existingTodos.length} todos. I couldn't find additional items to suggest.`
            : "I need a bit more to work with! Add some activities to your itinerary first, then I can suggest what to book 🗓️",
          proposedChanges: [],
        } as AgentResponse);
      }

      case "GENERATE_ITINERARY_PROMPT": {
        // Fetch bookings for context
        const { data: bookings } = await supabase
          .from("bookings")
          .select("type, airline, flight_number, departure_airport, arrival_airport, departure_time, hotel_name, check_in, check_out")
          .eq("trip_id", tripId);

        const bookingsList = (bookings || []).map(b => {
          if (b.type === "FLIGHT") {
            return {
              type: "Flight",
              details: `${b.airline} ${b.flight_number} ${b.departure_airport}→${b.arrival_airport} on ${b.departure_time?.split("T")[0] || "TBD"}`,
            };
          } else if (b.type === "HOTEL") {
            return {
              type: "Hotel",
              details: `${b.hotel_name} (${b.check_in} to ${b.check_out})`,
            };
          }
          return { type: b.type, details: "Booked" };
        });

        const promptContext: ItineraryPromptContext = {
          tripName: trip.name,
          destinations: trip.destinations || [],
          startDate: trip.start_date,
          endDate: trip.end_date,
          travelers: (travelers || []).map(t => ({
            name: t.name,
            type: t.type || "ADULT",
            age: t.age,
          })),
          bookings: bookingsList,
          preferences: body.text, // User can pass preferences
        };

        // Return the prompt directly without calling AI
        const generatedPrompt = generateItineraryPromptForUser(promptContext);

        return NextResponse.json({
          success: true,
          message: generatedPrompt,
          proposedChanges: [],
        } as AgentResponse);
      }

      default:
        return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Call OpenRouter API
    // Use vision model for image documents, default model for PDFs and text
    const model = (body.action === "PARSE_DOCUMENT" && !isPdfDocument) ? VISION_MODEL : DEFAULT_MODEL;

    // Log available tools for this action
    const toolNames = tools?.map(t => t.type === "function" ? t.function.name : "unknown") || [];

    logAgentEvent("ai_call_started", {
      tripId,
      userId,
      action: body.action,
      model,
      toolsCount: tools?.length || 0,
      availableTools: toolNames,
    });

    console.log(`[Agent] Available tools for ${body.action}: ${toolNames.join(", ")}`);

    const aiStartTime = Date.now();
    let completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      tools,
      tool_choice: "auto",
      parallel_tool_calls: true, // Enable multiple tool calls in a single response
    });
    let aiDuration = Date.now() - aiStartTime;

    // Log which tools were called
    let toolCallNames = completion.choices[0]?.message?.tool_calls?.filter(tc => tc.type === "function").map(tc => tc.function.name) || [];

    logAgentEvent("ai_call_completed", {
      tripId,
      userId,
      action: body.action,
      model,
      durationMs: aiDuration,
      hasToolCalls: !!completion.choices[0]?.message?.tool_calls?.length,
      toolCallsCount: completion.choices[0]?.message?.tool_calls?.length || 0,
      toolsCalled: toolCallNames,
      usage: completion.usage,
    });

    console.log(`[Agent] Tools called for ${body.action}: ${toolCallNames.join(", ") || "none"}`);

    const responseMessage = completion.choices[0]?.message;

    if (!responseMessage) {
      return NextResponse.json({
        success: false,
        message: "I didn't get a response this time. Please try again 🔄",
        proposedChanges: [],
      } as AgentResponse);
    }

    // Process tool calls into proposed changes
    const proposedChanges: ProposedChange[] = [];
    const suggestions: AgentSuggestion[] = [];
    const detectedLocations: string[] = [];

    // Helper to check if a string looks like a date instead of a UUID
    const looksLikeDate = (str: string): boolean => {
      if (!str) return false;
      return str.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(str);
    };

    // Helper to check if a string is a valid UUID format
    const isValidUUID = (str: string): boolean => {
      if (!str) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    };

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      for (const toolCall of responseMessage.tool_calls) {
        // Only process function-type tool calls
        if (toolCall.type === "function") {
          const args = JSON.parse(toolCall.function.arguments);

          // Fix common AI mistake: using dates instead of UUIDs for day_id
          if ((toolCall.function.name === "delete_day" || toolCall.function.name === "update_day") && args.day_id) {
            if (looksLikeDate(args.day_id) && !isValidUUID(args.day_id)) {
              // AI passed a date instead of UUID - try to find the correct day by date
              const dateStr = args.day_id.split("T")[0]; // Extract just the date part
              const { data: matchingDay } = await supabase
                .from("itinerary_days")
                .select("id")
                .eq("trip_id", tripId)
                .eq("date", dateStr)
                .single();

              if (matchingDay) {
                logAgentEvent("fixed_day_id", {
                  tripId,
                  originalId: args.day_id,
                  fixedId: matchingDay.id,
                  tool: toolCall.function.name,
                });
                args.day_id = matchingDay.id;
              }
            }
          }

          proposedChanges.push({
            id: toolCall.id,
            tool: toolCall.function.name as ProposedChange["tool"],
            description: generateChangeDescription(toolCall.function.name, args),
            data: args,
          });

          // Extract locations from parsed itinerary
          if (toolCall.function.name === "parse_itinerary_text") {
            const days = args.days as Array<{ location?: string; activities?: Array<{ location?: string }> }>;
            for (const day of days) {
              if (day.location) {
                const loc = day.location.toLowerCase();
                if (!detectedLocations.some((l) => l.toLowerCase() === loc)) {
                  detectedLocations.push(day.location);
                }
              }
            }

            // Check for location mismatch with trip destinations
            if (detectedLocations.length > 0 && trip.destinations) {
              const tripDestLower = trip.destinations.map((d: string) => d.toLowerCase());
              const newLocations = detectedLocations.filter(
                (loc) => !tripDestLower.some((dest: string) => dest.includes(loc.toLowerCase()) || loc.toLowerCase().includes(dest))
              );

              if (newLocations.length > 0) {
                suggestions.push({
                  type: "location_mismatch",
                  title: "New destinations detected",
                  description: `The itinerary mentions ${newLocations.join(", ")} which is not in your trip destinations (${trip.destinations.join(", ")}). Would you like to update the trip destinations?`,
                  data: { newLocations, currentDestinations: trip.destinations },
                });
              }
            }

            // Detect hotels, flights, and activities needing booking
            const flightMentions: Array<{ title: string; day: number }> = [];
            const hotelMentions: Array<{ name: string; day: number; checkIn?: boolean }> = [];
            const bookingNeededActivities: Array<{ title: string; day: number; tips?: string }> = [];

            for (const day of args.days as Array<{ day_number: number; activities: Array<{ title: string; location?: string; tags?: string[]; tips?: string }> }>) {
              for (const activity of day.activities || []) {
                const titleLower = activity.title.toLowerCase();

                // Detect activities needing booking (from tags or common patterns)
                const needsBooking = activity.tags?.includes("Needs Booking") ||
                  titleLower.includes("safari") ||
                  titleLower.includes("whale watching") ||
                  titleLower.includes("diving") ||
                  titleLower.includes("snorkeling") ||
                  titleLower.includes("cooking class") ||
                  titleLower.includes("tour");

                if (needsBooking && !titleLower.includes("flight") && !titleLower.includes("hotel")) {
                  bookingNeededActivities.push({
                    title: activity.title,
                    day: day.day_number,
                    tips: activity.tips,
                  });
                }

                // Detect flights
                if (titleLower.includes("flight") || titleLower.includes("fly to") || titleLower.includes("depart") || titleLower.includes("arrive at airport")) {
                  flightMentions.push({ title: activity.title, day: day.day_number });
                }

                // Detect hotels/accommodations - extract the name
                if (titleLower.includes("check-in") || titleLower.includes("check in") ||
                    titleLower.includes("hotel") || titleLower.includes("resort") ||
                    titleLower.includes("villa") || titleLower.includes("stay at") ||
                    titleLower.includes("airbnb") || titleLower.includes("hostel")) {
                  // Try to extract the accommodation name
                  let hotelName = activity.title;
                  // Remove common prefixes
                  hotelName = hotelName.replace(/^(check[- ]?in( at| to)?|arrive at|stay at)\s*/i, "");
                  // Use location if available and name seems generic
                  if (activity.location && hotelName.toLowerCase().includes("hotel")) {
                    hotelName = activity.location;
                  }
                  hotelMentions.push({
                    name: hotelName.trim(),
                    day: day.day_number,
                    checkIn: titleLower.includes("check-in") || titleLower.includes("check in")
                  });
                }
              }
            }

            // Suggest booking flights (HIGH priority - need to book early)
            if (flightMentions.length > 0) {
              const tripStartDate = new Date(trip.start_date);
              suggestions.push({
                type: "create_todo",
                title: "Book flights",
                description: `Your itinerary mentions ${flightMentions.length} flight(s). Would you like to create booking reminders?`,
                data: {
                  todos: flightMentions.map(f => {
                    // Calculate due date based on day number
                    const dueDate = new Date(tripStartDate);
                    dueDate.setDate(tripStartDate.getDate() + f.day - 1);
                    return {
                      title: `Book flight: ${f.title}`,
                      due_date: dueDate.toISOString().split('T')[0],
                      priority: "HIGH",
                    };
                  }),
                  category: "bookings",
                  priority: "HIGH",
                },
              });
            }

            // Suggest booking accommodations
            if (hotelMentions.length > 0) {
              // Deduplicate hotels by name
              const uniqueHotels = hotelMentions.filter((h, i, arr) =>
                arr.findIndex(x => x.name.toLowerCase() === h.name.toLowerCase()) === i
              );

              // Calculate dates based on trip start and day number
              const tripStartDate = new Date(trip.start_date);

              // Suggest creating actual booking records
              suggestions.push({
                type: "create_booking",
                title: "Add hotel bookings",
                description: `Found ${uniqueHotels.length} accommodation(s): ${uniqueHotels.map(h => h.name).join(", ")}. Add them to your bookings?`,
                data: {
                  bookings: uniqueHotels.map(h => {
                    // Calculate check-in date based on day number
                    const checkInDate = new Date(tripStartDate);
                    checkInDate.setDate(tripStartDate.getDate() + h.day - 1);

                    return {
                      type: "HOTEL",
                      hotel_name: h.name,
                      check_in: checkInDate.toISOString().split('T')[0],
                      status: "PENDING",
                    };
                  }),
                },
              });

              // Also offer to create todos as backup reminders (HIGH priority)
              suggestions.push({
                type: "create_todo",
                title: "Create booking reminders",
                description: `Create todo reminders to book: ${uniqueHotels.map(h => h.name).join(", ")}?`,
                data: {
                  todos: uniqueHotels.map(h => {
                    // Calculate due date based on day number
                    const dueDate = new Date(tripStartDate);
                    dueDate.setDate(tripStartDate.getDate() + h.day - 1);
                    return {
                      title: `Book: ${h.name}`,
                      due_date: dueDate.toISOString().split('T')[0],
                      priority: "HIGH",
                    };
                  }),
                  category: "bookings",
                  priority: "HIGH",
                },
              });
            }

            // Suggest creating todos for activities needing booking (safaris, whale watching, etc.) - HIGH priority
            if (bookingNeededActivities.length > 0) {
              // Deduplicate by title
              const uniqueActivities = bookingNeededActivities.filter((a, i, arr) =>
                arr.findIndex(x => x.title.toLowerCase() === a.title.toLowerCase()) === i
              );

              const tripStartDate = new Date(trip.start_date);
              suggestions.push({
                type: "create_todo",
                title: "Book activities & tickets",
                description: `These activities typically require advance booking: ${uniqueActivities.map(a => a.title).join(", ")}. Create booking reminders?`,
                data: {
                  todos: uniqueActivities.map(a => {
                    // Calculate due date based on day number
                    const dueDate = new Date(tripStartDate);
                    dueDate.setDate(tripStartDate.getDate() + a.day - 1);
                    return {
                      title: `Book: ${a.title}`,
                      due_date: dueDate.toISOString().split('T')[0],
                      priority: "HIGH",
                      notes: a.tips || undefined,
                    };
                  }),
                  category: "bookings",
                  priority: "HIGH",
                },
              });
            }

            // Suggest updating trip dates if itinerary has different duration
            const parsedDays = (args.days as Array<{ day_number: number }>).length;
            const tripStart = new Date(trip.start_date);
            const tripEnd = new Date(trip.end_date);
            const tripDays = Math.ceil((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            if (parsedDays !== tripDays) {
              suggestions.push({
                type: "update_trip_dates",
                title: "Update trip duration",
                description: `Your itinerary has ${parsedDays} days but your trip is set for ${tripDays} days. Would you like to update the trip end date?`,
                data: {
                  newDuration: parsedDays,
                  currentDuration: tripDays,
                  suggestedEndDate: new Date(tripStart.getTime() + (parsedDays - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                },
              });
            }
          }
        }
      }
    }

    const response: AgentResponse = {
      success: true,
      message: responseMessage.content || "Here's what I've prepared for you:",
      proposedChanges,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      detectedLocations: detectedLocations.length > 0 ? detectedLocations : undefined,
    };

    const totalDuration = Date.now() - startTime;
    logAgentEvent("request_completed", {
      tripId,
      userId,
      action,
      success: true,
      totalDurationMs: totalDuration,
      proposedChangesCount: proposedChanges.length,
      suggestionsCount: suggestions.length,
      detectedLocationsCount: detectedLocations.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logAgentEvent("request_failed", {
      tripId: "unknown",
      userId,
      action,
      success: false,
      totalDurationMs: totalDuration,
      error: errorMessage,
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    console.error("Agent API error:", error);

    // Surface actionable error messages
    let userMessage = "Oops! Something didn't work as expected. Give it another try 🔄";
    if (errorMessage.includes("API key") || errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("auth")) {
      userMessage = "I'm having trouble connecting to the AI service. The API key may need updating — check your OPENROUTER_API_KEY in .env.local 🔑";
    } else if (errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      userMessage = "I'm getting too many requests right now. Give me a moment and try again ⏳";
    } else if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT") || errorMessage.includes("ECONNREFUSED")) {
      userMessage = "Looks like I can't reach the AI service. Check your internet connection and try again 🌐";
    } else if (errorMessage.includes("model") || errorMessage.includes("404")) {
      userMessage = "The AI service is temporarily unavailable. Please try again in a moment ⏳";
    }

    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        proposedChanges: [],
        error: errorMessage,
      } as AgentResponse,
      { status: 500 }
    );
  }
}

// Helper to fetch current trip context for editing
async function getTripContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tripId: string,
  trip: { name: string; start_date: string; end_date: string; destinations: string[] }
): Promise<TripContext> {
  // Fetch days with activities
  const { data: days } = await supabase
    .from("itinerary_days")
    .select("id, day_number, date, title, location, activities(id, time, title, order)")
    .eq("trip_id", tripId)
    .order("day_number");

  // Fetch bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, type, status, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, hotel_name, check_in, check_out")
    .eq("trip_id", tripId);

  // Fetch todos
  const { data: todos } = await supabase
    .from("trip_todos")
    .select("id, title, category, completed")
    .eq("trip_id", tripId)
    .order("order");

  return {
    tripName: trip.name,
    startDate: trip.start_date,
    endDate: trip.end_date,
    destinations: trip.destinations,
    days: (days || []).map((d) => ({
      id: d.id,
      day_number: d.day_number,
      date: d.date,
      title: d.title,
      location: d.location,
      activities: (d.activities || []).map((a: { id: string; time?: string; title: string; order: number }) => ({
        id: a.id,
        time: a.time,
        title: a.title,
        order: a.order,
      })),
    })),
    bookings: (bookings || []).map((b) => ({
      id: b.id,
      type: b.type,
      status: b.status,
      airline: b.airline,
      flight_number: b.flight_number,
      departure_airport: b.departure_airport,
      arrival_airport: b.arrival_airport,
      departure_time: b.departure_time,
      arrival_time: b.arrival_time,
      hotel_name: b.hotel_name,
      check_in: b.check_in,
      check_out: b.check_out,
    })),
    todos: (todos || []).map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      completed: t.completed,
    })),
  };
}

// Generate human-readable description for a proposed change
function generateChangeDescription(toolName: string, args: Record<string, unknown>): string {
  switch (toolName) {
    case "parse_flight":
      return `Add flight: ${args.airline} ${args.flight_number} (${args.departure_airport} → ${args.arrival_airport})`;
    case "parse_hotel":
      return `Add hotel: ${args.hotel_name} (${args.check_in} to ${args.check_out})`;
    case "parse_activity":
      return `Add activity: ${args.activity_name}${args.date ? ` on ${args.date}` : ""}${args.location ? ` at ${args.location}` : ""}`;
    case "parse_itinerary_text":
      const days = args.days as Array<{ day_number: number; title: string }>;
      return `Create ${days.length} day(s): ${days.map((d) => `Day ${d.day_number}: ${d.title}`).join(", ")}`;
    case "add_day":
      return `Add Day ${args.day_number}: ${args.title}`;
    case "update_day":
      return `Update day: ${args.title || "changes"}`;
    case "delete_day":
      return `Delete day (id: ${args.day_id})`;
    case "add_activity":
      return `Add activity to Day ${args.day_number}: ${args.title}${args.time ? ` at ${args.time}` : ""}`;
    case "update_activity":
      return `Update activity: ${args.title || "changes"}`;
    case "delete_activity":
      return `Delete activity (id: ${args.activity_id})`;
    case "move_activity":
      return `Move activity to Day ${args.to_day_number}`;
    case "delete_booking":
      return `Delete booking (id: ${args.booking_id})`;
    case "delete_all_bookings":
      return `Delete all ${args.booking_type === "ALL" ? "" : args.booking_type + " "}bookings`;
    case "delete_todo":
      return `Delete todo (id: ${args.todo_id})`;
    case "delete_all_todos":
      return `Delete all todos${args.category ? ` in category "${args.category}"` : ""}`;
    case "delete_all_packing":
      return "Delete all packing items";
    case "delete_all_phrases":
      return "Delete all local phrases";
    case "generate_packing_list": {
      const items = args.items as Array<{ category: string; item: string }>;
      // Group by category for display
      const byCategory = items?.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item.item);
        return acc;
      }, {} as Record<string, string[]>) || {};
      const categoryList = Object.entries(byCategory)
        .map(([cat, itemList]) => `${cat}: ${itemList.slice(0, 3).join(", ")}${itemList.length > 3 ? ` (+${itemList.length - 3} more)` : ""}`)
        .slice(0, 4)
        .join("\n");
      return `Generate ${items?.length || 0} packing items:\n${categoryList}${Object.keys(byCategory).length > 4 ? `\n...and ${Object.keys(byCategory).length - 4} more categories` : ""}`;
    }
    case "generate_phrases": {
      const phrases = args.phrases as Array<{ english: string; local_text: string }>;
      const samplePhrases = phrases?.slice(0, 5).map(p => `"${p.english}" → ${p.local_text}`).join("\n") || "";
      return `Generate ${phrases?.length || 0} essential phrases:\n${samplePhrases}${(phrases?.length || 0) > 5 ? `\n...and ${phrases.length - 5} more` : ""}`;
    }
    case "update_trip_dates": {
      const parts: string[] = [];
      if (args.start_date) parts.push(`start: ${args.start_date}`);
      if (args.end_date) parts.push(`end: ${args.end_date}`);
      return `Update trip dates (${parts.join(", ")}) - all day dates will be recalculated`;
    }
    default:
      return `${toolName}: ${JSON.stringify(args)}`;
  }
}
