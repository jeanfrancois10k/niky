import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, getFirstImage } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { supabase, type Product, type Training } from "@/lib/supabase";
import { 
  ArrowRight, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  PhoneCall, 
  Smartphone, 
  FlaskConical, 
  Droplets, 
  Flame, 
  Calendar, 
  MapPin,
  Beaker,
  Award
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !data) {
    return [];
  }
  return data;
}

async function getNextTraining(): Promise<Training | null> {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('is_active', true)
    .order('date_start', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data;
}

export default async function Home() {
  const popularProducts = await getProducts();
  const nextTraining = await getNextTraining();

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-accent selection:text-white">
      {/* 1. HERO SECTION ULTRA-MODERNE */}
      <section className="relative bg-gradient-to-b from-[#0a1435] via-[#112255] to-[#152e75] text-white pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
        {/* Luminous Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-white shadow-xs">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Fournisseur Chimique Agréé & Académie NCP en Haïti</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight leading-[1.1]">
              L&apos;Excellence Chimique <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                & Formations Pratiques
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
              Votre partenaire direct en Haïti pour les matières premières pures de détergents, cosmétiques et parfums, avec un accompagnement pratique certifié.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/boutique"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-2xl font-bold px-8 py-6 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]"
                )}
              >
                Explorer la Boutique <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/formations"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/15 rounded-2xl font-bold px-8 py-6 transition-all"
                )}
              >
                <GraduationCap className="mr-2 h-5 w-5 text-accent" /> Nos Formations Pratiques
              </Link>
            </div>
          </div>

          {/* Dual Floating Cards Showcase */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1: Boutique Preview */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 text-white shadow-2xl hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4" /> Matières Premières Certifiées
                  </span>
                  <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full font-semibold">Grade Industriel & Cosmétique</span>
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">Approvisionnement Direct à Port-au-Prince</h3>
                <p className="text-sm text-blue-100/80 mb-4">
                  Texapon N70, Acide Sulfonique, Glycérine, Comperlan KD, Parfums concentrés et solvants livrés en vrac ou au détail.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-100">
                  <Smartphone className="h-4 w-4 text-accent" />
                  Paiement Mobile <strong>MonCash</strong> accepté
                </div>
                <Link href="/boutique" className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1">
                  Voir tout ↗
                </Link>
              </div>
            </div>

            {/* Card 2: Next Training Session */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 text-white shadow-2xl hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" /> Académie Pratique NCP
                  </span>
                  {nextTraining ? (
                    <span className="text-xs bg-amber-500/30 text-amber-200 border border-amber-400/40 px-2.5 py-1 rounded-full font-bold">
                      {Number(nextTraining.max_seats) - Number(nextTraining.current_seats)} PLACES RESTANTES
                    </span>
                  ) : (
                    <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full font-semibold">Sessions Ouvertes</span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-xl mb-2">
                  {nextTraining ? nextTraining.title : "Formations Professionnelles en Fabrication"}
                </h3>
                <p className="text-sm text-blue-100/80 mb-4">
                  {nextTraining
                    ? `Session encadrée par nos chimistes au ${nextTraining.location}. Remise de certificat officiel.`
                    : "Apprenez à fabriquer vos propres détergents, cosmétiques et savons avec nos cours 100% pratiques."}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-blue-100 font-semibold">
                  {nextTraining ? `${Number(nextTraining.price).toLocaleString()} HTG` : "Tarifs abordables"}
                </div>
                <Link
                  href={nextTraining ? `/formations/${nextTraining.slug}` : "/formations"}
                  className="text-xs font-bold bg-white text-primary hover:bg-blue-50 px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  S&apos;inscrire ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REASSURANCE BAR (MONCASH, LIVRAISON, QUALITE, SUPPORT) */}
      <section className="bg-white border-b border-border py-8 shadow-xs">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">MonCash Officiel</h4>
                <p className="text-xs text-muted-foreground">Paiement mobile instantané & sécurisé</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Livraison en Haïti</h4>
                <p className="text-xs text-muted-foreground">Port-au-Prince et tous les départements</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Pureté Certifiée</h4>
                <p className="text-xs text-muted-foreground">Matières premières de 1er choix</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Support & WhatsApp</h4>
                <p className="text-xs text-muted-foreground">+509 4729 7655 pour devis et conseils</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GUIDE INTERACTIF : QUE SOUHAITEZ-VOUS FABRIQUER ? */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-xs uppercase tracking-wider mb-3">
              Guide & Formulations
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground">
              Que souhaitez-vous fabriquer ?
            </h2>
            <p className="text-muted-foreground mt-2">
              Sélectionnez votre domaine de production pour découvrir les matières premières exactes et les recettes recommandées.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1 */}
            <Link
              href="/boutique?category=Bases Lavantes"
              className="group bg-white border border-border hover:border-primary/50 p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Droplets className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  Savons Liquides & Vaisselle
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Texapon N70, Comperlan KD, Acide Sulfonique, Glycérine et colorants vifs pour détergents liquides stables.
                </p>
              </div>
              <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                Voir les ingrédients →
              </div>
            </Link>

            {/* Box 2 */}
            <Link
              href="/boutique?category=Tensioactifs"
              className="group bg-white border border-border hover:border-primary/50 p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  Détergents en Poudre & Lessive
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Tensioactifs anioniques, sulfates, agents moussants et enzymes nettoyantes à fort pouvoir dégraissant.
                </p>
              </div>
              <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                Voir les ingrédients →
              </div>
            </Link>

            {/* Box 3 */}
            <Link
              href="/boutique?category=Parfums"
              className="group bg-white border border-border hover:border-primary/50 p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  Parfumerie & Désodorisants
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Fragrances pures concentrées (Citron, Lavande, Fleurs tropicales), fixateurs de parfum et bases hydroalcooliques.
                </p>
              </div>
              <div className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                Voir les ingrédients →
              </div>
            </Link>

            {/* Box 4 */}
            <Link
              href="/formations"
              className="group bg-gradient-to-br from-primary to-[#0f1f4b] text-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-2">
                  Besoin d&apos;Apprendre ?
                </h3>
                <p className="text-xs text-blue-100/80 leading-relaxed mb-4">
                  Rejoignez nos ateliers pratiques pour maîtriser le dosage, le pH, la conservation et lancer votre propre marque.
                </p>
              </div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1 group-hover:underline">
                Découvrir les formations →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. POPULAR PRODUCTS (DIRECTEMENT DU CATALOGUE) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2 block">
                Disponibilité Immédiate
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground">
                Matières Premières Populaires
              </h2>
            </div>
            <Link href="/boutique" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Consulter tout le catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {popularProducts.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-3xl border border-border text-muted-foreground max-w-xl mx-auto p-8">
              <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-foreground">Catalogue en cours de mise à jour</p>
              <p className="text-xs text-muted-foreground mt-1">
                Les produits ajoutés par l&apos;administrateur s&apos;afficheront ici en direct.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProducts.map((product) => (
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
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1.5 block">
                      {product.category}
                    </span>
                    <Link href={`/boutique/${product.slug}`} className="hover:text-primary transition-colors">
                      <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.short_desc}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-4 border-t border-border/60 gap-3">
                      <div>
                        <div className="font-extrabold text-xl text-primary">{Number(product.price).toLocaleString()} HTG</div>
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
      </section>

      {/* 5. LABORATOIRE & QUALITÉ DE FORMULATION */}
      <section className="py-20 bg-muted/20 border-t border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-primary border border-blue-100 text-xs font-bold uppercase tracking-wider">
                <FlaskConical className="h-4 w-4" /> Laboratoire & Contrôle Qualité
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
                La Précision Chimique au Service de vos Produits
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Toutes nos matières premières subissent un contrôle rigoureux de densité, viscosité et concentration active. Nous garantissons à nos partenaires des formulations sans impuretés pour une efficacité et une stabilité maximales.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-border shadow-xs">
                  <div className="p-2 bg-blue-50 text-primary rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Certifications & Pureté Garantie</h4>
                    <p className="text-xs text-muted-foreground">Fiches techniques et fiches de données de sécurité (FDS) disponibles sur demande.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-border shadow-xs">
                  <div className="p-2 bg-amber-50 text-accent rounded-xl shrink-0 mt-0.5">
                    <Beaker className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Accompagnement Technique & Dosages</h4>
                    <p className="text-xs text-muted-foreground">Nos chimistes vous conseillent sur les proportions exactes et l&apos;ajustement du pH de vos mélanges.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-border shadow-xs">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl shrink-0 mt-0.5">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Attestation & Remise de Diplôme NCP</h4>
                    <p className="text-xs text-muted-foreground">Chaque formation pratique donne lieu à un certificat officiel reconnu par les professionnels.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-slate-900 aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/lab-distillation.jpg"
                  alt="Laboratoire NCP Équipements et Réactions Chimiques"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1435]/90 via-[#0a1435]/30 to-transparent" />
                <div className="absolute bottom-6 inset-x-6 text-white space-y-2">
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" /> Paillasse Technique & Distillation NCP
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white">Formulation Chimique & Pureté Certifiée</h3>
                  <p className="text-xs text-blue-100/80">Ateliers pratiques et contrôle qualité au siège de Pétion-Ville et en antennes régionales.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LABORATOIRE & QUALITÉ DE FORMULATION */}

      {/* 7. NEXT TRAINING BANNER */}
      {nextTraining && (
        <section className="py-20 bg-gradient-to-br from-[#0f1f4b] to-[#152e75] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <span className="inline-block px-3 py-1 bg-amber-400 text-slate-900 font-extrabold rounded-full text-xs uppercase tracking-wider">
                  Prochaine Session Pratique
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white">
                  {nextTraining.title}
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Calendar className="h-4 w-4 text-amber-300" />
                    <span>Du {new Date(nextTraining.date_start).toLocaleDateString("fr-FR")} au {new Date(nextTraining.date_end).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <MapPin className="h-4 w-4 text-amber-300" />
                    <span>{nextTraining.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-center shrink-0">
                <div className="text-xs text-blue-200 uppercase font-semibold mb-1">Tarif Inscription</div>
                <div className="text-3xl font-extrabold text-white mb-4">
                  {Number(nextTraining.price).toLocaleString()} <span className="text-sm font-normal text-amber-300">HTG</span>
                </div>
                <Link
                  href={`/formations/${nextTraining.slug}`}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl px-8 shadow-lg shadow-orange-500/30"
                  )}
                >
                  S&apos;inscrire maintenant
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
