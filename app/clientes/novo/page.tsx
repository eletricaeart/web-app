"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { clienteSchema, ClienteFormData } from "@/lib/schemas/cliente";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CaretLeft,
  DeviceMobile,
  User,
  MapPin,
  Check,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NovoClientePage() {
  const router = useRouter();
  const { saveData } = useData("clientes");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  const onSubmit = async (data: ClienteFormData) => {
    setLoading(true);
    const result = await saveData(data, "create");

    if (result.success) {
      toast.success("Cliente cadastrado!");
      router.push("/clientes");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-svh bg-slate-50 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-600 bg-white rounded-full shadow-sm"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Novo Cliente</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            Identificação
          </h2>

          <div className="space-y-1">
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <Input
                {...register("name")}
                placeholder="Nome completo do cliente"
                className={`pl-12 h-14 bg-white border-none rounded-2xl shadow-sm ${errors.name ? "ring-2 ring-red-500" : ""}`}
              />
            </div>
            {errors.name && (
              <span className="text-red-500 text-xs ml-2">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="relative">
            <DeviceMobile
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <Input
              {...register("whatsapp")}
              placeholder="WhatsApp (Ex: 13991223344)"
              className="pl-12 h-14 bg-white border-none rounded-2xl shadow-sm"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            Endereço (Opcional)
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Input
              {...register("cep")}
              placeholder="CEP"
              className="col-span-1 h-14 bg-white border-none rounded-2xl shadow-sm"
            />
            <Input
              {...register("cidade")}
              placeholder="Cidade"
              className="col-span-2 h-14 bg-white border-none rounded-2xl shadow-sm"
            />
          </div>
          <Input
            {...register("rua")}
            placeholder="Logradouro"
            className="h-14 bg-white border-none rounded-2xl shadow-sm"
          />
        </section>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-indigo-950 hover:bg-indigo-900 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          {loading ? (
            "SALVANDO..."
          ) : (
            <div className="flex items-center gap-2">
              <Check size={24} weight="bold" />
              <span>FINALIZAR CADASTRO</span>
            </div>
          )}
        </Button>
      </form>
    </main>
  );
}
