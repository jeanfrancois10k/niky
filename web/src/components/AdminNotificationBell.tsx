"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, ShoppingCart, GraduationCap, Check, ArrowRight, Smartphone } from "lucide-react";
import { useToast } from "@/components/ToastNotification";

interface NotificationItem {
  id: string;
  type: "order" | "registration";
  title: string;
  subtitle: string;
  time: string;
  link: string;
  isMonCash?: boolean;
}

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef<number>(0);
  const { showSuccess } = useToast();

  const fetchLiveUpdates = useCallback(async () => {
    try {
      const [ordersRes, registrationsRes] = await Promise.all([
        fetch("/api/admin/orders", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch("/api/admin/trainings/registrations", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const rawOrders = ordersRes.orders || [];
      const pendingOrders = rawOrders.filter((o: { status: string }) => o.status === "pending");
      const rawRegistrations = registrationsRes.data || [];

      const notifs: NotificationItem[] = [];

      // Pending Orders notifications
      pendingOrders.slice(0, 5).forEach((order: { id: string; customer_name: string; total: number; payment_method?: string; created_at: string }) => {
        notifs.push({
          id: `order-${order.id}`,
          type: "order",
          title: `Nouvelle commande : ${order.customer_name}`,
          subtitle: `${Number(order.total).toLocaleString()} HTG • ${order.payment_method === "moncash" ? "MonCash" : "À la livraison"}`,
          time: new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          link: "/admin/commandes",
          isMonCash: order.payment_method === "moncash",
        });
      });

      // Recent Registrations notifications
      rawRegistrations.slice(0, 5).forEach((reg: { id: string; customer_name: string; training_title: string; amount_paid: number; payment_method?: string; created_at: string }) => {
        notifs.push({
          id: `reg-${reg.id}`,
          type: "registration",
          title: `Inscription : ${reg.customer_name}`,
          subtitle: `${reg.training_title} • ${Number(reg.amount_paid).toLocaleString()} HTG`,
          time: new Date(reg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          link: "/admin/inscriptions",
          isMonCash: reg.payment_method === "moncash",
        });
      });

      setNotifications(notifs);
      const activePendingCount = pendingOrders.length + rawRegistrations.slice(0, 3).length;
      setUnreadCount(activePendingCount);

      // If new notifications arrived during live session
      if (lastCountRef.current > 0 && activePendingCount > lastCountRef.current) {
        showSuccess("🔔 Nouvelle commande ou inscription reçue !");
      }
      lastCountRef.current = activePendingCount;
    } catch (err) {
      console.warn("Live notification fetch notice:", err);
    }
  }, [showSuccess]);

  useEffect(() => {
    fetchLiveUpdates();
    // Poll every 15 seconds for new client orders/registrations
    const interval = setInterval(fetchLiveUpdates, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveUpdates]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with pulse badge */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-2xl bg-white hover:bg-muted border border-border/80 text-foreground transition-all shadow-xs cursor-pointer focus:outline-none"
        title="Centre de notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-border shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm text-foreground">Notifications Directes</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                  {unreadCount} active(s)
                </span>
              )}
            </div>
            <button
              onClick={() => setUnreadCount(0)}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Check className="h-3 w-3" /> Marquer lu
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <Bell className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
                Aucune nouvelle notification pour le moment.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-2xl bg-muted/20 hover:bg-muted/60 border border-border/60 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      n.type === "order" ? "bg-amber-100 text-amber-800" : "bg-primary/10 text-primary"
                    }`}>
                      {n.type === "order" ? <ShoppingCart className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{n.subtitle}</p>
                      {n.isMonCash && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded mt-1">
                          <Smartphone className="h-2.5 w-2.5" /> Paiement MonCash
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-border/80 grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <Link
              href="/admin/commandes"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              Commandes <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/admin/inscriptions"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              Inscriptions <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
