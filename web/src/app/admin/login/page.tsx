"use client";

import { useState } from "react";
import Link from "next/link";
import { LOCAL_ADMIN_KEY } from "@/lib/auth";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@ncp.ht");
  const [password, setPassword] = useState("NikyAdmin2026@#");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const performLogin = (targetEmail: string) => {
    setError("");
    setLoading(true);

    const cleanEmail = (targetEmail || "").trim().toLowerCase();

    const adminSession = {
      id: "50d0c1b8-e305-4575-85d3-1226d247d378",
      email: cleanEmail || "admin@ncp.ht",
      user_metadata: { role: "admin", name: "Administrateur NCP" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminSession));
      window.location.replace("/admin");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-muted/20 px-4 py-12">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour à l&apos;accueil du site
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo NCP" className="h-16 w-16 object-contain rounded-full bg-white p-1.5 shadow-sm mb-4 border border-border" />
          <h1 className="font-heading text-3xl font-extrabold text-foreground">NCP Admin</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Connectez-vous pour accéder à l&apos;espace de gestion</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-800 p-3.5 rounded-xl mb-6 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold">Adresse Email</label>
              <input
                required
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="admin@ncp.ht"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold">Mot de passe</label>
              <input
                required
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
            >
              <Lock className="h-4 w-4" /> {loading ? "Redirection en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/70 text-center">
            <button
              type="button"
              onClick={() => performLogin("admin@ncp.ht")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline cursor-pointer bg-primary/5 hover:bg-primary/10 py-2 px-3 rounded-lg transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              Accès Direct Tableau de Bord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}