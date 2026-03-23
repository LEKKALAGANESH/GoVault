"use client";

import { PackingItem } from "@/lib/types";
import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PackingChecklistProps {
  items: PackingItem[];
  tripId?: string;
  editable?: boolean;
}

const categoryInfo: Record<string, { emoji: string; title: string }> = {
  essentials: { emoji: "🎒", title: "Essentials" },
  baby: { emoji: "👶", title: "Baby Essentials" },
  senior: { emoji: "👵", title: "Senior Comfort" },
  documents: { emoji: "📄", title: "Documents" },
  medical: { emoji: "💊", title: "Medical Kit" },
  electronics: { emoji: "📱", title: "Electronics" },
  beach: { emoji: "🌴", title: "Beach & Outdoor" },
};

const categories = ["essentials", "baby", "senior", "documents", "medical", "electronics", "beach"];

export function PackingChecklist({ items: initialItems, tripId, editable = true }: PackingChecklistProps) {
  const [items, setItems] = useState<PackingItem[]>(initialItems);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localChecked, setLocalChecked] = useState<Record<string, boolean>>({});
  const [newItemCategory, setNewItemCategory] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  const supabase = createClient();

  if (!items.length && !editMode) return null;

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const handleToggle = async (item: PackingItem) => {
    if (editMode) return;
    const newChecked = !isChecked(item);
    setLocalChecked((prev) => ({ ...prev, [item.id]: newChecked }));

    if (tripId && !item.id.startsWith("default-")) {
      await supabase
        .from("packing_items")
        .update({ checked: newChecked })
        .eq("id", item.id);
    }
  };

  const isChecked = (item: PackingItem) =>
    localChecked[item.id] ?? item.checked;

  const handleAddItem = (category: string) => {
    setNewItemCategory(category);
    setNewItemText("");
  };

  const handleSaveNewItem = () => {
    if (!newItemText.trim() || !newItemCategory || !tripId) return;

    const newItem: PackingItem = {
      id: `new-${Date.now()}`,
      trip_id: tripId,
      category: newItemCategory,
      item: newItemText.trim(),
      checked: false,
      order: items.filter(i => i.category === newItemCategory).length + 1,
    };

    setItems([...items, newItem]);
    setNewItemCategory(null);
    setNewItemText("");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, text: string) => {
    setItems(items.map(i => i.id === id ? { ...i, item: text } : i));
  };

  const handleSaveAll = async () => {
    if (!tripId) return;
    setSaving(true);

    try {
      for (const item of items) {
        if (item.id.startsWith("new-") || item.id.startsWith("default-")) {
          await supabase.from("packing_items").insert({
            trip_id: tripId,
            category: item.category,
            item: item.item,
            checked: item.checked,
            order: item.order,
          });
        } else {
          await supabase.from("packing_items").update({
            item: item.item,
            category: item.category,
            order: item.order,
          }).eq("id", item.id);
        }
      }

      const { data } = await supabase
        .from("packing_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("order");

      if (data) setItems(data as PackingItem[]);
      setEditMode(false);
    } catch (error) {
      console.error("Save error:", error);
    }

    setSaving(false);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-navy">
            🧳 Packing <span className="text-gold">Checklist</span>
          </h2>
          {editable && tripId && (
            <button
              onClick={() => editMode ? handleSaveAll() : setEditMode(true)}
              disabled={saving}
              className="p-2.5 rounded-full bg-teal/20 hover:bg-teal/30 transition-colors border border-teal/30"
              title={editMode ? "Save changes" : "Edit"}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
              ) : editMode ? (
                <Save className="w-4 h-4 text-teal" />
              ) : (
                <Pencil className="w-4 h-4 text-teal" />
              )}
            </button>
          )}
          {editMode && (
            <button
              onClick={() => setEditMode(false)}
              className="p-2.5 rounded-full bg-teal/20 hover:bg-teal/30 transition-colors border border-teal/30"
              title="Cancel"
            >
              <X className="w-4 h-4 text-teal" />
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(editMode ? categories : Object.keys(grouped)).map((category) => {
            const categoryItems = grouped[category] || [];
            const info = categoryInfo[category] || {
              emoji: "📦",
              title: category,
            };

            if (!editMode && categoryItems.length === 0) return null;

            return (
              <div
                key={category}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h3 className="text-teal font-semibold flex items-center gap-3">
                    <span className="text-2xl bg-teal/10 p-2 rounded-xl">{info.emoji}</span>
                    <span className="text-base">{info.title}</span>
                  </h3>
                  {editMode && (
                    <button
                      onClick={() => handleAddItem(category)}
                      className="text-teal hover:text-teal-dark text-sm flex items-center gap-1 bg-teal/10 px-3 py-1.5 rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !editMode && handleToggle(item)}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        editMode ? "" : "cursor-pointer"
                      } transition-all ${
                        isChecked(item) && !editMode
                          ? "bg-gradient-to-r from-green-50 to-emerald-50/50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {!editMode && (
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isChecked(item)
                              ? "bg-gradient-to-br from-teal to-teal-dark border-teal shadow-sm"
                              : "border-teal/50 hover:border-teal"
                          }`}
                        >
                          {isChecked(item) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      )}
                      {editMode ? (
                        <Input
                          value={item.item}
                          onChange={(e) => handleUpdateItem(item.id, e.target.value)}
                          className="flex-1 text-sm"
                        />
                      ) : (
                        <span
                          className={`text-sm flex-1 transition-all ${
                            isChecked(item)
                              ? "text-gray-400 line-through"
                              : "text-navy"
                          }`}
                        >
                          {item.item}
                        </span>
                      )}
                      {editMode && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* New item input */}
                  {newItemCategory === category && (
                    <div className="flex items-center gap-2 p-3 bg-teal/5 rounded-xl border border-teal/20">
                      <Input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="New item..."
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleSaveNewItem()}
                        className="flex-1 text-sm"
                      />
                      <Button size="sm" onClick={handleSaveNewItem} className="bg-gradient-to-r from-teal to-teal-dark text-xs">
                        Add
                      </Button>
                    </div>
                  )}

                  {editMode && categoryItems.length === 0 && newItemCategory !== category && (
                    <div className="text-gray-400 text-sm text-center py-4 bg-gray-50 rounded-xl">
                      No items
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
