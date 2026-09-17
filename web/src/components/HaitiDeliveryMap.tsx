"use client";

import { useState } from "react";
import { 
  MapPin, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Navigation,
  PhoneCall
} from "lucide-react";

interface Hub {
  id: string;
  name: string;
  department: string;
  type: "hub_principal" | "antenne" | "relais" | "livraison";
  address?: string;
  deliveryTime: string;
  status: string;
  phone?: string;
  coords: { x: number; y: number }; // percentage coordinates on map canvas
  description: string;
}

const HUBS: Hub[] = [
  {
    id: "pap",
    name: "Port-au-Prince / Pétion-Ville",
    department: "Ouest",
    type: "hub_principal",
    address: "#68B Route De Frère, Pétion-Ville",
    deliveryTime: "Retrait immédiat ou Livraison 24h",
    status: "Siège & Laboratoire Central",
    phone: "+509 47 29 76 55",
    coords: { x: 53, y: 64 },
    description: "Hub principal NCP : stock complet de matières premières, ateliers de formation pratique et expéditions nationales."
  },
  {
    id: "jacmel",
    name: "Jacmel",
    department: "Sud-Est",
    type: "antenne",
    address: "#21 Rue de la Comédie, Jacmel",
    deliveryTime: "Point de retrait direct / 24h",
    status: "Antenne Sud-Est NCP",
    phone: "+509 47 29 76 55",
    coords: { x: 50, y: 76 },
    description: "Antenne officielle NCP pour tout le Sud-Est. Vente directe au détail et support pour artisans savonniers."
  },
  {
    id: "kenscoff",
    name: "Kenscoff / Fermathe",
    department: "Ouest (Hauteurs)",
    type: "relais",
    address: "#2 imp Noël Fermathe 55, Kenscoff",
    deliveryTime: "Point Relais & Retrait sur RDV",
    status: "Point Relais Officiel",
    phone: "+509 47 29 76 55",
    coords: { x: 55, y: 70 },
    description: "Point relais et dépôt pour les commandes en altitude et zones périphériques de Port-au-Prince."
  },
  {
    id: "cap",
    name: "Cap-Haïtien",
    department: "Nord",
    type: "livraison",
    deliveryTime: "24h à 48h",
    status: "Réseau Logistique Nord",
    coords: { x: 55, y: 22 },
    description: "Expéditions régulières sécurisées pour les savonneries, ateliers et commerçants du Grand Nord."
  },
  {
    id: "cayes",
    name: "Les Cayes",
    department: "Sud",
    type: "livraison",
    deliveryTime: "24h à 48h",
    status: "Réseau Logistique Sud",
    coords: { x: 22, y: 78 },
    description: "Dessert la presqu'île du Sud et les fabricants de cosmétiques naturels et d'huiles essentielles."
  },
  {
    id: "gonaives",
    name: "Gonaïves",
    department: "Artibonite",
    type: "livraison",
    deliveryTime: "24h",
    status: "Réseau Artibonite",
    coords: { x: 42, y: 38 },
    description: "Acheminement rapide des fûts et barils de tensioactifs pour les fabricants de détergents locaux."
  },
  {
    id: "stmarc",
    name: "Saint-Marc",
    department: "Artibonite",
    type: "livraison",
    deliveryTime: "24h",
    status: "Réseau Artibonite",
    coords: { x: 44, y: 49 },
    description: "Livraison directe pour artisans et PME de nettoyage industriel de la côte."
  },
  {
    id: "hinche",
    name: "Hinche",
    department: "Centre",
    type: "livraison",
    deliveryTime: "48h",
    status: "Réseau Plateau Central",
    coords: { x: 62, y: 44 },
    description: "Approvisionnement fiable pour les savonneries et coopératives artisanales du Centre."
  }
];

