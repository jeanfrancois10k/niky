"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Search, Calendar, Users, Loader2, Upload, Image as ImageIcon, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Training } from "@/lib/supabase";
import { useToast } from "@/components/ToastNotification";

export default function AdminFormationsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showLoading, showUploading, showSuccess, showError, hideToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    full_description: "",
    objectives: "",
    date_start: "",
    date_end: "",
    location: "Centre de formation NCP, Pétion-Ville, Haïti",
    max_seats: "" as string | number,
    current_seats: "" as string | number,
    price: "" as string | number,
    image: "",
  });

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trainings");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setTrainings(json.data);
      }
    } catch (err) {
      console.warn("Fetch trainings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const openAddModal = () => {
    setEditingTraining(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      full_description: "",
      objectives: "Comprendre les bases de la formulation\nMaîtriser les dosages et le pH\nTechniques de conservation et parfum",
      date_start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      date_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      location: "Centre de formation NCP, Pétion-Ville, Haïti",
      max_seats: "",
      current_seats: "",
      price: "",
      image: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Training) => {
    setEditingTraining(t);
    setFormData({
      title: t.title,
      slug: t.slug,
      description: t.description || "",
      full_description: t.full_description || "",
      objectives: Array.isArray(t.objectives) ? t.objectives.join("\n") : (t.objectives || ""),
      date_start: t.date_start ? String(t.date_start).split("T")[0] : "",
      date_end: t.date_end ? String(t.date_end).split("T")[0] : "",
      location: t.location || "Centre de formation NCP, Pétion-Ville, Haïti",
      max_seats: t.max_seats ?? "",
      current_seats: t.current_seats ?? "",
      price: t.price ?? "",
      image: t.image || "",
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = showUploading("Chargement de la photo...");

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
        hideToast(toastId);
        showSuccess("Photo chargée avec succès !");
      }
    };
    reader.onerror = () => {
      hideToast(toastId);
      showError("Erreur lors du chargement de l'image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = showLoading("Enregistrement de la formation...");

    const generatedSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const objectivesArray = formData.objectives
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const fallbackImage = "https://images.unsplash.com/photo-1585644158404-3677b10c660f?q=80&w=1000&auto=format&fit=crop";

    const payload = {
      ...(editingTraining?.id ? { id: editingTraining.id } : {}),
      title: formData.title,
      slug: generatedSlug,
      description: formData.description,
      full_description: formData.full_description || formData.description,
      objectives: objectivesArray,
      date_start: formData.date_start,
      date_end: formData.date_end,
      location: formData.location,
      max_seats: formData.max_seats === "" ? 20 : Number(formData.max_seats),
      current_seats: formData.current_seats === "" ? 0 : Number(formData.current_seats),
      price: formData.price === "" ? 0 : Number(formData.price),
      image: formData.image || fallbackImage,
      is_active: true,
    };

    try {
      const res = await fetch("/api/admin/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Erreur lors de l'enregistrement");
      }

      await fetchTrainings();
      hideToast(toastId);
      showSuccess(editingTraining ? "Formation modifiée avec succès !" : "Formation ajoutée avec succès !");
      setIsModalOpen(false);
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Impossible de sauvegarder la formation.";
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette session de formation ?")) return;

    const toastId = showLoading("Suppression de la formation...");
    try {
      const res = await fetch(`/api/admin/trainings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Erreur de suppression");
      }

      setTrainings(trainings.filter((t) => t.id !== id));
      hideToast(toastId);
      showSuccess("Formation supprimée définitivement !");
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression.";
      showError(message);
    }
  };

  const filtered = trainings.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSeatsOccupied = trainings.reduce((sum, t) => sum + (Number(t.current_seats) || 0), 0);
  const totalTrainingsRevenue = trainings.reduce((sum, t) => sum + ((Number(t.price) || 0) * (Number(t.current_seats) || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Gestion des Formations</h1>
          <p className="text-muted-foreground mt-1">Créez, modifiez ou supprimez des sessions de formation professionnelle.</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary text-white hover:bg-primary/90 rounded-xl px-5 cursor-pointer">
          <Plus className="h-4 w-4 mr-2" /> Ajouter une formation
        </Button>
      </div>

      {/* Training Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Sessions Actives</div>
            <div className="text-3xl font-extrabold text-foreground">{trainings.length}</div>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Participants Inscrits</div>
            <div className="text-3xl font-extrabold text-accent">{totalSeatsOccupied}</div>
          </div>
          <div className="p-3 bg-accent/10 text-accent rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Chiffre d&apos;Affaires Formations</div>
            <div className="text-2xl font-extrabold text-green-600">{totalTrainingsRevenue.toLocaleString()} HTG</div>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl font-bold">
            HTG
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une formation..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
            />
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {filtered.length} session{filtered.length > 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex justify-center items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Chargement des formations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <p className="text-lg font-semibold text-foreground mb-1">Aucune formation enregistrée</p>
            <p className="text-sm mb-6">Ajoutez votre première session pratique pour commencer à recevoir des inscriptions.</p>
            <Button onClick={openAddModal} className="bg-primary text-white hover:bg-primary/90 rounded-xl cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une formation maintenant
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Image</th>
                  <th className="px-5 py-3.5 font-semibold">Titre de la Formation</th>
                  <th className="px-5 py-3.5 font-semibold">Dates</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Tarif</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Places</th>
                  <th className="px-5 py-3.5 font-semibold text-right">CA Généré</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((training) => {
                  const caTraining = (Number(training.price) || 0) * (Number(training.current_seats) || 0);
                  const isFull = Number(training.current_seats) >= Number(training.max_seats);
                  return (
                    <tr key={training.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="h-12 w-16 rounded-xl bg-muted overflow-hidden border border-border shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={training.image || "https://images.unsplash.com/photo-1585644158404-3677b10c660f?q=80&w=200&auto=format&fit=crop"} 
                            alt={training.title} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-primary text-base">{training.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{training.location}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {training.date_start ? new Date(training.date_start).toLocaleDateString("fr-FR") : "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-medium">{Number(training.price).toLocaleString()} HTG</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                          isFull 
                            ? "bg-red-100 text-red-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {training.current_seats} / {training.max_seats} inscrits
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-foreground">
                        {caTraining.toLocaleString()} HTG
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(training)} 
                            className="p-2 text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-muted rounded-xl cursor-pointer"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(training.id)} 
                            className="p-2 text-muted-foreground hover:text-red-600 transition-colors bg-muted/50 hover:bg-red-50 rounded-xl cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'ajout / modification de formation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 font-heading border-b pb-3">
              {editingTraining ? "Modifier la session de formation" : "Ajouter une nouvelle formation"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold">Titre de la formation <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Ex: Fabrication de Savon Liquide et Détergent..." 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Date de début <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="date" 
                    value={formData.date_start} 
                    onChange={(e) => setFormData({ ...formData, date_start: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Date de fin <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="date" 
                    value={formData.date_end} 
                    onChange={(e) => setFormData({ ...formData, date_end: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold">Lieu de la formation <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="text" 
                    value={formData.location} 
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Centre de formation NCP, Pétion-Ville, Haïti" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Tarif d&apos;inscription (Gourdes) <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Ex: 50000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Nombre maximum de places <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="number" 
                    value={formData.max_seats} 
                    onChange={(e) => setFormData({ ...formData, max_seats: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Ex: 20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Places déjà occupées</label>
                  <input 
                    type="number" 
                    value={formData.current_seats} 
                    onChange={(e) => setFormData({ ...formData, current_seats: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Ex: 0"
                  />
                </div>

                {/* Section Image avec Upload de fichier depuis PC/Téléphone */}
                <div className="sm:col-span-2 space-y-2 border rounded-xl p-4 bg-muted/10">
                  <label className="text-sm font-semibold flex items-center justify-between">
                    <span>Photo de la formation</span>
                    <span className="text-xs font-normal text-muted-foreground">Fichier local ou URL web</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {formData.image ? (
                      <div className="relative h-20 w-28 rounded-xl overflow-hidden border border-border shrink-0 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.image} alt="Aperçu" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                          title="Supprimer la photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground shrink-0 bg-white">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-dashed flex items-center justify-center gap-2 bg-white hover:bg-muted/40 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 text-primary" />
                        Choisir une image depuis l&apos;appareil
                      </Button>

                      <input 
                        type="text" 
                        value={formData.image} 
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                        className="w-full p-2 text-xs border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none bg-white text-muted-foreground" 
                        placeholder="Ou collez une URL d'image web (https://...)" 
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold">Description courte</label>
                  <input 
                    type="text" 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Résumé de la formation en une phrase..." 
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold">Description détaillée & Programme</label>
                  <textarea 
                    rows={3} 
                    value={formData.full_description} 
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none" 
                    placeholder="Détails du programme pratique, durée, matériel fourni..."
                  ></textarea>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold">Objectifs (1 par ligne)</label>
                  <textarea 
                    rows={3} 
                    value={formData.objectives} 
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none" 
                    placeholder="Objectif 1&#10;Objectif 2&#10;Objectif 3..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary text-white hover:bg-primary/90 cursor-pointer">
                  {isSaving ? "Enregistrement..." : "Enregistrer la formation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
