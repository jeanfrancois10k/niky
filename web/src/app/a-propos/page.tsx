import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  GraduationCap, 
  FlaskConical, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Smartphone,
  Truck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AProposPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Header Banner */}
      <section className="relative bg-gradient-to-b from-[#0a1435] via-[#112255] to-[#152e75] text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
            <Sparkles className="h-4 w-4" /> Notre Histoire & Engagement
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight leading-tight">
            Bâtir l&apos;Autonomie Industrielle & Artisanale d&apos;Haïti
          </h1>
          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto">
            <strong>Niky Chemical Product (NCP)</strong> est le partenaire de référence des artisans, PME et passionnés de chimie en Haïti pour l&apos;approvisionnement en matières premières certifiées et la formation technique pratique.
          </p>
        </div>
      </section>

      {/* 2. Notre Mission & Vision */}
      <section className="py-20 bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                Notre Raison d&apos;Être
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground">
                Une chimie de haute précision accessible à tous
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Fondée avec la volonté de démocratiser la fabrication locale en Haïti, <strong>NCP</strong> répond à deux défis majeurs : la rareté des matières premières chimiques pures sur le marché national et le manque de formations professionnelles certifiantes.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Nous fournissons directement des bases chimiques de premier choix (grade industriel et cosmétique) et formons chaque mois des dizaines d&apos;entrepreneurs capables de créer leurs propres marques de savons, détergents, cosmétiques et parfums.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-sm font-semibold text-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" /> Pureté garantie
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" /> Pratique en atelier
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" /> Paiement MonCash
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-slate-950 aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/lab-formulation.png"
                alt="Laboratoire NCP - Formulation et Verrerie Chimique"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1435]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  <FlaskConical className="h-3 w-3" /> Laboratoire de Formulation NCP
                </div>
                <p className="text-base font-bold text-white">Innover • Créer • Réussir — Contrôle qualité & normes industrielles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Les 4 Piliers Fondamentaux de NCP */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">Nos Engagements</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground">
              Pourquoi choisir NCP ?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-7 rounded-3xl border border-border shadow-xs hover:shadow-xl hover:border-primary/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Matières Premières Pures</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Approvisionnement direct sans intermédiaires. Nos produits sont non coupés et conservent leur plein pouvoir actif.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-border shadow-xs hover:shadow-xl hover:border-primary/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Niky Académie (NAF)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apprentissage 100% sur paillasse : formulation, calcul du pH, fabrication et remise d&apos;un certificat international NAF.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-border shadow-xs hover:shadow-xl hover:border-primary/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">MonCash & Prix en HTG</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transparence totale des tarifs en Gourdes (HTG) et règlement instantané et sécurisé avec votre compte MonCash.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-border shadow-xs hover:shadow-xl hover:border-primary/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Couverture Nationale</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Expédition rapide dans tous les départements d&apos;Haïti (Cap-Haïtien, Jacmel, Les Cayes, Gonaïves, Saint-Marc, etc.).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Nos 3 Centres d'Implantation en Haïti */}
      <section className="py-20 bg-white border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2">Présence Locale</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground">
              Nos Centres & Points de Retrait
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Venez nous rencontrer pour vos achats au détail, commandes de gros ou pour assister à nos sessions de formation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Siège Pétion-Ville */}
            <div className="bg-muted/20 border border-border p-8 rounded-3xl space-y-4">
              <div className="p-3 bg-primary text-white rounded-2xl w-fit">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Siège Principal & Académie</span>
                <h3 className="font-heading font-extrabold text-xl text-foreground mt-1">Pétion-Ville</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                #68B Route De Frère, Pétion-Ville, Haïti
              </p>
              <div className="text-xs font-semibold text-foreground pt-2 border-t border-border">
                📞 +509 47 29 76 55
              </div>
            </div>

            {/* Antenne Jacmel */}
            <div className="bg-muted/20 border border-border p-8 rounded-3xl space-y-4">
              <div className="p-3 bg-accent text-white rounded-2xl w-fit">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Antenne Sud-Est</span>
                <h3 className="font-heading font-extrabold text-xl text-foreground mt-1">Jacmel</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                #21 Rue de la Comédie, Jacmel, Haïti
              </p>
              <div className="text-xs font-semibold text-foreground pt-2 border-t border-border">
                📞 +509 47 29 76 55
              </div>
            </div>

            {/* Antenne Kenscoff */}
            <div className="bg-muted/20 border border-border p-8 rounded-3xl space-y-4">
              <div className="p-3 bg-primary text-white rounded-2xl w-fit">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Point Relais</span>
                <h3 className="font-heading font-extrabold text-xl text-foreground mt-1">Kenscoff</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                #2 imp Noël Fermathe 55, Kenscoff, Haïti
              </p>
              <div className="text-xs font-semibold text-foreground pt-2 border-t border-border">
                📞 +509 47 29 76 55
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Final */}
      <section className="py-20 bg-gradient-to-r from-[#0f1f4b] to-[#152e75] text-white text-center">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading">
            Prêt à lancer votre production ?
          </h2>
          <p className="text-blue-100/90 text-base sm:text-lg">
            Commandez vos matières premières chimiques en ligne ou inscrivez-vous à notre prochaine session de formation pratique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/boutique"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl px-8 py-6 shadow-lg shadow-orange-500/30"
              )}
            >
              Commander des Matières Premières <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/formations"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl font-bold px-8 py-6"
              )}
            >
              Voir les Formations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
