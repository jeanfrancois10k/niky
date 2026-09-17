"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";

export default function PanierPage() {
  const { items, removeItem, updateQuantity, getCartTotal, getCartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = getCartTotal();
  const count = getCartCount();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-muted/30 p-12 rounded-2xl max-w-lg mx-auto border border-border">
          <h1 className="font-heading text-3xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-muted-foreground mb-8">Découvrez notre catalogue de matières premières chimiques et commencez vos achats.</p>
          <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
            <Link href="/boutique">Retour à la boutique</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Votre Panier ({count} article{count > 1 ? 's' : ''})</h1>
          <p className="text-muted-foreground text-sm mt-1">Vérifiez vos articles avant de passer commande.</p>
        </div>
        <button
          onClick={() => {
            useCart.getState().clearCart();
          }}
          className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          🗑️ Vider le panier
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center sm:items-start shadow-xs hover:border-primary/40 transition-colors">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-muted/60 border border-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=600&auto=format&fit=crop"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=600&auto=format&fit=crop";
                  }}
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1 block">{item.category}</span>
                <Link href={`/boutique/${item.slug}`} className="font-bold text-lg hover:text-primary transition-colors block mb-1">
                  {item.name}
                </Link>
                <div className="font-bold text-primary text-base">
                  {Number(item.price).toLocaleString()} Gourdes <span className="text-sm font-normal text-muted-foreground">/ {item.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-auto sm:mt-0">
                <div className="flex items-center border border-border rounded-xl bg-muted/20 overflow-hidden">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1.5 hover:bg-muted font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1.5 hover:bg-muted font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="font-extrabold text-lg w-28 text-right text-foreground">
                  {(item.price * item.quantity).toLocaleString()} HTG
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  title="Supprimer cet article"
                >
                  ✕ Supprimer
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Link href="/boutique" className="inline-flex items-center text-primary font-semibold hover:underline">
              ← Continuer mes achats
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="font-heading font-bold text-xl mb-6 border-b border-border pb-4">Résumé de la commande</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Sous-total</span>
                <span>{total} Gourdes</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frais de livraison</span>
                <span>Calculé {"à l'étape"} suivante</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">Total estimé</span>
                <span className="font-bold text-2xl text-primary">{total} Gourdes</span>
              </div>
              <p className="text-xs text-muted-foreground text-right">Taxes incluses si applicable</p>
            </div>
            
            <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-white" asChild>
              <Link href="/commande">
                Passer la commande
              </Link>
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center">
              Paiement à la livraison disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
