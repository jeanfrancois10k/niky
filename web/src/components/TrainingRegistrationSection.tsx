"use client";

import { useState } from "react";
import { type Training } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { TrainingRegistrationModal } from "@/components/TrainingRegistrationModal";

export function TrainingRegistrationSection({ training }: { training: Training }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSeats, setCurrentSeats] = useState(Number(training.current_seats) || 0);

  const maxSeats = Number(training.max_seats) || 20;
  const isFull = currentSeats >= maxSeats;
  const availableSeats = Math.max(0, maxSeats - currentSeats);

  return (
    <>
      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm sticky top-24">
        <h3 className="font-heading font-bold text-xl mb-6 border-b border-border pb-4">Détails de la session</h3>

        <div className="space-y-6 mb-8">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 mr-4 shrink-0 text-primary mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Dates de la session</div>
              <div className="text-muted-foreground text-sm">
                Du {new Date(training.date_start).toLocaleDateString("fr-FR")} au {new Date(training.date_end).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-4 shrink-0 text-primary mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Lieu</div>
              <div className="text-muted-foreground text-sm">{training.location}</div>
            </div>
          </div>

          <div className="flex items-start">
            <Users className="h-5 w-5 mr-4 shrink-0 text-primary mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Disponibilité</div>
              <div className="text-muted-foreground text-sm">Capacité : {maxSeats} participants</div>
              {!isFull ? (
                <div className="text-green-600 font-semibold text-sm mt-1">
                  ✓ {availableSeats} place{availableSeats > 1 ? "s" : ""} restante{availableSeats > 1 ? "s" : ""}
                </div>
              ) : (
                <div className="text-red-600 font-semibold text-sm mt-1">✕ Plus aucune place disponible</div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 mb-8 text-center bg-muted/20 -mx-6 sm:-mx-8 px-6 py-4 rounded-xl">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Tarif de participation</div>
          <div className="font-extrabold text-3xl text-primary">{Number(training.price).toLocaleString()} <span className="text-base font-normal text-muted-foreground">HTG</span></div>
        </div>

        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-accent hover:bg-accent/90 text-white text-base font-bold py-6 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
          disabled={isFull}
        >
          {isFull ? "Session Complète" : "S'inscrire maintenant"}
        </Button>
      </div>

      <TrainingRegistrationModal
        training={{ ...training, current_seats: currentSeats }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setCurrentSeats((prev) => prev + 1);
        }}
      />
    </>
  );
}
