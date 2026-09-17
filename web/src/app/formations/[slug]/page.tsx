import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, type Training } from "@/lib/supabase";
import { CheckCircle2 } from "lucide-react";
import { TrainingRegistrationSection } from "@/components/TrainingRegistrationSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTraining(slug: string): Promise<Training | null> {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data;
}

export default async function TrainingDetailPage({ params }: { params: { slug: string } }) {
  const training = await getTraining(params.slug);

  if (!training) {
    notFound();
  }

  const isFull = training.current_seats >= training.max_seats;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/formations" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        ← Retour aux formations
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={training.image} alt={training.title} className="w-full h-full object-cover" />
            {isFull && (
              <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-4 py-2 rounded-full text-sm">
                Session complète
              </div>
            )}
          </div>

          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">{training.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{training.full_description}</p>

            <h2 className="font-heading text-2xl font-bold mb-4">Objectifs de la formation</h2>
            <ul className="space-y-3">
              {training.objectives && training.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 shrink-0" />
                  <span className="text-foreground/90">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <TrainingRegistrationSection training={training} />
        </div>
      </div>
    </div>
  );
}