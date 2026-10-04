"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Smartphone, PhoneCall } from "lucide-react";
import Link from "next/link";

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [registrationNumber, setRegistrationNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const confirm = async () => {
      try {
        // MonCash redirects back with ?transactionId=xxx&orderId=xxx or similar
        const transactionId =
          searchParams.get("transactionId") ||
          searchParams.get("transaction_id") ||
          searchParams.get("token");

        // Retrieve from sessionStorage (set before redirect to MonCash)
        const registrationId = sessionStorage.getItem("naf_reg_id") || "";
        const moncashRef = searchParams.get("reference") || sessionStorage.getItem("naf_mc_ref") || "";
        const storedRegNumber = sessionStorage.getItem("naf_reg_number") || "";

        if (!registrationId && !moncashRef) {
          setErrorMessage("Informations de paiement introuvables. Contactez-nous.");
          setStatus("error");
          return;
        }

        const res = await fetch("/api/trainings/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registration_id: registrationId,
            moncash_reference: moncashRef,
            moncash_transaction_id: transactionId,
          }),
        });

        const json = await res.json();

        if (json.success) {
          setRegistrationNumber(json.registration_number || storedRegNumber);
          setStatus("success");
          // Clean up sessionStorage
          sessionStorage.removeItem("naf_reg_id");
          sessionStorage.removeItem("naf_mc_ref");
          sessionStorage.removeItem("naf_reg_number");
        } else {
          throw new Error(json.error || "Confirmation échouée");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur de confirmation";
        setErrorMessage(msg);
        setStatus("error");
      }
    };

    confirm();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Confirmation en cours...</h2>
          <p className="text-sm text-muted-foreground">Veuillez patienter pendant la validation de votre paiement.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-5 border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Paiement non confirmé</h2>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-left space-y-1">
            <p className="font-bold">Contactez-nous pour confirmer manuellement :</p>
            <p>📞 <strong>+509 47 29 76 55</strong></p>
            <p>💬 WhatsApp : +509 47 29 76 55</p>
          </div>
          <a
            href={`https://wa.me/50947297655?text=Bonjour, j'ai effectué un paiement MonCash pour mon inscription NAF mais je n'ai pas reçu de confirmation.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all cursor-pointer"
          >
            <PhoneCall className="h-4 w-4" /> Contacter via WhatsApp
          </a>
          <Link href="/" className="block text-xs text-muted-foreground hover:text-foreground underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-5 border border-green-100">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">
          <Smartphone className="h-3.5 w-3.5" /> Paiement MonCash Validé
        </div>

        <h2 className="text-2xl font-bold text-foreground">Inscription Confirmée !</h2>

        <p className="text-sm text-muted-foreground">
          Votre paiement a été reçu et votre dossier étudiant NAF est maintenant actif.{" "}
          <strong>Un email de confirmation a été envoyé</strong> avec votre code de dossier.
        </p>

        {registrationNumber && (
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Numéro de Dossier Étudiant
            </div>
            <div className="text-2xl font-mono font-extrabold text-primary">{registrationNumber}</div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-left space-y-1 text-amber-900">
          <p className="font-bold">📋 Prochaines étapes :</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Vérifiez votre email pour le récapitulatif.</li>
            <li>Présentez-vous au centre avec votre pièce d&apos;identité.</li>
            <li>Pour toute question : <strong>+509 47 29 76 55</strong></li>
          </ul>
        </div>

        <a
          href={`https://wa.me/50947297655?text=Bonjour NAF, mon paiement MonCash est confirmé pour mon inscription (Dossier: ${registrationNumber}). Merci !`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all cursor-pointer"
        >
          <PhoneCall className="h-4 w-4" /> Confirmer sur WhatsApp
        </a>

        <Link href="/" className="block text-xs text-muted-foreground hover:text-foreground underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}
