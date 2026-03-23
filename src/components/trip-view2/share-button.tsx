"use client";

import { useState } from "react";
import { Share2, Check, Copy, Link, Mail, Send, Plus, X, Loader2 } from "lucide-react";
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
import type { Traveler } from "@/lib/types";

interface ShareButtonProps {
  tripSlug: string;
  tripName?: string;
  travelers?: Traveler[];
  onTravelerEmailUpdate?: (travelerId: string, email: string) => Promise<void>;
  currentUserId?: string;
  currentUserEmail?: string;
}

export function ShareButton({ tripSlug, tripName = "Trip", travelers = [], onTravelerEmailUpdate, currentUserId, currentUserEmail }: ShareButtonProps) {
  // Helper to check if a traveler is the current user
  const isSelf = (traveler: Traveler) => traveler.user_id === currentUserId;

  // Get display email for a traveler
  const getTravelerEmail = (traveler: Traveler) => {
    if (isSelf(traveler) && currentUserEmail) return currentUserEmail;
    return traveler.email;
  };
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingTravelerId, setEditingTravelerId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${tripSlug}`
    : `/share/${tripSlug}`;

  const handleCopy = async () => {
    const url = `${window.location.origin}/share/${tripSlug}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/share/${tripSlug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${tripName}!`,
          text: "I wanted to share my trip itinerary with you",
          url: url,
        });
        setOpen(false);
      } catch {
        // User cancelled
      }
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

  const startEditingEmail = (traveler: Traveler) => {
    setEditingTravelerId(traveler.id);
    setEmailInput(traveler.email || "");
  };

  const saveEmail = async () => {
    if (!editingTravelerId || !onTravelerEmailUpdate) return;

    setSaving(true);
    try {
      await onTravelerEmailUpdate(editingTravelerId, emailInput);
      setEditingTravelerId(null);
      setEmailInput("");
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const cancelEditingEmail = () => {
    setEditingTravelerId(null);
    setEmailInput("");
  };

  const travelerEmoji: Record<string, string> = {
    ADULT: "👤",
    SENIOR: "👵",
    CHILD: "👦",
    INFANT: "👶",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Share2 className="w-5 h-5 text-teal-600" />
            Share Itinerary
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Share a public link to your trip itinerary. Anyone with this link can view your trip details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 w-full overflow-hidden">
          {/* Share URL */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 min-w-0 flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
              <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate font-mono">
                {shareUrl}
              </span>
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? "default" : "outline"}
              size="sm"
              className={`flex-shrink-0 ${copied ? "bg-green-500 hover:bg-green-600 text-white" : "border-slate-300"}`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Native share button (mobile) */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share via...
            </Button>
          )}

          {/* Share with Travelers */}
          {travelers.length > 0 && (
            <div className="pt-2 border-t border-slate-200 w-full">
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Share with Travelers
              </Label>
              <div className="space-y-2">
                {travelers.map((traveler) => (
                  <div
                    key={traveler.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-lg flex-shrink-0">{travelerEmoji[traveler.type] || "👤"}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate flex items-center gap-2">
                          {traveler.name}
                          {isSelf(traveler) && (
                            <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                        </p>
                        {/* For self: always show email from auth */}
                        {isSelf(traveler) && currentUserEmail ? (
                          <p className="text-xs text-slate-500 truncate">{currentUserEmail}</p>
                        ) : editingTravelerId === traveler.id ? (
                          <div className="flex items-center gap-1 mt-1">
                            <Input
                              type="email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              placeholder="email@example.com"
                              className="h-7 text-xs w-32 bg-white"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 flex-shrink-0"
                              onClick={saveEmail}
                              disabled={saving}
                            >
                              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-green-600" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 flex-shrink-0"
                              onClick={cancelEditingEmail}
                            >
                              <X className="w-3 h-3 text-slate-500" />
                            </Button>
                          </div>
                        ) : traveler.email ? (
                          <p className="text-xs text-slate-500 truncate">{traveler.email}</p>
                        ) : onTravelerEmailUpdate && !isSelf(traveler) ? (
                          <button
                            onClick={() => startEditingEmail(traveler)}
                            className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add email
                          </button>
                        ) : (
                          <p className="text-xs text-slate-400">No email</p>
                        )}
                      </div>
                    </div>
                    {/* Don't show share buttons for self */}
                    {!isSelf(traveler) && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getTravelerEmail(traveler) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareViaEmail(traveler)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                            title="Share via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        {traveler.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareViaWhatsApp(traveler)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-green-600 hover:bg-green-50"
                            title="Share via WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy note */}
          <p className="text-xs text-slate-500 text-center pt-2">
            Public links show trip details without personal booking information.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
