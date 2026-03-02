import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "../styles/orcamentos-legacy.css";
import BottomNavbar from "@/components/layout/BottomNavbar";
import { Toaster } from "@/components/ui/sonner";
// import { usePathname } from "next/navigation";
import { cookies } from "next/headers";
import NavWrapper from "./NavWrapper";
import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#00559c", // Cor da barra de notificação do Android (mesma da AppBar)
};

export const metadata: Metadata = {
  title: "Elétrica & Art",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Elétrica & Art",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/pix/ea/EA-logo.png" />
        {/* Apple Touch Icon para iPhones */}
        <link rel="apple-touch-icon" href="/pix/ea/EA-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}

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

export const metadata: Metadata = {
  title: "Elétrica & Art",
  description: "Gestão Profissional de Orçamentos",
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
