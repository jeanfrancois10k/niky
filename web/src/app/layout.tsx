import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ToastNotification";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrainingAnnouncementPopup } from "@/components/TrainingAnnouncementPopup";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Niky Chemical Product - Matières premières chimiques & Formations",
  description: "Fournisseur premium des matières premières pour la fabrication des produits détergents, cosmétiques, d'entretiens et comestibles en Haïti depuis 2012.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/logo.png" },
    ],
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var r of registrations) { r.unregister(); }
                  });
                }
                window.addEventListener('error', function(e) {
                  if (e.message && e.message.indexOf('Loading chunk') !== -1) {
                    var lastReload = sessionStorage.getItem('chunk_reload');
                    var now = Date.now();
                    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                      sessionStorage.setItem('chunk_reload', now.toString());
                      window.location.reload();
                    }
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <TrainingAnnouncementPopup />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
