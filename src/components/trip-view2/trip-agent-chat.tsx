"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripData } from "./trip-data-provider";
import {
  Sparkles,
  X,
  Send,
  Upload,
  FileText,
  Plane,
  Hotel,
  Calendar,
  Check,
  Loader2,
  AlertCircle,
  ChevronRight,
  MapPin,
  ListTodo,
  UserPlus,
  CalendarDays,
  Backpack,
  MessageSquareText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AgentActionType, AgentResponse, AgentSuggestion, ProposedChange } from "@/lib/agent/types";

interface TripAgentChatProps {
  tripId: string;
  tripName: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposedChanges?: ProposedChange[];
  suggestions?: AgentSuggestion[];
  appliedChanges?: boolean;
  applyingChangeIndex?: number; // Current change being applied (for progress display)
  dismissedSuggestions?: number[]; // Indices of dismissed suggestions
  // Document that was uploaded (for linking to booking when applied)
  uploadedDocument?: {
    base64: string;
    mimeType: string;
    filename: string;
  };
}

// Session storage key for chat history
const getChatStorageKey = (tripId: string) => `tripvault-chat-${tripId}`;

export function TripAgentChat({ tripId, tripName }: TripAgentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { refreshStats, refreshTrip } = useTripData();

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const storageKey = getChatStorageKey(tripId);
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        // Invalid stored data, ignore
      }
    }
  }, [tripId]);

  // Save messages to sessionStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = getChatStorageKey(tripId);
      // Don't store uploadedDocument base64 to save space
      const messagesToStore = messages.map(m => ({
        ...m,
        uploadedDocument: m.uploadedDocument ? { filename: m.uploadedDocument.filename } : undefined,
      }));
      sessionStorage.setItem(storageKey, JSON.stringify(messagesToStore));
    }
  }, [messages, tripId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hey! Welcome to **${tripName}** 🌍

I'm your trip concierge — here to keep everything organized so you can enjoy the journey.

✈️ **Bookings** — Upload flight, hotel, or activity confirmations and I'll sort them instantly

🗓️ **Itinerary** — Paste your plan or build one from scratch

🎒 **Packing & Phrases** — Get a tailored checklist and essential local phrases

✏️ **Quick Edits** — Move activities, update hotels, or tweak your schedule in plain English

What would you like to start with?`,
        },
      ]);
    }
  }, [isOpen, messages.length, tripName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const lowerInput = input.toLowerCase();

      // Determine action type based on input
      let action: AgentActionType;

      // Check for comprehensive itinerary FIRST (long text with day patterns)
      // This takes priority because pasted itineraries often contain packing lists and phrases too
      const hasDayPattern = /day\s*[1-9]|day\s*one|day\s*two|first\s*day/i.test(input);
      const isLongText = input.length > 200;

      // Check for DELETE/REMOVE commands FIRST - these should always go to EDIT_ITINERARY
      // This takes priority over content generation keywords
      const isDeleteCommand = /\b(delete|remove|clear|erase)\b/i.test(lowerInput);

      if (isDeleteCommand) {
        // Explicit delete/remove commands go to EDIT_ITINERARY for the AI to handle
        action = "EDIT_ITINERARY";
      } else if (isLongText && hasDayPattern) {
        // Long text with day patterns = comprehensive itinerary (may include packing/phrases)
        action = "PARSE_ITINERARY";
      } else if (
        lowerInput.includes("help me plan") ||
        lowerInput.includes("plan my itinerary") ||
        lowerInput.includes("create itinerary") ||
        lowerInput.includes("generate itinerary") ||
        lowerInput.includes("itinerary prompt") ||
        lowerInput.includes("need an itinerary")
      ) {
        action = "GENERATE_ITINERARY_PROMPT";
      } else if (
        lowerInput.includes("packing") ||
        lowerInput.includes("pack list") ||
        lowerInput.includes("what to pack") ||
        lowerInput.includes("what should i pack")
      ) {
        action = "GENERATE_PACKING";
      } else if (
        lowerInput.includes("phrase") ||
        lowerInput.includes("local language") ||
        lowerInput.includes("how to say") ||
        lowerInput.includes("essential words")
      ) {
        action = "GENERATE_PHRASES";
      } else if (
        lowerInput.includes("todo") ||
        lowerInput.includes("to-do") ||
        lowerInput.includes("to do") ||
        lowerInput.includes("checklist") ||
        lowerInput.includes("what should i book") ||
        lowerInput.includes("booking reminder")
      ) {
        action = "GENERATE_TODOS";
      } else if (hasDayPattern || lowerInput.includes("arrival") || isLongText) {
        action = "PARSE_ITINERARY";
      } else {
        // Check if this is a casual/greeting message that doesn't need AI processing
        const casualPatterns = /^(hi|hello|hey|sup|yo|hola|what's up|whats up|howdy|greetings|good morning|good afternoon|good evening|thanks|thank you|ok|okay|cool|nice|great|awesome)\b/i;
        if (casualPatterns.test(lowerInput.trim()) && lowerInput.trim().length < 30) {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `Hey! 👋 Here's how I can help:\n\n📎 **Upload a booking** — tap the clip icon to add confirmations\n🎒 **"Generate packing list"** — tailored to your destination\n🗣️ **"Generate local phrases"** — essential words for your trip\n📋 **Paste an itinerary** — I'll organize it for you\n🧠 **"Help me plan my itinerary"** — get a ready-to-use AI prompt\n\nJust type or tap — what sounds good?`,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }
        action = "EDIT_ITINERARY";
      }

      // Build conversation history for context (last 10 messages)
      const conversationHistory = messages
        .filter(m => m.role === "user" || (m.role === "assistant" && !m.proposedChanges))
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch(`/api/trips/${tripId}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          tripId,
          text: input,
          conversationHistory,
        }),
      });

      const data: AgentResponse = await response.json();

      if (!response.ok) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: data.message || "Something went wrong. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || (data.proposedChanges?.length > 0 ? "Here's what I found:" : "I couldn't process that request."),
        proposedChanges: data.proposedChanges?.length > 0 ? data.proposedChanges : undefined,
        suggestions: data.suggestions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Oops! Something didn't work as expected. Give it another try, or rephrase your request 🔄",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Add user message about upload
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: `📎 Uploading: ${file.name}`,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      const documentInfo = {
        base64,
        mimeType: file.type,
        filename: file.name,
      };

      const response = await fetch(`/api/trips/${tripId}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PARSE_DOCUMENT",
          tripId,
          document: documentInfo,
        }),
      });

      const data: AgentResponse = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || "I've analyzed your document:",
        proposedChanges: data.proposedChanges?.length > 0 ? data.proposedChanges : undefined,
        // Store document so it can be uploaded when changes are applied
        uploadedDocument: data.proposedChanges?.length > 0 ? documentInfo : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Hmm, I couldn't read that document. Try uploading a clearer image or a different file format (PNG, JPG, PDF) 📄",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyChanges = async (
    messageId: string,
    changes: ProposedChange[],
    uploadedDocument?: Message["uploadedDocument"]
  ) => {
    setIsApplying(true);

    // Show progress as we apply changes one by one
    for (let i = 0; i < changes.length; i++) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, applyingChangeIndex: i }
            : msg
        )
      );

      // Small delay to show progress visually
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/agent/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          changes,
          // Include document so it gets uploaded and linked to the booking
          document: uploadedDocument,
        }),
      });

      const data = await response.json();

      // Update the message to show changes were applied
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, appliedChanges: true, applyingChangeIndex: undefined }
            : msg
        )
      );

      // Add confirmation message with any warnings and suggestions
      let confirmContent = "";
      if (data.success) {
        confirmContent = `✅ Done! ${changes.length} change${changes.length > 1 ? 's' : ''} applied to your trip.`;
        if (data.warnings && data.warnings.length > 0) {
          confirmContent += "\n\n⚠️ **Heads up — booking conflicts:**\n" + data.warnings.join("\n");
        }
        if (!data.warnings?.length && !data.suggestions?.length) {
          confirmContent += " Refreshing page...";
        }
      } else {
        confirmContent = `⚠️ Heads up — some changes didn't go through: ${data.errors?.join(", ")}`;
      }

      const confirmMessage: Message = {
        id: `confirm-${Date.now()}`,
        role: "assistant",
        content: confirmContent,
        // Include suggestions from the apply response for user action
        suggestions: data.suggestions,
      };
      setMessages((prev) => [...prev, confirmMessage]);

      // Refresh both stats and the full page to show new data (packing list, phrases, etc.)
      if (data.success) {
        const delay = data.suggestions?.length ? 2000 : 500;
        setTimeout(() => {
          refreshStats();
          // Use router.refresh() to re-fetch server components and show updated data
          router.refresh();
        }, delay);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Couldn't save those changes right now. Please try again in a moment ⚙️",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsApplying(false);
    }
  };

  const handleAcceptSuggestion = async (messageId: string, suggestion: AgentSuggestion, suggestionIndex: number) => {
    setIsApplying(true);

    try {
      let endpoint: string;
      let method: string = "PATCH";
      let payload: Record<string, unknown>;
      let confirmContent: string;

      if (suggestion.type === "location_mismatch") {
        // Update trip destinations
        endpoint = `/api/trips/${tripId}`;
        const newLocations = suggestion.data?.newLocations as string[] || [];
        const currentDests = suggestion.data?.currentDestinations as string[] || [];
        payload = {
          destinations: [...currentDests, ...newLocations],
        };
        confirmContent = `✅ Destinations updated! Added **${newLocations.join(", ")}** to your trip.`;
      } else if (suggestion.type === "create_todo") {
        // Create todos - handle both old format (activities) and new format (todos)
        endpoint = `/api/trips/${tripId}/todos`;
        method = "POST";

        // New format: todos array with title/description/priority
        const todosData = suggestion.data?.todos as Array<{ title: string; description?: string; priority?: string }> | undefined;
        // Old format: activities array of strings
        const activitiesData = suggestion.data?.activities as string[] | undefined;
        // Priority from suggestion data (default to HIGH for booking-related todos)
        const defaultPriority = (suggestion.data?.priority as string) || "HIGH";

        if (todosData && todosData.length > 0) {
          payload = {
            todos: todosData.map((todo) => ({
              title: todo.title,
              description: todo.description,
              category: suggestion.data?.category || "bookings",
              priority: todo.priority || defaultPriority,
            })),
          };
          confirmContent = `✅ Added ${todosData.length} item${todosData.length > 1 ? 's' : ''} to your checklist. Stay on track! 📝`;
        } else if (activitiesData && activitiesData.length > 0) {
          payload = {
            todos: activitiesData.map((activity) => ({
              title: `Book: ${activity}`,
              category: suggestion.data?.category || "bookings",
              priority: defaultPriority,
            })),
          };
          confirmContent = `✅ Added ${activitiesData.length} booking reminder${activitiesData.length > 1 ? 's' : ''} to your checklist 📝`;
        } else {
          throw new Error("No todos to create");
        }
      } else if (suggestion.type === "update_trip_dates") {
        // Update trip end date
        endpoint = `/api/trips/${tripId}`;
        const suggestedEndDate = suggestion.data?.suggestedEndDate as string;
        payload = {
          end_date: suggestedEndDate,
        };
        const newDuration = suggestion.data?.newDuration as number;
        confirmContent = `✅ Trip updated to **${newDuration} days**. Your itinerary dates are now in sync 📅`;
      } else if (suggestion.type === "create_booking") {
        // Create hotel/flight bookings
        endpoint = `/api/trips/${tripId}/bookings`;
        method = "POST";
        const bookingsData = suggestion.data?.bookings as Array<{
          type: string;
          hotel_name?: string;
          check_in?: string;
          status?: string;
        }>;
        payload = {
          bookings: bookingsData,
        };
        confirmContent = `✅ ${bookingsData?.length || 0} booking${(bookingsData?.length || 0) > 1 ? 's' : ''} added! Head to the **Bookings** tab to review ✈️`;
      } else if (suggestion.type === "remove_booking") {
        // Delete a booking
        const bookingId = suggestion.data?.bookingId as string;
        const bookingDesc = suggestion.data?.description as string || "Booking";
        if (!bookingId) {
          throw new Error("No booking ID provided");
        }
        endpoint = `/api/trips/${tripId}/bookings`;
        method = "DELETE";
        payload = { bookingId };
        confirmContent = `✅ **${bookingDesc}** has been removed from your trip 🗑️`;
      } else if (suggestion.type === "date_mismatch") {
        // For date mismatch, user can choose to remove the booking
        const bookingId = suggestion.data?.bookingId as string;
        const bookingDesc = suggestion.data?.description as string || "Booking";
        if (!bookingId) {
          throw new Error("No booking ID provided");
        }
        endpoint = `/api/trips/${tripId}/bookings`;
        method = "DELETE";
        payload = { bookingId };
        confirmContent = `✅ **${bookingDesc}** removed — no more date conflicts 🗑️`;
      } else {
        throw new Error("Unknown suggestion type");
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to apply suggestion");
      }

      // Mark the suggestion as dismissed (accepted)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                dismissedSuggestions: [...(msg.dismissedSuggestions || []), suggestionIndex],
              }
            : msg
        )
      );

      // Add confirmation message
      const confirmMessage: Message = {
        id: `confirm-${Date.now()}`,
        role: "assistant",
        content: confirmContent,
      };
      setMessages((prev) => [...prev, confirmMessage]);

      // Refresh stats, trip metadata, and page to show changes
      setTimeout(() => {
        refreshStats();
        refreshTrip();
        router.refresh();
      }, 500);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "That suggestion didn't go through. Want to give it another shot? 🔁",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDismissSuggestion = (messageId: string, suggestionIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              dismissedSuggestions: [...(msg.dismissedSuggestions || []), suggestionIndex],
            }
          : msg
      )
    );
  };

  const handleClearChat = () => {
    setMessages([]);
    const storageKey = getChatStorageKey(tripId);
    sessionStorage.removeItem(storageKey);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        data-testid="ai-assistant-button"
        aria-label="Open AI assistant"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center ${
          isOpen ? "hidden" : ""
        }`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Slide-out Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold" data-testid="panel-title">Trip Concierge</span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                data-testid="clear-chat-button"
                title="Clear chat"
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              data-testid="close-panel-button"
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100vh - 140px)" }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  message.role === "user"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                {/* Proposed Changes */}
                {message.proposedChanges && message.proposedChanges.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500">
                      {message.proposedChanges.length > 1
                        ? `${message.proposedChanges.length} changes to apply:`
                        : "Proposed change:"}
                    </p>
                    {message.proposedChanges.map((change, index) => {
                      const isApplyingThis = message.applyingChangeIndex !== undefined && index <= message.applyingChangeIndex;
                      const isCurrentlyApplying = message.applyingChangeIndex === index;

                      return (
                        <div
                          key={change.id}
                          className={`flex items-start gap-2 p-2 rounded-lg border transition-all ${
                            message.appliedChanges
                              ? "bg-green-50 border-green-200"
                              : isApplyingThis
                                ? "bg-teal-50 border-teal-200"
                                : "bg-white border-gray-200"
                          }`}
                        >
                          {message.appliedChanges ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : isCurrentlyApplying ? (
                            <Loader2 className="w-4 h-4 text-teal-500 animate-spin flex-shrink-0" />
                          ) : isApplyingThis ? (
                            <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          ) : (
                            getChangeIcon(change.tool)
                          )}
                          <span className={`text-xs flex-1 ${
                            message.appliedChanges ? "text-green-700" : "text-gray-700"
                          }`}>{change.description}</span>
                        </div>
                      );
                    })}

                    {!message.appliedChanges && message.applyingChangeIndex === undefined && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplyChanges(message.id, message.proposedChanges!, message.uploadedDocument)}
                          disabled={isApplying}
                          className="flex-1 bg-teal-500 hover:bg-teal-600"
                        >
                          {isApplying ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Check className="w-4 h-4 mr-1" />
                          )}
                          Apply {message.proposedChanges.length > 1 ? `All (${message.proposedChanges.length})` : ""}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === message.id
                                  ? { ...msg, proposedChanges: undefined }
                                  : msg
                              )
                            );
                          }}
                          className="flex-1"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}

                    {message.appliedChanges && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                        <Check className="w-3 h-3" />
                        All {message.proposedChanges.length} changes applied
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500">Suggestions:</p>
                    {message.suggestions.map((suggestion, index) => {
                      const isDismissed = message.dismissedSuggestions?.includes(index);
                      if (isDismissed) return null;

                      return (
                        <div
                          key={`${suggestion.type}-${index}`}
                          className="p-3 bg-amber-50 rounded-lg border border-amber-200"
                        >
                          <div className="flex items-start gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-amber-800">{suggestion.title}</p>
                              <p className="text-xs text-amber-700 mt-0.5">{suggestion.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptSuggestion(message.id, suggestion, index)}
                              disabled={isApplying}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs h-7"
                            >
                              {isApplying ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Check className="w-3 h-3 mr-1" />
                              )}
                              Yes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDismissSuggestion(message.id, index)}
                              className="flex-1 text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-100"
                            >
                              No thanks
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Working on it...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-testid="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or paste your itinerary..."
              data-testid="message-input"
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              data-testid="send-button"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 bg-teal-500 hover:bg-teal-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Upload bookings · Paste itineraries · Edit in plain English
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// Helper to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:image/png;base64,)
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

// Get icon for change type
function getChangeIcon(tool: string) {
  switch (tool) {
    case "parse_flight":
      return <Plane className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    case "parse_hotel":
      return <Hotel className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    case "add_activity":
    case "update_activity":
    case "delete_activity":
    case "move_activity":
      return <Calendar className="w-4 h-4 text-teal-500 flex-shrink-0" />;
    case "parse_itinerary_text":
      return <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    case "generate_packing_list":
      return <Backpack className="w-4 h-4 text-orange-500 flex-shrink-0" />;
    case "generate_phrases":
      return <MessageSquareText className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
    default:
      return <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />;
  }
}

// Get icon for suggestion type
function getSuggestionIcon(type: string) {
  switch (type) {
    case "location_mismatch":
      return <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    case "create_todo":
    case "missing_booking":
      return <ListTodo className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    case "missing_traveler":
      return <UserPlus className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    case "update_trip_dates":
      return <CalendarDays className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    case "create_booking":
      return <Hotel className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    case "remove_booking":
    case "date_mismatch":
      return <Trash2 className="w-4 h-4 text-red-500 flex-shrink-0" />;
    default:
      return <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />;
  }
}
