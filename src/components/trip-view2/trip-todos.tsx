"use client";

import { TripTodo, TodoPriority } from "@/lib/types";
import { useState } from "react";
import { Check, AlertCircle, Pencil, Plus, Trash2, X, Save, ExternalLink, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO, isValid } from "date-fns";

// Helper to format dates - handles both ISO strings and pre-formatted strings
function formatDate(dateStr: string | undefined, formatStr: string = "MMM d"): string {
  if (!dateStr) return "";

  // Check if it's an ISO date string (contains T or looks like YYYY-MM-DD)
  if (dateStr.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    try {
      const parsed = parseISO(dateStr);
      if (isValid(parsed)) {
        return format(parsed, formatStr);
      }
    } catch {
      // Fall through to return original
    }
  }

  // Return as-is if it's already formatted or can't be parsed
  return dateStr;
}

function formatBookingDate(dateStr: string | undefined): string {
  return formatDate(dateStr, "MMM d, yyyy • h:mm a");
}

// Determine if a todo is a booking (vs a task to complete)
// Booking todos: in flights/tours categories with links, or title starts with "Book" or "Buy"
function isBookingTodo(todo: TripTodo): boolean {
  const bookingCategories = ["flights", "tours", "bookings"];
  const titleLower = todo.title.toLowerCase();

  // Check if title starts with booking-related words
  if (titleLower.startsWith("book ") || titleLower.startsWith("buy ") || titleLower.startsWith("reserve ")) {
    return true;
  }

  // Check if in booking category with a link
  if (bookingCategories.includes(todo.category) && todo.link_url) {
    return true;
  }

  return false;
}

interface TripTodosProps {
  todos: TripTodo[];
  tripId?: string;
  editable?: boolean;
}

const categoryInfo: Record<string, { emoji: string; title: string }> = {
  flights: { emoji: "✈️", title: "Flights & Transport" },
  tours: { emoji: "🎟️", title: "Tours & Tickets" },
  admin: { emoji: "📋", title: "Pre-Trip Admin" },
  bookings: { emoji: "✈️", title: "Bookings to Make" },
  documents: { emoji: "📄", title: "Documents to Prepare" },
  before_trip: { emoji: "📋", title: "Before We Go" },
  packing: { emoji: "🧳", title: "Packing" },
};

const priorityConfig: Record<TodoPriority, { className: string; label: string }> = {
  HIGH: { className: "bg-red-100 text-red-700 border-red-200", label: "HIGH" },
  MEDIUM: { className: "bg-amber-100 text-amber-700 border-amber-200", label: "MEDIUM" },
  LOW: { className: "bg-green-100 text-green-700 border-green-200", label: "LOW" },
};

const categories = ["flights", "tours", "admin", "bookings", "documents", "before_trip", "packing"];

