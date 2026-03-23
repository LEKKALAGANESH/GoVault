import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Plane,
  Hotel,
  Car,
  Ticket,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { Trip, Booking, BookingType } from "@/lib/types";

interface PageProps {
  params: Promise<{ tripId: string }>;
}

export default async function BookingsPage({ params }: PageProps) {
  const { tripId } = await params;
  const supabase = await createClient();

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !trip) {
    notFound();
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  const typedTrip = trip as Trip;
  const typedBookings = (bookings as Booking[]) || [];

  const flights = typedBookings.filter((b) => b.type === "FLIGHT");
  const hotels = typedBookings.filter((b) => b.type === "HOTEL");
  const transports = typedBookings.filter((b) => b.type === "TRANSPORT");
  const activities = typedBookings.filter((b) => b.type === "ACTIVITY");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center text-muted-foreground hover:text-navy mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to {typedTrip.name}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy">Booking Vault</h1>
            <p className="text-muted-foreground mt-1">
              {typedBookings.length} bookings for your trip
            </p>
          </div>
          <Link href={`/trips/${tripId}/bookings/new`}>
            <Button className="bg-teal hover:bg-teal-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-sand">
          <TabsTrigger value="all">
            All ({typedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="flights">
            <Plane className="w-4 h-4 mr-1" />
            Flights ({flights.length})
          </TabsTrigger>
          <TabsTrigger value="hotels">
            <Hotel className="w-4 h-4 mr-1" />
            Hotels ({hotels.length})
          </TabsTrigger>
          <TabsTrigger value="transport">
            <Car className="w-4 h-4 mr-1" />
            Transport ({transports.length})
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Ticket className="w-4 h-4 mr-1" />
            Activities ({activities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {typedBookings.length > 0 ? (
            typedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} tripId={tripId} />
            ))
          ) : (
            <EmptyState tripId={tripId} />
          )}
        </TabsContent>

        <TabsContent value="flights" className="space-y-4">
          {flights.length > 0 ? (
            flights.map((booking) => (
              <BookingCard key={booking.id} booking={booking} tripId={tripId} />
            ))
          ) : (
            <EmptyState tripId={tripId} type="FLIGHT" />
          )}
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          {hotels.length > 0 ? (
            hotels.map((booking) => (
              <BookingCard key={booking.id} booking={booking} tripId={tripId} />
            ))
          ) : (
            <EmptyState tripId={tripId} type="HOTEL" />
          )}
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          {transports.length > 0 ? (
            transports.map((booking) => (
              <BookingCard key={booking.id} booking={booking} tripId={tripId} />
            ))
          ) : (
            <EmptyState tripId={tripId} type="TRANSPORT" />
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {activities.length > 0 ? (
            activities.map((booking) => (
              <BookingCard key={booking.id} booking={booking} tripId={tripId} />
            ))
          ) : (
            <EmptyState tripId={tripId} type="ACTIVITY" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingCard({ booking, tripId }: { booking: Booking; tripId: string }) {
  const typeConfig: Record<BookingType, { icon: React.ReactNode; color: string }> = {
    FLIGHT: { icon: <Plane className="w-5 h-5" />, color: "bg-teal/10 text-teal" },
    HOTEL: { icon: <Hotel className="w-5 h-5" />, color: "bg-gold/10 text-gold" },
    TRANSPORT: { icon: <Car className="w-5 h-5" />, color: "bg-coral/10 text-coral" },
    ACTIVITY: { icon: <Ticket className="w-5 h-5" />, color: "bg-navy/10 text-navy" },
  };

  const statusConfig = {
    CONFIRMED: { icon: <CheckCircle className="w-4 h-4" />, className: "bg-green-100 text-green-700" },
    PENDING: { icon: <Clock className="w-4 h-4" />, className: "bg-yellow-100 text-yellow-700" },
    CANCELLED: { icon: <XCircle className="w-4 h-4" />, className: "bg-red-100 text-red-700" },
  };

  const { icon, color } = typeConfig[booking.type];
  const status = statusConfig[booking.status];

  return (
    <Link href={`/trips/${tripId}/bookings/${booking.id}`}>
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-navy">
                {booking.type === "FLIGHT" && `${booking.airline} ${booking.flight_number}`}
                {booking.type === "HOTEL" && booking.hotel_name}
                {booking.type === "TRANSPORT" && `${booking.vehicle_type} - ${booking.provider}`}
                {booking.type === "ACTIVITY" && booking.activity_name}
              </h3>
              <Badge className={`text-xs gap-1 ${status.className}`}>
                {status.icon}
                {booking.status}
              </Badge>
            </div>

            {/* Details */}
            <div className="text-sm text-muted-foreground">
              {booking.type === "FLIGHT" && (
                <>
                  <p>
                    {booking.departure_airport} → {booking.arrival_airport}
                  </p>
                  {booking.departure_time && (
                    <p>{format(new Date(booking.departure_time), "EEE, MMM d 'at' h:mm a")}</p>
                  )}
                </>
              )}
              {booking.type === "HOTEL" && (
                <>
                  <p>{booking.address}</p>
                  {booking.check_in && booking.check_out && (
                    <p>
                      {format(new Date(booking.check_in), "MMM d")} -{" "}
                      {format(new Date(booking.check_out), "MMM d, yyyy")}
                    </p>
                  )}
                </>
              )}
              {booking.type === "TRANSPORT" && (
                <>
                  <p>
                    {booking.pickup_location} → {booking.dropoff_location}
                  </p>
                  {booking.pickup_time && (
                    <p>{format(new Date(booking.pickup_time), "EEE, MMM d 'at' h:mm a")}</p>
                  )}
                </>
              )}
              {booking.type === "ACTIVITY" && (
                <>
                  <p>{booking.venue}</p>
                  {booking.activity_date && (
                    <p>
                      {format(new Date(booking.activity_date), "EEE, MMM d")}
                      {booking.activity_time && ` at ${booking.activity_time}`}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Confirmation Number */}
            {booking.confirmation_number && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Ref:</span>
                <code className="text-xs bg-sand px-2 py-0.5 rounded font-mono">
                  {booking.confirmation_number}
                </code>
              </div>
            )}
          </div>

          {/* Cost */}
          {booking.cost && (
            <div className="text-right">
              <p className="font-semibold text-navy">
                {booking.currency || "₹"}{booking.cost.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ tripId, type }: { tripId: string; type?: BookingType }) {
  const messages: Record<BookingType | "all", { title: string; description: string }> = {
    all: {
      title: "No Bookings Yet",
      description: "Add your flights, hotels, and activities to keep everything organized.",
    },
    FLIGHT: {
      title: "No Flights Added",
      description: "Add your flight bookings to see them here.",
    },
    HOTEL: {
      title: "No Hotels Added",
      description: "Add your accommodation bookings to see them here.",
    },
    TRANSPORT: {
      title: "No Transport Added",
      description: "Add your car rentals, transfers, or trains here.",
    },
    ACTIVITY: {
      title: "No Activities Added",
      description: "Add your tours, tickets, and experiences here.",
    },
  };

  const { title, description } = messages[type || "all"];

  return (
    <div className="text-center py-12 bg-white rounded-2xl">
      <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-navy mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Link href={`/trips/${tripId}/bookings/new`}>
        <Button className="bg-teal hover:bg-teal-dark text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Booking
        </Button>
      </Link>
    </div>
  );
}
