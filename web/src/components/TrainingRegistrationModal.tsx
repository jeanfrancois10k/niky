"use client";

import { useState } from "react";
import { type Training } from "@/lib/supabase";
import { useToast } from "@/components/ToastNotification";
import { Loader2, CheckCircle2, User, Phone, Mail, MapPin, CreditCard, X, PhoneCall, Smartphone } from "lucide-react";

interface Props {
  training: Training;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TrainingRegistrationModal({ training, isOpen, onClose, onSuccess }: Props) {
  const { showLoading, showSuccess, showError, hideToast } = useToast();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    city: "Port-au-Prince",
    payment_method: "moncash",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_phone) {
      showError("Veuillez remplir votre nom et votre numéro de téléphone.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading("Confirmation de votre inscription en cours...");

    try {
      const res = await fetch("/api/trainings/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          training_id: training.id,
          training_title: training.title,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email,
          city: formData.city,
          payment_method: formData.payment_method,
          amount: training.price,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Erreur lors de l'inscription");
      }

      hideToast(toastId);
      showSuccess("Inscription validée avec succès !");
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Impossible de finaliser l'inscription.";
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-border max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">Inscription Confirmée !</h3>
            <p className="text-sm text-muted-foreground">
              Félicitations <span className="font-semibold text-foreground">{formData.customer_name}</span>, votre place pour la formation <span className="font-semibold text-primary">« {training.title} »</span> est bien réservée.
            </p>
            <div className="bg-muted/40 p-4 rounded-2xl text-xs text-left space-y-2 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarif formation :</span>
                <span className="font-bold text-primary">{Number(training.price).toLocaleString()} HTG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode de règlement :</span>
                <span className="font-semibold text-foreground capitalize">
                  {formData.payment_method === "moncash" ? "MonCash (Mobile)" : "Espèces au centre"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date début :</span>
                <span className="font-medium text-foreground">{new Date(training.date_start).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            {formData.payment_method === "moncash" && (
              <div className="bg-red-50 p-3.5 rounded-2xl border border-red-100 text-xs text-left space-y-1 text-red-950">
                <div className="flex items-center gap-1.5 font-bold text-red-700">
                  <Smartphone className="h-4 w-4" /> Règlement MonCash
                </div>
                <p>Composez *202# ou utilisez votre app MonCash pour régler <strong>{Number(training.price).toLocaleString()} HTG</strong>.</p>
              </div>
            )}

            <a
              href={`https://wa.me/50947297655?text=Bonjour%20NCP,%20je%20viens%20de%20m'inscrire%20à%20la%20formation%20"${encodeURIComponent(
                training.title
              )}"%20(Nom:%20${encodeURIComponent(formData.customer_name)}).`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition-all mt-2 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              Confirmer ma place sur WhatsApp (+509 47 29 76 55)
            </a>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-semibold rounded-full text-xs mb-2">
                Inscription Rapide
              </span>
              <h3 className="text-2xl font-bold font-heading">{training.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tarif : <strong className="text-primary">{Number(training.price).toLocaleString()} Gourdes</strong> • Lieu : {training.location}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Nom et Prénom *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean Baptiste"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Numéro de Téléphone (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +509 3400 0000"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Email (Facultatif)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Ex: jean@exemple.ht"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Ville de Résidence
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ex: Port-au-Prince, Delmas, Cap-Haïtien..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Moyen de Règlement Préféré
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                  >
                    <option value="moncash">MonCash (Paiement Mobile Sécurisé)</option>
                    <option value="sur_place">Paiement au Centre NCP (Espèces)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Inscription en cours...
                  </>
                ) : (
                  `Confirmer mon Inscription (${Number(training.price).toLocaleString()} HTG)`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