export function HaitiDeliveryMap() {
  const [selectedHub, setSelectedHub] = useState<Hub>(HUBS[0]);

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Truck className="h-4 w-4" /> Réseau Logistique & Points de Retrait
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-foreground tracking-tight">
          Couverture Nationale d&apos;Haïti
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-3 max-w-2xl mx-auto">
          De Port-au-Prince aux provinces, <strong>Niky Chemical Product</strong> assure la distribution sécurisée de vos matières premières avec règlement instantané via <strong>MonCash</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
        {/* Interactive Map Visual (Left 7 cols) */}
        <div className="lg:col-span-7 bg-[#0b1536] rounded-3xl p-6 sm:p-8 border border-blue-900/60 shadow-2xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Map Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 text-white border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Lignes d&apos;expédition en direct
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <Smartphone className="h-3.5 w-3.5 text-accent" />
              <span>Garantie MonCash</span>
            </div>
          </div>

          {/* Stylized Haiti Map Canvas */}
          <div className="relative w-full aspect-[4/3] bg-[#070e24]/80 rounded-2xl border border-white/5 overflow-hidden p-4 flex items-center justify-center">
            {/* Grid overlay */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            />

            {/* Stylized Haiti SVG Outline */}
            <svg 
              viewBox="0 0 800 600" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <defs>
                <linearGradient id="haitiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#172554" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Geographic simplified contours of Haiti */}
              {/* Northern peninsula & Massif du Nord */}
              <path
                d="M 280,140 Q 380,100 480,120 Q 560,110 620,160 Q 640,200 580,240 Q 480,250 400,260 Q 320,270 280,220 Z"
                fill="url(#haitiGrad)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.9"
              />

              {/* Central Plateau & Artibonite */}
              <path
                d="M 320,240 Q 450,230 580,250 Q 620,320 560,370 Q 420,380 340,330 Q 300,280 320,240 Z"
                fill="url(#haitiGrad)"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.85"
              />

              {/* Southern Peninsula (Grand'Anse, Sud, Nippes, Ouest, Sud-Est) */}
              <path
                d="M 120,440 Q 240,430 380,430 Q 520,440 600,430 Q 620,480 540,510 Q 380,520 220,510 Q 110,500 120,440 Z"
                fill="url(#haitiGrad)"
                stroke="#ea580c"
                strokeWidth="2.5"
                opacity="0.95"
              />

              {/* Ile de la Gonave */}
              <ellipse 
                cx="330" 
                cy="370" 
                rx="45" 
                ry="18" 
                transform="rotate(-20 330 370)"
                fill="#1e3a8a" 
                stroke="#3b82f6" 
                strokeWidth="1.5" 
                opacity="0.7"
              />

              {/* Ile de la Tortue */}
              <ellipse 
                cx="390" 
                cy="95" 
                rx="50" 
                ry="12" 
                transform="rotate(-10 390 95)"
                fill="#1e3a8a" 
                stroke="#3b82f6" 
                strokeWidth="1.5" 
                opacity="0.7"
              />

              {/* Connecting routes from Port-au-Prince (Hub) */}
              <path d="M 424,384 L 440,132" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
              <path d="M 424,384 L 176,468" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
              <path d="M 424,384 L 400,456" stroke="#ea580c" strokeWidth="2.5" opacity="0.8" />
              <path d="M 424,384 L 336,228" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
              <path d="M 424,384 L 496,264" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
            </svg>

            {/* Interactive Hub Node Pins */}
            {HUBS.map((hub) => {
              const isSelected = selectedHub.id === hub.id;
              const isMain = hub.type === "hub_principal";
              const isBranch = hub.type === "antenne";

              return (
                <button
                  key={hub.id}
                  onClick={() => setSelectedHub(hub)}
                  style={{ left: `${hub.coords.x}%`, top: `${hub.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-20"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring for selected or main hubs */}
                    {(isSelected || isMain) && (
                      <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-75 animate-ping ${
                        isMain ? "bg-orange-500" : isBranch ? "bg-amber-400" : "bg-blue-400"
                      }`} />
                    )}

                    {/* Pin Circle */}
                    <div className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                      isSelected 
                        ? "h-7 w-7 bg-white text-primary ring-4 ring-orange-500 shadow-lg scale-125" 
                        : isMain 
                        ? "h-6 w-6 bg-orange-500 text-white ring-2 ring-white/80" 
                        : isBranch
                        ? "h-5 w-5 bg-amber-500 text-slate-950 ring-2 ring-white/60"
                        : "h-4 w-4 bg-blue-500 text-white ring-1 ring-white/40 hover:scale-125"
                    }`}>
                      {isMain ? (
                        <Navigation className="h-3.5 w-3.5" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                    </div>

                    {/* Label Tag */}
                    <span className={`absolute top-full mt-1.5 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md transition-all ${
                      isSelected 
                        ? "bg-orange-500 text-white shadow-md z-30 scale-105" 
                        : "bg-slate-900/90 text-blue-100 border border-white/10 group-hover:border-white/30"
                    }`}>
                      {hub.name.split("/")[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Hub Filter Badges */}
          <div className="flex flex-wrap gap-2 mt-6 relative z-10">
            {HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedHub.id === hub.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                    : "bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10"
                }`}
              >
                {hub.name.split("/")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Hub Details Card (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-7 border border-border shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  selectedHub.type === "hub_principal"
                    ? "bg-orange-100 text-orange-700"
                    : selectedHub.type === "antenne"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {selectedHub.status}
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-foreground mt-2">
                  {selectedHub.name}
                </h3>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                  Département : {selectedHub.department}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedHub.description}
            </p>

            {selectedHub.address && (
              <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Adresse physique</span>
                <p className="text-sm font-bold text-foreground">
                  {selectedHub.address}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                  <Clock className="h-4 w-4 shrink-0" /> Délai moyen
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {selectedHub.deliveryTime}
                </div>
              </div>

              <div className="bg-orange-50/60 p-3.5 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-xs mb-1">
                  <Smartphone className="h-4 w-4 shrink-0" /> Paiement
                </div>
                <div className="text-xs font-semibold text-foreground">
                  MonCash Instantané
                </div>
              </div>
            </div>

            {/* Direct Contact Button */}
            <a
              href="https://wa.me/50947297655?text=Bonjour%20NCP,%20je%20souhaite%20des%20renseignements%20sur%20vos%20produits%20et%20la%20livraison"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all"
            >
              <PhoneCall className="h-4 w-4" />
              Commander pour cette zone sur WhatsApp
            </a>
          </div>

          {/* Quality & MonCash Guarantees */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-foreground">Emballage Étanche</h5>
                <p className="text-[11px] text-muted-foreground">Bidons & fûts scellés</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-foreground">Traçabilité NCP</h5>
                <p className="text-[11px] text-muted-foreground">Puretés contrôlées</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
