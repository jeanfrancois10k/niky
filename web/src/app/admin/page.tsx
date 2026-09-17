"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Order, type Product, type Training } from "@/lib/supabase";
import { Package, ShoppingCart, GraduationCap, ArrowRight, Loader2, UserCheck, TrendingUp, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParticipantRecord {
  id: string;
  training_title: string;
  customer_name: string;
  customer_phone: string;
  amount_paid: number;
  payment_method: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    totalStockValue: 0,
    totalStockUnits: 0,
    ordersCount: 0,
    productSalesTotal: 0,
    trainingsCount: 0,
    trainingParticipantsCount: 0,
    trainingsRevenue: 0,
    grandTotalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentParticipants, setRecentParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsRes, ordersRes, trainingsRes, registrationsRes] = await Promise.all([
          fetch("/api/admin/products").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          fetch("/api/admin/trainings").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
          fetch("/api/admin/trainings/registrations").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
        ]);

        const products = (productsRes.data || []) as Product[];
        const trainings = (trainingsRes.data || []) as Training[];
        const rawOrders = (ordersRes.data || []) as Order[];
        const participants = (registrationsRes.data || []) as ParticipantRecord[];

        // Filter product orders (exclude training notes if stored in orders)
        const productOrders = rawOrders.filter((o) => o.notes !== "INSCRIPTION_FORMATION");

        // 1. Stock Valuation (price * stock)
        const totalStockValue = products.reduce((sum: number, p: Product) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
        const totalStockUnits = products.reduce((sum: number, p: Product) => sum + (Number(p.stock) || 0), 0);

        // 2. Product Sales CA
        const productSalesTotal = productOrders.reduce((sum: number, o: Order) => sum + (Number(o.total) || 0), 0);

        // 3. Training Revenue CA (from registrations or trainings current_seats * price)
        const registrationsRevenue = participants.reduce((sum: number, p: ParticipantRecord) => sum + (Number(p.amount_paid) || 0), 0);
        const trainingsSeatsRevenue = trainings.reduce((sum: number, t: Training) => sum + ((Number(t.price) || 0) * (Number(t.current_seats) || 0)), 0);
        const trainingsRevenue = Math.max(registrationsRevenue, trainingsSeatsRevenue);
        const totalSeatsOccupied = Math.max(participants.length, trainings.reduce((sum: number, t: Training) => sum + (Number(t.current_seats) || 0), 0));

        // 4. Grand Total Revenue
        const grandTotalRevenue = productSalesTotal + trainingsRevenue;

        setStats({
          productsCount: products.length,
          totalStockValue,
          totalStockUnits,
          ordersCount: productOrders.length,
          productSalesTotal,
          trainingsCount: trainings.length,
          trainingParticipantsCount: totalSeatsOccupied,
          trainingsRevenue,
          grandTotalRevenue,
        });

        setRecentOrders(productOrders.slice(0, 5));
        setRecentParticipants(participants.slice(0, 5));
      } catch (err) {
        console.warn("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const exportGlobalReport = () => {
    const reportData = [
      ["RAPPORT FINANCIER & COMMERCIAL GLOBAL — NIKY CHEMICAL PRODUCT (NCP)"],
      [`Date d'extraction : ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`],
      [""],
      ["INDICATEURS CLÉS", "VALEUR EN GOURDES (HTG)", "DÉTAIL"],
      ["Chiffre d'Affaires Global Total", `${stats.grandTotalRevenue} HTG`, "Ventes de Produits + Inscriptions aux Formations"],
      ["Chiffre d'Affaires Formations", `${stats.trainingsRevenue} HTG`, `${stats.trainingParticipantsCount} participants inscrits`],
      ["Chiffre d'Affaires Ventes Produits", `${stats.productSalesTotal} HTG`, `${stats.ordersCount} commandes clients`],
      ["Valeur Totale du Stock en Entrepôt", `${stats.totalStockValue} HTG`, `${stats.productsCount} références • ${stats.totalStockUnits} unités en stock`],
    ];

    const csvContent = "\uFEFF" + reportData.map((row) => row.map((cell) => `"${cell}"`).join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bilan-global-ncp-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading">Tableau de bord</h2>
          <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de l&apos;activité, des stocks et du chiffre d&apos;affaires NCP.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={exportGlobalReport}
            variant="outline"
            className="rounded-xl border-border bg-white text-xs font-bold gap-2 cursor-pointer shadow-xs hover:bg-muted"
          >
            <Download className="h-4 w-4 text-primary" /> Exporter Bilan Global
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="rounded-xl border-border bg-white text-xs font-bold gap-2 cursor-pointer shadow-xs hover:bg-muted"
          >
            <Printer className="h-4 w-4 text-slate-700" /> Imprimer Bilan
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground flex justify-center items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement des indicateurs financiers...
        </div>
      ) : (
        <>
          {/* Main 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Stock Valuation */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Valeur Stock Marchandise</span>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-blue-700">{stats.totalStockValue.toLocaleString()} HTG</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.productsCount} produit{stats.productsCount > 1 ? "s" : ""} • {stats.totalStockUnits.toLocaleString()} unités
                </p>
              </div>
            </div>

            {/* 2. Products Sales CA */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Ventes Produits (CA)</span>
                <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-accent">{stats.productSalesTotal.toLocaleString()} HTG</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.ordersCount} commande{stats.ordersCount > 1 ? "s" : ""} client{stats.ordersCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* 3. Training Revenue CA */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Formations (CA)</span>
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-primary">{stats.trainingsRevenue.toLocaleString()} HTG</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.trainingParticipantsCount} participant{stats.trainingParticipantsCount > 1 ? "s" : ""} inscrit{stats.trainingParticipantsCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* 4. Grand Total Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between bg-gradient-to-br from-green-50/50 to-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Chiffre d&apos;Affaires Réalisé</span>
                <div className="p-2.5 bg-green-100 text-green-700 rounded-xl">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-green-700">{stats.grandTotalRevenue.toLocaleString()} HTG</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium text-green-600">
                  Total Ventes + Inscriptions
                </p>
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Product Orders */}
            <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-heading font-bold text-lg">Dernières Commandes Produits</h3>
                  <p className="text-xs text-muted-foreground">Matières premières chimiques</p>
                </div>
                <Link href="/admin/commandes" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm">Aucune commande pour le moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Client</th>
                        <th className="px-3 py-2 font-semibold">Ville</th>
                        <th className="px-3 py-2 text-right">Montant</th>
                        <th className="px-3 py-2 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2.5 font-semibold text-foreground">{o.customer_name}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{o.city}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-primary">{Number(o.total).toLocaleString()} HTG</td>
                          <td className="px-3 py-2.5 text-center">
                            {o.status === "confirmed" ? (
                              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded-full">
                                Confirmée
                              </span>
                            ) : o.status === "rejected" || o.status === "cancelled" ? (
                              <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full">
                                Rejetée
                              </span>
                            ) : o.status === "delivered" ? (
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                                Livrée
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-full">
                                En attente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Training Registrations */}
            <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-heading font-bold text-lg">Dernières Inscriptions Formations</h3>
                  <p className="text-xs text-muted-foreground">Participants aux sessions pratiques</p>
                </div>
                <Link href="/admin/inscriptions" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentParticipants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm">Aucune inscription pour le moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Participant</th>
                        <th className="px-3 py-2 font-semibold">Formation</th>
                        <th className="px-3 py-2 text-right">Tarif</th>
                        <th className="px-3 py-2 text-center">Règlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-foreground">{p.customer_name}</div>
                            <div className="text-[11px] text-muted-foreground">{p.customer_phone}</div>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-foreground truncate max-w-[140px]">{p.training_title}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-primary">{Number(p.amount_paid).toLocaleString()} HTG</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full uppercase">
                              {p.payment_method === "moncash" ? "MonCash" : "Sur place"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

