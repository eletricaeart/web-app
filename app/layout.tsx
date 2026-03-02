import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "../styles/orcamentos-legacy.css";
import BottomNavbar from "@/components/layout/BottomNavbar";
import { Toaster } from "@/components/ui/sonner";
// import { usePathname } from "next/navigation";
import { cookies } from "next/headers";
import NavWrapper from "./NavWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const godOfThunder = localFont({
  src: "./fonts/GodOfThunder.ttf", // caminho para o arquivo
  variable: "--font-thunder", // Nome da variável CSS
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#00559c", 
};

export const metadata: Metadata = {
  title: "Elétrica & Art",
  description: "Gestão Profissional de Orçamentos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Elétrica & Art",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verificamos a sessão no servidor para decidir se mostramos a barra
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("ea_session");

  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/pix/ea/EA-logo.png" />
        {/* Apple Touch Icon para iPhones */}
        <link rel="apple-touch-icon" href="/pix/ea/EA-logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${godOfThunder.variable} antialiased pb-24`}
      >
        {children}
        <Toaster richColors position="top-center" />

        {/* O Wrapper decide se renderiza ou não a barra no cliente */}
        <NavWrapper hasSession={hasSession} />
      </body>
    </html>
  );
}



