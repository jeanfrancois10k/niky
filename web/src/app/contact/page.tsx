"use client";

import { useState } from "react";
import { 
  MapPin, 
  PhoneCall, 
  Clock, 
  Send, 
  MessageSquare, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Matières Premières",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate contact submission
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Header Banner */}
      <section className="relative bg-gradient-to-b from-[#0a1435] via-[#112255] to-[#152e75] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
            <Sparkles className="h-4 w-4" /> Support & Service Client NCP
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight leading-tight">
            Contactez Notre Équipe en Haïti
          </h1>
          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto">
            Besoin d&apos;un devis pour des fûts de matières premières chimiques, d&apos;un conseil technique ou d&apos;une inscription à nos formations ? Nous sommes à votre écoute.
          </p>
        </div>
      </section>

      {/* 2. Direct Channels & Locations */}
      <section className="py-16 bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Siège Pétion-Ville */}
            <div className="bg-muted/20 border border-border p-8 rounded-3xl space-y-5 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Siège & Laboratoire</span>
                <h3 className="font-heading font-extrabold text-xl text-foreground mt-1">Pétion-Ville</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                #68B Route De Frère, Pétion-Ville, Haïti
              </p>
              <div className="pt-3 border-t border-border/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <PhoneCall className="h-4 w-4 text-primary" /> +509 47 29 76 55
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Lun - Sam : 8h00 - 17h00
                </div>
              </div>
            </div>

            {/* Antenne Jacmel */}
            <div className="bg-muted/20 border border-border p-8 rounded-3xl space-y-5 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Antenne Régionale</span>
                <h3 className="font-heading font-extrabold text-xl text-foreground mt-1">Jacmel</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                #21 Rue de la Comédie, Jacmel, Haïti
              </p>
              <div className="pt-3 border-t border-border/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <PhoneCall className="h-4 w-4 text-accent" /> +509 47 29 76 55
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Lun - Sam : 8h30 - 16h30
                </div>
              </div>
            </div>

            {/* Antenne Kenscoff */}
            <div className="bg-muted/20 border border-border p-8 rounded-3xl space-y-5 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Point Relais</span>
                <h3 className="font-heading font-extrabold text-xl text-foreground mt-1">Kenscoff</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                #2 imp Noël Fermathe 55, Kenscoff, Haïti
              </p>
              <div className="pt-3 border-t border-border/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <PhoneCall className="h-4 w-4 text-primary" /> +509 47 29 76 55
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Lun - Ven : 9h00 - 16h00
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Form & Direct WhatsApp */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
            {/* Left Info & WhatsApp Box (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">Canal Express</span>
                <h2 className="text-3xl font-extrabold font-heading text-foreground">
                  Assistance Immédiate par WhatsApp
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Pour un passage de commande urgent, une confirmation de stock ou un paiement par <strong>MonCash</strong>, écrivez-nous directement sur WhatsApp.
                </p>
              </div>

              {/* WhatsApp Box */}
              <div className="bg-gradient-to-br from-[#128C7E] to-[#075E54] text-white p-7 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">WhatsApp Professionnel NCP</h4>
                    <p className="text-xs text-emerald-100">Réponse en moins de 15 minutes</p>
                  </div>
                </div>

                <p className="text-xs text-white/90 leading-relaxed">
                  Échangez en direct avec nos conseillers techniques pour vos devis de gros et questions sur les formations.
                </p>

                <a
                  href="https://wa.me/50947297655?text=Bonjour%20NCP,%20je%20souhaite%20des%20informations%20sur%20vos%20produits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white text-[#075E54] hover:bg-emerald-50 font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  Discuter au +509 47 29 76 55
                </a>
              </div>

              {/* Guarantees */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-foreground">Nos Engagements</h4>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Devis rapide et transparent en Gourdes (HTG)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Livraison sécurisée dans les 10 départements</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Règlement instantané sécurisé par MonCash</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-border shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-foreground">Message bien reçu !</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Merci d&apos;avoir contacté Niky Chemical Product. Notre équipe vous répondra par téléphone ou WhatsApp dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className={cn(buttonVariants({ variant: "outline" }), "mt-4 rounded-xl")}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold font-heading text-foreground">Formulaire de Contact & Devis</h3>
                    <p className="text-xs text-muted-foreground mt-1">Remplissez le formulaire ci-dessous pour nous faire part de vos besoins.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Nom complet *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Jean-Baptiste Paul"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Numéro Téléphone (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+509 XXXX XXXX"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Adresse Email (Optionnel)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nom@exemple.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Sujet de votre demande *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Matières Premières">Commande de Matières Premières</option>
                        <option value="Formations">Inscription à une Formation Pratique</option>
                        <option value="Devis Gros">Demande de Devis de Gros / Fûts</option>
                        <option value="Partenariat">Partenariat & Distribution</option>
                        <option value="Autre">Autre question</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Votre message ou liste de produits *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Précisez votre demande (quantités désirées, questions sur une formation, ville de livraison...)"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 py-6 cursor-pointer"
                    )}
                  >
                    <Send className="mr-2 h-4 w-4" /> Envoyer la demande
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Rapide */}
      <section className="py-16 bg-white border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Questions Fréquentes</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
              Tout ce que vous devez savoir
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-muted/20 p-6 rounded-2xl border border-border space-y-2">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> Comment payer par MonCash ?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lors de votre commande en ligne, sélectionnez l&apos;option MonCash. Vous recevrez une demande de paiement instantanée sur votre numéro de téléphone.
              </p>
            </div>

            <div className="bg-muted/20 p-6 rounded-2xl border border-border space-y-2">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> Livrez-vous en province ?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Oui ! Nous expédions dans les 10 départements d&apos;Haïti (Cap-Haïtien, Jacmel, Les Cayes, Gonaïves, Saint-Marc, Hinche, etc.) sous 24h à 48h.
              </p>
            </div>

            <div className="bg-muted/20 p-6 rounded-2xl border border-border space-y-2">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> Les formations sont-elles certifiées ?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Oui, à la fin de chaque atelier pratique de fabrication, vous recevez un certificat officiel délivré par Niky Chemical Product.
              </p>
            </div>

            <div className="bg-muted/20 p-6 rounded-2xl border border-border space-y-2">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> Vendez-vous en gros ou au détail ?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Les deux ! Vous pouvez acheter au gallon/litre pour vos petits projets ou par fût/baril pour votre production industrielle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
