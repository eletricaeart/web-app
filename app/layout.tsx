import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNavbar from "@/components/layout/BottomNavbar";
import { Toaster } from "@/components/ui/sonner";
// import { usePathname } from "next/navigation";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-24`}
      >
        {children}
        <Toaster richColors position="top-center" />
        {hasSession && <BottomNavbar />}
      </body>
    </html>
  );
}
