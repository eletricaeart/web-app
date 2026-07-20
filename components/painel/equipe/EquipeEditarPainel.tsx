// components/painel/equipe/EquipeEditarPainel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import AvatarUpload from '@/components/forms/AvatarUpload';
import { FloppyDisk, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client'; // Importar o cliente
import '@/app/clientes/Clientes.css';

interface MembroEquipe {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  whatsapp: string;
  about: string;
  photo_url?: string;
  gender: string;
}

export default function EquipeEditarPainel() {
  const router = usePainelRouter();
  const supabase = createClient();
  const editId = router.params.id;

  const { data: users, save: saveUser } =
    useEASyncSupabase<MembroEquipe>('profiles');

  const { userId, email } = usePainelAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MembroEquipe>({
    id: '',
    name: '',
    email: '',
    role: 'Eletricista',
    specialty: '',
    whatsapp: '',
    about: '',
    photo_url: '',
    gender: 'masc',
  });

  // 1. Carrega os dados no formulário assim que a lista de perfis carregar
  useEffect(() => {
    if (editId && users.length > 0) {
      const found = users.find((u) => String(u.id) === String(editId));
      if (found) {
        setFormData({ ...found, photo_url: found.photo_url || '' });
      }
    }
  }, [editId, users]);

  const handleSave = async () => {
    if (!formData.name) return toast.error('O nome é obrigatório.');
    setLoading(true);

    const finalId = editId || userId;

    // Montamos o payload garantindo que os nomes batam com as colunas do banco
    const payload = {
      id: finalId,
      name: formData.name,
      email: formData.email || email,
      role: formData.role,
      specialty: formData.specialty,
      whatsapp: formData.whatsapp,
      about: formData.about,
      photo_url: formData.photo_url,
      gender: formData.gender,
      updated_at: new Date().toISOString(),
    };

    const action = editId ? 'update' : 'create';
    const res = await saveUser(payload, action);

    if (res) {
      toast.success('Perfil atualizado com sucesso!');
      if (finalId === userId) {
        router.replace('perfil');
      } else {
        router.replace('equipe');
      }
    }
    setLoading(false);
  };

  // Mantive todo o seu retorno de UI/HTML original abaixo
  return (
    <>
      <AppBar
        title={editId ? 'Editar Membro' : 'Novo Membro'}
        backAction={() => router.back()}
      />

      <View tag="page" className="add-client-page">
        <View tag="page-content" className="p-4">
          <AvatarUpload
            value={formData.photo_url || ''}
            gender={formData.gender}
            name={formData.name}
            onChange={(url: string) =>
              setFormData({ ...formData, photo_url: url })
            }
          />

          <View tag="card-ea-client">
            <View tag="card-ea-header">DADOS BÁSICOS</View>
            <View tag="card-ea-body" className="flex flex-col gap-4">
              <label>
                Nome Completo
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>
              <label>
                Cargo / Função
                <input
                  className="input"
                  value={formData.role}
                  onChange={(e) =>
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
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                />
              </label>
              <label>
                Sobre o Profissional
                <textarea
                  className="input h-24 p-2"
                  value={formData.about}
                  onChange={(e) =>
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
            SALVAR ALTERAÇÕES
          </button>
        </footer>
      </View>
    </>
  );
}
