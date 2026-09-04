// components/forms/ClauseManager.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import View from '@/components/layout/View';
import styles from './ClauseManager.module.css';
import Pressable from '../Pressable';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { Input } from '@/components/ui/input';
import {
  CaretUp,
  CaretDown,
  Lock,
  FileText,
  Wallet,
  Calculator,
  Article,
  PencilSimple,
  Check,
  Eye,
  ListDashes,
  Sparkle,
} from '@phosphor-icons/react';
import { processTextToHtml } from '@/utils/TextPreProcessor';
import { formatCurrency } from '@/lib/types/investment';

interface ClauseItem {
  id: number;
  subtitulo: string;
  content: string;
  [key: string]: any;
}

interface Clause {
  id: number;
  titulo: string;
  items: ClauseItem[];
  sourceType?: 'investment' | 'summary';
}

interface ClauseManagerProps {
  clauses: Clause[];
  onClausesChange: (newClauses: Clause[]) => void;
  canInsertInvestmentSections: boolean;
  onInsertInvestmentClause: () => void;
  onInsertSummaryClause: () => void;
}

export default function ClauseManager({
  clauses,
  onClausesChange,
  canInsertInvestmentSections,
  onInsertInvestmentClause,
  onInsertSummaryClause,
}: ClauseManagerProps) {
  const hasInvestmentClause = clauses.some(
    (c) => c.sourceType === 'investment',
  );
  const hasSummaryClause = clauses.some((c) => c.sourceType === 'summary');

  // Modo de visualização: 'focused' (uma cláusula em edição por vez) ou 'all' (todas abertas)
  const [viewMode, setViewMode] = useState<'focused' | 'all'>('focused');

  // ID da cláusula ativa em modo de edição
  // Orçamento novo (1 cláusula vazia): inicia em modo edição na 1ª cláusula
  // Orçamento existente com conteúdo: inicia recolhido mostrando todas no formato final
  const [activeClauseId, setActiveClauseId] = useState<number | null>(() => {
    if (
      clauses.length === 1 &&
      !clauses[0].titulo &&
      !clauses[0].items?.[0]?.content
    ) {
      return clauses[0].id;
    }
    return null;
  });

  // Foca automaticamente na nova cláusula quando uma seção for adicionada
  const prevCountRef = useRef(clauses.length);
  useEffect(() => {
    if (clauses.length > prevCountRef.current) {
      const last = clauses[clauses.length - 1];
      if (last) {
        setActiveClauseId(last.id);
      }
    }
    prevCountRef.current = clauses.length;
  }, [clauses.length]);

  const addClause = () => {
    const newId = Date.now();
    const newClause: Clause = {
      id: newId,
      titulo: '',
      items: [
        {
          id: newId + 1,
          subtitulo: '',
          content: '',
        },
      ],
    };
    onClausesChange([...clauses, newClause]);
    setActiveClauseId(newId);
  };

  const removeClause = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onClausesChange(clauses.filter((c) => c.id !== id));
    if (activeClauseId === id) {
      setActiveClauseId(null);
    }
  };

  const moveClause = (
    id: number,
    direction: 'up' | 'down',
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    const index = clauses.findIndex((c) => c.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clauses.length) return;

    const updated = [...clauses];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    onClausesChange(updated);
  };

  const updateClauseTitle = (id: number, title: string) => {
    onClausesChange(
      clauses.map((c) => (c.id === id ? { ...c, titulo: title } : c)),
    );
  };

  const addItem = (clauseId: number) => {
    onClausesChange(
      clauses.map((c) =>
        c.id === clauseId
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  id: Date.now(),
                  subtitulo: '',
                  content: '',
                  numbered: true,
                },
              ],
            }
          : c,
      ),
    );
  };

  const updateItem = (
    clauseId: number,
    itemId: number,
    field: string,
    value: any,
  ) => {
    onClausesChange(
      clauses.map((c) =>
        c.id === clauseId
          ? {
              ...c,
              items: c.items.map((it) =>
                it.id === itemId ? { ...it, [field]: value } : it,
              ),
            }
          : c,
      ),
    );
  };

  const removeItem = (
    clauseId: number,
    itemId: number,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    onClausesChange(
      clauses.map((c) => {
        if (c.id === clauseId) {
          return { ...c, items: c.items.filter((it) => it.id !== itemId) };
        }
        return c;
      }),
    );
  };

  return (
    <View tag="clauses-field" className="flex flex-col gap-4">
      {/* --- BARRA SUPERIOR DE CONTROLE E NAVEGAÇÃO DAS CLÁUSULAS --- */}
      {clauses.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="font-bold text-slate-700">
              {clauses.length} {clauses.length === 1 ? 'cláusula' : 'cláusulas'}
            </span>
            <span className="text-slate-300">•</span>
            <span>
              {viewMode === 'focused'
                ? activeClauseId !== null
                  ? 'Editando 1 cláusula (demais no formato final)'
                  : 'Todas no formato final (toque para editar)'
                : 'Todas as cláusulas abertas para edição'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('focused')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'focused'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Edita uma cláusula por vez e mostra as outras no formato final do orçamento"
            >
              <Sparkle size={13} weight="fill" />
              <span>Modo Focado</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Abre todas as cláusulas simultaneamente para edição"
            >
              <ListDashes size={13} weight="bold" />
              <span>Expandir Todas</span>
            </button>

            {viewMode === 'focused' && activeClauseId !== null && (
              <button
                type="button"
                onClick={() => setActiveClauseId(null)}
                className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold flex items-center gap-1 border border-emerald-200 transition-colors ml-1"
                title="Recolhe a cláusula atual para ver o orçamento completo finalizado"
              >
                <Eye size={13} weight="bold" />
                <span>Ver Final</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- LISTAGEM DE CLÁUSULAS --- */}
      {clauses.map((clause, index) => {
        const isFirst = index === 0;
        const isLast = index === clauses.length - 1;
        const isGenerated = !!clause.sourceType;
        const isEditingThis =
          viewMode === 'all' || activeClauseId === clause.id;

        // --- CONTROLES DE REORDENAÇÃO COMPARTILHADOS ---
        const moveControls = (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => moveClause(clause.id, 'up', e)}
              disabled={isFirst}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 shadow-xs transition-colors"
              title="Mover cláusula para cima"
            >
              <CaretUp size={13} weight="bold" />
            </button>
            <button
              type="button"
              onClick={(e) => moveClause(clause.id, 'down', e)}
              disabled={isLast}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 shadow-xs transition-colors"
              title="Mover cláusula para baixo"
            >
              <CaretDown size={13} weight="bold" />
            </button>
          </div>
        );

        // =====================================================================
        // CASO 1: MODO VISUALIZAÇÃO FINAL (CLÁUSULA FECHADA / RENDERIZADA)
        // =====================================================================
        if (!isEditingThis) {
          let previewSubCounter = 0;
          return (
            <div
              key={clause.id}
              onClick={() => setActiveClauseId(clause.id)}
              className="group relative bg-white dark:bg-slate-900 border-2 border-transparent hover:border-indigo-400/70 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
              title="Clique para editar esta cláusula"
            >
              {/* Faixa superior de opções rápidas */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cláusula {index + 1}
                  </span>
                  {isGenerated && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                      <Lock size={10} weight="bold" /> Sincronizado
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {moveControls}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveClauseId(clause.id);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200/70 shadow-xs transition-colors"
                  >
                    <PencilSimple size={13} weight="bold" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => removeClause(clause.id, e)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir cláusula"
                  >
                    <span className="text-xs font-bold">✕</span>
                  </button>
                </div>
              </div>

              {/* Cabeçalho no formato final */}
              <div className="bg-[#003b6b] text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-between shadow-xs mb-3">
                <div className="flex items-center gap-2">
                  <span className="opacity-90">{index + 1}.</span>
                  <span>{clause.titulo || '(Cláusula sem título)'}</span>
                </div>
                <span className="text-[10px] text-sky-200 font-normal opacity-75 group-hover:opacity-100 transition-opacity">
                  Toque para editar ✎
                </span>
              </div>

              {/* Subcláusulas renderizadas no formato final fiel ao orçamento */}
              <div className="flex flex-col gap-3 px-1">
                {clause.items.map((item) => {
                  let displaySubtitulo = item.subtitulo;
                  if (item.numbered) {
                    previewSubCounter += 1;
                    displaySubtitulo = `${index + 1}.${previewSubCounter} ${item.subtitulo || ''}`;
                  }

                  const hasContent =
                    !!item.content && item.content.trim() !== '';
                  const itemPrice = Number(item.price) || 0;

                  return (
                    <div
                      key={item.id}
                      className="border-l-2 border-sky-100 pl-3 py-1 flex flex-col gap-1"
                    >
                      {displaySubtitulo && (
                        <div className="flex items-center justify-between gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs">
                          <span>{displaySubtitulo}</span>
                          {itemPrice > 0 && (
                            <span className="text-slate-600 font-bold">
                              {formatCurrency(itemPrice)}
                            </span>
                          )}
                        </div>
                      )}

                      {hasContent ? (
                        <div
                          className="markdown-rendered-content text-slate-600 dark:text-slate-300 text-xs leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: processTextToHtml(item.content),
                          }}
                        />
                      ) : (
                        <p className="text-[11px] italic text-slate-400">
                          (Sem descrição — toque para preencher)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // =====================================================================
        // CASO 2: MODO EDIÇÃO ATIVA (FORMULÁRIO ABERTO)
        // =====================================================================
        let subCounter = 0;
        return (
          <View
            tag="clause"
            key={clause.id}
            className="bg-[#e5e5e500] dark:bg-slate-800 transition-all rounded-3xl"
          >
            {/* Barra de opções da cláusula em edição */}
            <View tag="clause-options" className={styles.clauseOptions}>
              <View className="flex items-center gap-2">
                <View className="flex flex-row gap-1 p-1 shrink-0 bg-[#48a5] rounded-[.8rem_.8rem_0_0] ml-2">
                  <button
                    type="button"
                    onClick={(e) => moveClause(clause.id, 'up', e)}
                    disabled={isFirst}
                    className="flex p-1 rounded-[.6rem_5px_0_0] w-12 h-8 items-center justify-center bg-white border border-slate-200 disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <CaretUp size={14} weight="bold" color="#28a" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => moveClause(clause.id, 'down', e)}
                    disabled={isLast}
                    className="flex items-center justify-center w-12 h-8 p-1 rounded-[5px_.6rem_0_0] bg-white border border-slate-200 disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <CaretDown size={14} weight="bold" color="#28a" />
                  </button>
                </View>

                {isGenerated && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-full">
                    <Lock size={11} weight="bold" /> Sincronizado com o
                    Investimento
                  </span>
                )}
              </View>

              <div className="flex items-center gap-2">
                {viewMode === 'focused' && (
                  <button
                    type="button"
                    onClick={() => setActiveClauseId(null)}
                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-2.5 py-1.5 rounded-t-xl flex items-center gap-1 transition-colors"
                    title="Concluir edição e ver o formato final desta cláusula"
                  >
                    <Check size={14} weight="bold" />
                    <span>Concluir</span>
                  </button>
                )}
                <View
                  tag="btn_remove-clause"
                  className={styles.btn_remove_clause}
                  onClick={(e) => removeClause(clause.id, e)}
                >
                  Excluir
                </View>
              </div>
            </View>

            {/* Cabeçalho de input do título da cláusula */}
            <View tag="clause-header" className={styles.clauseHeader}>
              <View className={styles.clauseHeader_ui}>
                <View tag="clause-number" className={styles.clauseNumber}>
                  {index + 1}.
                </View>
                <input
                  type="text"
                  className={styles.clauseTitleInput}
                  placeholder="Ex: Descrição dos Serviços"
                  value={clause.titulo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateClauseTitle(clause.id, e.target.value)
                  }
                />
              </View>
            </View>

            {/* Lista de subcláusulas em edição */}
            <View tag="subclause-field">
              {clause.items.map((item) => (
                <React.Fragment key={item.id}>
                  <View
                    tag="subclause"
                    className={styles.subclause}
                    key={item.id}
                  >
                    <View
                      tag="subclause-content"
                      className={styles.subclauseContent}
                    >
                      <label className={styles.subclauseTitle}>
                        <div className="flex items-center bg-[#e5e5e5] text-center text-xs font-bold text-slate-400 rounded-[1.2rem]">
                          <span
                            onClick={() =>
                              updateItem(
                                clause.id,
                                item.id,
                                'numbered',
                                !item.numbered,
                              )
                            }
                            className="flex items-center justify-center shrink-0 w-9 bg-none py-2 px-2 cursor-pointer hover:text-indigo-600 transition-colors"
                            title="Alternar numeração automática"
                          >
                            {item.numbered ? (
                              `${index + 1}.${++subCounter}`
                            ) : (
                              <Article size={20} />
                            )}
                          </span>
                          <Input
                            placeholder="Subtítulo (Ex: Serviços de Elétrica)"
                            className="subclause-subtitle flex-1 bg-[#fff_!important] rounded-[1.1rem_!important]"
                            value={item.subtitulo}
                            onChange={(e) =>
                              updateItem(
                                clause.id,
                                item.id,
                                'subtitulo',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </label>

                      <div className={styles.subclauseHelpTips}>
                        <TipTapEditor
                          value={item.content}
                          onChange={(val: string) =>
                            updateItem(clause.id, item.id, 'content', val)
                          }
                          bg="#f5f5f5"
                          radius="1rem"
                        />
                      </div>
                    </View>
                  </View>
                  <View
                    tag="subclause-options"
                    className={styles.subclauseOptions}
                  >
                    <View
                      tag="subclause-options-overlay"
                      className={styles.subclauseOptionsOverlay}
                    />
                    <View
                      tag="btn_remove-subclause"
                      className={styles.btn_remove_subclause}
                    >
                      <View
                        tag="btn_x"
                        style={{
                          width: 'fit-content',
                          display: 'flex',
                        }}
                        onClick={(e) => removeItem(clause.id, item.id, e)}
                      >
                        Excluir subcláusula
                      </View>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* Adicionar subcláusula e botão de concluir */}
            <View
              tag="footer-options"
              className="flex flex-row items-center justify-between p-4 gap-2"
            >
              <Pressable
                label="+ Adicionar Subcláusula"
                style={{ background: '#27f2', color: '#29f' }}
                onClick={() => addItem(clause.id)}
              />
              {viewMode === 'focused' && (
                <button
                  type="button"
                  onClick={() => setActiveClauseId(null)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Check size={15} weight="bold" />
                  <span>Concluir Cláusula {index + 1}</span>
                </button>
              )}
            </View>
          </View>
        );
      })}

      {/* --- BOTÕES PARA ADICIONAR SEÇÕES E CLÁUSULAS --- */}
      <View
        tag="btn_add-clause-field"
        className="px-4 mt-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-800 p-3 flex flex-col gap-2"
      >
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-1">
          Adicionar Seção
        </span>
        <button
          type="button"
          onClick={addClause}
          className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 text-left active:scale-[0.98] transition-transform shadow-sm hover:border-indigo-200 border border-transparent"
        >
          <View className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 p-2 rounded-lg">
            <FileText size={18} weight="duotone" />
          </View>
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">
              Cláusula em Branco
            </p>
            <p className="text-[11px] text-slate-400">
              Texto livre, como as demais
            </p>
          </div>
        </button>
        {canInsertInvestmentSections && !hasInvestmentClause && (
          <button
            type="button"
            onClick={onInsertInvestmentClause}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 text-left active:scale-[0.98] transition-transform shadow-sm hover:border-indigo-200 border border-transparent"
          >
            <View className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg">
              <Wallet size={18} weight="duotone" />
            </View>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-100">
                Seção Investimento
              </p>
              <p className="text-[11px] text-slate-400">
                Sempre atualizada com o painel de Investimento
              </p>
            </div>
          </button>
        )}
        {canInsertInvestmentSections && !hasSummaryClause && (
          <button
            type="button"
            onClick={onInsertSummaryClause}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 text-left active:scale-[0.98] transition-transform shadow-sm hover:border-indigo-200 border border-transparent"
          >
            <View className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg">
              <Calculator size={18} weight="duotone" />
            </View>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-100">
                Seção Resumo Financeiro
              </p>
              <p className="text-[11px] text-slate-400">
                Soma tudo, sempre em sincronia
              </p>
            </div>
          </button>
        )}
        {canInsertInvestmentSections &&
          hasInvestmentClause &&
          hasSummaryClause && (
            <p className="text-[11px] text-slate-400 px-1 pt-1">
              As duas seções já foram inseridas neste orçamento.
            </p>
          )}
        {!canInsertInvestmentSections && (
          <p className="text-[11px] text-slate-400 px-1 pt-1">
            Preencha o Investimento (barra na parte inferior da tela) para
            liberar as opções de Investimento e Resumo Financeiro.
          </p>
        )}
      </View>
    </View>
  );
}
