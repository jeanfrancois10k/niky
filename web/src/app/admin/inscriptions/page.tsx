"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastNotification";
import { 
  UserCheck, 
  Search, 
  Loader2, 
  DollarSign, 
  Users, 
  GraduationCap, 
  Trash2, 
  Download, 
  Printer, 
  Smartphone,
  PhoneCall,
  Eye,
  X,
  FileText,
  HeartPulse,
  Globe2,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParticipantRecord {
  id: string;
  training_id: string;
  training_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface DossierData {
  registration_number?: string;
  gender?: string;
  date_of_birth?: string;
  whatsapp?: string;
  profession?: string;
  education_level?: string;
  address?: string;
  id_card_photo?: string;
  health?: {
    has_medical_condition?: boolean;
    medical_condition_details?: string;
    is_asthmatic?: boolean;
    has_medical_treatment?: boolean;
    medical_treatment_details?: string;
  };
  passport?: {
    has_passport?: boolean;
    passport_number?: string;
    passport_expiry?: string;
    national_mobility?: boolean;
    international_mobility?: boolean;
  };
  emergency_contact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
}

export default function AdminInscriptionsPage() {
  const { showLoading, showSuccess, showError, hideToast } = useToast();
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("Tous");
  const [selectedDossier, setSelectedDossier] = useState<{
    participant: ParticipantRecord;
    dossier: DossierData | null;
  } | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/trainings/registrations");
      const json = await res.json();
      if (json.success) {
        setParticipants(json.data || []);
      }
    } catch (err: unknown) {
      console.warn("Fetch registrations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette inscription ?")) return;

    const toastId = showLoading("Suppression de l'inscription...");
    try {
      const res = await fetch(`/api/admin/trainings/registrations?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Erreur de suppression");
      }

      setParticipants((prev) => prev.filter((p) => p.id !== id));
      if (selectedDossier?.participant.id === id) {
        setSelectedDossier(null);
      }
      hideToast(toastId);
      showSuccess("Inscription supprimée !");
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Erreur de suppression.";
      showError(message);
    }
  };

  const handleOpenDossier = (p: ParticipantRecord) => {
    let parsedDossier: DossierData | null = null;
    if (p.notes) {
      try {
        parsedDossier = JSON.parse(p.notes);
      } catch {
        parsedDossier = null;
      }
    }
    setSelectedDossier({ participant: p, dossier: parsedDossier });
  };

  // Export CSV Function
  const exportToCSV = () => {
    if (filtered.length === 0) {
      showError("Aucune inscription à exporter.");
      return;
    }

    const headers = [
      "ID",
      "Nom du Participant",
      "Téléphone",
      "Email",
      "Ville",
      "Formation",
      "Montant Payé (HTG)",
      "Mode de Règlement",
      "Date d'Inscription"
    ];

    const rows = filtered.map((p) => [
      `"${p.id || ""}"`,
      `"${(p.customer_name || "").replace(/"/g, '""')}"`,
      `"${p.customer_phone || ""}"`,
      `"${p.customer_email || ""}"`,
      `"${(p.city || "").replace(/"/g, '""')}"`,
      `"${(p.training_title || "").replace(/"/g, '""')}"`,
      `"${p.amount_paid || 0}"`,
      `"${p.payment_method === "moncash" ? "MonCash" : "Sur place / Autre"}"`,
      `"${p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : ""}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inscriptions-formations-naf-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Fichier CSV téléchargé avec succès !");
  };

  // Print Function
  const handlePrint = () => {
    window.print();
  };

  const totalRevenue = participants.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);
  const uniqueTrainings = Array.from(new Set(participants.map((p) => p.training_title).filter(Boolean)));

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer_phone.includes(searchTerm) ||
      p.training_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTraining = selectedTraining === "Tous" || p.training_title === selectedTraining;
    return matchesSearch && matchesTraining;
  });

  return (
    <div className="space-y-6">
      {/* Header with Export & Print Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Inscriptions aux Formations NAF</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les dossiers complets des étudiants, pièces d&apos;identité et paiements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="rounded-xl border-border bg-white text-xs font-bold gap-2 cursor-pointer shadow-xs hover:bg-muted"
          >
            <Download className="h-4 w-4 text-primary" /> Exporter en CSV
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="rounded-xl border-border bg-white text-xs font-bold gap-2 cursor-pointer shadow-xs hover:bg-muted"
          >
            <Printer className="h-4 w-4 text-slate-700" /> Imprimer / PDF
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
              Total Étudiants Inscrits
            </div>
            <div className="text-3xl font-extrabold text-foreground">{participants.length}</div>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
              Chiffre d&apos;Affaires NAF
            </div>
            <div className="text-2xl font-extrabold text-green-600">
              {totalRevenue.toLocaleString()} HTG
            </div>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
              Sessions Demandées
            </div>
            <div className="text-3xl font-extrabold text-accent">{uniqueTrainings.length}</div>
          </div>
          <div className="p-3 bg-accent/10 text-accent rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
          />
        </div>

        {uniqueTrainings.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedTraining}
              onChange={(e) => setSelectedTraining(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
            >
              <option value="Tous">Toutes les formations ({participants.length})</option>
              {uniqueTrainings.map((t, idx) => (
                <option key={idx} value={t}>
                  {t} ({participants.filter((p) => p.training_title === t).length})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Participants Table */}
      <div className="bg-white border border-border rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex justify-center items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Chargement des inscriptions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-lg font-semibold text-foreground">Aucune inscription trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dès qu&apos;un candidat soumettra son formulaire d&apos;inscription NAF, son dossier apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Participant</th>
                  <th className="px-5 py-3.5 font-semibold">Contact / Ville</th>
                  <th className="px-5 py-3.5 font-semibold">Formation choisie</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Tarif</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Règlement</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Dossier</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  let parsed: DossierData | null = null;
                  if (p.notes) {
                    try {
                      parsed = JSON.parse(p.notes);
                    } catch {}
                  }
                  const hasIdPhoto = !!parsed?.id_card_photo;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{p.customer_name}</div>
                        {p.customer_phone && (
                          <a
                            href={`https://wa.me/${p.customer_phone.replace(/\D/g, "")}?text=Bonjour%20${encodeURIComponent(
                              p.customer_name
                            )},%20Niky%20Acad%C3%A9mie%20(NAF)%20confirme%20la%20r%C3%A9ception%20compl%C3%A8te%20de%20votre%20dossier%20d'inscription.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold mt-0.5"
                          >
                            <PhoneCall className="h-3 w-3" /> WhatsApp
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-primary text-xs">{p.customer_phone}</div>
                        {p.customer_email && (
                          <div className="text-xs text-muted-foreground">{p.customer_email}</div>
                        )}
                        <div className="text-xs text-muted-foreground font-semibold">{p.city}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-foreground block text-xs sm:text-sm">{p.training_title}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-primary">
                        {Number(p.amount_paid).toLocaleString()} HTG
                      </td>
                      <td className="px-5 py-4 text-center">
                        {p.payment_method === "moncash" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full">
                            <Smartphone className="h-3 w-3" /> MonCash
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase">
                            Sur place
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleOpenDossier(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            hasIdPhoto
                              ? "bg-primary/10 hover:bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Voir Dossier</span>
                          {hasIdPhoto && <span className="w-2 h-2 rounded-full bg-green-500" />}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Supprimer cette inscription"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Dossier Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-border max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedDossier(null)}
              className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-xs uppercase tracking-wider">
                  Dossier Étudiant NAF
                </span>
                {selectedDossier.dossier?.registration_number && (
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {selectedDossier.dossier.registration_number}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold font-heading text-foreground mt-2">
                {selectedDossier.participant.customer_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Session : <span className="font-semibold text-foreground">{selectedDossier.participant.training_title}</span>
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Card Photo */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" /> Pièce d&apos;Identité Officielle
                </h4>
                {selectedDossier.dossier?.id_card_photo ? (
                  <div className="border border-border rounded-2xl overflow-hidden bg-black/5 aspect-video flex items-center justify-center shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedDossier.dossier.id_card_photo}
                      alt="Pièce d'identité"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="border border-dashed border-border rounded-2xl p-8 text-center text-xs text-muted-foreground bg-muted/20">
                    Aucune photo de pièce d&apos;identité attachée.
                  </div>
                )}

                {/* Emergency Contact */}
                <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-2 text-xs">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <PhoneCall className="h-3.5 w-3.5 text-primary" /> Contact en Cas d&apos;Urgence
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nom : </span>
                    <strong className="text-foreground">{selectedDossier.dossier?.emergency_contact?.name || "Non spécifié"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lien : </span>
                    <span className="text-foreground">{selectedDossier.dossier?.emergency_contact?.relation || "Non spécifié"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Téléphone : </span>
                    <strong className="text-primary">{selectedDossier.dossier?.emergency_contact?.phone || "Non spécifié"}</strong>
                  </div>
                </div>
              </div>

              {/* Personal, Health & Passport Information */}
              <div className="space-y-4 text-xs">
                {/* Personal Info Box */}
                <div className="bg-white border border-border rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                    <User className="h-4 w-4 text-primary" /> Informations Personnelles
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-muted-foreground">Sexe : </span>
                      <strong className="text-foreground">{selectedDossier.dossier?.gender || "-"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date Naissance : </span>
                      <strong className="text-foreground">{selectedDossier.dossier?.date_of_birth || "-"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Téléphone : </span>
                      <strong className="text-primary">{selectedDossier.participant.customer_phone}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">WhatsApp : </span>
                      <strong className="text-emerald-600">{selectedDossier.dossier?.whatsapp || selectedDossier.participant.customer_phone}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Profession : </span>
                      <span className="text-foreground">{selectedDossier.dossier?.profession || "-"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Niveau d&apos;étude : </span>
                      <span className="text-foreground">{selectedDossier.dossier?.education_level || "-"}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-muted-foreground">Adresse : </span>
                    <span className="text-foreground font-medium">
                      {selectedDossier.dossier?.address || "-"}, {selectedDossier.participant.city}
                    </span>
                  </div>
                </div>

                {/* Health Box */}
                <div className="bg-white border border-border rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                    <HeartPulse className="h-4 w-4 text-red-500" /> Santé & Sécurité Atelier
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div>
                      <span className="text-muted-foreground">Affection / Maladie : </span>
                      {selectedDossier.dossier?.health?.has_medical_condition ? (
                        <span className="font-bold text-amber-600">
                          Oui ({selectedDossier.dossier.health.medical_condition_details})
                        </span>
                      ) : (
                        <span className="text-foreground">Aucune</span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Asthmatique : </span>
                      {selectedDossier.dossier?.health?.is_asthmatic ? (
                        <span className="font-bold text-red-600">Oui</span>
                      ) : (
                        <span className="text-foreground">Non</span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Traitement médical : </span>
                      {selectedDossier.dossier?.health?.has_medical_treatment ? (
                        <span className="font-bold text-amber-600">
                          Oui ({selectedDossier.dossier.health.medical_treatment_details})
                        </span>
                      ) : (
                        <span className="text-foreground">Aucun</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Passport & Mobility */}
                <div className="bg-white border border-border rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                    <Globe2 className="h-4 w-4 text-primary" /> Mobilité & Passeport
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div>
                      <span className="text-muted-foreground">Passeport valide : </span>
                      {selectedDossier.dossier?.passport?.has_passport ? (
                        <span className="font-bold text-primary">
                          Oui (N° {selectedDossier.dossier.passport.passport_number} - Exp: {selectedDossier.dossier.passport.passport_expiry || "N/A"})
                        </span>
                      ) : (
                        <span className="text-foreground">Non</span>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-muted-foreground">Mobilité Nat. : </span>
                        <strong>{selectedDossier.dossier?.passport?.national_mobility ? "Oui" : "Non"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mobilité Int. : </span>
                        <strong>{selectedDossier.dossier?.passport?.international_mobility ? "Oui" : "Non"}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <a
                href={`https://wa.me/${selectedDossier.participant.customer_phone.replace(/\D/g, "")}?text=Bonjour%20${encodeURIComponent(
                  selectedDossier.participant.customer_name
                )},%20Niky%20Acad%C3%A9mie%20(NAF)%20confirme%20la%20r%C3%A9ception%20compl%C3%A8te%20de%20votre%20dossier%20d'inscription.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <PhoneCall className="h-4 w-4" /> Contacter sur WhatsApp
              </a>

              <Button
                onClick={() => setSelectedDossier(null)}
                variant="outline"
                className="rounded-xl text-xs font-semibold"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
