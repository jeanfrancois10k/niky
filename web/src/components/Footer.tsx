import Link from "next/link";
import { Mail, MapPin, Phone, Smartphone, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0c183d] text-white mt-auto border-t border-white/10">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo NCP" className="h-11 w-11 object-contain rounded-full bg-white p-1" />
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">NCP</span>
            </Link>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Fournisseur de référence en Haïti pour les matières premières chimiques pures et centre de formation professionnelle en fabrication industrielle et artisanale.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300">
              <ShieldCheck className="h-4 w-4" /> Qualité & Normes Certifiées
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="font-heading font-bold text-base uppercase tracking-wider text-amber-400 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-blue-100/80">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/boutique" className="hover:text-white transition-colors">Boutique en ligne</Link></li>
              <li><Link href="/formations" className="hover:text-white transition-colors">Académie & Formations</Link></li>
              <li><Link href="/panier" className="hover:text-white transition-colors">Mon Panier</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors text-xs text-blue-300">Accès Administration</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact & Adresses */}
          <div>
            <h3 className="font-heading font-bold text-base uppercase tracking-wider text-amber-400 mb-4">
              Adresses & Contact
            </h3>
            <ul className="space-y-3.5 text-xs text-blue-100/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="flex flex-col gap-1">
                  <span><strong>Pétion-Ville :</strong> #68B Route De Frère</span>
                  <span><strong>Jacmel :</strong> #21 Rue de la Comédie</span>
                  <span><strong>Kenscoff :</strong> #2 imp Noël Fermathe 55</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-amber-400" />
                <a href="tel:+50947297655" className="hover:text-white font-medium">+509 47 29 76 55</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                <a href="mailto:contact@ncp.ht" className="hover:text-white">contact@ncp.ht</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Paiement MonCash & Réseaux */}
          <div className="space-y-5">
            <div>
              <h3 className="font-heading font-bold text-base uppercase tracking-wider text-amber-400 mb-3">
                Paiement Mobile
              </h3>
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 flex items-center gap-3">
                <div className="p-2 bg-red-600 text-white font-bold rounded-xl text-xs flex items-center justify-center">
                  <Smartphone className="h-4 w-4 mr-1" /> MonCash
                </div>
                <div className="text-[11px] text-blue-100">
                  Paiements rapides & sécurisés par <strong>MonCash</strong> en Gourdes (HTG).
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-blue-200 mb-2">Rejoignez notre communauté</h4>
              <div className="flex gap-2.5">
                <Link
                  href="https://www.facebook.com/profile.php?id=100063644979670&mibextid=ZbWKwL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent transition-colors font-bold text-xs"
                  title="Facebook"
                >
                  f
                </Link>
                <Link
                  href="https://www.tiktok.com/@nikychemicalproduc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent transition-colors font-bold text-xs"
                  title="TikTok"
                >
                  tt
                </Link>
                <Link
                  href="https://wa.me/50947297655"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-green-600/30 text-green-400 border border-green-500/30 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors font-bold text-xs"
                  title="WhatsApp"
                >
                  wa
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-blue-200/60">
          <p>&copy; {new Date().getFullYear()} Niky Chemical Product (NCP) • Haïti. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            Paiements en <strong>Gourdes (HTG)</strong> • MonCash Agréé
          </p>
        </div>
      </div>
    </footer>
  );
}
