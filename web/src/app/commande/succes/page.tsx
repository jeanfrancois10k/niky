"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Smartphone, PhoneCall, ArrowRight, ShieldCheck, PackageCheck } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const clearCart = useCart((state) => state.clearCart);
  const [mounted, setMounted] = useState(false);

  const orderId = searchParams.get("orderId") || searchParams.get("order") || "NCP-" + Math.floor(100000 + Math.random() * 900000);
  const amount = searchParams.get("amount") || searchParams.get("total") || "";
  const transactionId = searchParams.get("transactionId") || searchParams.get("token") || "";

  useEffect(() => {
    setMounted(true);
    clearCart();
  }, [clearCart]);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="bg-white border border-border shadow-2xl p-8 sm:p-10 rounded-3xl mb-8 text-left space-y-6">
        {/* Header checkmark */}
        <div className="flex items-center gap-4 bg-green-50 p-5 rounded-2xl border border-green-200">
          <div className="p-3 bg-green-500 text-white rounded-2xl shrink-0 shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-extrabold uppercase tracking-wider mb-1">
              Paiement Confirmé
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-green-950">
              Transaction MonCash Réussie !
            </h1>
            <p className="text-xs sm:text-sm text-green-800 mt-0.5">
              Votre paiement a été validé et votre commande est enregistrée dans notre système.
            </p>
          </div>
        </div>

        {/* Order Number Banner */}
        <div className="bg-muted/40 p-5 rounded-2xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider block">
              Numéro de Commande Officiel :
            </span>
            <span className="font-mono text-2xl font-extrabold text-primary tracking-tight">
              {orderId}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl">
            <PackageCheck className="h-4 w-4" /> En cours de préparation
          </div>
        </div>

        {/* Payment & Delivery Summary */}
        <div className="bg-gradient-to-br from-red-50/80 to-orange-50/60 p-6 rounded-2xl border border-red-100 space-y-4">
          <div className="flex items-center justify-between border-b border-red-200/60 pb-3">
            <div className="flex items-center gap-2 font-bold text-red-700 text-sm">
              <Smartphone className="h-5 w-5" /> Règlement MonCash Digicel
            </div>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">
              Sandbox / Validé
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {amount && (
              <div className="bg-white/80 p-3 rounded-xl border border-red-100">
                <span className="text-muted-foreground block mb-0.5">Montant Réglé :</span>
                <span className="font-extrabold text-base text-primary">{Number(amount).toLocaleString()} HTG</span>
              </div>
            )}
            <div className="bg-white/80 p-3 rounded-xl border border-red-100">
              <span className="text-muted-foreground block mb-0.5">Destinataire :</span>
              <span className="font-bold text-foreground">Niky Chemical Product (NCP)</span>
            </div>
            {transactionId && (
              <div className="sm:col-span-2 bg-white/80 p-3 rounded-xl border border-red-100 truncate">
                <span className="text-muted-foreground block mb-0.5">Jeton / Référence MonCash :</span>
                <span className="font-mono text-[11px] font-semibold text-slate-700">{transactionId.slice(0, 32)}...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 pt-1">
            <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
            <span>Un conseiller logistique NCP va préparer l&apos;expédition de vos matières premières.</span>
          </div>

          {/* WhatsApp Action */}
          <a
            href={`https://wa.me/50947297655?text=Bonjour%20NCP,%20j'ai%20validé%20mon%20paiement%20MonCash%20pour%20la%20commande%20${orderId}${amount ? `%20d'un%20montant%20de%20${amount}%20HTG` : ""}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <PhoneCall className="h-4 w-4" />
            Contacter le service logistique sur WhatsApp (+509 47 29 76 55)
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-8 shadow-sm">
          <Link href="/boutique">Continuer mes achats <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-2xl px-8">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}

export default function MoncashSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Chargement de votre commande...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
