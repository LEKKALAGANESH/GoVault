"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Image,
  Download,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentUploadModal } from "./document-upload-modal";
import type { Document, Booking } from "@/lib/types";

interface BookingDocumentsProps {
  documents: Document[];
  tripId: string;
  bookingId: string;
  bookingType: "FLIGHT" | "HOTEL" | "ACTIVITY" | "TRANSPORT";
  isOwner?: boolean;
  compact?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  BOARDING_PASS: "Boarding Pass",
  E_TICKET: "E-Ticket",
  CONFIRMATION: "Confirmation",
  VOUCHER: "Voucher",
  VISA: "Visa",
  PASSPORT: "Passport",
  INSURANCE: "Insurance",
  OTHER: "Document",
};

const BOOKING_DEFAULT_CATEGORY: Record<string, string> = {
  FLIGHT: "BOARDING_PASS",
  HOTEL: "CONFIRMATION",
  ACTIVITY: "VOUCHER",
  TRANSPORT: "CONFIRMATION",
};

export function BookingDocuments({
  documents,
  tripId,
  bookingId,
  bookingType,
  isOwner = false,
  compact = false,
}: BookingDocumentsProps) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!compact || documents.length <= 2);

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
    if (fileType.includes("pdf")) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <Image className="w-4 h-4 text-blue-500" />;
  };

  const displayedDocs = expanded ? documents : documents.slice(0, 2);
  const hasMore = !expanded && documents.length > 2;

  if (documents.length === 0 && !isOwner) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Documents ({documents.length})
        </span>
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-teal hover:text-teal-dark"
            onClick={() => setShowUpload(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="space-y-1.5">
          {displayedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
            >
              {getFileIcon(doc.file_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {doc.name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {CATEGORY_LABELS[doc.category || "OTHER"]}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-white rounded-md"
                  title="View"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                </a>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleting === doc.id}
                    className="p-1.5 hover:bg-red-50 rounded-md"
                    title="Delete"
                  >
                    {deleting === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Show more/less */}
          {(hasMore || (expanded && documents.length > 2)) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 flex items-center justify-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Show {documents.length - 2} more
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-center hover:border-teal hover:bg-teal/5 transition-colors"
        >
          <Plus className="w-4 h-4 mx-auto text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">
            Add {bookingType === "FLIGHT" ? "boarding pass" : "confirmation"}
          </span>
        </button>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        open={showUpload}
        onOpenChange={setShowUpload}
        tripId={tripId}
        preselectedBookingId={bookingId}
        preselectedCategory={BOOKING_DEFAULT_CATEGORY[bookingType]}
      />
    </div>
  );
}

// Smaller inline button to add documents (for use in card headers)
interface AddDocumentButtonProps {
  tripId: string;
  bookingId: string;
  bookingType: "FLIGHT" | "HOTEL" | "ACTIVITY" | "TRANSPORT";
  bookings?: Booking[];
}

export function AddDocumentButton({
  tripId,
  bookingId,
  bookingType,
  bookings,
}: AddDocumentButtonProps) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowUpload(true)}
        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        title="Add document"
      >
        <Plus className="w-4 h-4" />
      </button>

      <DocumentUploadModal
        open={showUpload}
        onOpenChange={setShowUpload}
        tripId={tripId}
        bookings={bookings}
        preselectedBookingId={bookingId}
        preselectedCategory={BOOKING_DEFAULT_CATEGORY[bookingType]}
      />
    </>
  );
}
