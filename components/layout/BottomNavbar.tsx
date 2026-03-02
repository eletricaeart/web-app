"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Users,
  FileText,
  Notebook,
  UserCircle,
  Icon, // Importamos o tipo Icon para garantir a tipagem correta
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Interface para definir a estrutura dos itens de navegação
interface NavItem {
  label: string;
  href: string;
  icon: Icon; // Tipagem oficial do Phosphor Icons
}

export default function BottomNavbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: House },
    { label: "Clientes", href: "/clientes", icon: Users },
    { label: "Orçamentos", href: "/orcamentos", icon: FileText },
    { label: "Notas", href: "/notas", icon: Notebook },
    { label: "Perfil", href: "/perfil", icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-100 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)] py-4 px-2">
      {navItems.map((item) => {
        // Lógica de ativação ajustada para evitar falsos positivos
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));

        const NavIcon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 group transition-all w-full"
          >
            <div
              className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive
                  ? "bg-mauve-400 rounded-[5rem] w-full grid items-center justify-center text-white shadow-lg shadow-indigo-200 -translate-y-1"
                  : "text-slate-400 group-active:scale-90",
              )}
            >
              <NavIcon size={24} weight={isActive ? "fill" : "regular"} />
            </div>
            <span
              className={cn(
                "text-[10px] font-bold transition-all",
                isActive
                  ? "text-indigo-950 opacity-100"
                  : "text-slate-400 opacity-70",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
