import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase, type Training } from "@/lib/supabase";
import { Calendar, MapPin, Users, GraduationCap, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTrainings(): Promise<Training[]> {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('is_active', true)
    .order('date_start', { ascending: true });

  if (error || !data) {
    return [];
  }
  return data;
}

export default async function FormationsPage() {
  const trainings = await getTrainings();

  return (
    <div className="min-h-screen bg-muted/15 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="h-4 w-4" /> Académie Pratique NCP • Haïti
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Formations Professionnelles & Certifiées
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Des ateliers 100% pratiques encadrés par des chimistes pour maîtriser la fabrication de détergents, cosmétiques et savons.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 bg-white border border-border px-3 py-1.5 rounded-full shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-green-600" /> Certificat Officiel Remis
            </span>
            <span className="flex items-center gap-1 bg-white border border-border px-3 py-1.5 rounded-full shadow-xs">
              <Smartphone className="h-4 w-4 text-red-600" /> Paiement par <strong>MonCash</strong>
            </span>
          </div>
        </div>

        {trainings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 max-w-xl mx-auto shadow-xs space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <h3 className="font-heading font-bold text-2xl text-foreground">Prochaines sessions en cours de programmation</h3>
            <p className="text-sm text-muted-foreground">
              De nouvelles dates de formation pratique à Pétion-Ville et Port-au-Prince seront publiées sous peu. Contactez notre équipe sur WhatsApp pour réserver votre place prioritaire.
            </p>
            <Button asChild className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-6 py-5 font-bold cursor-pointer">
              <Link href="https://wa.me/50947297655" target="_blank" rel="noopener noreferrer">
                Nous contacter sur WhatsApp (+509 4729 7655)
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {trainings.map((training) => {
              const maxSeats = Number(training.max_seats) || 20;
              const currentSeats = Number(training.current_seats) || 0;
              const isFull = currentSeats >= maxSeats;
              const available = Math.max(0, maxSeats - currentSeats);

              return (
                <div key={training.id} className="bg-white border border-border rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/40 transition-all flex flex-col">
                  <Link href={`/formations/${training.slug}`} className="relative aspect-video overflow-hidden bg-muted/40 group block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={training.image || "https://images.unsplash.com/photo-1585644158404-3677b10c660f?q=80&w=600&auto=format&fit=crop"}
                      alt={training.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {isFull ? (
                      <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-3.5 py-1 rounded-full text-xs shadow-md">
                        Session Complète
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 bg-amber-500 text-slate-900 font-extrabold px-3.5 py-1 rounded-full text-xs shadow-md">
                        {available} place{available > 1 ? "s" : ""} restante{available > 1 ? "s" : ""}
                      </div>
                    )}
                  </Link>

                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <Link href={`/formations/${training.slug}`} className="hover:text-primary transition-colors">
                      <h3 className="font-heading font-extrabold text-2xl leading-tight mb-3 text-foreground">{training.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{training.description}</p>

                    <div className="space-y-3 mb-6 mt-auto bg-muted/20 p-4 rounded-2xl border border-border/60 text-xs">
                      <div className="flex items-center text-foreground font-medium">
                        <Calendar className="h-4 w-4 mr-2.5 shrink-0 text-primary" />
                        Du {new Date(training.date_start).toLocaleDateString('fr-FR')} au {new Date(training.date_end).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2.5 shrink-0 text-primary" />
                        {training.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2.5 shrink-0 text-primary" />
                        Effectif : Max {maxSeats} participants ({currentSeats} inscrits)
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-border/80">
                      <div>
                        <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Frais de stage</div>
                        <div className="font-extrabold text-2xl text-primary">{Number(training.price).toLocaleString()} HTG</div>
                      </div>
                      <Button asChild className={isFull ? "" : "bg-accent hover:bg-accent/90 text-white rounded-xl font-bold px-5 shadow-xs"} variant={isFull ? "outline" : "default"}>
                        <Link href={`/formations/${training.slug}`}>
                          {isFull ? "Voir détails" : "S'inscrire →"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
