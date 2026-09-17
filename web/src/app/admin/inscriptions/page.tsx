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
  PhoneCall
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
  created_at: string;
}

export default function AdminInscriptionsPage() {
  const { showLoading, showSuccess, showError, hideToast } = useToast();
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("Tous");

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
      hideToast(toastId);
      showSuccess("Inscription supprimée !");
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Erreur de suppression.";
      showError(message);
    }
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
      `inscriptions-formations-ncp-${new Date().toISOString().split("T")[0]}.csv`
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
          <h1 className="text-3xl font-bold tracking-tight font-heading">Inscriptions aux Formations</h1>
          <p className="text-muted-foreground mt-1">
            Suivez la liste de tous les participants inscrits et exportez les données.
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
              Total Participants Inscrits
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
              Chiffre d&apos;Affaires Formations
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
              Dès qu&apos;un candidat réservera sa place à une session de formation, ses coordonnées apparaîtront ici.
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
                  <th className="px-5 py-3.5 font-semibold text-center">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">{p.customer_name}</div>
                      {p.customer_phone && (
                        <a
                          href={`https://wa.me/${p.customer_phone.replace(/\D/g, "")}?text=Bonjour%20${encodeURIComponent(
                            p.customer_name
                          )},%20votre%20inscription%20à%20la%20formation%20NCP%20"${encodeURIComponent(
                            p.training_title
                          )}"%20est%20bien%20confirmée.`}
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
                    <td className="px-5 py-4 text-center text-xs text-muted-foreground">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "-"}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
