import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

const spaceGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/NexaBold/Nexa Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/NexaBold/Nexa Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Studio 3D — Impresión 3D, Diseño y Modelado",
  description:
    "Especialistas en impresión 3D, modelado digital y diseño personalizado en Huancayo, Perú. Desarrollamos maquetas, personajes y piezas técnicas de alta calidad.",
  keywords: ["Studio 3D", "impresión 3D Perú", "modelado digital", "Fusion 360", "Huancayo", "maquetas", "prototipos"],
};

import WhatsAppButton from "./components/WhatsAppButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Material Symbols */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased min-h-screen`}
      >
        <AuthProvider>
          {children}
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