export function TripTodos({ todos: initialTodos, tripId, editable = true }: TripTodosProps) {
  const [todos, setTodos] = useState<TripTodo[]>(initialTodos);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localCompleted, setLocalCompleted] = useState<Record<string, boolean>>({});
  const [newItemCategory, setNewItemCategory] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");

  const supabase = createClient();

  if (!todos.length && !editMode) return null;

  // Group by category
  const grouped = todos.reduce((acc, todo) => {
    if (!acc[todo.category]) acc[todo.category] = [];
    acc[todo.category].push(todo);
    return acc;
  }, {} as Record<string, TripTodo[]>);

  const isCompleted = (todo: TripTodo) =>
    localCompleted[todo.id] ?? todo.completed;

  const handleToggle = async (todo: TripTodo) => {
    if (editMode) return;
    const newCompleted = !isCompleted(todo);
    setLocalCompleted((prev) => ({ ...prev, [todo.id]: newCompleted }));

    if (tripId && !todo.id.startsWith("default-")) {
      await supabase
        .from("trip_todos")
        .update({ completed: newCompleted })
        .eq("id", todo.id);
    }
  };

  const handleAddItem = (category: string) => {
    setNewItemCategory(category);
    setNewItemTitle("");
  };

  const handleSaveNewItem = async () => {
    if (!newItemTitle.trim() || !newItemCategory || !tripId) return;

    const newTodo: TripTodo = {
      id: `new-${Date.now()}`,
      trip_id: tripId,
      category: newItemCategory,
      title: newItemTitle.trim(),
      completed: false,
      order: todos.filter(t => t.category === newItemCategory).length + 1,
    };

    setTodos([...todos, newTodo]);
    setNewItemCategory(null);
    setNewItemTitle("");
  };

  const handleDeleteItem = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleUpdateTitle = (id: string, title: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, title } : t));
  };

  const handleSaveAll = async () => {
    if (!tripId) return;
    setSaving(true);

    try {
      for (const todo of todos) {
        if (todo.id.startsWith("new-") || todo.id.startsWith("default-")) {
          await supabase.from("trip_todos").insert({
            trip_id: tripId,
            category: todo.category,
            title: todo.title,
            completed: todo.completed,
            order: todo.order,
          });
        } else {
          await supabase.from("trip_todos").update({
            title: todo.title,
            category: todo.category,
            order: todo.order,
          }).eq("id", todo.id);
        }
      }

      const { data } = await supabase
        .from("trip_todos")
        .select("*")
        .eq("trip_id", tripId)
        .order("order");

      if (data) setTodos(data as TripTodo[]);
      setEditMode(false);
    } catch (error) {
      console.error("Save error:", error);
    }

    setSaving(false);
  };

  const totalTodos = todos.length;
  const completedCount = todos.filter((t) => isCompleted(t)).length;
  const pendingCount = totalTodos - completedCount;

  return (
    <section className="py-12 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-white">
            ✅ Trip <span className="text-white/80">To-Do List</span>
          </h2>
          {editable && tripId && (
            <button
              onClick={() => editMode ? handleSaveAll() : setEditMode(true)}
              disabled={saving}
              className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30"
              title={editMode ? "Save changes" : "Edit"}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editMode ? (
                <Save className="w-4 h-4 text-white" />
              ) : (
                <Pencil className="w-4 h-4 text-white" />
              )}
            </button>
          )}
          {editMode && (
            <button
              onClick={() => setEditMode(false)}
              className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30"
              title="Cancel"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        <p className="text-center mb-8">
          {pendingCount > 0 ? (
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-white/30">
              <AlertCircle className="w-4 h-4" />
              {pendingCount} pending items
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-green-500/30 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-green-400/30">
              <Check className="w-4 h-4" />
              All done!
            </span>
          )}
        </p>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/50">
          {(editMode ? categories : Object.keys(grouped)).map((category, idx) => {
            const categoryTodos = grouped[category] || [];
            const info = categoryInfo[category] || {
              emoji: "📌",
              title: category,
            };

            if (!editMode && categoryTodos.length === 0) return null;

            return (
              <div
                key={category}
                className={idx > 0 ? "border-t border-gray-200" : ""}
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 font-semibold text-navy flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-base">{info.title}</span>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => handleAddItem(category)}
                      className="text-teal hover:text-teal-dark text-sm flex items-center gap-1.5 bg-teal/10 px-3 py-1.5 rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {categoryTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isCompleted={isCompleted(todo)}
                      editMode={editMode}
                      onToggle={() => handleToggle(todo)}
                      onUpdateTitle={(title) => handleUpdateTitle(todo.id, title)}
                      onDelete={() => handleDeleteItem(todo.id)}
                    />
                  ))}

                  {newItemCategory === category && (
                    <div className="flex items-center gap-3 px-6 py-4 bg-teal/5">
                      <Input
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="New item..."
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleSaveNewItem()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSaveNewItem} className="bg-teal">
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setNewItemCategory(null)}>
                        Cancel
                      </Button>
                    </div>
                  )}

                  {editMode && categoryTodos.length === 0 && newItemCategory !== category && (
                    <div className="px-6 py-4 text-gray-400 text-sm text-center">
                      No items. Click &ldquo;Add&rdquo; to create one.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface TodoItemProps {
  todo: TripTodo;
  isCompleted: boolean;
  editMode: boolean;
  onToggle: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
}

function TodoItem({ todo, isCompleted, editMode, onToggle, onUpdateTitle, onDelete }: TodoItemProps) {
  const hasMetadata = todo.due_date || todo.priority || todo.link_url;
  const hasBookingInfo = todo.booking_date; // booking_ref shown separately

  return (
    <div
      onClick={() => !editMode && onToggle()}
      className={`px-6 py-4 ${editMode ? "" : "cursor-pointer"} transition-all ${
        isCompleted && !editMode
          ? "bg-gradient-to-r from-green-50 to-emerald-50/50"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        {!editMode && (
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              isCompleted
                ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-400 shadow-sm"
                : "border-gray-300 hover:border-teal"
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 text-white" />}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editMode ? (
            <Input
              value={todo.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="text-navy"
            />
          ) : (
            <>
              {/* Title */}
              <div
                className={`font-medium transition-all ${
                  isCompleted ? "text-gray-400 line-through" : "text-navy"
                }`}
              >
                {todo.title}
              </div>

              {/* Metadata row: due date, priority, link, booking date */}
              {(hasMetadata || hasBookingInfo) && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {todo.due_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {isBookingTodo(todo) ? "Book by" : "Complete by"}: {formatDate(todo.due_date)}
                    </span>
                  )}
                  {todo.priority && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        priorityConfig[todo.priority].className
                      }`}
                    >
                      {priorityConfig[todo.priority].label}
                    </span>
                  )}
                  {todo.link_url && (
                    <a
                      href={todo.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-teal hover:text-teal-dark font-medium"
                    >
                      {todo.link_text || "Link"} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {todo.booking_date && (
                    <span className="text-[11px] text-gray-400">
                      • {formatBookingDate(todo.booking_date)}
                    </span>
                  )}
                </div>
              )}

              {/* Booking ref only - if exists */}
              {todo.booking_ref && (
                <div className="mt-2 text-xs text-gray-400">
                  Ref: <span className="font-mono">{todo.booking_ref}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete button in edit mode */}
        {editMode && (
          <button
            onClick={() => onDelete()}
            className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
