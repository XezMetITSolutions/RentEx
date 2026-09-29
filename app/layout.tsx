import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { SITE_URL } from '@/lib/config';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "RentEx - Premium Autovermietung & Fuhrpark-Verwaltungssystem",
  description: "RentEx ist Ihr professionelles Verwaltungssystem für Autovermietungen. Verwalten Sie Fahrzeuge, Buchungen und Kunden effizient und einfach online.",
  alternates: {
    canonical: SITE_URL,
    languages: {
      "de-AT": SITE_URL,
      "de-DE": SITE_URL,
    },
  },
  openGraph: {
    title: "RentEx - Premium Autovermietung & Fuhrpark-Verwaltungssystem",
    description: "RentEx ist Ihr professionelles Verwaltungssystem für Autovermietungen. Verwalten Sie Fahrzeuge, Buchungen und Kunden effizient und einfach online.",
    url: SITE_URL,
    siteName: "RentEx",
    images: [
      {
        url: `${SITE_URL}/assets/logo.png`,
        width: 800,
        height: 600,
        alt: "RentEx Logo",
      },
    ],
    locale: "de_AT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentEx - Premium Autovermietung & Fuhrpark-Verwaltungssystem",
    description: "RentEx ist Ihr professionelles Verwaltungssystem für Autovermietungen. Verwalten Sie Fahrzeuge, Buchungen und Kunden effizient und einfach online.",
    images: [`${SITE_URL}/assets/logo.png`],
  },
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-AT" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            theme="system"
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
