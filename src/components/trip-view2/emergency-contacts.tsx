"use client";

import { useState } from "react";
import { EmergencyContact } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Phone, MessageCircle, Pencil, Plus, Trash2, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  tripId?: string;
  tripName?: string;
  travelers?: string[];
  editable?: boolean;
}

const categoryInfo: Record<string, { emoji: string; title: string }> = {
  emergency: { emoji: "🚨", title: "Emergency Numbers" },
  hospital: { emoji: "🏥", title: "Hospitals" },
  embassy: { emoji: "🇮🇳", title: "Embassy" },
  hotel: { emoji: "🏨", title: "Hotels" },
  family: { emoji: "👨‍👩‍👧", title: "Family" },
};

const categories = ["emergency", "hospital", "embassy", "hotel", "family"];

export function EmergencyContacts({
  contacts: initialContacts,
  tripId,
  tripName,
  travelers = [],
  editable = true,
}: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newContactCategory, setNewContactCategory] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({ label: "", phone: "" });

  const supabase = createClient();

  if (!contacts.length && !editMode) return null;

  // Group contacts by category
  const grouped = contacts.reduce((acc, contact) => {
    if (!acc[contact.category]) acc[contact.category] = [];
    acc[contact.category].push(contact);
    return acc;
  }, {} as Record<string, EmergencyContact[]>);

  const handleSOS = () => {
    const hotelContacts = contacts
      .filter((c) => c.category === "hotel")
      .map((c) => `• ${c.label}: ${c.phone}`)
      .join("\n");

    const message = encodeURIComponent(
      `🆘 EMERGENCY - ${tripName || "Trip"}\n\nTravelers: ${travelers.join(", ")}\n\nHotels:\n${hotelContacts}\n\nEmergency: Tourist Police 1155`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleAddContact = (category: string) => {
    setNewContactCategory(category);
    setNewContact({ label: "", phone: "" });
  };

  const handleSaveNewContact = () => {
    if (!newContact.label.trim() || !newContactCategory || !tripId) return;

    const contact: EmergencyContact = {
      id: `new-${Date.now()}`,
      trip_id: tripId,
      category: newContactCategory,
      label: newContact.label.trim(),
      phone: newContact.phone.trim() || undefined,
      order: contacts.filter(c => c.category === newContactCategory).length + 1,
    };

    setContacts([...contacts, contact]);
    setNewContactCategory(null);
    setNewContact({ label: "", phone: "" });
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleUpdateContact = (id: string, field: keyof EmergencyContact, value: string) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveAll = async () => {
    if (!tripId) return;
    setSaving(true);

    try {
      for (const contact of contacts) {
        if (contact.id.startsWith("new-") || contact.id.startsWith("default-")) {
          await supabase.from("emergency_contacts").insert({
            trip_id: tripId,
            category: contact.category,
            label: contact.label,
            phone: contact.phone,
            address: contact.address,
            notes: contact.notes,
            order: contact.order,
          });
        } else {
          await supabase.from("emergency_contacts").update({
            label: contact.label,
            phone: contact.phone,
            category: contact.category,
            order: contact.order,
          }).eq("id", contact.id);
        }
      }

      const { data } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("trip_id", tripId)
        .order("order");

      if (data) setContacts(data as EmergencyContact[]);
      setEditMode(false);
    } catch (error) {
      console.error("Save error:", error);
    }

    setSaving(false);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 relative overflow-hidden">
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="max-w-6xl mx-auto px-4 relative">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h2 className="font-playfair text-2xl md:text-3xl text-center text-white">
            🆘 Emergency <span className="text-amber-200">Contacts</span>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(editMode ? categories : Object.keys(grouped)).map((category) => {
            const categoryContacts = grouped[category] || [];
            const info = categoryInfo[category] || {
              emoji: "📞",
              title: category,
            };

            if (!editMode && categoryContacts.length === 0) return null;

            return (
              <div
                key={category}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
                  <h3 className="text-amber-200 font-semibold flex items-center gap-3">
                    <span className="text-xl bg-white/10 p-2 rounded-xl">{info.emoji}</span>
                    <span className="text-sm">{info.title}</span>
                  </h3>
                  {editMode && (
                    <button
                      onClick={() => handleAddContact(category)}
                      className="text-amber-200 hover:text-white text-sm bg-white/10 p-1.5 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {categoryContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`py-2 ${!editMode ? "border-b border-white/10 last:border-b-0" : ""}`}
                    >
                      {editMode ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={contact.label}
                              onChange={(e) => handleUpdateContact(contact.id, "label", e.target.value)}
                              placeholder="Label"
                              className="bg-white/10 text-white text-sm border-white/20"
                            />
                            <Input
                              value={contact.phone || ""}
                              onChange={(e) => handleUpdateContact(contact.id, "phone", e.target.value)}
                              placeholder="Phone"
                              className="bg-white/10 text-white text-sm border-white/20"
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-300 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-white/90 text-sm">
                            {contact.label}
                          </span>
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone.replace(/\s/g, "")}`}
                              className="text-amber-200 font-semibold text-sm hover:text-white transition-colors bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* New contact form */}
                  {newContactCategory === category && (
                    <div className="space-y-2 p-3 bg-white/10 rounded-xl border border-white/20">
                      <Input
                        value={newContact.label}
                        onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                        placeholder="Label (e.g., Tourist Police)"
                        autoFocus
                        className="bg-white/10 text-white text-sm border-white/20"
                      />
                      <Input
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="Phone number"
                        onKeyDown={(e) => e.key === "Enter" && handleSaveNewContact()}
                        className="bg-white/10 text-white text-sm border-white/20"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveNewContact} className="bg-gradient-to-r from-amber-400 to-amber-500 text-navy text-xs flex-1 font-semibold">
                          Add
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setNewContactCategory(null)} className="text-white text-xs hover:bg-white/10">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {editMode && categoryContacts.length === 0 && newContactCategory !== category && (
                    <div className="text-white/50 text-sm text-center py-4 bg-white/5 rounded-xl">
                      No contacts
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SOS Button */}
        {!editMode && (
          <button
            onClick={handleSOS}
            className="mt-10 mx-auto block bg-white text-red-600 font-bold py-4 px-10 rounded-2xl text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3 border-2 border-white/50"
          >
            <MessageCircle className="w-6 h-6" />
            🆘 Send Emergency SOS via WhatsApp
          </button>
        )}
      </div>
    </section>
  );
}
