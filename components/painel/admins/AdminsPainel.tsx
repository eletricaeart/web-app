// components/painel/admins/AdminsPainel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
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
import {
  UserPlus,
  CircleNotch,
  ShieldCheck,
  ShieldWarning,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface AdminRecord {
  id: string;
  role: string;
  can_manage_admins: boolean;
  can_manage_finance: boolean;
  can_manage_content: boolean;
  is_active: boolean;
  created_at: string;
  profile: {
    name?: string;
    email?: string;
    photo_url?: string;
  } | null;
}

export default function AdminsPainel() {
  const router = usePainelRouter();
  const { admin, userId } = usePainelAuth();
  const canManageAdmins = !!admin?.can_manage_admins;
  const loadingPermission = admin === null;

  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);

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

  const loadAdmins = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/list');
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch {
      toast.error('Erro ao carregar administradores');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (canManageAdmins) loadAdmins();
  }, [canManageAdmins, loadAdmins]);

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
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAdmin = async (id: string, patch: Record<string, any>) => {
    // Atualização otimista na lista local
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );

    try {
      const res = await fetch(`/api/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Erro ao atualizar');
      }
    } catch (err: any) {
      toast.error(err.message);
      loadAdmins(); // reverte, buscando o estado real
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
          backAction={() => router.push('configuracoes')}
        />
        <View tag="page" className="p-10 text-center text-slate-400">
          Você não tem permissão para gerenciar administradores.
        </View>
      </>
    );
  }

  return (
    <>
      <AppBar
        title="Administradores"
        backAction={() => router.push('configuracoes')}
      />

      <View tag="page" className="p-4 pb-24">
        {/* --- LISTA DE ADMINS EXISTENTES --- */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck size={18} weight="duotone" /> Administradores Ativos
          </div>

          {loadingList ? (
            <div className="text-center py-6 text-slate-400">
              <CircleNotch className="animate-spin inline-block" size={20} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {admins.map((a) => (
                <div
                  key={a.id}
                  className={`border rounded-2xl p-4 ${
                    a.is_active
                      ? 'border-slate-100 bg-slate-50'
                      : 'border-red-100 bg-red-50 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-800">
                        {a.profile?.name || 'Sem nome'}
                        {a.id === userId && (
                          <span className="text-[10px] text-indigo-500 ml-2 uppercase">
                            (você)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        {a.profile?.email}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        a.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {a.is_active ? 'Ativo' : 'Banido'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="flex items-center justify-between text-xs">
                      Classe
                      <Select
                        value={a.role}
                        onValueChange={(v) => updateAdmin(a.id, { role: v })}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </Label>

                    <Label className="flex items-center justify-between text-xs">
                      Gerenciar admins
                      <Switch
                        checked={a.can_manage_admins}
                        onCheckedChange={(v) =>
                          updateAdmin(a.id, { can_manage_admins: v })
                        }
                      />
                    </Label>
                    <Label className="flex items-center justify-between text-xs">
                      Gerenciar financeiro
                      <Switch
                        checked={a.can_manage_finance}
                        onCheckedChange={(v) =>
                          updateAdmin(a.id, { can_manage_finance: v })
                        }
                      />
                    </Label>
                    <Label className="flex items-center justify-between text-xs">
                      Gerenciar conteúdo
                      <Switch
                        checked={a.can_manage_content}
                        onCheckedChange={(v) =>
                          updateAdmin(a.id, { can_manage_content: v })
                        }
                      />
                    </Label>
                  </div>

                  {a.id !== userId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`w-full mt-3 ${
                        a.is_active
                          ? 'text-red-500 hover:bg-red-100'
                          : 'text-emerald-600 hover:bg-emerald-100'
                      }`}
                      onClick={() =>
                        updateAdmin(a.id, { is_active: !a.is_active })
                      }
                    >
                      {a.is_active ? (
                        <>
                          <ShieldWarning size={16} className="mr-2" /> Banir
                          Administrador
                        </>
                      ) : (
                        <>
                          <ArrowCounterClockwise size={16} className="mr-2" />{' '}
                          Reativar Administrador
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </View>

        {/* --- CRIAR NOVO ADMIN --- */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <UserPlus size={18} weight="duotone" /> Novo Administrador
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
