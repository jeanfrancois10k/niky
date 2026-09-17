import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { supabase, type Product } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/data";
import { getFirstImage } from "@/lib/utils";
import { FlaskConical, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProducts(category?: string): Promise<Product[]> {
  let query = supabase.from('products').select('*').eq('is_active', true).order('name');
  if (category && category !== 'Tous') {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error || !data) {
    return [];
  }
  return data;
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const currentCategory = searchParams.category || "Tous";
  const products = await getProducts(currentCategory);

  return (
    <div className="min-h-screen bg-muted/15 py-10 md:py-14">
      <div className="container mx-auto px-4">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-border/80 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <FlaskConical className="h-3.5 w-3.5" /> Catalogue Officiel NCP
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Matières Premières Chimiques
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg mt-2">
              Produits purs pour la formulation industrielle et artisanale de savons, détergents, cosmétiques et parfums.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-white border border-border px-4 py-2 rounded-2xl text-muted-foreground shadow-xs">
            <Smartphone className="h-4 w-4 text-red-600" />
            Paiement <strong>MonCash</strong> disponible
          </div>
        </div>

        {/* Banner matières premières */}
        <div className="mb-10 rounded-3xl overflow-hidden border border-border shadow-md relative bg-slate-900 aspect-[21/9] sm:aspect-[24/7] max-h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/raw-materials.png"
            alt="Matières Premières NCP - Texapon, Acide Sulfonique, Glycérine, Parfums"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1435]/90 via-[#0a1435]/50 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-md text-white space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider">
                Stocks Disponibles Immédiatement
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">Pureté & Traçabilité Certifiées</h2>
              <p className="text-xs sm:text-sm text-blue-100/90 hidden sm:block">Texapon N70, Acide Sulfonique, Cocamide DEA, Glycérine végétale et fragrances pures.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white border border-border p-6 rounded-3xl shadow-xs sticky top-24 space-y-6">
              <div>
                <h3 className="font-heading font-bold text-base uppercase tracking-wider text-muted-foreground mb-4">
                  Filtrer par Catégorie
                </h3>
                <div className="space-y-1.5">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category}
                      href={category === "Tous" ? "/boutique" : `/boutique?category=${category}`}
                      className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        currentCategory === category
                          ? 'bg-primary text-white shadow-xs font-bold'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-2 text-xs text-muted-foreground">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> Garantie Qualité NCP
                </div>
                <p>Toutes nos matières premières sont testées en laboratoire et conformes aux normes industrielles.</p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-border p-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-lg font-bold text-foreground">Aucun produit dans cette catégorie</p>
                <p className="text-sm mt-1">Consultez nos autres catégories ou contactez-nous pour une commande spéciale.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all flex flex-col"
                  >
                    <Link href={`/boutique/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getFirstImage(product.images)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {Number(product.stock) <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-red-500 text-white font-bold px-4 py-1.5 rounded-full text-xs">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1.5 block">
                        {product.category}
                      </span>
                      <Link href={`/boutique/${product.slug}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.short_desc}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-4 border-t border-border/60 gap-3">
                        <div>
                          <div className="font-extrabold text-lg text-primary">{Number(product.price).toLocaleString()} HTG</div>
                          <div className="text-[11px] text-muted-foreground font-medium">Prix par {product.unit}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AddToCartButton
                            size="sm"
                            className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold"
                            product={{
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              unit: product.unit,
                              image: getFirstImage(product.images),
                              category: product.category,
                              stock: product.stock,
                              slug: product.slug,
                            }}
                          />
                          <BuyNowButton
                            size="sm"
                            label="Payer direct"
                            product={{
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              unit: product.unit,
                              image: getFirstImage(product.images),
                              category: product.category,
                              stock: product.stock,
                              slug: product.slug,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
