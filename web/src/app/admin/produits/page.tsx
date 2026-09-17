"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Upload, Image as ImageIcon, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/data";
import { useToast } from "@/components/ToastNotification";

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showLoading, showUploading, showSuccess, showError, hideToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "Bases Lavantes",
    price: "" as string | number,
    stock: "" as string | number,
    unit: "kg",
    description: "",
    short_desc: "",
    images: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.warn("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      category: CATEGORIES[1] || "Bases Lavantes",
      price: "",
      stock: "",
      unit: "kg",
      description: "",
      short_desc: "",
      images: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price ?? "",
      stock: p.stock ?? "",
      unit: p.unit,
      description: p.description || "",
      short_desc: p.short_desc || "",
      images: p.images && p.images.length > 0 ? p.images[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = showUploading("Chargement de la photo du produit...");

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, images: reader.result as string }));
        hideToast(toastId);
        showSuccess("Photo chargée avec succès !");
      }
    };
    reader.onerror = () => {
      hideToast(toastId);
      showError("Erreur lors de la lecture de l'image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = showLoading("Enregistrement du produit...");

    const generatedSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const fallbackImage = "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=1000&auto=format&fit=crop";

    const payload = {
      ...(editingProduct?.id ? { id: editingProduct.id } : {}),
      name: formData.name,
      slug: generatedSlug,
      category: formData.category,
      price: formData.price === "" ? 0 : Number(formData.price),
      stock: formData.stock === "" ? 0 : Number(formData.stock),
      unit: formData.unit,
      description: formData.description,
      short_desc: formData.short_desc || formData.name,
      images: formData.images ? [formData.images] : [fallbackImage],
      is_active: true,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Erreur lors de l'enregistrement");
      }

      await fetchProducts();
      hideToast(toastId);
      showSuccess(editingProduct ? "Produit modifié avec succès !" : "Produit ajouté avec succès !");
      setIsModalOpen(false);
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    const toastId = showLoading("Suppression du produit...");
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Erreur de suppression");
      }

      setProducts(products.filter((p) => p.id !== id));
      hideToast(toastId);
      showSuccess("Produit supprimé définitivement !");
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression.";
      showError(message);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Gestion des Produits</h1>
          <p className="text-muted-foreground mt-1">Ajoutez, modifiez ou supprimez des matières premières du catalogue.</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary text-white hover:bg-primary/90 rounded-xl px-5 cursor-pointer">
          <Plus className="h-4 w-4 mr-2" /> Ajouter un produit
        </Button>
      </div>

      {/* Stock & CA Valuation Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Total Références</div>
            <div className="text-3xl font-extrabold text-foreground">{products.length}</div>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Volume Marchandises en Stock</div>
            <div className="text-3xl font-extrabold text-accent">{totalStockUnits.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-accent/10 text-accent rounded-xl">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Valeur Totale du Stock (CA Marchandise)</div>
            <div className="text-2xl font-extrabold text-green-600">{totalStockValue.toLocaleString()} HTG</div>
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
              placeholder="Rechercher un produit..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
            />
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex justify-center items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Chargement des données...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <p className="text-lg font-semibold text-foreground mb-1">Aucun produit dans le catalogue</p>
            <p className="text-sm mb-6">Ajoutez votre première matière première chimique pour commencer.</p>
            <Button onClick={openAddModal} className="bg-primary text-white hover:bg-primary/90 rounded-xl cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Ajouter un produit maintenant
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Image</th>
                  <th className="px-5 py-3.5 font-semibold">Nom du Produit</th>
                  <th className="px-5 py-3.5 font-semibold">Catégorie</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Prix Unitaire</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Stock</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Valeur en Stock</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product) => {
                  const valStock = (Number(product.price) || 0) * (Number(product.stock) || 0);
                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=200&auto=format&fit=crop"} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary">{product.name}</td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 bg-accent/10 text-accent rounded-lg text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium">{Number(product.price).toLocaleString()} HTG/{product.unit}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={Number(product.stock) <= 0 ? "text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-full text-xs" : Number(product.stock) < 30 ? "text-amber-600 font-bold" : "text-green-600 font-medium"}>
                          {product.stock} {product.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-foreground">
                        {valStock.toLocaleString()} HTG
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(product)} 
                            className="p-2 text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-muted rounded-xl cursor-pointer"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
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

      {/* Modal d'ajout / modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 font-heading border-b pb-3">
              {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold">Nom du produit <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Ex: Texapon N70, Glycérine..." 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Catégorie</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none bg-white"
                  >
                    {CATEGORIES.filter(c => c !== "Tous").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Unité de vente</label>
                  <input 
                    type="text" 
                    value={formData.unit} 
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="kg, litre, galon, sac..." 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Prix unitaire (Gourdes) <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Ex: 3500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Quantité en stock <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    type="number" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Ex: 100"
                  />
                </div>

                {/* Section Image avec Upload de fichier depuis PC/Téléphone */}
                <div className="sm:col-span-2 space-y-2 border rounded-xl p-4 bg-muted/10">
                  <label className="text-sm font-semibold flex items-center justify-between">
                    <span>Photo du produit</span>
                    <span className="text-xs font-normal text-muted-foreground">Fichier local ou URL web</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {formData.images ? (
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border shrink-0 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.images} alt="Aperçu" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, images: "" })}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                          title="Supprimer la photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground shrink-0 bg-white">
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
                        value={formData.images} 
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })} 
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
                    value={formData.short_desc} 
                    onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
                    placeholder="Résumé en une phrase..." 
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-semibold">Description complète</label>
                  <textarea 
                    rows={3} 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none" 
                    placeholder="Propriétés chimiques, utilisation, dosage..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary text-white hover:bg-primary/90 cursor-pointer">
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
