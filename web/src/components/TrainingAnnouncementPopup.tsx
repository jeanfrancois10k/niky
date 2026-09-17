"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase, type Training } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Sparkles, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  Smartphone 
} from "lucide-react";

export function TrainingAnnouncementPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [training, setTraining] = useState<Training | null>(null);

  useEffect(() => {
    // Ne pas afficher sur les pages d'administration
    if (pathname && pathname.startsWith("/admin")) {
      return;
    }

    async function loadUpcomingTraining() {
      try {
        const { data, error } = await supabase
          .from("trainings")
          .select("*")
          .eq("is_active", true)
          .order("date_start", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          return;
        }

        // Vérifier si l'utilisateur a déjà fermé ce popup pendant sa session
        const isDismissed = sessionStorage.getItem(`ncp_training_popup_${data.id}`);
        if (!isDismissed) {
          setTraining(data);
          // Délai d'apparition agréable (1.5 secondes)
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn("Notice loading training popup:", err);
      }
    }

    loadUpcomingTraining();
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    if (training) {
      sessionStorage.setItem(`ncp_training_popup_${training.id}`, "true");
    }
  };

  if (!isOpen || !training) return null;

  const maxSeats = Number(training.max_seats) || 20;
  const currentSeats = Number(training.current_seats) || 0;
  const remainingSeats = Math.max(0, maxSeats - currentSeats);
  const isFull = remainingSeats <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md"
          aria-label="Fermer la notification"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Image Banner */}
        <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={training.image || "/lab-distillation.jpg"}
            alt={training.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1435] via-[#0a1435]/40 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-md uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Nouvelle Session Ouverte
            </span>
          </div>

          <div className="absolute bottom-4 inset-x-4 flex justify-between items-end text-white">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block mb-0.5">
                Académie Pratique NCP
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl leading-tight text-white drop-shadow-sm">
                {training.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-foreground">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {training.description || "Rejoignez nos ateliers pratiques au laboratoire NCP pour apprendre la formulation chimique de savons, détergents et cosmétiques."}
          </p>

          {/* Training Key Details */}
          <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="h-4 w-4 text-primary" /> Dates de la session :
              </span>
              <span className="font-bold text-foreground">
                Du {new Date(training.date_start).toLocaleDateString("fr-FR")} au {new Date(training.date_end).toLocaleDateString("fr-FR")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <MapPin className="h-4 w-4 text-primary" /> Lieu de formation :
              </span>
              <span className="font-bold text-foreground">{training.location}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <GraduationCap className="h-4 w-4 text-accent" /> Disponibilité :
              </span>
              {!isFull ? (
                <span className="font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  {remainingSeats} place{remainingSeats > 1 ? "s" : ""} restante{remainingSeats > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="font-bold text-red-600">Session complète</span>
              )}
            </div>
          </div>

          {/* Pricing & Reassurance */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                Tarif d&apos;inscription :
              </span>
              <span className="font-heading font-extrabold text-2xl text-primary">
                {Number(training.price).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">HTG</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl">
              <Smartphone className="h-3.5 w-3.5 text-red-600" />
              <span>Paiement <strong>MonCash</strong> disponible</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Certificat officiel</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> 100% Pratique</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Matières fournies</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              asChild
              size="lg"
              className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-orange-500/25 text-sm cursor-pointer"
              onClick={handleClose}
            >
              <Link href={`/formations/${training.slug}`}>
                Découvrir & S&apos;inscrire <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <button
              onClick={handleClose}
              className="py-2 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-xl hover:bg-muted/50"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
