"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/lib/auth";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const items = useCart((state) => state.items);
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? items.reduce((count, item) => count + item.quantity, 0) : 0;
  const isLoggedIn = mounted && !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section: Logo & Admin Badge / Navigation */}
        <div className="flex items-center gap-5">
          <Link href={isLoggedIn ? "/admin" : "/"} className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo NCP" className="h-10 w-10 object-contain rounded-full border border-primary/20 bg-white p-0.5" />
            <span className="font-heading font-extrabold text-xl tracking-tight text-primary">NCP</span>
          </Link>

          {isLoggedIn ? (
            <div className="hidden sm:flex flex-col border-l border-border/80 pl-4 py-0.5">
              <span className="font-heading font-bold text-sm md:text-base text-primary leading-tight">
                Espace Administration
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Connecté en tant que <span className="font-semibold text-foreground">{user.email || "admin@ncp.ht"}</span>
              </span>
            </div>
          ) : (
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Accueil</Link>
              <Link href="/boutique" className="text-sm font-medium hover:text-primary transition-colors">Boutique</Link>
              <Link href="/formations" className="text-sm font-medium hover:text-primary transition-colors">Formations</Link>
              <Link href="/a-propos" className="text-sm font-medium hover:text-primary transition-colors">À Propos</Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {!isLoggedIn && (
            <Link
              href="/panier"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative p-2 rounded-full hover:bg-muted/80")}
              aria-label={`Panier (${cartCount} articles)`}
            >
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-extrabold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden md:inline-flex text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                target="_blank"
                title="Ouvrir le site public"
              >
                Voir le site ↗
              </Link>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full px-4 py-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              href="/admin/login"
              className={cn(buttonVariants({ size: "sm" }), "hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4")}
            >
              Connexion Admin
            </Link>
          )}

          {!isLoggedIn && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Drawer pour visiteurs non connectés */}
      {mobileOpen && !isLoggedIn && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Accueil</Link>
            <Link href="/boutique" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Boutique</Link>
            <Link href="/formations" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Formations</Link>
            <Link href="/a-propos" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>À Propos</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Contact</Link>
            
            <Link href="/panier" className="text-sm font-medium flex items-center justify-between hover:text-primary transition-colors py-2 border-t pt-3" onClick={() => setMobileOpen(false)}>
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Panier d&apos;achats
              </span>
              {cartCount > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartCount} articles
                </span>
              )}
            </Link>

            <div className="pt-2 border-t">
              <Link href="/admin/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 block" onClick={() => setMobileOpen(false)}>
                Connexion Admin
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}