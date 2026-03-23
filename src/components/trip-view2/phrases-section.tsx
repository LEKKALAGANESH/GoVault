"use client";

import { useState } from "react";
import { Phrase } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Plus, Trash2, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PhrasesSectionProps {
  phrases: Phrase[];
  tripId?: string;
  editable?: boolean;
}

export function PhrasesSection({ phrases: initialPhrases, tripId, editable = true }: PhrasesSectionProps) {
  const [phrases, setPhrases] = useState<Phrase[]>(initialPhrases);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhrase, setNewPhrase] = useState({ english: "", local_text: "", pronunciation: "" });

  const supabase = createClient();

  if (!phrases.length && !editMode) return null;

  const handleAddPhrase = () => {
    if (!newPhrase.english.trim() || !newPhrase.local_text.trim()) return;

    const phrase: Phrase = {
      id: `new-${Date.now()}`,
      trip_id: tripId || "",
      english: newPhrase.english.trim(),
      local_text: newPhrase.local_text.trim(),
      pronunciation: newPhrase.pronunciation.trim() || undefined,
      order: phrases.length + 1,
    };

    setPhrases([...phrases, phrase]);
    setNewPhrase({ english: "", local_text: "", pronunciation: "" });
    setShowAddForm(false);
  };

  const handleDeletePhrase = (id: string) => {
    setPhrases(phrases.filter(p => p.id !== id));
  };

  const handleUpdatePhrase = (id: string, field: keyof Phrase, value: string) => {
    setPhrases(phrases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSaveAll = async () => {
    if (!tripId) return;
    setSaving(true);

    try {
      for (const phrase of phrases) {
        if (phrase.id.startsWith("new-") || phrase.id.startsWith("default-")) {
          await supabase.from("phrases").insert({
            trip_id: tripId,
            english: phrase.english,
            local_text: phrase.local_text,
            pronunciation: phrase.pronunciation,
            order: phrase.order,
          });
        } else {
          await supabase.from("phrases").update({
            english: phrase.english,
            local_text: phrase.local_text,
            pronunciation: phrase.pronunciation,
            order: phrase.order,
          }).eq("id", phrase.id);
        }
      }

      const { data } = await supabase
        .from("phrases")
        .select("*")
        .eq("trip_id", tripId)
        .order("order");

      if (data) setPhrases(data as Phrase[]);
      setEditMode(false);
    } catch (error) {
      console.error("Save error:", error);
    }

    setSaving(false);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-navy via-slate-800 to-navy relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="max-w-6xl mx-auto px-4 relative">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-white">
            🗣️ Local Language <span className="text-gold">Phrases</span>
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
            <>
              <button
                onClick={() => setShowAddForm(true)}
                className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30"
                title="Add phrase"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30"
                title="Cancel"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="mb-6 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                value={newPhrase.english}
                onChange={(e) => setNewPhrase({ ...newPhrase, english: e.target.value })}
                placeholder="English (e.g., Hello)"
                className="bg-white"
              />
              <Input
                value={newPhrase.local_text}
                onChange={(e) => setNewPhrase({ ...newPhrase, local_text: e.target.value })}
                placeholder="Local text (e.g., สวัสดี)"
                className="bg-white"
              />
              <Input
                value={newPhrase.pronunciation}
                onChange={(e) => setNewPhrase({ ...newPhrase, pronunciation: e.target.value })}
                placeholder="Pronunciation (e.g., Sa-wat-dee)"
                className="bg-white"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddPhrase} className="bg-gradient-to-r from-gold to-amber-500 text-navy hover:brightness-105 font-semibold">
                Add Phrase
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {phrases.map((phrase) => (
            <div
              key={phrase.id}
              className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center hover:bg-white/15 hover:border-white/30 transition-all shadow-lg relative ${
                editMode ? "group" : ""
              }`}
            >
              {editMode && (
                <button
                  onClick={() => handleDeletePhrase(phrase.id)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              {editMode ? (
                <>
                  <Input
                    value={phrase.english}
                    onChange={(e) => handleUpdatePhrase(phrase.id, "english", e.target.value)}
                    className="bg-white/10 text-gold text-sm mb-2 text-center border-white/20"
                  />
                  <Input
                    value={phrase.local_text}
                    onChange={(e) => handleUpdatePhrase(phrase.id, "local_text", e.target.value)}
                    className="bg-white/10 text-white text-center mb-1 border-white/20"
                  />
                  <Input
                    value={phrase.pronunciation || ""}
                    onChange={(e) => handleUpdatePhrase(phrase.id, "pronunciation", e.target.value)}
                    placeholder="Pronunciation"
                    className="bg-white/10 text-white/60 text-xs text-center border-white/20"
                  />
                </>
              ) : (
                <>
                  <div className="text-gold font-semibold text-sm mb-2 bg-gold/10 px-2 py-1 rounded-lg inline-block">
                    {phrase.english}
                  </div>
                  <div className="text-white text-2xl font-thai mb-2">
                    {phrase.local_text}
                  </div>
                  {phrase.pronunciation && (
                    <div className="text-white/70 text-xs italic bg-white/5 px-2 py-1 rounded-md inline-block">
                      {phrase.pronunciation}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {editMode && phrases.length === 0 && (
          <div className="text-center text-white/60 py-12 bg-white/5 rounded-2xl border border-dashed border-white/20">
            No phrases yet. Click the + button to add one.
          </div>
        )}
      </div>
    </section>
  );
}
