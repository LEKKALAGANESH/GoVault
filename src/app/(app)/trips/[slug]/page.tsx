import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TripHeroVibes } from "@/components/trip-view2/trip-hero-vibes";
import { TripStats } from "@/components/trip-view2/trip-hero";
import { FlightCard } from "@/components/trip-view2/flight-card";
import { HotelCard } from "@/components/trip-view2/hotel-card";
import { TripTodos } from "@/components/trip-view2/trip-todos";
import { ExpandableDayCard } from "@/components/trip-view2/expandable-day-card";
import { SurvivalGuide } from "@/components/trip-view2/survival-guide";
import { PhrasesSection } from "@/components/trip-view2/phrases-section";
import { PackingChecklist } from "@/components/trip-view2/packing-checklist";
import { EmergencyContacts } from "@/components/trip-view2/emergency-contacts";
import { BeachSectionsWrapper, BeachSectionDecorator } from "@/components/trip-view2/beach-sections-wrapper";
import { TripActions } from "@/components/trip-view2/trip-actions";
import { DocumentsSection } from "@/components/trip-view2/documents-section";
import { TripAgentChat } from "@/components/trip-view2/trip-agent-chat";
import { TripDataProvider } from "@/components/trip-view2/trip-data-provider";
import { ArrowLeft } from "lucide-react";
import {
  isThailandTrip,
  getDefaultSurvivalTips,
  getDefaultPhrases,
  getDefaultPackingItems,
  getDefaultEmergencyContacts,
  getDefaultTodos,
  getDefaultItinerary,
} from "@/lib/defaults/thailand-trip";
import type {
  Trip,
  Traveler,
  Booking,
  ItineraryDay,
  Activity,
  SurvivalTip,
  Phrase,
  PackingItem,
  EmergencyContact,
  TripTodo,
  Document,
} from "@/lib/types";

