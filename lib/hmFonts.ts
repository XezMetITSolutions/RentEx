import { Archivo, JetBrains_Mono } from "next/font/google";

// Display + mono faces of the public-site design system (see tokens.css).
const archivo = Archivo({
  variable: "--font-hm-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-hm-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const hmFontVariables = `${archivo.variable} ${jetbrains.variable}`;
