// components/painel/admins/AdminsPainel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, CircleNotch, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function AdminsPainel() {
  const router = usePainelRouter();
  const supabase = createClient();

  const [canManageAdmins, setCanManageAdmins] = useState(false);
  const [loadingPermission, setLoadingPermission] = useState(true);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    can_manage_admins: false,
    can_manage_finance: false,
    can_manage_content: true,
  });

  // Verifica se o admin logado tem permissão de gerenciar outros admins
  useEffect(() => {
    async function checkPermission() {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        setCanManageAdmins(!!data?.can_manage_admins);
      } catch {
        setCanManageAdmins(false);
      } finally {
        setLoadingPermission(false);
      }
    }
    checkPermission();
  }, []);

  const handleCreateAdmin = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Preencha nome, e-mail e senha.');
    }
    if (formData.password.length < 6) {
      return toast.error('A senha precisa ter pelo menos 6 caracteres.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Erro ao criar administrador');
      }

      toast.success('Administrador criado com sucesso!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        can_manage_admins: false,
        can_manage_finance: false,
        can_manage_content: true,
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPermission) {
    return (
      <View tag="page" className="p-10 text-center">
        Verificando permissões...
      </View>
    );
  }

  if (!canManageAdmins) {
    return (
      <>
        <AppBar
          title="Administradores"
          backAction={() => router.push('home')}
        />
        <View tag="page" className="p-10 text-center text-slate-400">
          Você não tem permissão para gerenciar administradores.
        </View>
      </>
    );
  }

  return (
    <>
      <AppBar title="Administradores" backAction={() => router.push('home')} />

      <View tag="page" className="p-4">
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck size={18} weight="duotone" /> Novo Administrador
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Nome
              </span>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome completo"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                E-mail
              </span>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Senha Temporária
              </span>
              <Input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Mínimo 6 caracteres"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Classe
              </span>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner (acesso total)</SelectItem>
                  <SelectItem value="staff">Staff (acesso limitado)</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
              <Label className="flex items-center justify-between cursor-pointer">
                Pode gerenciar outros admins
                <Switch
                  checked={formData.can_manage_admins}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, can_manage_admins: v })
                  }
                />
              </Label>
              <Label className="flex items-center justify-between cursor-pointer">
                Pode gerenciar financeiro
                <Switch
                  checked={formData.can_manage_finance}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, can_manage_finance: v })
                  }
                />
              </Label>
              <Label className="flex items-center justify-between cursor-pointer">
                Pode gerenciar conteúdo (clientes, orçamentos, notas)
                <Switch
                  checked={formData.can_manage_content}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, can_manage_content: v })
                  }
                />
              </Label>
            </div>

            <Button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 mt-2"
            >
              {loading ? (
                <CircleNotch className="animate-spin" size={20} />
              ) : (
                <>
                  <UserPlus size={20} className="mr-2" /> Criar Administrador
                </>
              )}
            </Button>
          </div>
        </View>
      </View>
    </>
  );
}
