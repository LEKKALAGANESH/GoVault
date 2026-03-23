"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Image,
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
  Plane,
  Building2,
  Ticket,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentUploadModal } from "./document-upload-modal";
import type { Document, Booking } from "@/lib/types";

interface DocumentsSectionProps {
  documents: Document[];
  tripId: string;
  bookings: Booking[];
  isOwner: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  BOARDING_PASS: { label: "Boarding Passes", icon: <Plane className="w-4 h-4" /> },
  E_TICKET: { label: "E-Tickets", icon: <Ticket className="w-4 h-4" /> },
  CONFIRMATION: { label: "Confirmations", icon: <FileText className="w-4 h-4" /> },
  VOUCHER: { label: "Vouchers & Tickets", icon: <Ticket className="w-4 h-4" /> },
  VISA: { label: "Visa Documents", icon: <FileText className="w-4 h-4" /> },
  PASSPORT: { label: "Passport Copies", icon: <FileText className="w-4 h-4" /> },
  INSURANCE: { label: "Insurance", icon: <FileText className="w-4 h-4" /> },
  // Legacy categories from AI uploads (for backwards compatibility)
  FLIGHT: { label: "Flight Documents", icon: <Plane className="w-4 h-4" /> },
  HOTEL: { label: "Hotel Documents", icon: <Building2 className="w-4 h-4" /> },
  ACTIVITY: { label: "Activity Documents", icon: <Ticket className="w-4 h-4" /> },
  OTHER: { label: "Other Documents", icon: <FolderOpen className="w-4 h-4" /> },
};

export function DocumentsSection({
  documents,
  tripId,
  bookings,
  isOwner,
}: DocumentsSectionProps) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document?")) return;

    setDeleting(docId);
    try {
      const response = await fetch(
        `/api/trips/${tripId}/documents/${docId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes("pdf")) {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    return <Image className="w-5 h-5 text-blue-400" />;
  };

  const getBookingLabel = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    if (booking.type === "FLIGHT") {
      return {
        icon: <Plane className="w-3 h-3" />,
        text: `${booking.airline || "Flight"} ${booking.flight_number || ""}`,
      };
    }
    if (booking.type === "HOTEL") {
      return {
        icon: <Building2 className="w-3 h-3" />,
        text: booking.hotel_name || "Hotel",
      };
    }
    if (booking.type === "ACTIVITY") {
      return {
        icon: <Ticket className="w-3 h-3" />,
        text: booking.activity_name || "Activity",
      };
    }
    return null;
  };

  // Group documents by category
  const groupedDocs = documents.reduce((acc, doc) => {
    const category = doc.category || "OTHER";
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Order categories
  const categoryOrder = [
    "BOARDING_PASS",
    "E_TICKET",
    "CONFIRMATION",
    "VOUCHER",
    "VISA",
    "PASSPORT",
    "INSURANCE",
    "OTHER",
  ];

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 mb-8">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-white">
            📄 Travel <span className="text-teal-300">Documents</span>
          </h2>
          {isOwner && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUpload(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Upload
            </Button>
          )}
        </div>

        {documents.length > 0 ? (
          <div className="space-y-6">
            {categoryOrder
              .filter((cat) => groupedDocs[cat]?.length > 0)
              .map((category) => {
                const categoryInfo = CATEGORY_LABELS[category];
                const docs = groupedDocs[category];

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3 text-white/70">
                      {categoryInfo.icon}
                      <span className="text-sm font-medium">
                        {categoryInfo.label} ({docs.length})
                      </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
                      <div className="divide-y divide-white/10">
                        {docs.map((doc) => {
                          const bookingInfo = doc.booking_id
                            ? getBookingLabel(doc.booking_id)
                            : null;

                          return (
                            <div
                              key={doc.id}
                              className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                            >
                              {getFileIcon(doc.file_type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                  {doc.name}
                                </p>
                                {bookingInfo && (
                                  <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                                    {bookingInfo.icon}
                                    <span>{bookingInfo.text}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-cyan-500/30 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/40 transition-colors flex items-center gap-1.5"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View
                                </a>
                                {isOwner && (
                                  <button
                                    onClick={() => handleDelete(doc.id)}
                                    disabled={deleting === doc.id}
                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                  >
                                    {deleting === doc.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-white/40 mb-3" />
            <p className="text-white/60 mb-4">No Documents Yet</p>
            <p className="text-white/40 text-sm mb-4">
              Upload boarding passes, e-tickets, and travel confirmations for offline access
            </p>
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUpload(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                Upload Documents
              </Button>
            )}
          </div>
        )}
      </div>

      <DocumentUploadModal
        open={showUpload}
        onOpenChange={setShowUpload}
        tripId={tripId}
        bookings={bookings}
      />
    </div>
  );
}
