// components/forms/ClauseManager.tsx
'use client';

import React from 'react';
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
  ListNumbers,
  Article,
} from '@phosphor-icons/react';

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

  const addClause = () => {
    const newClause: Clause = {
      id: Date.now(),
      titulo: '',
      items: [
        {
          id: Date.now() + 1,
          subtitulo: '',
          content: '',
        },
      ],
    };
    onClausesChange([...clauses, newClause]);
  };

  const removeClause = (id: number) => {
    onClausesChange(clauses.filter((c) => c.id !== id));
  };

  const moveClause = (id: number, direction: 'up' | 'down') => {
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

  const removeItem = (clauseId: number, itemId: number) => {
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
    <View tag="clauses-field">
      {clauses.map((clause, index) => {
        const isFirst = index === 0;
        const isLast = index === clauses.length - 1;
        const isGenerated = !!clause.sourceType;

        const moveControls = (
          <View className="flex flex-row gap-1 shrink-0">
            <button
              type="button"
              onClick={() => moveClause(clause.id, 'up')}
              disabled={isFirst}
              className="p-1 rounded-md bg-amber-200 border border-slate-200 disabled:opacity-30"
            >
              <CaretUp size={14} weight="bold" color="#000" />
            </button>
            <button
              type="button"
              onClick={() => moveClause(clause.id, 'down')}
              disabled={isLast}
              className="p-1 rounded-md bg-amber-200 border border-slate-200 disabled:opacity-30"
            >
              <CaretDown size={14} weight="bold" color="#000" />
            </button>
          </View>
        );

        return (
          <View
            tag="clause"
            key={clause.id}
            className="bg-[#e5e5e5] dark:bg-slate-800"
          >
            <View tag="clause-options" className={styles.clauseOptions}>
              <View className="flex items-center gap-2">
                {moveControls}
                <View tag="label-text" className={styles.labelTitle}>
                  Título
                </View>
                {isGenerated && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-full">
                    <Lock size={11} weight="bold" /> Sincronizado com o
                    Investimento
                  </span>
                )}
              </View>
              <View
                tag="btn_remove-clause"
                className={styles.btn_remove_clause}
                onClick={() => removeClause(clause.id)}
              >
                Excluir
              </View>
            </View>
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
                      {isGenerated ? (
                        <>
                          {item.subtitulo && (
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                              {item.subtitulo}
                            </div>
                          )}
                          <div
                            className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        </>
                      ) : (
                        <>
                          <label className={styles.subclauseTitle}>
                            <div className="flex items-center justify-between">
                              <span
                                onClick={() =>
                                  updateItem(
                                    clause.id,
                                    item.id,
                                    'numbered',
                                    !item.numbered,
                                  )
                                }
                                className={`text-[10px] font-bold px-2 py-2 rounded-[.8rem] ${
                                  item.numbered
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {item.numbered ? (
                                  <ListNumbers size={20} />
                                ) : (
                                  <Article size={20} />
                                )}
                              </span>
                              <span className="label-text flex-1 ml-3">
                                Subtítulo
                              </span>
                            </div>
                            <Input
                              placeholder="Subtítulo (Ex: Cozinha)"
                              className="subclause-subtitle"
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
                          </label>

                          <label className={styles.subclauseHelpTips}>
                            <span className="label-text">Conteúdo</span>

                            <TipTapEditor
                              value={item.content}
                              onChange={(val: string) =>
                                updateItem(clause.id, item.id, 'content', val)
                              }
                              bg="#f5f5f5"
                              radius="9px"
                            />
                          </label>
                        </>
                      )}
                    </View>
                  </View>
                  {!isGenerated && (
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
                          onClick={() => removeItem(clause.id, item.id)}
                        >
                          Excluir subcláusula
                        </View>
                      </View>
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>

            {!isGenerated && (
              <View
                tag="footer-options"
                className="flex flex-col justify-center p-4"
              >
                <Pressable
                  label="+ Adicionar Subcláusula"
                  style={{ background: '#27f2', color: '#29f' }}
                  onClick={() => addItem(clause.id)}
                />
              </View>
            )}
          </View>
        );
      })}

      {/* --- CARD "FANTASMA" — SEMPRE EXPANDIDO, SEM CLIQUE EXTRA --- */}
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
          className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 text-left active:scale-[0.98] transition-transform shadow-sm"
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
            className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 text-left active:scale-[0.98] transition-transform shadow-sm"
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
            className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 text-left active:scale-[0.98] transition-transform shadow-sm"
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
        )}{' '}
      </View>
    </View>
  );
}
