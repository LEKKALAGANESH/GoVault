"use client";

import { useState } from "react";
import { Traveler, TravelerType } from "@/lib/types";
import { Users, Plus, Pencil, Trash2, Mail, Phone, Send, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManageTravelersModalProps {
  tripId: string;
  tripName: string;
  travelers: Traveler[];
  onTravelersChange: (travelers: Traveler[]) => void;
  triggerButton?: React.ReactNode;
  currentUserId?: string;
  currentUserEmail?: string;
}

const travelerEmoji: Record<TravelerType, string> = {
  ADULT: "👤",
  SENIOR: "👵",
  CHILD: "👦",
  INFANT: "👶",
};

const travelerTypeLabels: Record<TravelerType, string> = {
  ADULT: "Adult",
  SENIOR: "Senior",
  CHILD: "Child",
  INFANT: "Infant",
};

interface TravelerFormData {
  name: string;
  type: TravelerType;
  age?: number;
  email?: string;
  phone?: string;
}

const emptyForm: TravelerFormData = {
  name: "",
  type: "ADULT",
  age: undefined,
  email: "",
  phone: "",
};

export function ManageTravelersModal({
  tripId,
  tripName,
  travelers,
  onTravelersChange,
  triggerButton,
  currentUserId,
  currentUserEmail,
}: ManageTravelersModalProps) {
  // Helper to check if a traveler is the current user
  const isSelf = (traveler: Traveler) => traveler.user_id === currentUserId;

  // Get display email for a traveler
  const getTravelerEmail = (traveler: Traveler) => {
    if (isSelf(traveler) && currentUserEmail) return currentUserEmail;
    return traveler.email;
  };
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TravelerFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${tripId}`
    : `/share/${tripId}`;

  const resetForm = () => {
    setFormData(emptyForm);
    setIsAdding(false);
    setEditingId(null);
    setError(null);
  };

  const startEditing = (traveler: Traveler) => {
    setEditingId(traveler.id);
    setFormData({
      name: traveler.name,
      type: traveler.type,
      age: traveler.age,
      email: traveler.email || "",
      phone: traveler.phone || "",
    });
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing traveler
        const res = await fetch(`/api/trips/${tripId}/travelers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update traveler");
        }

        const updated = await res.json();
        onTravelersChange(
          travelers.map((t) => (t.id === editingId ? updated : t))
        );
      } else {
        // Add new traveler
        const res = await fetch(`/api/trips/${tripId}/travelers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add traveler");
        }

        const newTraveler = await res.json();
        onTravelersChange([...travelers, newTraveler]);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (travelerId: string) => {
    if (!confirm("Are you sure you want to remove this traveler?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/travelers/${travelerId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove traveler");
      }

      onTravelersChange(travelers.filter((t) => t.id !== travelerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const shareViaEmail = (traveler: Traveler) => {
    if (!traveler.email) return;
    const subject = encodeURIComponent(`You're invited: ${tripName}`);
    const body = encodeURIComponent(
      `Hi ${traveler.name},\n\nI wanted to share our trip itinerary with you!\n\nView the trip here: ${shareUrl}\n\nSee you soon!`
    );
    window.open(`mailto:${traveler.email}?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = (traveler: Traveler) => {
    if (!traveler.phone) return;
    const phone = traveler.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi ${traveler.name}! Check out our trip itinerary: ${shareUrl}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Travelers</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Manage Travelers
          </DialogTitle>
          <DialogDescription>
            Add travelers to your trip and share the itinerary with them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Travelers list */}
          <div className="space-y-2">
            {travelers.map((traveler) => (
              <div
                key={traveler.id}
                className={`border rounded-lg p-3 transition-all ${
                  editingId === traveler.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {editingId === traveler.id ? (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Label htmlFor="edit-name" className="text-xs">Name</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Name"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-age" className="text-xs">Age</Label>
                        <Input
                          id="edit-age"
                          type="number"
                          min="0"
                          max="120"
                          value={formData.age ?? ""}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="Age"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-type" className="text-xs">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) => setFormData({ ...formData, type: v as TravelerType })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(travelerTypeLabels) as TravelerType[]).map((type) => (
                            <SelectItem key={type} value={type}>
                              {travelerEmoji[type]} {travelerTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="edit-email" className="text-xs">Email</Label>
                        {(() => {
                          const editingTraveler = travelers.find(t => t.id === editingId);
                          // For self: always show email from auth (read-only)
                          if (editingTraveler && isSelf(editingTraveler) && currentUserEmail) {
                            return (
                              <div className="h-9 px-3 flex items-center bg-slate-100 rounded-md border text-sm text-slate-600">
                                {currentUserEmail}
                                <span className="ml-1 text-[10px] text-teal-600">(from login)</span>
                              </div>
                            );
                          }
                          // For others with email: show read-only
                          if (editingTraveler?.email) {
                            return (
                              <div className="h-9 px-3 flex items-center bg-slate-100 rounded-md border text-sm text-slate-600">
                                {editingTraveler.email}
                              </div>
                            );
                          }
                          // For others without email: editable
                          return (
                            <Input
                              id="edit-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="email@example.com"
                              className="h-9"
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <Label htmlFor="edit-phone" className="text-xs">Phone</Label>
                        <Input
                          id="edit-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetForm}
                        disabled={loading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{travelerEmoji[traveler.type]}</span>
                      <div>
                        <p className="font-medium text-slate-900 flex items-center gap-2">
                          {traveler.name}
                          {isSelf(traveler) && (
                            <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span>{travelerTypeLabels[traveler.type]}</span>
                          {traveler.age && (
                            <span>• {traveler.age} yrs</span>
                          )}
                          {getTravelerEmail(traveler) && (
                            <span className="flex items-center gap-0.5">
                              <Mail className="w-3 h-3" />
                              {getTravelerEmail(traveler)}
                            </span>
                          )}
                          {traveler.phone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />
                              {traveler.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Share buttons - don't show for self */}
                      {!isSelf(traveler) && getTravelerEmail(traveler) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareViaEmail(traveler)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-teal-600"
                          title="Share via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      {!isSelf(traveler) && traveler.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareViaWhatsApp(traveler)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-green-600"
                          title="Share via WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(traveler)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {/* Don't allow deleting self */}
                      {!isSelf(traveler) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(traveler.id)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                          disabled={loading}
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {travelers.length === 0 && !isAdding && (
              <div className="text-center py-6 text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No travelers added yet</p>
              </div>
            )}
          </div>

          {/* Add traveler form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="border border-teal-500 bg-teal-50 rounded-lg p-3 space-y-3">
              <p className="font-medium text-sm text-teal-800">Add New Traveler</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="new-name" className="text-xs">Name *</Label>
                  <Input
                    id="new-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name"
                    className="h-9 bg-white"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="new-age" className="text-xs">Age</Label>
                  <Input
                    id="new-age"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.age ?? ""}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Age"
                    className="h-9 bg-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="new-type" className="text-xs">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as TravelerType })}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(travelerTypeLabels) as TravelerType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {travelerEmoji[type]} {travelerTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-email" className="text-xs">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="h-9 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="new-phone" className="text-xs">Phone</Label>
                  <Input
                    id="new-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-9 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  Add Traveler
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setIsAdding(true); setEditingId(null); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Traveler
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
