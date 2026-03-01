// app/equipe/editar/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import AvatarUpload from "@/components/forms/AvatarUpload";
import { FloppyDisk, CircleNotch } from "@phosphor-icons/react";
import { toast } from "sonner";
import "@/app/clientes/Clientes.css"; // Reaproveitando os estilos de card-ea

// Interface para garantir a tipagem do Membro da Equipe
interface MembroEquipe {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  whatsapp: string;
  about: string;
  photo: string;
  gender: string;
  status: string;
  password?: string;
}

export default function EditarUsuario() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // Tipagem do hook useEASync com a interface MembroEquipe
  const { data: users, save: saveUser } = useEASync<MembroEquipe>("usuarios");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MembroEquipe>({
    id: "",
    name: "",
    email: "",
    role: "Eletricista",
    specialty: "",
    whatsapp: "",
    about: "",
    photo: "",
    gender: "masc",
    status: "Ativo",
    password: "123",
  });

  useEffect(() => {
    if (editId && users.length > 0) {
      const found = users.find((u) => String(u.id) === String(editId));
      if (found) {
        setFormData(found);
      }
    }
  }, [editId, users]);

  const handleSave = async () => {
    setLoading(true);
    const action = editId ? "update" : "create";
    const payload = { ...formData, id: editId || `TEMP_${Date.now()}` };

    const res = (await saveUser(payload, action)) as { success: boolean };
    if (res.success) {
      toast.success("Dados da equipe atualizados!");
      router.replace("/equipe");
    }
    setLoading(false);
  };

  return (
    <>
      <AppBar
        title={editId ? "Editar Membro" : "Novo Membro"}
        backAction={() => router.back()}
      />

      <View tag="page" className="add-client-page">
        <View tag="page-content" className="p-4">
          <AvatarUpload
            value={formData.photo}
            gender={formData.gender}
            onChange={(url: string) => setFormData({ ...formData, photo: url })}
          />

          <View tag="card-ea-client">
            <View tag="card-ea-header">DADOS BÁSICOS</View>
            <View tag="card-ea-body" className="flex flex-col gap-4">
              <label>
                Nome Completo
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>
              <label>
                Cargo / Função
                <input
                  className="input"
                  value={formData.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </label>
            </View>
          </View>

          <View tag="card-ea-client">
            <View tag="card-ea-header">PROFISSIONAL</View>
            <View tag="card-ea-body" className="flex flex-col gap-4">
              <label>
                Especialidade Principal
                <input
                  className="input"
                  value={formData.specialty}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                />
              </label>
              <label>
                Sobre o Profissional
                <textarea
                  className="input h-24 p-2"
                  value={formData.about}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                />
              </label>
            </View>
          </View>
        </View>

        <footer className="footer-btn p-6">
          <button
            className="btn-save w-full flex justify-center items-center gap-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <FloppyDisk size={24} />
            )}
            SALVAR NA EQUIPE
          </button>
        </footer>
      </View>
    </>
  );
}
