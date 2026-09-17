import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Product } from "@/lib/supabase";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { getFirstImage } from "@/lib/utils";
import { Smartphone, ShieldCheck, Truck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data;
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  const productData = {
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    image: getFirstImage(product.images),
    category: product.category,
    stock: product.stock,
    slug: product.slug,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/boutique" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        ← Retour à la boutique
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getFirstImage(product.images)} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col">
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-semibold rounded-full text-sm w-fit mb-4">
            {product.category}
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">{product.name}</h1>
          <div className="text-3xl font-extrabold text-primary mb-6">
            {Number(product.price).toLocaleString()} Gourdes <span className="text-lg text-muted-foreground font-normal">/ {product.unit}</span>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">{product.description}</p>

          <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Disponibilité</span>
              {product.stock > 0 ? (
                <span className="font-semibold text-green-600">En stock ({product.stock} {product.unit}s)</span>
              ) : (
                <span className="font-semibold text-red-600">Rupture de stock</span>
              )}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Unité de vente</span>
              <span className="font-semibold text-foreground">{product.unit}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground text-sm">Paiement accepté</span>
              <span className="font-semibold text-red-600 flex items-center gap-1 text-xs sm:text-sm">
                <Smartphone className="h-4 w-4" /> MonCash & Espèces
              </span>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Direct Buy */}
          <div className="mt-auto space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <BuyNowButton
                size="lg"
                label="Payer directement"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-orange-500/25 text-base"
                product={productData}
              />
              <AddToCartButton
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-2xl text-base shadow-sm"
                product={productData}
              />
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-green-600" /> Qualité garantie</span>
              <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-primary" /> Expédition rapide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
