// components/painel/servicos/ServicoEditorPainel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import PageHeader from '@/components/layout/PageHeader';
import View from '@/components/layout/View';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServicoInsumo } from './ServicosPainel';
import { toast } from 'sonner';
import { Trash, FloppyDisk } from '@phosphor-icons/react';

export default function ServicoEditorPainel() {
  const router = usePainelRouter();
  const isEditing = !!router.params?.id;
  const { data, save, loading } =
    useEASyncSupabase<ServicoInsumo>('servicos_insumos');

  const [form, setForm] = useState<ServicoInsumo>({
    tipo: 'servico',
    nome: '',
    unidade: 'un.',
    custo: 0,
    descricao: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && data.length > 0) {
      const found = data.find((d) => d.id === router.params.id);
      if (found) setForm(found);
    }
  }, [isEditing, router.params?.id, data]);

  const handleSave = async () => {
    if (!form.nome) {
      toast.error('O nome é obrigatório');
      return;
    }
    setIsSaving(true);
    try {
      await save(form, isEditing ? 'update' : 'create');
      toast.success(
        isEditing ? 'Item atualizado!' : 'Item cadastrado com sucesso!',
      );
      router.push('servicos');
    } catch (e) {
      toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    if (!confirm('Deseja realmente excluir este item do catálogo?')) return;

    setIsSaving(true);
    try {
      await save(form, 'delete');
      toast.success('Item excluído com sucesso.');
      router.push('servicos');
    } catch (e) {
      toast.error('Erro ao excluir.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && isEditing) {
    return <p className="p-4 text-center">Carregando...</p>;
  }

  const pageOptions = isEditing
    ? [
        {
          icon: <Trash size={18} />,
          label: 'Excluir Item',
          action: handleDelete,
          variant: 'destructive' as const,
        },
      ]
    : [];

  return (
    <>
      <PainelAppBar backAction={() => router.push('servicos')} />

      <View
        tag="page"
        className="p-4 sm:p-6 bg-slate-50 min-h-screen max-w-3xl mx-auto w-full"
      >
        <PageHeader
          title={isEditing ? 'Editar Item' : 'Novo Serviço / Insumo'}
          subtitle={
            isEditing
              ? 'Atualize os valores e detalhes deste item do catálogo'
              : 'Cadastre um novo serviço ou material de base para orçamentos'
          }
          options={pageOptions}
        />

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Tipo do Item
            </label>
            <div className="flex gap-2">
              <Button
                variant={form.tipo === 'servico' ? 'default' : 'outline'}
                className={
                  form.tipo === 'servico'
                    ? 'bg-indigo-600 hover:bg-indigo-700 flex-1 h-11'
                    : 'flex-1 h-11'
                }
                onClick={() => setForm({ ...form, tipo: 'servico' })}
              >
                Serviço (Mão de Obra)
              </Button>
              <Button
                variant={form.tipo === 'insumo' ? 'default' : 'outline'}
                className={
                  form.tipo === 'insumo'
                    ? 'bg-emerald-600 hover:bg-emerald-700 flex-1 h-11'
                    : 'flex-1 h-11'
                }
                onClick={() => setForm({ ...form, tipo: 'insumo' })}
              >
                Insumo (Material)
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Nome do Item
            </label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Instalação de Tomada Simples"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">
                Unidade de Medida
              </label>
              <Input
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                placeholder="Ex: un., m², h, ponto, metro"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">
                Custo Base (R$)
              </label>
              <Input
                type="number"
                value={form.custo}
                onChange={(e) =>
                  setForm({ ...form, custo: parseFloat(e.target.value) || 0 })
                }
                placeholder="0,00"
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Descrição / Especificação Técnica
            </label>
            <textarea
              value={form.descricao || ''}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex: Inclui corte em alvenaria, colocação de caixinha 4x2 e fiação até 2.5mm..."
              className="min-h-[110px] p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Button
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-base font-bold flex items-center justify-center gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <FloppyDisk size={20} weight="bold" />
              {isSaving
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar Alterações'
                  : 'Cadastrar Item'}
            </Button>

            {isEditing && (
              <Button
                variant="ghost"
                className="w-full h-11 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleDelete}
                disabled={isSaving}
              >
                <Trash size={18} className="mr-2" /> Excluir Item do Catálogo
              </Button>
            )}
          </div>
        </div>
      </View>
    </>
  );
}
