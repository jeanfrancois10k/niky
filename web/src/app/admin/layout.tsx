"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LogOut, LayoutDashboard, Package, GraduationCap, ShoppingCart, UserCheck } from "lucide-react";

function AdminNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/produits", label: "Produits", icon: Package },
    { href: "/admin/formations", label: "Formations", icon: GraduationCap },
    { href: "/admin/inscriptions", label: "Inscriptions", icon: UserCheck },
    { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  ];

  return (
    <aside className="w-full md:w-60 shrink-0">
      <nav className="flex flex-col gap-1.5 bg-white p-3 rounded-2xl border border-border/80 shadow-xs">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2.5 ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        <div className="pt-3 mt-2 border-t border-border/60">
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </nav>
    </aside>
  );
}

import { AdminNotificationBell } from "@/components/AdminNotificationBell";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Sur la page de connexion, on affiche uniquement le formulaire propre sans le menu latéral
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-60 shrink-0 space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-border/80 shadow-xs md:hidden">
              <span className="font-heading font-extrabold text-sm text-primary">Administration</span>
              <AdminNotificationBell />
            </div>
            <AdminNav />
          </div>
          <main className="flex-1 space-y-6">
            <div className="hidden md:flex justify-end items-center mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium">Alertes & Commandes :</span>
                <AdminNotificationBell />
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}