"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lightning,
  EnvelopeSimple,
  Lock,
  CircleNotch,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha no acesso");
      }

      toast.success("Acesso autorizado!", {
        description: "Bem-vindo ao sistema Elétrica & Art.",
      });

      router.push("/");
      router.refresh(); // Força o Next a revalidar o middleware
    } catch (err: any) {
      toast.error("Erro de Login", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center p-6 bg-slate-50 overflow-hidden">
      {/* Blobs de fundo para manter o estilo que você gostou */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-900/10 blur-[80px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full" />

      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl z-10 bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-indigo-950 rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <Lightning size={28} weight="duotone" className="text-white" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-800">
            Elétrica & Art
          </CardTitle>
          <CardDescription className="text-slate-500">
            Gestão de Orçamentos e Clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                E-mail
              </label>
              <div className="relative">
                <EnvelopeSimple
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <Input
                  type="email"
                  placeholder="rafael@eletrica.com"
                  className="pl-10 h-12 bg-slate-100 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-slate-100 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <CircleNotch className="animate-spin" size={20} />
              ) : (
                "ACESSAR PAINEL"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="absolute bottom-6 text-slate-400 text-xs">
        &copy; 2026 Elétrica & Art &bull; Praia Grande/SP
      </footer>
    </div>
  );
}
