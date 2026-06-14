import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import BottomNav from "@/components/home/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rent-ex.vercel.app"),
  title: {
    default: "RentEx - Autovermietung Verwaltungssystem",
    template: "%s | RentEx"
  },
  description: "Professionelles Verwaltungssystem für Autovermietungen",
  icons: {
    icon: "/assets/logo.png",
  },
  openGraph: {
    title: "RentEx - Autovermietung Verwaltungssystem",
    description: "Professionelles Verwaltungssystem für Autovermietungen",
    url: "/",
    siteName: "RentEx",
    locale: "de_AT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentEx - Autovermietung Verwaltungssystem",
    description: "Professionelles Verwaltungssystem für Autovermietungen",
  },
  alternates: {
    canonical: "/",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-20 md:pb-0`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <BottomNav />
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
