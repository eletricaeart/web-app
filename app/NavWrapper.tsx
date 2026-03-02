"use client";

import { usePathname } from "next/navigation";
import BottomNavbar from "@/components/layout/BottomNavbar";

export default function NavWrapper({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname();

  // DEFINA AQUI: As únicas páginas que mostram a barra (Listagens)
  const showOnRoutes = [
    "/",
    "/orcamentos",
    "/clientes",
    "/notas",
    "/equipe",
    "/perfil",
  ];

  // Verifica se a rota atual está na lista acima
  const shouldShow = hasSession && showOnRoutes.includes(pathname);

  if (!shouldShow) return null;

  return <BottomNavbar />;
}
