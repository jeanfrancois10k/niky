"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Training } from "@/lib/supabase";
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
        const res = await fetch("/api/trainings/upcoming", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data as Training | null;

        if (!data) return;

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-300"
      onClick={(e) => {
        // Close when clicking directly on backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90dvh] shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Close Button on Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 p-2.5 text-white bg-black/60 hover:bg-black/85 active:scale-95 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg border border-white/20"
          aria-label="Fermer le popup"
          title="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Container for small screens */}
        <div className="overflow-y-auto flex-1">
          {/* Top Image Banner */}
          <div className="relative h-40 sm:h-52 w-full bg-slate-900 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={training.image || "/lab-distillation.jpg"}
              alt={training.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1435] via-[#0a1435]/50 to-black/20" />

            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[11px] shadow-md uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Nouvelle Formation
              </span>
            </div>

            <div className="absolute bottom-3 inset-x-3 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block mb-0.5">
                Niky Académie de Formation (NAF)
              </span>
              <h3 className="font-heading font-extrabold text-base sm:text-xl leading-tight text-white drop-shadow-sm line-clamp-2">
                {training.title}
              </h3>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-3.5 text-foreground">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {training.description || "Rejoignez nos ateliers pratiques au laboratoire NCP pour apprendre la formulation chimique de savons, détergents et cosmétiques."}
            </p>

            {/* Training Key Details */}
            <div className="bg-muted/40 rounded-2xl p-3 sm:p-4 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" /> Dates :
                </span>
                <span className="font-bold text-foreground text-right">
                  Du {new Date(training.date_start).toLocaleDateString("fr-FR")} au {new Date(training.date_end).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> Lieu :
                </span>
                <span className="font-bold text-foreground text-right">{training.location}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/60">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <GraduationCap className="h-3.5 w-3.5 text-accent shrink-0" /> Disponibilité :
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
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Tarif :
                </span>
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-primary">
                  {Number(training.price).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">HTG</span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-xl">
                <Smartphone className="h-3.5 w-3.5 text-red-600" />
                <span>MonCash disponible</span>
              </div>
            </div>

            {/* Highlights */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Certificat officiel</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> 100% Pratique</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Matières fournies</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-orange-500/25 text-xs sm:text-sm cursor-pointer"
                onClick={handleClose}
              >
                <Link href={`/formations/${training.slug}`}>
                  Découvrir & S&apos;inscrire <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer rounded-xl border border-border/50 text-center"
              >
                Fermer cette fenêtre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
