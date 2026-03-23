"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save, GripVertical, Wand2, Sparkles, Loader2, Users, Globe } from "lucide-react";
import type { SurvivalTip, Phrase, PackingItem, EmergencyContact, TripTodo } from "@/lib/types";
import {
  defaultTodos,
  defaultPhrases,
  defaultPackingItems,
  defaultEmergencyContacts,
} from "@/lib/defaults/thailand-trip";

interface TravelerInput {
  name: string;
  age?: string;
  nationality?: string;
}

// Helper to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function ExtrasPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const supabase = createClient();

  const [tripId, setTripId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for each section
  const [todos, setTodos] = useState<TripTodo[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [survivalTips, setSurvivalTips] = useState<SurvivalTip[]>([]);

  // AI Generation state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateType, setGenerateType] = useState<"phrases" | "packing" | "emergency" | "todos" | "all">("all");
  const [originCountry, setOriginCountry] = useState("India");
  const [travelers, setTravelers] = useState<TravelerInput[]>([{ name: "", age: "", nationality: "" }]);

  // Resolve slug to tripId on mount
  useEffect(() => {
    async function resolveTripId() {
      if (!slug) return;

      let resolvedId: string | null = null;

      if (isUUID(slug)) {
        // It's already a UUID
        resolvedId = slug;
      } else {
        // Look up by slug
        const { data } = await supabase
          .from("trips")
          .select("id")
          .eq("slug", slug)
          .single();
        resolvedId = data?.id || null;
      }

      if (resolvedId) {
        setTripId(resolvedId);
      } else {
        router.push("/trips");
      }
    }

    resolveTripId();
  }, [slug, supabase, router]);

  // Load data when tripId is resolved
  useEffect(() => {
    if (tripId) {
      loadData();
    }
  }, [tripId]);

  async function loadData() {
    if (!tripId) return;
    setLoading(true);
    const [
      { data: todosData },
      { data: phrasesData },
      { data: packingData },
      { data: contactsData },
      { data: tipsData },
    ] = await Promise.all([
      supabase.from("trip_todos").select("*").eq("trip_id", tripId).order("order"),
      supabase.from("phrases").select("*").eq("trip_id", tripId).order("order"),
      supabase.from("packing_items").select("*").eq("trip_id", tripId).order("order"),
      supabase.from("emergency_contacts").select("*").eq("trip_id", tripId).order("order"),
      supabase.from("survival_tips").select("*").eq("trip_id", tripId).order("order"),
    ]);

    setTodos((todosData as TripTodo[]) || []);
    setPhrases((phrasesData as Phrase[]) || []);
    setPackingItems((packingData as PackingItem[]) || []);
    setEmergencyContacts((contactsData as EmergencyContact[]) || []);
    setSurvivalTips((tipsData as SurvivalTip[]) || []);
    setLoading(false);
  }

  // Todo handlers
  const addTodo = () => {
    const newTodo: TripTodo = {
      id: `new-${Date.now()}`,
      trip_id: tripId,
      category: "before_trip",
      title: "",
      completed: false,
      order: todos.length + 1,
    };
    setTodos([...todos, newTodo]);
  };

  const updateTodo = (id: string, field: keyof TripTodo, value: string | boolean) => {
    setTodos(todos.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // Phrase handlers
  const addPhrase = () => {
    const newPhrase: Phrase = {
      id: `new-${Date.now()}`,
      trip_id: tripId,
      english: "",
      local_text: "",
      pronunciation: "",
      order: phrases.length + 1,
    };
    setPhrases([...phrases, newPhrase]);
  };

  const updatePhrase = (id: string, field: keyof Phrase, value: string) => {
    setPhrases(phrases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deletePhrase = (id: string) => {
    setPhrases(phrases.filter(p => p.id !== id));
  };

  // Packing item handlers
  const addPackingItem = () => {
    const newItem: PackingItem = {
      id: `new-${Date.now()}`,
      trip_id: tripId,
      category: "essentials",
      item: "",
      checked: false,
      order: packingItems.length + 1,
    };
    setPackingItems([...packingItems, newItem]);
  };

  const updatePackingItem = (id: string, field: keyof PackingItem, value: string | boolean) => {
    setPackingItems(packingItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const deletePackingItem = (id: string) => {
    setPackingItems(packingItems.filter(i => i.id !== id));
  };

  // Emergency contact handlers
  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      id: `new-${Date.now()}`,
      trip_id: tripId,
      category: "emergency",
      label: "",
      phone: "",
      order: emergencyContacts.length + 1,
    };
    setEmergencyContacts([...emergencyContacts, newContact]);
  };

  const updateEmergencyContact = (id: string, field: keyof EmergencyContact, value: string) => {
    setEmergencyContacts(emergencyContacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteEmergencyContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  // Load Thailand defaults
  const loadDefaults = () => {
    if (!confirm("This will add Thailand-specific defaults. Continue?")) return;

    // Add defaults (keeping existing items)
    const newTodos = defaultTodos.map((t, i) => ({
      ...t,
      id: `new-${Date.now()}-todo-${i}`,
      trip_id: tripId,
    })) as TripTodo[];
    setTodos([...todos, ...newTodos]);

    const newPhrases = defaultPhrases.map((p, i) => ({
      ...p,
      id: `new-${Date.now()}-phrase-${i}`,
      trip_id: tripId,
    })) as Phrase[];
    setPhrases([...phrases, ...newPhrases]);

    const newPackingItems = defaultPackingItems.map((item, i) => ({
      ...item,
      id: `new-${Date.now()}-packing-${i}`,
      trip_id: tripId,
    })) as PackingItem[];
    setPackingItems([...packingItems, ...newPackingItems]);

    const newContacts = defaultEmergencyContacts.map((c, i) => ({
      ...c,
      id: `new-${Date.now()}-contact-${i}`,
      trip_id: tripId,
    })) as EmergencyContact[];
    setEmergencyContacts([...emergencyContacts, ...newContacts]);
  };

  // AI Content Generation
  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const validTravelers = travelers
        .filter(t => t.name.trim())
        .map(t => ({
          name: t.name,
          age: t.age ? parseInt(t.age) : undefined,
          nationality: t.nationality || undefined,
        }));

      const response = await fetch(`/api/trips/${tripId}/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: generateType,
          travelers: validTravelers.length > 0 ? validTravelers : undefined,
          originCountry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      const content = data.content;

      // Apply generated content
      if (content.phrases && (generateType === "phrases" || generateType === "all")) {
        const newPhrases = content.phrases.map((p: { english: string; local_text: string; pronunciation?: string }, i: number) => ({
          id: `new-${Date.now()}-phrase-${i}`,
          trip_id: tripId,
          english: p.english,
          local_text: p.local_text,
          pronunciation: p.pronunciation || "",
          order: phrases.length + i + 1,
        })) as Phrase[];
        setPhrases([...phrases, ...newPhrases]);
      }

      if (content.packing && (generateType === "packing" || generateType === "all")) {
        const newItems = content.packing.map((item: { category: string; item: string }, i: number) => ({
          id: `new-${Date.now()}-packing-${i}`,
          trip_id: tripId,
          category: item.category || "essentials",
          item: item.item,
          checked: false,
          order: packingItems.length + i + 1,
        })) as PackingItem[];
        setPackingItems([...packingItems, ...newItems]);
      }

      if (content.emergency && (generateType === "emergency" || generateType === "all")) {
        const newContacts = content.emergency.map((c: { category: string; label: string; phone?: string; notes?: string }, i: number) => ({
          id: `new-${Date.now()}-contact-${i}`,
          trip_id: tripId,
          category: c.category || "emergency",
          label: c.label,
          phone: c.phone || "",
          notes: c.notes || "",
          order: emergencyContacts.length + i + 1,
        })) as EmergencyContact[];
        setEmergencyContacts([...emergencyContacts, ...newContacts]);
      }

      if (content.todos && (generateType === "todos" || generateType === "all")) {
        const newTodos = content.todos.map((t: { category: string; title: string; description?: string; priority?: string }, i: number) => ({
          id: `new-${Date.now()}-todo-${i}`,
          trip_id: tripId,
          category: t.category || "before_trip",
          title: t.title,
          description: t.description || "",
          completed: false,
          priority: t.priority || "MEDIUM",
          order: todos.length + i + 1,
        })) as TripTodo[];
        setTodos([...todos, ...newTodos]);
      }

      setAiDialogOpen(false);
      alert("Content generated successfully! Don't forget to save your changes.");
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Traveler input handlers
  const addTraveler = () => {
    setTravelers([...travelers, { name: "", age: "", nationality: "" }]);
  };

  const updateTraveler = (index: number, field: keyof TravelerInput, value: string) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  const removeTraveler = (index: number) => {
    setTravelers(travelers.filter((_, i) => i !== index));
  };

  // Save all data
  async function saveAll() {
    setSaving(true);
    try {
      // Save todos
      const existingTodos = todos.filter(t => !t.id.startsWith("new-"));
      const newTodos = todos.filter(t => t.id.startsWith("new-")).map(t => ({
        trip_id: t.trip_id,
        category: t.category,
        title: t.title,
        description: t.description,
        completed: t.completed,
        order: t.order,
      }));

      if (existingTodos.length > 0) {
        for (const todo of existingTodos) {
          await supabase.from("trip_todos").upsert(todo);
        }
      }
      if (newTodos.length > 0) {
        await supabase.from("trip_todos").insert(newTodos);
      }

      // Save phrases
      const existingPhrases = phrases.filter(p => !p.id.startsWith("new-"));
      const newPhrases = phrases.filter(p => p.id.startsWith("new-")).map(p => ({
        trip_id: p.trip_id,
        english: p.english,
        local_text: p.local_text,
        pronunciation: p.pronunciation,
        order: p.order,
      }));

      if (existingPhrases.length > 0) {
        for (const phrase of existingPhrases) {
          await supabase.from("phrases").upsert(phrase);
        }
      }
      if (newPhrases.length > 0) {
        await supabase.from("phrases").insert(newPhrases);
      }

      // Save packing items
      const existingPacking = packingItems.filter(i => !i.id.startsWith("new-"));
      const newPacking = packingItems.filter(i => i.id.startsWith("new-")).map(i => ({
        trip_id: i.trip_id,
        category: i.category,
        item: i.item,
        checked: i.checked,
        order: i.order,
      }));

      if (existingPacking.length > 0) {
        for (const item of existingPacking) {
          await supabase.from("packing_items").upsert(item);
        }
      }
      if (newPacking.length > 0) {
        await supabase.from("packing_items").insert(newPacking);
      }

      // Save emergency contacts
      const existingContacts = emergencyContacts.filter(c => !c.id.startsWith("new-"));
      const newContacts = emergencyContacts.filter(c => c.id.startsWith("new-")).map(c => ({
        trip_id: c.trip_id,
        category: c.category,
        label: c.label,
        phone: c.phone,
        address: c.address,
        notes: c.notes,
        order: c.order,
      }));

      if (existingContacts.length > 0) {
        for (const contact of existingContacts) {
          await supabase.from("emergency_contacts").upsert(contact);
        }
      }
      if (newContacts.length > 0) {
        await supabase.from("emergency_contacts").insert(newContacts);
      }

      // Reload data to get proper IDs
      await loadData();
      alert("Saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save. Please try again.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/trips/${slug}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-playfair text-xl text-navy">Manage Trip Essentials</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal" />
                    AI-Powered Content Generator
                  </DialogTitle>
                  <DialogDescription>
                    AI will generate personalized content based on your trip details, travelers, and destination.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Content Type Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">What to generate</label>
                    <Select value={generateType} onValueChange={(v) => setGenerateType(v as typeof generateType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everything (Recommended)</SelectItem>
                        <SelectItem value="todos">Pre-trip Checklist (Visa, Documents, etc.)</SelectItem>
                        <SelectItem value="phrases">Essential Phrases</SelectItem>
                        <SelectItem value="packing">Packing List</SelectItem>
                        <SelectItem value="emergency">Emergency Contacts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Origin Country */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Traveling from (for visa info)
                    </label>
                    <Input
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      placeholder="e.g., India, United States, UK"
                    />
                  </div>

                  {/* Travelers */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Travelers (optional - for personalized packing)
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {travelers.map((traveler, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={traveler.name}
                            onChange={(e) => updateTraveler(index, "name", e.target.value)}
                            placeholder="Name"
                            className="flex-1"
                          />
                          <Input
                            value={traveler.age || ""}
                            onChange={(e) => updateTraveler(index, "age", e.target.value)}
                            placeholder="Age"
                            className="w-16"
                            type="number"
                          />
                          {travelers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTraveler(index)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addTraveler} className="w-full">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Traveler
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={generateWithAI}
                    disabled={generating}
                    className="bg-teal hover:bg-teal-dark"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={saveAll} disabled={saving} className="bg-teal hover:bg-teal-dark">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="todos">To-Dos</TabsTrigger>
            <TabsTrigger value="phrases">Phrases</TabsTrigger>
            <TabsTrigger value="packing">Packing</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          {/* Todos Tab */}
          <TabsContent value="todos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pre-Trip Checklist</CardTitle>
                <Button onClick={addTodo} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <select
                      value={todo.category}
                      onChange={(e) => updateTodo(todo.id, "category", e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="bookings">Bookings</option>
                      <option value="documents">Documents</option>
                      <option value="before_trip">Before Trip</option>
                      <option value="packing">Packing</option>
                    </select>
                    <Input
                      value={todo.title}
                      onChange={(e) => updateTodo(todo.id, "title", e.target.value)}
                      placeholder="To-do item..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {todos.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No checklist items yet. Click &ldquo;Add Item&rdquo; to start.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phrases Tab */}
          <TabsContent value="phrases">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Essential Phrases</CardTitle>
                <Button onClick={addPhrase} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" /> Add Phrase
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {phrases.map((phrase) => (
                  <div key={phrase.id} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg items-center">
                    <div className="col-span-1">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={phrase.english}
                        onChange={(e) => updatePhrase(phrase.id, "english", e.target.value)}
                        placeholder="English"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={phrase.local_text}
                        onChange={(e) => updatePhrase(phrase.id, "local_text", e.target.value)}
                        placeholder="Local text"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={phrase.pronunciation || ""}
                        onChange={(e) => updatePhrase(phrase.id, "pronunciation", e.target.value)}
                        placeholder="Pronunciation"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePhrase(phrase.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {phrases.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No phrases yet. Click "Add Phrase" to start.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packing Tab */}
          <TabsContent value="packing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Packing Checklist</CardTitle>
                <Button onClick={addPackingItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {packingItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <select
                      value={item.category}
                      onChange={(e) => updatePackingItem(item.id, "category", e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="essentials">Essentials</option>
                      <option value="baby">Baby</option>
                      <option value="senior">Senior</option>
                      <option value="documents">Documents</option>
                      <option value="medical">Medical</option>
                      <option value="electronics">Electronics</option>
                      <option value="beach">Beach & Outdoor</option>
                    </select>
                    <Input
                      value={item.item}
                      onChange={(e) => updatePackingItem(item.id, "item", e.target.value)}
                      placeholder="Item name..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePackingItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {packingItems.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No packing items yet. Click "Add Item" to start.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Emergency Contacts</CardTitle>
                <Button onClick={addEmergencyContact} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" /> Add Contact
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg items-center">
                    <div className="col-span-1">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={contact.category}
                        onChange={(e) => updateEmergencyContact(contact.id, "category", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="emergency">Emergency</option>
                        <option value="hospital">Hospital</option>
                        <option value="embassy">Embassy</option>
                        <option value="hotel">Hotel</option>
                        <option value="family">Family</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={contact.label}
                        onChange={(e) => updateEmergencyContact(contact.id, "label", e.target.value)}
                        placeholder="Label (e.g., Tourist Police)"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={contact.phone || ""}
                        onChange={(e) => updateEmergencyContact(contact.id, "phone", e.target.value)}
                        placeholder="Phone number"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEmergencyContact(contact.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {emergencyContacts.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No emergency contacts yet. Click "Add Contact" to start.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
