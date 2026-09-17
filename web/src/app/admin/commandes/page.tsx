"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { type Order } from "@/lib/supabase";
import { useToast } from "@/components/ToastNotification";
import { 
  ShoppingCart, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Search, 
  PhoneCall, 
  Eye, 
  X,
  Smartphone,
  Banknote,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn("Fetch orders error:", err);
      showError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = (orderId: string, newStatus: "confirmed" | "rejected" | "delivered" | "pending") => {
    setUpdatingId(orderId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status: newStatus }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
          );
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
          }

          const statusLabels: Record<string, string> = {
            confirmed: "Commande confirmée avec succès !",
            rejected: "Commande rejetée.",
            delivered: "Commande marquée comme livrée.",
            pending: "Commande remise en attente."
          };
          showSuccess(statusLabels[newStatus] || "Statut mis à jour");
        } else {
          showError(data.error || "Erreur lors de la mise à jour");
        }
      } catch (err) {
        console.error("Error updating status:", err);
        showError("Erreur réseau");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_phone?.toLowerCase().includes(query) ||
      order.customer_email?.toLowerCase().includes(query) ||
      order.city?.toLowerCase().includes(query) ||
      order.delivery_address?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // KPI calculations
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed" || o.status === "delivered").length;
  const rejectedCount = orders.filter((o) => o.status === "rejected" || o.status === "cancelled").length;
  const totalConfirmedRevenue = orders
    .filter((o) => o.status === "confirmed" || o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Confirmée
          </span>
        );
      case "rejected":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            Rejetée
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
            <Truck className="h-3.5 w-3.5 text-blue-600" />
            Livrée
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading text-foreground">
          Gestion des Commandes
        </h1>
        <p className="text-muted-foreground mt-1">
          Validez, confirmez ou rejetez les commandes de matières premières passées par vos clients.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Total Commandes</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{totalCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Toutes catégories confondues</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="text-xs font-semibold uppercase text-amber-600 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> En attente
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Nécessite une validation admin</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="text-xs font-semibold uppercase text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirmées / Livrées
          </div>
          <div className="text-2xl font-extrabold text-green-700 mt-1">{confirmedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Validées par l&apos;équipe</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
          <div className="text-xs font-semibold uppercase text-primary">Chiffre d&apos;Affaires Validé</div>
          <div className="text-2xl font-extrabold text-primary mt-1">
            {totalConfirmedRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">HTG</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Commandes confirmées & payées</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Toutes ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            En attente ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === "confirmed"
                ? "bg-green-600 text-white shadow-xs"
                : "bg-green-50 text-green-800 hover:bg-green-100"
            }`}
          >
            Confirmées ({orders.filter((o) => o.status === "confirmed").length})
          </button>
          <button
            onClick={() => setFilterStatus("delivered")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === "delivered"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            Livrées ({orders.filter((o) => o.status === "delivered").length})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === "rejected"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-red-50 text-red-800 hover:bg-red-100"
            }`}
          >
            Rejetées ({rejectedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher client, téléphone, ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-border rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-muted-foreground flex justify-center items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Chargement des commandes...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-lg font-semibold text-foreground">Aucune commande trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || filterStatus !== "all"
                ? "Essayez de modifier vos filtres de recherche."
                : "Les commandes des clients s'afficheront ici en direct."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-bold">Client</th>
                  <th className="px-5 py-4 font-bold">Contact</th>
                  <th className="px-5 py-4 font-bold">Destination</th>
                  <th className="px-5 py-4 font-bold">Paiement</th>
                  <th className="px-5 py-4 font-bold text-right">Montant</th>
                  <th className="px-5 py-4 font-bold text-center">Statut</th>
                  <th className="px-5 py-4 font-bold text-right">Actions de Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const isConfirmed = order.status === "confirmed";
                  const isRejected = order.status === "rejected" || order.status === "cancelled";
                  const isDelivered = order.status === "delivered";
                  const isBusy = isUpdating && updatingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      {/* Client */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground text-sm flex items-center gap-2">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </td>

                      {/* Contact & WhatsApp */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground text-xs">{order.customer_phone}</div>
                        <div className="text-[11px] text-muted-foreground">{order.customer_email}</div>
                        {order.customer_phone && (
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=Bonjour%20${encodeURIComponent(
                              order.customer_name
                            )},%20votre%20commande%20NCP%20est%20en%20cours%20de%20traitement.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold mt-1"
                          >
                            <PhoneCall className="h-3 w-3" /> Écrire sur WhatsApp
                          </a>
                        )}
                      </td>

                      {/* Destination */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-medium text-foreground line-clamp-1">{order.delivery_address}</div>
                        <div className="text-[11px] text-muted-foreground font-bold">{order.city}</div>
                      </td>

                      {/* Paiement */}
                      <td className="px-5 py-4">
                        {order.payment_method === "moncash" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            <Smartphone className="h-3 w-3" /> MonCash
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Banknote className="h-3 w-3" /> À la livraison
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right">
                        <div className="font-extrabold text-sm text-primary">
                          {Number(order.total).toLocaleString()} HTG
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold mt-0.5 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" /> {order.items ? order.items.length : 0} article(s)
                        </button>
                      </td>

                      {/* Statut Badge */}
                      <td className="px-5 py-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Actions Admin : Confirmer / Rejeter */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isBusy ? (
                            <div className="px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mise à jour...
                            </div>
                          ) : (
                            <>
                              {/* Bouton Confirmer */}
                              {!isConfirmed && !isDelivered && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "confirmed")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                  title="Valider et confirmer la commande"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Confirmer
                                </button>
                              )}

                              {/* Bouton Marquer Livrée */}
                              {isConfirmed && !isDelivered && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "delivered")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                  title="Marquer la commande comme livrée"
                                >
                                  <Truck className="h-3.5 w-3.5" />
                                  Livrée
                                </button>
                              )}

                              {/* Bouton Rejeter */}
                              {!isRejected && (
                                <button
                                  onClick={() => {
                                    if (window.confirm("Êtes-vous sûr de vouloir rejeter cette commande ?")) {
                                      handleUpdateStatus(order.id, "rejected");
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                  title="Rejeter ou annuler la commande"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Rejeter
                                </button>
                              )}

                              {/* Bouton Remettre en attente (si rejetée ou déjà livrée) */}
                              {(isRejected || isDelivered) && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "pending")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-medium rounded-xl transition-all cursor-pointer"
                                  title="Remettre en attente"
                                >
                                  En attente
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Détails de la commande
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-foreground">
                {selectedOrder.customer_name}
              </h3>
              <div className="flex items-center gap-2 pt-1">
                {getStatusBadge(selectedOrder.status)}
                <span className="text-xs text-muted-foreground">
                  ID: #{selectedOrder.id.slice(0, 8)}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone :</span>
                <span className="font-bold text-foreground">{selectedOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email :</span>
                <span className="font-bold text-foreground">{selectedOrder.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ville & Adresse :</span>
                <span className="font-bold text-foreground text-right">{selectedOrder.delivery_address}, {selectedOrder.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode de paiement :</span>
                <span className="font-bold text-foreground capitalize">
                  {selectedOrder.payment_method === "moncash" ? "MonCash (Mobile)" : "Paiement à la livraison"}
                </span>
              </div>
              {selectedOrder.notes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block mb-0.5">Notes du client :</span>
                  <p className="font-medium text-foreground italic">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground">Articles Commandés</h4>
              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex justify-between items-center text-xs bg-white">
                      <div>
                        <div className="font-bold text-foreground">{item.product_name}</div>
                        <div className="text-muted-foreground">
                          {item.quantity} x {Number(item.unit_price).toLocaleString()} HTG
                        </div>
                      </div>
                      <div className="font-extrabold text-primary">
                        {(item.quantity * Number(item.unit_price)).toLocaleString()} HTG
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-muted-foreground text-center">Aucun détail d&apos;article</div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <span className="font-bold text-sm text-foreground">Total Commande</span>
              <span className="font-extrabold text-xl text-primary">
                {Number(selectedOrder.total).toLocaleString()} HTG
              </span>
            </div>

            {/* Action Buttons in Modal */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleUpdateStatus(selectedOrder.id, "rejected");
                }}
                disabled={isUpdating}
                className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-bold"
              >
                <XCircle className="mr-2 h-4 w-4" /> Rejeter
              </Button>

              <Button
                onClick={() => {
                  handleUpdateStatus(selectedOrder.id, "confirmed");
                }}
                disabled={isUpdating}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-xs"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
