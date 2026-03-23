"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  Image,
  Loader2,
  X,
  Plane,
  Building2,
  Ticket,
  FileCheck,
} from "lucide-react";
import type { Booking } from "@/lib/types";

const DOCUMENT_CATEGORIES = [
  { value: "BOARDING_PASS", label: "Boarding Pass", icon: Plane },
  { value: "E_TICKET", label: "E-Ticket", icon: Ticket },
  { value: "CONFIRMATION", label: "Confirmation", icon: FileCheck },
  { value: "VOUCHER", label: "Voucher/Entry Ticket", icon: Ticket },
  { value: "VISA", label: "Visa", icon: FileText },
  { value: "PASSPORT", label: "Passport", icon: FileText },
  { value: "INSURANCE", label: "Insurance", icon: FileText },
  { value: "OTHER", label: "Other", icon: FileText },
] as const;

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  bookings?: Booking[];
  preselectedBookingId?: string;
  preselectedCategory?: string;
  onSuccess?: () => void;
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  tripId,
  bookings = [],
  preselectedBookingId,
  preselectedCategory,
  onSuccess,
}: DocumentUploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(preselectedCategory || "OTHER");
  const [bookingId, setBookingId] = useState(preselectedBookingId || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    // Auto-set name from filename if empty
    if (!name) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(baseName);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      setError("Please select a file and provide a name");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name.trim());
      formData.append("category", category);
      if (bookingId) {
        formData.append("booking_id", bookingId);
      }

      const response = await fetch(`/api/trips/${tripId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      // Success
      setFile(null);
      setName("");
      setCategory(preselectedCategory || "OTHER");
      setBookingId(preselectedBookingId || "");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setName("");
      setError(null);
      setCategory(preselectedCategory || "OTHER");
      setBookingId(preselectedBookingId || "");
      onOpenChange(false);
    }
  };

  const getBookingLabel = (booking: Booking) => {
    if (booking.type === "FLIGHT") {
      return `${booking.airline || "Flight"} ${booking.flight_number || ""} (${booking.departure_airport} - ${booking.arrival_airport})`;
    }
    if (booking.type === "HOTEL") {
      return booking.hotel_name || "Hotel";
    }
    if (booking.type === "ACTIVITY") {
      return booking.activity_name || "Activity";
    }
    return booking.provider || "Booking";
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case "FLIGHT":
        return Plane;
      case "HOTEL":
        return Building2;
      default:
        return Ticket;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal" />
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload tickets, boarding passes, confirmations, or any travel
            document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragActive
                ? "border-teal bg-teal/5"
                : file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-teal/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {file.type.includes("pdf") ? (
                  <FileText className="w-8 h-8 text-red-500" />
                ) : (
                  <Image className="w-8 h-8 text-blue-500" />
                )}
                <div className="text-left">
                  <p className="font-medium text-gray-900 truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Drag and drop your file here, or
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  PDF, JPG, PNG, WebP up to 10MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name *</Label>
            <Input
              id="doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., BKK-DEL Boarding Pass"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {DOCUMENT_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "border-teal bg-teal/10 text-teal"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] leading-tight block">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attach to Booking */}
          {bookings.length > 0 && (
            <div className="space-y-2">
              <Label>Attach to Booking (optional)</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => setBookingId("")}
                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                    !bookingId
                      ? "bg-gray-100 font-medium"
                      : "hover:bg-gray-50"
                  }`}
                >
                  General (not attached to booking)
                </button>
                {bookings.map((booking) => {
                  const Icon = getBookingIcon(booking.type);
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setBookingId(booking.id)}
                      className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                        bookingId === booking.id
                          ? "bg-teal/10 text-teal font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{getBookingLabel(booking)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-teal hover:bg-teal-dark"
              onClick={handleUpload}
              disabled={uploading || !file || !name.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