// Force dynamic rendering to ensure auth state is always fresh
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default async function TripDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Look up trip by ID (if UUID) or by slug
  let trip;
  let error;

  if (isUUID(slug)) {
    // Query by ID
    const result = await supabase
      .from("trips")
      .select("*")
      .eq("id", slug)
      .single();
    trip = result.data;
    error = result.error;
  } else {
    // Query by slug
    const result = await supabase
      .from("trips")
      .select("*")
      .eq("slug", slug)
      .single();
    trip = result.data;
    error = result.error;
  }

  if (error || !trip) {
    notFound();
  }

  // Use trip.id for all related queries
  const tripId = trip.id;
  const isOwner = user?.id === trip.owner_id;

  const [
    { data: travelers },
    { data: bookings },
    { data: days },
    { data: documents },
  ] = await Promise.all([
    supabase.from("travelers").select("*").eq("trip_id", tripId),
    supabase
      .from("bookings")
      .select("*")
      .eq("trip_id", tripId)
      .order("departure_time", { ascending: true }),
    supabase
      .from("itinerary_days")
      .select("*, activities(*)")
      .eq("trip_id", tripId)
      .order("day_number", { ascending: true }),
    supabase
      .from("documents")
      .select("*")
      .eq("trip_id", tripId),
  ]);

  const { data: survivalTips } = await supabase
    .from("survival_tips")
    .select("*")
    .eq("trip_id", tripId)
    .order("order", { ascending: true });

  const { data: phrases } = await supabase
    .from("phrases")
    .select("*")
    .eq("trip_id", tripId)
    .order("order", { ascending: true });

  const { data: packingItems } = await supabase
    .from("packing_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("order", { ascending: true });

  const { data: emergencyContacts } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("trip_id", tripId)
    .order("order", { ascending: true });

  const { data: todos } = await supabase
    .from("trip_todos")
    .select("*")
    .eq("trip_id", tripId)
    .order("order", { ascending: true });

  const typedTrip = trip as Trip;
  const typedDocuments = (documents || []) as Document[];
  const flights = (bookings as Booking[] | null)?.filter((b) => b.type === "FLIGHT") || [];
  const hotels = (bookings as Booking[] | null)?.filter((b) => b.type === "HOTEL") || [];

  // Helper to get documents for a specific booking
  const getBookingDocuments = (bookingId: string) =>
    typedDocuments.filter((doc) => doc.booking_id === bookingId);

  // General documents (not attached to any booking)
  const generalDocuments = typedDocuments.filter((doc) => !doc.booking_id);

  const isThailand = isThailandTrip(typedTrip.destinations);
  const finalSurvivalTips = (survivalTips && survivalTips.length > 0)
    ? survivalTips as SurvivalTip[]
    : isThailand ? getDefaultSurvivalTips(tripId) : [];
  const finalPhrases = (phrases && phrases.length > 0)
    ? phrases as Phrase[]
    : isThailand ? getDefaultPhrases(tripId) : [];
  const finalPackingItems = (packingItems && packingItems.length > 0)
    ? packingItems as PackingItem[]
    : isThailand ? getDefaultPackingItems(tripId) : [];
  const finalEmergencyContacts = (emergencyContacts && emergencyContacts.length > 0)
    ? emergencyContacts as EmergencyContact[]
    : isThailand ? getDefaultEmergencyContacts(tripId) : [];
  const finalTodos = (todos && todos.length > 0)
    ? todos as TripTodo[]
    : isThailand ? getDefaultTodos(tripId) : [];
  const finalDays = (days && days.length > 0)
    ? days as (ItineraryDay & { activities: Activity[] })[]
    : isThailand ? getDefaultItinerary(tripId) : [];

  const tripStats: TripStats = {
    flights: {
      total: flights.length,
      confirmed: flights.filter((f) => f.status === "CONFIRMED").length,
    },
    hotels: {
      total: hotels.length,
      confirmed: hotels.filter((h) => h.status === "CONFIRMED").length,
    },
    todos: {
      total: finalTodos.length,
      completed: finalTodos.filter((t) => t.completed).length,
    },
    packing: {
      total: finalPackingItems.length,
      checked: finalPackingItems.filter((p) => p.checked).length,
    },
    documents: documents?.length || 0,
    emergencyContacts: finalEmergencyContacts.length,
    pendingActions: generatePendingActions(
      flights,
      hotels,
      finalTodos,
      finalPackingItems,
      documents?.length || 0
    ),
  };

  return (
    <TripDataProvider
      tripId={tripId}
      initialStats={tripStats}
      initialTripMetadata={{
        start_date: trip.start_date,
        end_date: trip.end_date,
        name: trip.name,
        destinations: trip.destinations || [],
      }}
    >
    <BeachSectionsWrapper>
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-sm z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/trips"
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-playfair font-semibold text-slate-800 whitespace-nowrap">
              ✨ {typedTrip.name}
            </span>
          </div>
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            <NavLink href="#itinerary">📅 Days</NavLink>
            <NavLink href="#flights">✈️ Flights</NavLink>
            <NavLink href="#hotels">🏨 Hotels</NavLink>
            <NavLink href="#todos">✅ To-Do</NavLink>
            <NavLink href="#survival">🎒 Guide</NavLink>
            <NavLink href="#phrases">🗣️ Phrases</NavLink>
            <NavLink href="#packing">🧳 Packing</NavLink>
            <NavLink href="#documents">📄 Docs</NavLink>
            <NavLink href="#emergency" className="bg-rose-500 text-white hover:bg-rose-600">
              🆘 SOS
            </NavLink>
          </div>
          <TripActions
            tripId={tripId}
            tripSlug={typedTrip.slug}
            tripName={typedTrip.name}
            initialTravelers={(travelers as Traveler[]) || []}
            isOwner={isOwner}
            currentUserId={user?.id}
            currentUserEmail={user?.email}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <TripHeroVibes
        trip={typedTrip}
        travelers={travelers as Traveler[] | undefined}
        stats={tripStats}
        isOwner={isOwner}
        tripId={tripId}
        currentUserId={user?.id}
        currentUserEmail={user?.email}
      />

      {/* Itinerary Section - First after hero */}
      <BeachSectionDecorator variant="itinerary">
      <section id="itinerary" className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-amber-900 mb-8">
            📅 Day-by-Day <span className="text-amber-600">Itinerary</span>
          </h2>
          {finalDays.length > 0 ? (
            <div className="space-y-4">
              {finalDays.map((day) => (
                <ExpandableDayCard key={day.id} day={day} />
              ))}
            </div>
          ) : (
            <EmptySection message="No itinerary days added yet" />
          )}
        </div>
      </section>
      </BeachSectionDecorator>

      {/* Flights Section */}
      <BeachSectionDecorator variant="flights">
      <section id="flights" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
            ✈️ Flight <span className="text-sky-200">Details</span>
          </h2>
          {flights.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flights.map((flight, idx) => (
                <FlightCard
                  key={flight.id}
                  booking={flight}
                  variant={
                    idx === 0
                      ? "outbound"
                      : idx === flights.length - 1
                      ? "return"
                      : "internal"
                  }
                  documents={getBookingDocuments(flight.id)}
                  tripId={tripId}
                  isOwner={isOwner}
                  hidePrivateInfo={false}
                />
              ))}
            </div>
          ) : (
            <EmptySection message="No flights added yet" light />
          )}
        </div>
      </section>
      </BeachSectionDecorator>

      {/* Hotels Section */}
      <BeachSectionDecorator variant="hotels">
      <section id="hotels" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
            🏨 Accommodation <span className="text-cyan-200">Details</span>
          </h2>
          {hotels.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {hotels.map((hotel, idx) => (
                <HotelCard
                  key={hotel.id}
                  booking={hotel}
                  variant={idx % 2 === 0 ? "phuket" : "bangkok"}
                  documents={getBookingDocuments(hotel.id)}
                  tripId={tripId}
                  isOwner={isOwner}
                  hidePrivateInfo={false}
                />
              ))}
            </div>
          ) : (
            <EmptySection message="No hotels added yet" />
          )}
        </div>
      </section>
      </BeachSectionDecorator>

      {/* Todos Section */}
      <BeachSectionDecorator variant="todos">
      <section id="todos">
        {finalTodos.length > 0 ? (
          <TripTodos todos={finalTodos} tripId={tripId} editable={true} />
        ) : (
          <div className="py-12 bg-gradient-to-br from-coral-400 via-orange-400 to-amber-500" style={{ background: 'linear-gradient(to bottom right, #f97316, #fb923c, #fbbf24)' }}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
                ✅ Trip <span className="text-orange-100">To-Do List</span>
              </h2>
              <EmptySection message="No to-do items added yet" light />
            </div>
          </div>
        )}
      </section>
      </BeachSectionDecorator>

      {/* Survival Guide */}
      <BeachSectionDecorator variant="survival">
      <section id="survival">
        {finalSurvivalTips.length > 0 ? (
          <SurvivalGuide tips={finalSurvivalTips} />
        ) : (
          <div className="py-12 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
                🛡️ Travel <span className="text-emerald-200">Survival Guide</span>
              </h2>
              <EmptySection message="No survival tips added yet" light />
            </div>
          </div>
        )}
      </section>
      </BeachSectionDecorator>

      {/* Thai Phrases */}
      <BeachSectionDecorator variant="phrases">
      <section id="phrases">
        {finalPhrases.length > 0 ? (
          <PhrasesSection phrases={finalPhrases} tripId={tripId} editable={true} />
        ) : (
          <div className="py-12 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
                🗣️ Local Language <span className="text-pink-200">Phrases</span>
              </h2>
              <EmptySection message="No phrases added yet" light />
            </div>
          </div>
        )}
      </section>
      </BeachSectionDecorator>

      {/* Packing Checklist */}
      <BeachSectionDecorator variant="packing">
      <section id="packing">
        {finalPackingItems.length > 0 ? (
          <PackingChecklist items={finalPackingItems} tripId={tripId} editable={true} />
        ) : (
          <div className="py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-playfair text-2xl md:text-3xl text-center text-slate-800 mb-8">
                🧳 Packing <span className="text-amber-600">Checklist</span>
              </h2>
              <EmptySection message="No packing items added yet" />
            </div>
          </div>
        )}
      </section>
      </BeachSectionDecorator>

      {/* Documents Section */}
      <BeachSectionDecorator variant="documents">
      <section id="documents">
        <DocumentsSection
          documents={typedDocuments}
          tripId={tripId}
          bookings={(bookings as Booking[]) || []}
          isOwner={isOwner}
        />
      </section>
      </BeachSectionDecorator>

      {/* Emergency Contacts */}
      <BeachSectionDecorator variant="emergency">
      <section id="emergency">
        {finalEmergencyContacts.length > 0 ? (
          <EmergencyContacts
            contacts={finalEmergencyContacts}
            tripId={tripId}
            tripName={typedTrip.name}
            travelers={(travelers as Traveler[] | null)?.map((t) => t.name) || []}
            editable={true}
          />
        ) : (
          <div className="py-12 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
                🆘 Emergency <span className="text-orange-200">Contacts</span>
              </h2>
              <EmptySection message="No emergency contacts added yet" light />
            </div>
          </div>
        )}
      </section>
      </BeachSectionDecorator>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-teal-900 to-slate-900 py-12 text-center">
        <p className="font-playfair text-2xl text-teal-300 mb-2">
          {typedTrip.occasion || "Have an amazing trip!"}
        </p>
        <p className="text-slate-400">
          {(travelers as Traveler[] | null)?.map((t) => t.name).join(" + ")}
        </p>
      </footer>

      {/* AI Trip Assistant - Only for trip owners */}
      {isOwner && (
        <TripAgentChat tripId={tripId} tripName={typedTrip.name} />
      )}
    </div>
    </BeachSectionsWrapper>
    </TripDataProvider>
  );
}

function NavLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors text-slate-600 hover:bg-teal-500 hover:text-white ${className}`}
    >
      {children}
    </a>
  );
}

function EmptySection({ message, light = false }: { message: string; light?: boolean }) {
  return (
    <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
      light
        ? "border-white/20 bg-white/5"
        : "border-slate-300 bg-white"
    }`}>
      <p className={light ? "text-white/60" : "text-slate-400"}>{message}</p>
    </div>
  );
}

function generatePendingActions(
  flights: Booking[],
  hotels: Booking[],
  todos: TripTodo[],
  packingItems: PackingItem[],
  documentCount: number
): string[] {
  const actions: string[] = [];

  const pendingFlights = flights.filter((f) => f.status === "PENDING");
  pendingFlights.forEach((f) => {
    actions.push(`Book ${f.airline || "flight"} ${f.flight_number || ""} (${f.departure_airport} → ${f.arrival_airport})`);
  });

  const pendingHotels = hotels.filter((h) => h.status === "PENDING");
  pendingHotels.forEach((h) => {
    actions.push(`Confirm ${h.hotel_name || "hotel"} booking`);
  });

  // Prioritize HIGH priority todos first, then show others
  const incompleteTodos = todos.filter((t) => !t.completed);
  const urgentTodos = incompleteTodos.filter((t) => t.priority === "HIGH");
  const regularTodos = incompleteTodos.filter((t) => t.priority !== "HIGH");

  // Show urgent todos first with a marker
  urgentTodos.slice(0, 3).forEach((t) => {
    actions.push(`🔴 ${t.title}`);
  });
  if (urgentTodos.length > 3) {
    actions.push(`+${urgentTodos.length - 3} more urgent items`);
  }

  // Then show regular todos if we have room
  const remainingSlots = Math.max(0, 2 - urgentTodos.slice(0, 3).length);
  regularTodos.slice(0, remainingSlots).forEach((t) => {
    actions.push(t.title);
  });
  const remainingRegular = regularTodos.length - remainingSlots;
  if (remainingRegular > 0) {
    actions.push(`+${remainingRegular} more todo items`);
  }

  const packingProgress = packingItems.length > 0
    ? Math.round((packingItems.filter((p) => p.checked).length / packingItems.length) * 100)
    : 100;
  if (packingProgress < 50 && packingItems.length > 0) {
    actions.push(`Complete packing checklist (${packingProgress}% done)`);
  }

  if (documentCount === 0) {
    actions.push("Upload travel documents");
  }

  return actions;
}
