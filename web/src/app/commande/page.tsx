"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Smartphone, Banknote, CheckCircle2, ShieldCheck, PhoneCall } from "lucide-react";

export default function CommandePage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingMoncash, setIsRedirectingMoncash] = useState(false);
  const [isSuccessCash, setIsSuccessCash] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"moncash" | "cash_on_delivery">("moncash");
  const [orderNumber, setOrderNumber] = useState("");
  const [moncashPhone, setMoncashPhone] = useState("");

  useEffect(() => {
    setMounted(true);
    if (mounted && items.length === 0 && !isSuccessCash && !isRedirectingMoncash) {
      router.push("/panier");
    }
  }, [mounted, items.length, isSuccessCash, isRedirectingMoncash, router]);

  if (!mounted) return null;

  const total = getCartTotal();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const notes = formData.get("notes") as string;

    const generatedNumber = `NCP-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedNumber);

    try {
      // 1. Enregistrement de la commande
      await supabase.from("orders").insert([
        {
          customer_name: `${firstName} ${lastName}`.trim(),
          customer_email: email,
          customer_phone: phone,
          delivery_address: address,
          city: city,
          notes: notes || "",
          payment_method: paymentMethod,
          items: items.map((i) => ({
            product_id: i.id,
            product_name: i.name,
            quantity: i.quantity,
            unit_price: i.price,
            unit: i.unit,
          })),
          total: total,
          status: "pending",
        },
      ]);

      // 2. Si MonCash : Redirection Automatique vers la Passerelle MonCash Sandbox
      if (paymentMethod === "moncash") {
        setIsRedirectingMoncash(true);
        const mcRes = await fetch("/api/payment/moncash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: generatedNumber,
            amount: total,
            phone: moncashPhone || phone,
            customerName: `${firstName} ${lastName}`.trim(),
            description: `Commande ${generatedNumber} - Matières premières NCP`,
          }),
        });

        const mcData = await mcRes.json();
        if (mcData && mcData.redirectUrl) {
          // Redirection directe et automatique vers Digicel MonCash
          window.location.href = mcData.redirectUrl;
          return;
        } else {
          // Si indisponibilité passerelle externe, redirection vers la page de succès avec les instructions
          router.push(`/commande/succes?orderId=${generatedNumber}&amount=${total}&ref=${mcData?.reference || generatedNumber}`);
          return;
        }
      } else {
        // Mode Espèces à la livraison
        clearCart();
        setIsSuccessCash(true);
      }
    } catch (err) {
      console.warn("Erreur lors de la commande:", err);
      if (paymentMethod === "cash_on_delivery") {
        clearCart();
        setIsSuccessCash(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Écran d'attente lors de la redirection automatique vers MonCash
  if (isRedirectingMoncash) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-xl">
        <div className="bg-white border border-border shadow-2xl p-10 rounded-3xl space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Smartphone className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase tracking-wider">
              Portail Sécurisé Digicel MonCash
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Redirection en cours...
            </h2>
            <p className="text-sm text-muted-foreground">
              Vous allez être redirigé automatiquement vers le système officiel <strong>MonCash Sandbox</strong> pour effectuer votre paiement de <strong className="text-foreground">{total.toLocaleString()} HTG</strong>.
            </p>
          </div>

          <div className="p-4 bg-muted/40 rounded-2xl border border-border text-xs text-muted-foreground flex items-center justify-center gap-2">
            <span className="h-3 w-3 bg-red-600 rounded-full animate-ping" />
            <span>Votre numéro de commande officiel s&apos;affichera immédiatement après votre paiement.</span>
          </div>
        </div>
      </div>
    );
  }

  // Écran de confirmation pour paiement à la livraison (Espèces)
  if (isSuccessCash) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <div className="bg-white border border-border shadow-xl p-8 sm:p-10 rounded-3xl mb-8 space-y-6 text-left">
          <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-200">
            <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-green-900">Commande Reçue avec Succès !</h1>
              <p className="text-xs text-green-700">Votre commande a bien été transmise à notre équipe logistique NCP.</p>
            </div>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl border border-border flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground">Numéro de commande :</span>
            <span className="font-mono text-2xl font-extrabold text-primary">{orderNumber}</span>
          </div>

          <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 space-y-3 text-xs text-blue-950">
            <div className="flex items-center gap-2 font-bold text-primary text-sm">
              <Banknote className="h-5 w-5" /> Paiement à la livraison
            </div>
            <p className="leading-relaxed">
              Préparez le montant exact de <strong>{total.toLocaleString()} HTG</strong> lors de la réception de vos colis auprès de notre livreur.
            </p>
            <a
              href={`https://wa.me/50947297655?text=Bonjour%20NCP,%20j'ai%20passé%20la%20commande%20${orderNumber}%20d'un%20montant%20de%20${total}%20HTG%20à%20la%20livraison.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition-all mt-2 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              Confirmer la livraison sur WhatsApp (+509 47 29 76 55)
            </a>
          </div>
        </div>

        <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-8">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/panier" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        ← Retour au panier
      </Link>

      <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-8">Validation de la commande</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form id="checkout-form" onSubmit={handleSubmit} className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="font-heading font-bold text-xl mb-4 border-b border-border pb-2">Informations Personnelles</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-xs font-bold text-foreground">Prénom <span className="text-red-500">*</span></label>
                  <input required name="firstName" id="firstName" type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-xs font-bold text-foreground">Nom <span className="text-red-500">*</span></label>
                  <input required name="lastName" id="lastName" type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="email" className="text-xs font-bold text-foreground">Email <span className="text-red-500">*</span></label>
                  <input required name="email" id="email" type="email" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="phone" className="text-xs font-bold text-foreground">Téléphone (WhatsApp de préférence) <span className="text-red-500">*</span></label>
                  <input required name="phone" id="phone" type="tel" placeholder="+509 XXXX XXXX" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-heading font-bold text-xl mb-4 border-b border-border pb-2">Adresse de Livraison en Haïti</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs font-bold text-foreground">Adresse complète <span className="text-red-500">*</span></label>
                  <textarea required name="address" id="address" rows={2} placeholder="Rue, numéro, quartier, repère précis..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"></textarea>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-xs font-bold text-foreground">Ville / Commune / Département <span className="text-red-500">*</span></label>
                  <input required name="city" id="city" type="text" placeholder="Ex: Pétion-Ville, Jacmel, Cap-Haïtien, Les Cayes..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
              </div>
            </div>

            {/* Mode de paiement */}
            <div>
              <h2 className="font-heading font-bold text-xl mb-4 border-b border-border pb-2">Mode de Règlement</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Option 1: MonCash */}
                <div
                  onClick={() => setPaymentMethod("moncash")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "moncash"
                      ? "border-red-600 bg-red-50/50 shadow-sm"
                      : "border-border hover:border-muted-foreground/40 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-600 text-white rounded-xl">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-foreground">MonCash</span>
                    </div>
                    {paymentMethod === "moncash" && (
                      <CheckCircle2 className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paiement mobile instantané et sécurisé par compte marchand NCP.
                  </p>
                </div>

                {/* Option 2: Paiement à la livraison */}
                <div
                  onClick={() => setPaymentMethod("cash_on_delivery")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cash_on_delivery"
                      ? "border-primary bg-blue-50/50 shadow-sm"
                      : "border-border hover:border-muted-foreground/40 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary text-white rounded-xl">
                        <Banknote className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-foreground">À la Livraison</span>
                    </div>
                    {paymentMethod === "cash_on_delivery" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paiement en espèces (Gourdes HTG) directement lors de la réception.
                  </p>
                </div>
              </div>

              {/* Champ téléphone MonCash si sélectionné */}
              {paymentMethod === "moncash" && (
                <div className="mt-4 p-4 bg-red-50/40 rounded-2xl border border-red-100 space-y-2">
                  <label className="text-xs font-bold text-red-900 block">
                    Numéro de téléphone MonCash pour la confirmation :
                  </label>
                  <input
                    type="tel"
                    placeholder="+509 XXXX XXXX"
                    value={moncashPhone}
                    onChange={(e) => setMoncashPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-white rounded-xl border border-red-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-red-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
                    Transaction protégée et sécurisée par le service MonCash Digicel.
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-xs font-bold text-foreground">Notes ou instructions spéciales (Optionnel)</label>
              <textarea name="notes" id="notes" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Instructions particulières pour la livraison ou les contenants..."></textarea>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-xs sticky top-24 space-y-6">
            <h2 className="font-heading font-bold text-xl border-b border-border pb-4">Récapitulatif</h2>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{item.quantity}x</span>
                    <span className="truncate max-w-[150px] font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold text-foreground shrink-0">{(item.price * item.quantity).toLocaleString()} HTG</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Sous-total</span>
                <span className="font-semibold text-foreground">{total.toLocaleString()} HTG</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Mode de règlement</span>
                <span className="font-bold text-primary capitalize">{paymentMethod === "moncash" ? "MonCash" : "À la livraison"}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Livraison</span>
                <span className="text-green-600 font-semibold">Tarif selon département</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border mt-3">
                <span className="font-bold text-sm text-foreground">Total à régler</span>
                <span className="font-extrabold text-2xl text-primary">{total.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">HTG</span></span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              form="checkout-form"
              size="lg" 
              className={
                paymentMethod === "moncash"
                  ? "w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer text-base transition-all"
                  : "w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-orange-500/25 cursor-pointer text-base transition-all"
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Connexion MonCash en cours..."
              ) : paymentMethod === "moncash" ? (
                <>
                  <Smartphone className="h-5 w-5" />
                  Payer avec MonCash ({total.toLocaleString()} HTG)
                </>
              ) : (
                `Confirmer ma commande (${total.toLocaleString()} HTG)`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
