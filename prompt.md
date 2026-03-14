<<< app/orcamentos/novo/page.tsx >>>
// app/orcamentos/novo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppBar from "@/components/layout/AppBar";
import ClientForm from "@/components/forms/ClientForm";
import ClauseManager from "@/components/forms/ClauseManager";
import View from "@/components/layout/View";
import { CircleNotch } from "@phosphor-icons/react";
import { eaSyncClient } from "@/lib/EASyncClient";
import \* as Default_Divider from "@/components/Divider";

// Importações Shadcn/UI
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getYear, format, parseISO, isValid } from "date-fns";
import {
Popover,
PopoverContent,
PopoverTrigger,
} from "@/components/ui/popover";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import "./style.css";
import Pressable from "@/components/Pressable";

/\*\*

- Interfaces de Tipagem
  \*/
  interface ClauseItem {
  id: number;
  subtitulo: string;
  content: string;
  }

interface Clause {
id: number;
titulo: string;
items: ClauseItem[];
}

interface BudgetData {
id: string | null;
docTitle: {
text: string;
emissao: string;
validade: string;
subtitle?: string;
};
cliente: {
name: string;
cep: string;
rua: string;
num: string;
bairro: string;
cidade: string;
complemento?: string;
obs?: string;
};
clauses: Clause[];
}

interface DetalheSheet {
tipo: "brk" | "tagc" | "t6" | "ul" | "p";
conteudo: string | string[];
}

export default function NewBudgetPage() {
const searchParams = useSearchParams();
const router = useRouter();

const editId = searchParams.get("id");
const isEditing = searchParams.get("natabiruta");

const [loading, setLoading] = useState<boolean>(false);
const [clientsCache, setClientsCache] = useState<any[]>([]);
const [budget, setBudget] = useState<BudgetData>({
id: null,
docTitle: {
text: "",
emissao: new Date().toISOString().split("T")[0],
validade: "15 dias",
},
cliente: { name: "", cep: "", rua: "", num: "", bairro: "", cidade: "" },
clauses: [
{
id: Date.now(),
titulo: "",
items: [{ id: Date.now() + 1, subtitulo: "", content: "" }],
},
],
});

const getSelectedDate = () => {
const date = parseISO(budget.docTitle.emissao);
return isValid(date) ? date : new Date();
};

useEffect(() => {
const init = async () => {
if (editId) setLoading(true);
try {
const [clients, allBudgets] = await Promise.all([
eaSyncClient.pull("clientes"),
eaSyncClient.pull("orcamentos"),
]);

        setClientsCache(Array.isArray(clients) ? clients : []);

        if (editId) {
          let budgetToEdit = allBudgets.find(
            (o: any) => String(o.id) === String(editId),
          );
          if (!budgetToEdit) {
            const res = await fetch(`/api/data/orcamentos?id=${editId}`, {
              cache: "no-store",
            });
            budgetToEdit = await res.json();
          }
          if (budgetToEdit) mapIncomingData(budgetToEdit);
        } else {
          const draftStr = localStorage.getItem("ea_draft_budget");
          if (draftStr) {
            const draft = JSON.parse(draftStr);
            setBudget((prev) => ({ ...prev, ...draft }));
          }
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setLoading(false);
      }
    };
    init();

}, [editId]);

const mapIncomingData = (data: any) => {
const mappedClauses: Clause[] = data.servicos.map((s: any) => ({
id: Math.random(),
titulo: s.titulo,
items: s.itens.map((it: any) => ({
id: Math.random(),
subtitulo: it.subtitulo,
content: it.detalhes
.map((d: any) => {
if (d.tipo === "brk") return "---";
if (d.tipo === "tagc") return `> ${d.conteudo}`;
if (d.tipo === "t6") return `# ${d.conteudo}`;
if (d.tipo === "ul")
return d.conteudo.map((li: string) => `- ${li}`).join("\n");
return d.conteudo;
})
.join("\n"),
})),
}));

    setBudget({
      id: data.id,
      docTitle: {
        text: data.docTitle.text,
        emissao: formatDateForInput(data.docTitle.emissao),
        validade: data.docTitle.validade,
      },
      cliente: data.cliente,
      clauses: mappedClauses,
    });

};

const formatMarkdownForSheets = (text: string): DetalheSheet[] => {
const detalhes: DetalheSheet[] = [];
text.split("\n").forEach((line) => {
const tl = line.trim();
if (!tl) return;
if (tl === "---") detalhes.push({ tipo: "brk", conteudo: "" });
else if (tl.startsWith(">"))
detalhes.push({ tipo: "tagc", conteudo: tl.replace(">", "").trim() });
else if (tl.startsWith("#"))
detalhes.push({ tipo: "t6", conteudo: tl.replace("#", "").trim() });
else if (tl.startsWith("_") || tl.startsWith("-")) {
const last = detalhes[detalhes.length - 1];
const content = tl.replace(/^[_|-]\s\*/, "").trim();
if (last && last.tipo === "ul" && Array.isArray(last.conteudo)) {
last.conteudo.push(content);
} else {
detalhes.push({ tipo: "ul", conteudo: [content] });
}
} else {
detalhes.push({ tipo: "p", conteudo: tl });
}
});
return detalhes;
};

const handleSave = async () => {
setLoading(true);
const [y, m, d] = budget.docTitle.emissao.split("-");
const formattedDate = `${d}/${m}/${y}`;

    const payload = {
      id: editId || budget.id || `TEMP_${Date.now()}`,
      cliente: budget.cliente,
      docTitle: {
        subtitle: "PROPOSTA DE ORÇAMENTO",
        emissao: formattedDate,
        validade: budget.docTitle.validade,
        text: budget.docTitle.text,
      },
      servicos: budget.clauses.map((c) => ({
        titulo: c.titulo,
        itens: c.items.map((it) => ({
          subtitulo: it.subtitulo,
          detalhes: formatMarkdownForSheets(it.content),
        })),
      })),
    };

    const action = budget.id ? "update" : "create";
    const result = (await eaSyncClient.save("orcamentos", payload, action)) as {
      success: boolean;
    };

    if (result.success) {
      localStorage.removeItem("ea_draft_budget");
      localStorage.removeItem("ea_selected_client");
      router.push("/orcamentos");
    } else {
      alert("Erro ao salvar orçamento.");
    }
    setLoading(false);

};

const goToCreateClient = () => {
localStorage.setItem("ea_draft_budget", JSON.stringify(budget));
router.push("/clientes/novo");
};

return (
<>
<AppBar
title={isEditing ? `Edição` : `Novo Orçamento`}
backAction={() => {
localStorage.removeItem("ea_draft_budget");
localStorage.removeItem("ea_selected_client");
router.back();
}}
/>

      <View tag="page">
        <View tag="page-content">
          <h3 className="page-subtitle">Dados do orçamento</h3>

          <View className="formGroup">
            <label className="label" style={{ margin: 0, padding: "5px 0" }}>
              <View tag="t">Título</View>
              <input
                type="text"
                className="input"
                placeholder="SERVIÇOS DE ELÉTRICA (RESIDENCIAL)"
                value={budget.docTitle.text}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBudget({
                    ...budget,
                    docTitle: { ...budget.docTitle, text: e.target.value },
                  })
                }
              />
            </label>
          </View>

          <View tag="budget-infos" className="pd">
            <View tag="grid-duo">
              <label className="date-picker flex-5 flex flex-col gap-1">
                <View tag="t">Data de Emissão</View>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-[45px] justify-start text-left font-normal border-[#ccc] ${
                        !budget.docTitle.emissao && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {budget.docTitle.emissao ? (
                        format(getSelectedDate(), "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={getSelectedDate()}
                      onSelect={(date) => {
                        if (date) {
                          setBudget({
                            ...budget,
                            docTitle: {
                              ...budget.docTitle,
                              emissao: format(date, "yyyy-MM-dd"),
                            },
                          });
                        }
                      }}
                      captionLayout="dropdown"
                      fromYear={getYear(new Date()) - 100}
                      toYear={getYear(new Date()) + 100}
                      locale={ptBR}
                      initialFocus
                      classNames={{
                        caption_dropdowns: "flex justify-center gap-1",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </label>

              <label className="flex-5 flex flex-col gap-1">
                <View tag="t">Validade</View>
                <Select
                  value={budget.docTitle.validade}
                  onValueChange={(value: string) =>
                    setBudget({
                      ...budget,
                      docTitle: { ...budget.docTitle, validade: value },
                    })
                  }
                >
                  <SelectTrigger className="w-full h-[45px] bg-white border-[#ccc] focus:ring-1 focus:ring-[#ffab00]">
                    <SelectValue placeholder="Selecione a validade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 dias">7 dias</SelectItem>
                    <SelectItem value="15 dias">15 dias</SelectItem>
                    <SelectItem value="30 dias">30 dias</SelectItem>
                    <SelectItem value="60 dias">60 dias</SelectItem>
                    <SelectItem value="90 dias">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </View>
          </View>

          <Divider />

          <h3 className="page-subtitle">Dados do cliente</h3>
          <ClientForm
            clientData={budget.cliente}
            clientsCache={clientsCache}
            onClientChange={(data: any) =>
              setBudget({ ...budget, cliente: data })
            }
            onNewClientClick={goToCreateClient}
            isOnNewBudget={true}
          />
        </View>

        <Divider />

        <View tag="clauses-holder">
          <header className="subtitle-header">
            <h3 className="page-subtitle">Cláusulas e Itens</h3>
          </header>
          <ClauseManager
            clauses={budget.clauses}
            onClausesChange={(newClauses: any) =>
              setBudget({ ...budget, clauses: newClauses })
            }
          />
        </View>

        <footer className="footer flex flex-col">
          <Pressable
            onClick={handleSave}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? (
              <>
                <CircleNotch size={20} weight="bold" className="animate-spin" />
                <span>PROCESSANDO...</span>
              </>
            ) : (
              <span>
                {budget.id ? "ATUALIZAR ORÇAMENTO" : "SALVAR ORÇAMENTO"}
              </span>
            )}
          </Pressable>
        </footer>
        {/* <footer className="footer"> */}
        {/*   <button */}
        {/*     className="btnSave" */}
        {/*     onClick={handleSave} */}
        {/*     disabled={loading} */}
        {/*     style={{ */}
        {/*       display: "flex", */}
        {/*       justifyContent: "center", */}
        {/*       alignItems: "center", */}
        {/*       gap: "10px", */}
        {/*       opacity: loading ? 0.7 : 1, */}
        {/*       cursor: loading ? "not-allowed" : "pointer", */}
        {/*       transition: "all 0.3s ease", */}
        {/*     }} */}
        {/*   > */}
        {/*     {loading ? ( */}
        {/*       <> */}
        {/*         <CircleNotch size={20} weight="bold" className="animate-spin" /> */}
        {/*         <span>PROCESSANDO...</span> */}
        {/*       </> */}
        {/*     ) : ( */}
        {/*       <span> */}
        {/*         {budget.id ? "ATUALIZAR ORÇAMENTO" : "SALVAR ORÇAMENTO"} */}
        {/*       </span> */}
        {/*     )} */}
        {/*   </button> */}
        {/* </footer> */}
      </View>
    </>

);
}

/\*\*

- Helpers e Componentes Internos
  \*/
  function formatDateForInput(dateStr: string) {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  if (dateStr.includes("-")) return dateStr.split("T")[0];
  if (dateStr.includes("/")) {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
  const [d, m, y] = parts;
  return `${y}-${m}-${d}`;
  }
  }
  return new Date().toISOString().split("T")[0];
  }

const Divider = () => (
<Default_Divider.default spacing="2rem" color="transparent" />
);
<<< end >>>
<<< components/forms/ClauseManager.tsx >>>
// components/forms/ClauseManager.tsx
"use client";

import React from "react";
import { Trash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import TipTapEditor from "@/components/editor/TipTapEditor";
import View from "@/components/layout/View";
import styles from "./ClauseManager.module.css";
import Pressable from "../Pressable";

/\*\*

- Interfaces para garantir a tipagem estrita do Gerenciador de Cláusulas
  \*/
  interface ClauseItem {
  id: number;
  subtitulo: string;
  content: string;
  }

interface Clause {
id: number;
titulo: string;
items: ClauseItem[];
}

interface ClauseManagerProps {
clauses: Clause[];
onClausesChange: (newClauses: Clause[]) => void;
}

export default function ClauseManager({
clauses,
onClausesChange,
}: ClauseManagerProps) {
const addClause = () => {
const newClause: Clause = {
id: Date.now(),
titulo: "",
items: [{ id: Date.now() + 1, subtitulo: "", content: "" }],
};
onClausesChange([...clauses, newClause]);
};

const removeClause = (id: number) => {
onClausesChange(clauses.filter((c) => c.id !== id));
};

const updateClauseTitle = (id: number, title: string) => {
onClausesChange(
clauses.map((c) => (c.id === id ? { ...c, titulo: title } : c)),
);
};

const addItem = (clauseId: number) => {
onClausesChange(
clauses.map((c) => {
if (c.id === clauseId) {
return {
...c,
items: [...c.items, { id: Date.now(), subtitulo: "", content: "" }],
};
}
return c;
}),
);
};

const updateItem = (
clauseId: number,
itemId: number,
field: keyof ClauseItem,
value: string,
) => {
onClausesChange(
clauses.map((c) => {
if (c.id === clauseId) {
return {
...c,
items: c.items.map((it) =>
it.id === itemId ? { ...it, [field]: value } : it,
),
};
}
return c;
}),
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
{clauses.map((clause, index) => (
<View tag="clause" key={clause.id}>
<View tag="clause-options" className={styles.clauseOptions}>
<View tag="label-text" className={styles.labelTitle}>
Título
</View>
<View
tag="btn_remove-clause"
className={styles.btn_remove_clause}
onClick={() => removeClause(clause.id)} >
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
            {clause.items.map((item, iIdx) => (
              <React.Fragment key={item.id}>
                <View tag="subclause" className={styles.subclause}>
                  <View
                    tag="subclause-content"
                    className={styles.subclauseContent}
                  >
                    <label className={styles.subclauseTitle}>
                      <span className="label-text">Subtítulo</span>
                      <Input
                        placeholder="Subtítulo (Ex: Cozinha)"
                        className="subclause-subtitle"
                        value={item.subtitulo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateItem(
                            clause.id,
                            item.id,
                            "subtitulo",
                            e.target.value,
                          )
                        }
                      />
                    </label>

                    <label className={styles.subclauseHelpTips}>
                      <View
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span className="label-text">Conteúdo</span>
                        <span className={styles.btn_helpTips}>ajuda</span>
                      </View>

                      <TipTapEditor
                        value={item.content}
                        onChange={(val: string) =>
                          updateItem(clause.id, item.id, "content", val)
                        }
                        bg="#f5f5f5"
                        radius="9px"
                      />
                    </label>
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
                        width: "fit-content",
                        display: "flex",
                      }}
                      onClick={() => removeItem(clause.id, item.id)}
                    >
                      Excluir subcláusula
                    </View>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View
            tag="footer-options"
            className="flex flex-col justify-center p-4"
          >
            <Pressable
              label="+ Adicionar Subcláusula"
              style={{ background: "#27f2", color: "#29f" }}
              onClick={() => addItem(clause.id)}
            />
          </View>
        </View>
      ))}

      <View
        tag="btn_add-clause-field"
        className="flex flex-col justify-center px-4 py-0"
      >
        <Pressable
          className="btn_add-clause"
          style={{ background: "#27f2", color: "#29f" }}
          onClick={addClause}
        >
          + Adicionar Cláusula
        </Pressable>
      </View>
    </View>

);
}
<<< end >>>
<<< app/orcamentos/[id]/page.tsx >>>
// app/orcamentos/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import EACard from "@/components/ui/EACard";
import AppBar from "@/components/layout/AppBar";
import FAB from "@/components/ui/FAB";
import Text from "@/components/ui/Text";
import { processTextToHtml } from "@/utils/TextPreProcessor";
import View from "@/components/layout/View";
import BudgetSkeleton from "../components/BudgetSkeleton";
import BudgetShareMenu from "@/components/orcamentos/BudgetShareMenu";
import { Pen, FilePdf, ShareNetwork } from "@phosphor-icons/react";
import { CID } from "@/utils/helpers";
import { useEASync } from "@/hooks/useEASync";

// --- Interfaces para Tipagem ---

interface DetalheOrcamento {
tipo: "brk" | "tagc" | "t6" | "ul" | string;
conteudo: any; // Pode ser string ou string[] para 'ul'
}

interface ItemOrcamento {
subtitulo: string;
detalhes: DetalheOrcamento[];
}

interface ServicoOrcamento {
titulo: string;
itens: ItemOrcamento[];
}

interface OrcamentoData {
id: string | number;
docTitle: {
emissao: string;
validade: string;
subtitle: string;
text: string;
};
cliente: {
name: string;
rua?: string;
num?: string;
bairro?: string;
cidade?: string;
};
servicos: ServicoOrcamento[];
}

export default function Budget() {
const params = useParams();
const id = params?.id;
const router = useRouter();
const { data: orcamentos } = useEASync<OrcamentoData>("orcamentos");
const budgetRef = useRef<HTMLDivElement | null>(null);

const searchParams = useSearchParams();
const isPrintMode = searchParams.get("print") === "true";

const [isShareOpen, setIsShareOpen] = useState(false);
const [data, setData] = useState<OrcamentoData | null>(null);
const [loading, setLoading] = useState(true);

const getCleanDate = (date: string) =>
date?.includes("T")
? date.split("T")[0].split("-").reverse().join("/")
: date;

const handleEdit = () => {
if (data) {
router.push(`/orcamentos/novo?natabiruta=${CID()}&id=${data.id}`);
}
};

const fabActions = [
{
icon: <Pen size={28} weight="duotone" />,
label: "Editar",
action: handleEdit,
},
{
icon: <ShareNetwork size={28} weight="duotone" />,
label: "Compartilhar",
action: () => setIsShareOpen(true),
},
// {
// icon: <FilePdf size={28} weight="duotone" />,
// label: "Imprimir PDF",
// action: () => window.print(),
// },
];

useEffect(() => {
if (!id || !orcamentos.length) return;

    const normalizedId = Array.isArray(id) ? id[0] : id;

    const minimumTimer = setTimeout(() => {
      const found = orcamentos.find(
        (o) =>
          String(o.id).replace(/\s/g, "") ===
          String(normalizedId).replace(/\s/g, ""),
      );

      if (found) {
        setData(found);
        document.title = `Orçamento_${found.cliente.name}`;
      }

      setLoading(false);
    }, 500); // 🔥 seu delay de .5 segundo

    return () => clearTimeout(minimumTimer);

}, [orcamentos, id]);

const renderMarkdown = (itens: ItemOrcamento[]) => {
return itens.map((item, idx) => {
const markdownText = item.detalhes
.map((d) => {
if (d.tipo === "brk") return "---";
if (d.tipo === "tagc") return `> ${d.conteudo}`;
if (d.tipo === "t6") return `# ${d.conteudo}`;
if (d.tipo === "ul" && Array.isArray(d.conteudo))
return d.conteudo.map((li: string) => `- ${li}`).join("\n");
return d.conteudo;
})
.join("\n");

      return (
        <View key={idx} tag="subclause">
          <View tag="ui">
            <View tag="subclause-header">
              <View tag="t6">{item.subtitulo}</View>
            </View>
            <View
              tag="subclause-body"
              dangerouslySetInnerHTML={{
                __html: processTextToHtml(markdownText),
              }}
            />
          </View>
        </View>
      );
    });

};

if (loading) {
return (
<>
<AppBar backAction={() => router.back()} />
<BudgetSkeleton />
</>
);
}

if (!data) {
return (
<>
<AppBar backAction={() => router.back()} />

<div className="p-10 text-center">Orçamento não encontrado.</div>
</>
);
}

return (
<>
{!isPrintMode && <AppBar backAction={() => router.back()} />}

      <BudgetShareMenu
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        budgetRef={budgetRef}
        data={data}
        clientName={data?.cliente?.name}
        budgetTitle={data?.docTitle?.text}
      />

      <View tag="pageContainer">
        <View tag="budget-page" ref={budgetRef}>
          <View tag="page-header">
            <EACard />
            <View tag="doc-id">
              <span>
                <b>Data de Emissão:</b>
                <View tag="issue-date">
                  {getCleanDate(data.docTitle.emissao)}
                </View>
              </span>
              <span>
                <b>Validade da Proposta:</b>{" "}
                <View tag="t">{data.docTitle.validade}</View>
              </span>
            </View>
          </View>

          <View tag="doc-title">
            <View tag="doc-title_layout">
              <View tag="doc-title_type">
                <Text
                  size="1.2rem"
                  color="var(--sv-sombra-azuljnk, #fff)"
                  shadow="var(--sv-sodalita, #00559c)"
                  font='font-family: "inter", "Roboto", sans-serif'
                >
                  {data.docTitle.subtitle}
                </Text>
              </View>
              <View tag="doc-title_title">{data.docTitle.text}</View>
            </View>
          </View>

          <View tag="cliente-section">
            <View tag="ui">
              <header>
                <View tag="ui">
                  <View tag="t">CLIENTE</View>
                </View>
              </header>
              <View tag="content">
                <View tag="card">
                  <View tag="ui">
                    <View tag="t">
                      <b>Nome:</b> {data.cliente.name}
                    </View>
                    <View tag="t">
                      <b>Endereço:</b>{" "}
                      {`${data.cliente.rua ? data.cliente.rua + ", " : ""}${
                        data.cliente.num ? data.cliente.num + " - " : ""
                      }${
                        data.cliente.bairro ? data.cliente.bairro + " - " : ""
                      }${data.cliente?.cidade || ""}`}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View tag="budget-body">
            {data.servicos.map((servico, index) => (
              <View key={index} tag="clause">
                <View tag="ui">
                  <View tag="clause-header">
                    <View tag="ui">
                      <View tag="t">
                        {index + 1}. {servico.titulo}
                      </View>
                    </View>
                  </View>
                  <View tag="clause-content">
                    {renderMarkdown(servico.itens)}
                  </View>
                </View>
              </View>
            ))}

            <FooterContent />
          </View>
        </View>
      </View>

      {!isPrintMode && <FAB actions={fabActions} hasBottomNav={false} />}
    </>

);
}

function FooterContent() {
return (
<View tag="footer-content">
<View className="avoid" tag="footer-content_top">
<View tag="content">
<View tag="t6">Compromisso Elétrica&Art:</View>

<p>
Unir técnica, estética, precisão e responsabilidade para entregar um
resultado impecável, durável e superior.
</p>
<View tag="tagb">
<p>
Agradecemos a oportunidade de apresentar esta proposta e estamos à
disposição para quaisquer esclarecimentos adicionais.
</p>
</View>
</View>
</View>

      <View tag="footer-content_bottom">
        <View tag="ui">
          <header>
            <View tag="ui">
              <View tag="t">Assinatura e Aprovação</View>
            </View>
          </header>
          <View tag="content">
            <View tag="signatures">
              <View tag="signature">
                <View tag="content">
                  <View tag="sig-name">Rafael - Elétrica&Art</View>
                </View>
              </View>
              <View tag="signature">
                <View tag="content">
                  <View tag="sig-name">Assinatura do Cliente</View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>

);
}
<<< end >>>
<<< app/clientes/novo/page.tsx >>>
// app/clientes/novo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import {
AddressBook,
CircleNotch,
ExclamationMarkIcon,
FloppyDisk,
IdentificationCardIcon,
MapPinPlus,
UserList,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import AvatarUpload from "@/components/forms/AvatarUpload"; // Componente que faremos

/_ shadcn components _/
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";

import "../Clientes.css";
import "./styles.css";
import Pressable from "@/components/Pressable";

// Interface para definir a estrutura do Cliente e evitar 'any'
interface Cliente {
id: string;
name: string;
gender: string;
doc: string;
whatsapp: string;
email: string;
cep: string;
rua: string;
num: string;
complemento: string;
bairro: string;
cidade: string;
obs: string;
photo: string;
}

export default function ClienteForm() {
const router = useRouter();
const searchParams = useSearchParams();
const editId = searchParams.get("id");

// Uso do Generic <Cliente> para tipar o hook
const { data: clients, save: saveClient } = useEASync<Cliente>("clientes");

const [loading, setLoading] = useState(false);
const [fetchingCep, setFetchingCep] = useState(false);

// Estado tipado com a interface Cliente
const [formData, setFormData] = useState<Cliente>({
id: "",
name: "",
gender: "masc",
doc: "",
whatsapp: "",
email: "",
cep: "",
rua: "",
num: "",
complemento: "",
bairro: "",
cidade: "",
obs: "",
photo: "",
});

// Carrega dados se for Edição
useEffect(() => {
if (editId && clients.length > 0) {
const clientToEdit = clients.find((c) => String(c.id) === String(editId));
if (clientToEdit) {
setFormData((prev) => ({ ...prev, ...clientToEdit }));
}
}
}, [editId, clients]);

const handleChange = (
e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

// Lógica de busca de CEP original
const handleCepBlur = async () => {
const cep = formData.cep.replace(/\D/g, "");
if (cep.length !== 8) return;

    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br{cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
        }));
        toast.success("Endereço preenchido via CEP");
      }
    } catch (err) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setFetchingCep(false);
    }

};

const handleSave = async () => {
if (!formData.name) return toast.error("Nome é obrigatório");

    setLoading(true);
    const action = editId ? "update" : "create";

    const payload: Cliente = {
      ...formData,
      id: editId || `TEMP_${Date.now()}`,
    };

    const res = (await saveClient(payload, action)) as {
      success: boolean;
      id?: string;
    };

    if (res.success) {
      toast.success(editId ? "Cliente atualizado" : "Cliente cadastrado");

      const draftStr = localStorage.getItem("ea_draft_budget");

      if (!editId && draftStr) {
        // 1. Pegamos o rascunho atual
        const draft = JSON.parse(draftStr);

        // 2. Atualizamos a parte do cliente com os dados que acabamos de salvar
        draft.cliente = {
          name: formData.name,
          cep: formData.cep,
          rua: formData.rua,
          num: formData.num,
          bairro: formData.bairro,
          cidade: formData.cidade,
          complemento: formData.complemento,
          obs: formData.obs,
        };

        // 3. Salvamos o rascunho atualizado de volta no localStorage
        localStorage.setItem("ea_draft_budget", JSON.stringify(draft));

        // 4. Voltamos para a página de orçamento (sem precisar de ID na URL)
        router.replace(`/orcamentos/novo`);
      } else if (editId) {
        router.replace(`/clientes/${editId}`);
      } else {
        router.replace("/clientes");
      }
    } else {
      toast.error("Erro ao salvar dados");
    }
    setLoading(false);

};

return (
<>
<AppBar
title={editId ? "Editar Cliente" : "Novo Cliente"}
backAction={() => router.back()}
/>

      <View tag="page" className="add-client-page">
        <View tag="page-header">
          {/* Seção da Foto */}
          <AvatarUpload
            value={formData.photo}
            gender={formData.gender}
            onChange={(url: string) =>
              setFormData((prev) => ({ ...prev, photo: url }))
            }
          />
        </View>
        <View tag="page-content">
          <View tag="card-client" className="add-client-form">
            <View tag="card-header" className="">
              <IdentificationCardIcon size={18} weight="duotone" />
              IDENTIFICAÇÃO
            </View>
            <View tag="card-body" className="shadow-sm">
              <label>
                Nome Completo
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Rafael Silva"
                />
              </label>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <label id="genre_label">
                  Gênero
                  <Select
                    value={formData.gender}
                    onValueChange={(val: string) =>
                      setFormData({ ...formData, gender: val })
                    }
                  >
                    <SelectTrigger className="h-[45px] mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masc">Masculino</SelectItem>
                      <SelectItem value="fem">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label>
                  CPF / CNPJ
                  <input
                    name="doc"
                    value={formData.doc}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                  />
                </label>
              </div>
            </View>
          </View>

          <View tag="card-client">
            <View tag="card-header">
              <UserList size={18} weight="duotone" />
              CONTATO
            </View>
            <View tag="card-body" className="shadow-sm">
              <label>
                WhatsApp
                <input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </label>
              <label className="mt-4">
                E-mail
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@email.com"
                />
              </label>
            </View>
          </View>

          <View tag="card-client">
            <View
              tag="card-header"
              className="flex justify-between items-center"
            >
              <span className="flex gap-2">
                <AddressBook size={18} weight="duotone" />
                ENDEREÇO
              </span>
              {fetchingCep && (
                <CircleNotch className="animate-spin text-amber-500" />
              )}
            </View>
            <View tag="card-body" className="shadow-sm">
              <label>
                CEP
                <div className="relative">
                  <input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                  />
                  <MapPinPlus
                    size={20}
                    className="absolute right-3 top-3 opacity-30"
                  />
                </div>
              </label>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <label className="col-span-2">
                  Rua
                  <input
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Nº
                  <input
                    name="num"
                    value={formData.num}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <View className="mt-4">
                <label>
                  Comp.
                  <input
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Apto..."
                  />
                </label>
              </View>

              {/* <div className="grid grid-cols-2 gap-4 mt-4"> */}
              <label className="mt-4">
                Bairro
                <input
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                />
              </label>
              <label className="mt-4">
                Cidade
                <input
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </label>
              {/* </div> */}
            </View>
          </View>

          {/* Campo de Observações */}
          <View tag="card-client">
            <View tag="card-header">
              <ExclamationMarkIcon size={18} weight="duotone" />
              OBSERVAÇÕES
            </View>
            <View tag="card-body" className="shadow-sm">
              <textarea
                name="obs"
                className="input w-full p-2 rounded-md border h-24 bg-transparent outline-none"
                style={{ fontFamily: "inherit", fontSize: "0.9rem" }}
                value={formData.obs}
                onChange={handleChange}
                placeholder="Informações adicionais sobre o cliente..."
              />
            </View>
          </View>
        </View>

        <footer className="footer-btn p-6">
          <Pressable onClick={handleSave}>
            {loading ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <FloppyDisk size={24} />
            )}
            {loading
              ? "PROCESSANDO..."
              : editId
                ? "SALVAR ALTERAÇÕES"
                : "SALVAR CLIENTE"}
          </Pressable>
          {/* <button */}
          {/*   className="btn-save w-full flex justify-center items-center gap-2" */}
          {/*   onClick={handleSave} */}
          {/*   disabled={loading} */}
          {/* > */}
          {/*   {loading ? ( */}
          {/*     <CircleNotch size={24} className="animate-spin" /> */}
          {/*   ) : ( */}
          {/*     <FloppyDisk size={24} /> */}
          {/*   )} */}
          {/*   {loading */}
          {/*     ? "PROCESSANDO..." */}
          {/*     : editId */}
          {/*       ? "SALVAR ALTERAÇÕES" */}
          {/*       : "SALVAR CLIENTE"} */}
          {/* </button> */}
        </footer>
      </View>
    </>

);
}
<<< end >>>
<<< app/clientes/page.tsx >>>
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import FAB from "@/components/ui/FAB";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import SearchBar from "@/components/SearchBar";
import ClientCard from "@/components/layout/ClientCard";
import {
ArrowsClockwise,
DotsThreeOutlineVertical,
Trash,
UserPlus,
PencilSimple,
} from "@phosphor-icons/react";

/_ shadcn components _/
import {
Popover,
PopoverContent,
PopoverTrigger,
} from "@/components/ui/popover";

/_ styles _/
import "./Clientes.css";
import Page from "@/components/layout/Page";

// Interface alinhada com as definições anteriores para evitar 'any'
interface Cliente {
id: string;
name: string;
doc?: string;
gender?: string;
photo?: string;
whatsapp?: string;
email?: string;
cidade?: string;
[key: string]: any; // Flexibilidade para outras propriedades do motor de busca
}

export default function ClientesLista() {
const router = useRouter();

// Tipagem do hook useEASync com a interface Cliente
const {
data: allClients,
pull: syncClients,
save: saveClient,
} = useEASync<Cliente>("clientes");

const [term, setTerm] = useState("");

const AVATARS = {
masc: "/pix/avatar/default_avatar_masc.webp",
fem: "/pix/avatar/default_avatar_fem.webp",
};

const handleDeleteQuick = async (id: string, name: string) => {
if (window.confirm(`Excluir ${name}?`)) {
// O saveClient agora reconhece o payload baseado na interface
await saveClient({ id }, "delete");
}
};

const filtered = allClients.filter((c) => {
const searchTerm = term.trim().toLowerCase();
const nameMatches = c.name
? c.name.toLowerCase().includes(searchTerm)
: false;
const docMatches = c.doc ? String(c.doc).includes(term) : false;
return nameMatches || docMatches;
});

const fabConfig = [
{
icon: <UserPlus size={28} weight="duotone" />,
label: "Novo Cliente",
action: () => router.push("/clientes/novo"),
},
{
icon: <ArrowsClockwise size={28} weight="duotone" />,
label: "Sincronizar",
action: () => syncClients(),
},
];

return (
<>
<AppBar title="Clientes" />

      <SearchBar
        placeholder="Buscar cliente por nome ou documento..."
        onSearch={(val: string) => setTerm(val)}
        value={term}
      />

      <Page
        tag="clients-list"
        hasBottomNavBar={true}
        bg="#f5f5f5"
        pd="0 0 90px 0"
      >
        <View tag="clients-container" className="flex flex-col gap-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="client-card-wrapper"
              style={{ position: "relative", padding: "0 1rem" }}
            >
              <ClientCard
                client={c}
                onClick={() => router.push(`/clientes/${c.id}`)}
                options={
                  <div className="options-container">
                    <Popover>
                      <PopoverTrigger asChild>
                        <View
                          tag="vmenu-btn"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#777",
                            cursor: "pointer",
                          }}
                        >
                          <DotsThreeOutlineVertical
                            size={24}
                            weight="duotone"
                          />
                        </View>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-40 p-0 bg-white"
                        style={{
                          border: "none",
                          boxShadow: "#e5e5e5 0 0 10px 2px",
                        }}
                        align="end"
                        onOpenAutoFocus={(e) => {
                          e?.preventDefault();
                        }}
                      >
                        <div className="flex flex-col">
                          <button
                            className="menu-item"
                            onClick={() =>
                              router.push(`/clientes/novo?id=${c.id}`)
                            }
                            style={menuItemStyle}
                          >
                            <PencilSimple size={18} weight="duotone" /> Editar
                          </button>
                          <button
                            className="menu-item delete"
                            onClick={() => handleDeleteQuick(c.id, c.name)}
                            style={{
                              ...menuItemStyle,
                              color: "#ff4444",
                              borderTop: "1px solid #f5f5f5",
                            }}
                          >
                            <Trash size={18} weight="duotone" /> Excluir
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                }
              />
            </div>
          ))}
        </View>
      </Page>

      <FAB actions={fabConfig} hasBottomNav={true} />
      {/* <BottomNavbar /> */}
    </>

);
}

const menuItemStyle: React.CSSProperties = {
padding: "12px 15px",
display: "flex",
alignItems: "center",
gap: "10px",
width: "100%",
border: "none",
background: "none",
cursor: "pointer",
textAlign: "left",
fontFamily: "inherit",
fontSize: "0.9rem",
color: "#444",
};
<<< end >>>
<<< components/forms/ClientForm.tsx >>>
// components/forms/ClientForm.tsx
"use client";

import React, { useState, useMemo } from "react";
import "./ClientForm.css";
import View from "../layout/View";
import {
Drawer,
DrawerContent,
DrawerHeader,
DrawerTitle,
DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { UserPlus, MagnifyingGlass } from "@phosphor-icons/react";

/\*\*

- Interfaces para garantir a tipagem estrita e evitar erros de build
  \*/
  interface ClientData {
  name: string;
  cep?: string;
  rua?: string;
  num?: string;
  bairro?: string;
  cidade?: string;
  complemento?: string;
  obs?: string;
  [key: string]: any; // Flexibilidade para campos adicionais do motor de busca
  }

interface ClientFormProps {
clientData: ClientData;
onClientChange: (data: ClientData) => void;
clientsCache?: any[];
onNewClientClick: () => void;
isOnNewBudget?: boolean;
}

export default function ClientForm({
clientData,
onClientChange,
clientsCache = [],
onNewClientClick,
isOnNewBudget = false,
}: ClientFormProps) {
const [loadingCep, setLoadingCep] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

// Filtro de busca para o Drawer
const filteredClients = useMemo(() => {
return clientsCache.filter((c) =>
(c.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
);
}, [searchTerm, clientsCache]);

const handleSelectClient = (client: any) => {
onClientChange({
name: client.name,
cep: client.cep || client.address?.cep || "",
rua: client.rua || client.address?.rua || "",
num: client.num || client.address?.num || "",
bairro: client.bairro || client.address?.bairro || "",
cidade: client.cidade || client.address?.cidade || "",
});
setIsDrawerOpen(false); // Fecha o drawer após selecionar
};

// Busca automática de CEP
const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
const cep = e.target.value.replace(/\D/g, "");
if (cep.length === 8) {
setLoadingCep(true);
try {
const res = await fetch(`https://viacep.com.br${cep}/json/`);
const data = await res.json();
if (!data.erro) {
onClientChange({
...clientData,
cep: e.target.value,
rua: data.logradouro,
bairro: data.bairro,
cidade: `${data.localidade} - ${data.uf}`,
});
}
} catch (err) {
console.error("Erro ao buscar CEP:", err);
} finally {
setLoadingCep(false);
}
}
};

/_ manter _/
const handleChange = (
e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
const { id, value } = e.target;
// Mapeia o ID do input para a chave do objeto cliente
const fieldMap: Record<string, keyof ClientData> = {
c_name: "name",
c_cep: "cep",
c_rua: "rua",
c_num: "num",
c_complemento: "complemento",
c_bairro: "bairro",
c_cidade: "cidade",
c_obs: "obs",
};

    const fieldName = fieldMap[id];
    if (fieldName) {
      onClientChange({ ...clientData, [fieldName]: value });
    }

};

// Preenchimento automático ao selecionar da lista
const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const selected = clientsCache.find((c) => c.name === e.target.value);
if (selected) {
onClientChange({
name: selected.name,
cep: selected.cep || "",
rua: selected.rua || "",
num: selected.num || "",
bairro: selected.bairro || "",
cidade: selected.cidade || "",
});
} else {
handleChange(e);
}
};
/_ end manter _/

return (
<View tag="cliente-fieldset">
{/_ Nome do Cliente _/}
<View tag="client-name_input">
<View tag="client-name_label">
<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
<DrawerTrigger asChild>
<View tag="btn_select-cliente" className="cursor-pointer"> + SELECIONAR da lista
</View>
</DrawerTrigger>
<DrawerContent className="drawer h-[80vh] bg-[rgb(21,25,35)] items-center p-4">

<div className="mx-auto w-full max-w-md p-4">
<DrawerHeader className="px-0">
<DrawerTitle className="text-[#00559C]">
Buscar Cliente
</DrawerTitle>
</DrawerHeader>

                <div className="drawer-searchbar flex items-center gap-2 mb-4">
                  <div className="searchbar relative flex-1">
                    <MagnifyingGlass
                      className="MagnifyingGlass absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      placeholder="Nome do cliente..."
                      className="client-name_input pl-10"
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onNewClientClick()}
                    className="btn_add-newClient p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <UserPlus size={24} weight="duotone" />
                  </button>
                </div>

                <View
                  tag="clients-name_card"
                  className="overflow-y-auto max-h-[50vh] space-y-2"
                >
                  {filteredClients.map((c, i) => (
                    <React.Fragment key={c.id || i}>
                      <View
                        tag="client-name_card"
                        className="p-3 border rounded-lg active:bg-slate-100 cursor-pointer"
                        onClick={() => handleSelectClient(c)}
                      >
                        <div className="font-bold">{c.name}</div>
                        <div className="text-sm text-slate-500">
                          {c.cidade ||
                            c.address?.cidade ||
                            "Cidade não informada"}
                        </div>
                      </View>
                      {i !== filteredClients.length - 1 && (
                        <View tag="divisor">
                          <section></section>
                        </View>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      Nenhum cliente encontrado
                    </div>
                  )}
                </View>
              </div>
            </DrawerContent>
          </Drawer>

          <View tag="t" className="label-text">
            Nome / Empresa
          </View>
        </View>
        <input
          type="text"
          id="c_name"
          className="input"
          placeholder="Selecione acima ou digite..."
          value={clientData.name || ""}
          onChange={handleNameChange}
        />
      </View>

      {/* CEP */}
      <View tag="cep-input">
        <label>
          <View tag="t">
            CEP{" "}
            {loadingCep && (
              <span className="text-amber-500 ml-2">Buscando...</span>
            )}
          </View>
          <input
            type="text"
            id="c_cep"
            className="input"
            placeholder="00000-000"
            maxLength={9}
            value={clientData.cep || ""}
            onChange={handleChange}
            onBlur={handleCepBlur}
          />
        </label>
      </View>

      {/* Endereço */}
      <View
        tag="logradouro_numero-inputs"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "10px",
        }}
      >
        <View tag="logradouro-input">
          <label>
            <View tag="t">Logradouro (Rua/Av)</View>
            <input
              type="text"
              id="c_rua"
              className="input"
              placeholder="Av. President Kennedy ..."
              value={clientData.rua || ""}
              onChange={handleChange}
            />
          </label>
        </View>
        <View tag="numero-input">
          <label>
            <View tag="t">Número</View>
            <input
              type="text"
              id="c_num"
              className="input"
              placeholder="Ex: 50"
              value={clientData.num || ""}
              onChange={handleChange}
            />
          </label>
        </View>
      </View>
      <View tag="complemento-input">
        <label>
          <View tag="t">Complemento</View>
          <input
            type="text"
            id="c_complemento"
            className="input"
            value={clientData.complemento || ""}
            onChange={handleChange}
            placeholder="Apto..."
          />
        </label>
      </View>

      <View tag="bairro-input">
        <label>
          <View tag="t">Bairro</View>
          <input
            type="text"
            id="c_bairro"
            className="input"
            placeholder="Ex: Aviação"
            value={clientData.bairro || ""}
            onChange={handleChange}
          />
        </label>
      </View>

      <View tag="cidade-input">
        <label>
          <View tag="t">Cidade/UF</View>
          <input
            type="text"
            id="c_cidade"
            className="input"
            placeholder="Ex: Praia Grande - SP"
            value={clientData.cidade || ""}
            onChange={handleChange}
          />
        </label>
      </View>

      {/* seção de observações sobre o cliente */}
      {!isOnNewBudget && (
        <View tag="obs-input" className="mt-4">
          <label>
            <View tag="t">Observações Internas</View>
            <textarea
              id="c_obs"
              className="input w-full p-2 rounded-md border h-20"
              value={clientData.obs || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onClientChange({ ...clientData, obs: e.target.value })
              }
            />
          </label>
        </View>
      )}
    </View>

);
}
<<< end >>>
<<< app/notas/novo/page.tsx >>>
// app/notas/novo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import {
FloppyDisk,
CircleNotch,
UserCircle,
Star,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import ClientForm from "@/components/forms/ClientForm"; // O componente com Drawer que você enviou

import "../../clientes/Clientes.css"; // Reutilizando os estilos de cards e formulários

// Interfaces para suportar o TypeScript sem 'any'
interface Cliente {
id: string | number;
name: string;
cep?: string;
rua?: string;
num?: string;
bairro?: string;
cidade?: string;
complemento?: string;
obs?: string;
address?: {
cep?: string;
rua?: string;
num?: string;
bairro?: string;
cidade?: string;
};
}

interface NotaFormData {
id: string;
title: string;
content: string;
date: string;
clienteId: string | number;
clienteNome: string;
important: boolean;
owner_id: string;
}

export default function NovaNota() {
const router = useRouter();
const searchParams = useSearchParams();
const clienteIdParam = searchParams.get("clienteId");

const { data: clients } = useEASync<Cliente>("clientes");
const { save: saveNota } = useEASync("notas");

const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState<NotaFormData>({
id: "",
title: "",
content: "",
date: new Date().toISOString().split("T")[0],
clienteId: "",
clienteNome: "",
important: false,
owner_id: "", // Inicializado vazio para evitar erro de hidratação (SSR vs Client)
});

// Hydration fix para o owner_id
useEffect(() => {
const userEmail =
typeof window !== "undefined"
? localStorage.getItem("user_email") || ""
: "";
setFormData((prev) => ({ ...prev, owner_id: userEmail }));
}, []);

// Se vier um clienteId via URL (ex: vindo do perfil do cliente)
useEffect(() => {
if (clienteIdParam && clients.length > 0) {
const target = clients.find(
(c) => String(c.id) === String(clienteIdParam),
);
if (target) {
setFormData((prev) => ({
...prev,
clienteId: target.id,
clienteNome: target.name,
}));
}
}
}, [clienteIdParam, clients]);

const handleSave = async () => {
if (!formData.title || !formData.clienteId) {
return toast.error("Preencha o título e selecione um cliente");
}

    setLoading(true);
    const payload = {
      ...formData,
      id: `NT-${Date.now()}`,
    };

    const res = (await saveNota(payload, "create")) as { success: boolean };
    if (res.success) {
      toast.success("Nota técnica salva!");
      router.replace("/notas");
    } else {
      toast.error("Erro ao salvar nota");
    }
    setLoading(false);

};

return (
<>
<AppBar title="Nova Nota Técnica" backAction={() => router.back()} />

      <View tag="page" className="add-client-page">
        <View tag="page-content" className="p-4">
          {/* SELETOR DE CLIENTE (Reutilizando seu ClientForm modificado para Notas) */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">VINCULAR CLIENTE</View>
            <View tag="card-ea-body">
              <ClientForm
                clientData={{
                  name: formData.clienteNome,
                  cep: "",
                  rua: "",
                  num: "",
                  bairro: "",
                  cidade: "",
                  complemento: "",
                  obs: "",
                }}
                clientsCache={clients}
                onClientChange={(client: Partial<Cliente>) => {
                  // Busca o ID no cache já que o ClientForm não retorna o ID no onClientChange
                  const fullClient = clients.find(
                    (c) => c.name === client.name,
                  );
                  setFormData((prev) => ({
                    ...prev,
                    clienteId: fullClient?.id || prev.clienteId,
                    clienteNome: client.name || "",
                  }));
                }}
                onNewClientClick={() => router.push("/clientes/novo")}
              />
            </View>
          </View>

          {/* DADOS DA NOTA */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">RELATO TÉCNICO</View>
            <View tag="card-ea-body" className="flex flex-col gap-4">
              <label>
                Título da Nota
                <input
                  className="input"
                  placeholder="Ex: Manutenção Quadro Geral"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </label>

              <label>
                Data da Visita
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </label>

              <label>
                Descrição Detalhada
                <textarea
                  className="input h-32 p-2"
                  placeholder="Descreva os serviços executados, materiais utilizados ou pendências..."
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </label>
            </View>
          </View>

          {/* CONFIGURAÇÕES ADICIONAIS */}
          <View tag="card-ea-client">
            <View tag="card-ea-body">
              <label className="flex items-center justify-between cursor-pointer p-2">
                <div className="flex items-center gap-3">
                  <Star
                    size={24}
                    weight={formData.important ? "fill" : "regular"}
                    className={
                      formData.important ? "text-amber-500" : "text-slate-400"
                    }
                  />
                  <span className="font-bold text-slate-700">
                    Marcar como Importante
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md accent-indigo-600"
                  checked={formData.important}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, important: e.target.checked })
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
            {loading ? "SALVANDO..." : "FINALIZAR NOTA"}
          </button>
        </footer>
      </View>
    </>

);
}
<<< end >>>
<<< app/equipe/novo/page.tsx >>>
(ainda não tenho essa pagina)
<<< end >>>
<<< components/layout/BudgetCard.tsx >>>
// components/layout/BudgetCard.tsx
"use client";

import React from "react";
import View from "./View";
import "./ClientCard.css"; // Reutilizamos o CSS para manter a consistência
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
User,
GenderFemale,
CloudCheck,
ArrowsClockwise,
} from "@phosphor-icons/react";
import { getCleanDate } from "@/utils/helpers";

interface BudgetCardProps {
orc: {
id: string | number;
cliente?: { name?: string }; // Tornamos opcionais
docTitle?: { text?: string; emissao?: string }; // Tornamos opcionais
};
clientData?: {
photo?: string;
gender?: string;
};
onClick?: () => void;
options?: React.ReactNode;
}

export default function BudgetCard({
orc,
clientData,
onClick,
options,
}: BudgetCardProps) {
const isTemp = String(orc.id).startsWith("TEMP\_");

const defaultAvatars = {
masc: "/pix/avatar/default_avatar_masc.webp",
fem: "/pix/avatar/default_avatar_fem.webp",
};

// Extraímos os valores com fallbacks seguros para evitar o erro de toLowerCase()
// const clienteNome = orc?.cliente?.name || "Cliente não identificado";
const clienteNome = orc["Nome Cliente"] || "Cliente não identificado";
console.warn(orc);
const tituloOrcamento = orc?.docTitle?.text || "Sem título";
const dataEmissao = orc?.docTitle?.emissao || new Date().toISOString();

return (
<View tag="client-card" className="rounded-[1rem] shadow-sm">
{" "}
{/_ Mantemos a tag para herdar o CSS de layout _/}
<View tag="client-avatar" onClick={onClick} className="cursor-pointer">
<Avatar className="w-12 h-12">
<AvatarImage
src={
clientData?.photo ||
defaultAvatars[
(clientData?.gender || "masc") as keyof typeof defaultAvatars
] ||
defaultAvatars.masc
}
alt={clienteNome}
className="object-cover"
/>
<AvatarFallback>
{clientData?.gender === "fem" ? (
<GenderFemale size={24} />
) : (
<User size={24} />
)}
</AvatarFallback>
</Avatar>
</View>
<View
        tag="client-info"
        onClick={onClick}
        className="cursor-pointer truncate"
      >

<div className="flex items-center justify-between">
<h4 className="text-[#333] capitalize font-bold leading-tight truncate">
{clienteNome.toLowerCase()}
</h4>
<small className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
{isTemp ? (
<ArrowsClockwise
                size={14}
                className="animate-spin text-amber-500"
              />
) : (
<CloudCheck
                size={14}
                weight="duotone"
                className="text-emerald-500"
              />
)}
{getCleanDate(dataEmissao)}
</small>
</div>
<p className="text-xs text-indigo-600 font-medium truncate mt-1">
{tituloOrcamento}
</p>
</View>
<View tag="client-badge" className="bg-transparent">
{options}
</View>
</View>
);
}
<<< end >>>
<<< components/layout/ClientCard.tsx >>>
// components/layout/ClientCard.tsx
"use client";

import React from "react";
import View from "./View";
import "./ClientCard.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, GenderFemale } from "@phosphor-icons/react";

/\*\*

- Interface que define os dados esperados de um cliente.
  _/
  interface ClientData {
  id?: string | number;
  name: string;
  /\*\* Gênero do cliente para seleção do avatar ('masc' ou 'fem') _/
  gender?: "masc" | "fem" | string; // Tornado opcional para evitar erro se não existir no objeto
  cidade?: string;
  doc?: boolean | string;
  photo?: string;
  bairro?: string;
  }

/\*\*

- Interface para as propriedades do componente ClientCard.
  _/
  interface ClientCardProps {
  /\*\* Objeto com os dados do cliente _/
  client: ClientData;
  /** Função disparada ao clicar no avatar ou nas informações do cliente \*/
  onClick?: () => void;
  /** Elemento ou componente adicional (botões, menus, ícones) exibido no badge \*/
  options?: React.ReactNode;
  }

/\*\*

- Componente de Card para Listagem de Clientes.
-
- @param {ClientCardProps} props - Propriedades do card.
-
- @description
- Exibe um resumo do cliente com avatar dinâmico baseado no gênero,
- nome capitalizado e cidade. Possui uma área de 'options' (badge) customizável.
- Otimizado para renderização em listas no Next.js.
  \*/
  export default function ClientCard({
  client,
  onClick,
  options,
  }: ClientCardProps) {
  // Avatares padrão
  const defaultAvatars = {
  masc: "/pix/avatar/default_avatar_masc.webp",
  fem: "/pix/avatar/default_avatar_fem.webp",
  };

return (
<View tag="client-card" className="rounded-[1rem] shadow-sm">
<View tag="client-avatar" onClick={onClick} className="cursor-pointer">
<Avatar className="w-12 h-12">
{/_ Prioridade 1: Foto do Cloudinary _/}
{/_ Prioridade 2: Avatar padrão por gênero _/}
<AvatarImage
src={
client.photo ||
defaultAvatars[
(client.gender || "masc") as keyof typeof defaultAvatars
] ||
defaultAvatars.masc
}
alt={client.name || "Cliente"}
className="object-cover"
/>
<AvatarFallback>
{client.gender === "fem" ? (
<GenderFemale size={24} />
) : (
<User size={24} />
)}
</AvatarFallback>
</Avatar>
</View>

      <View tag="client-info" onClick={onClick} className="cursor-pointer">
        <h4 className="text-[#333] capitalize font-bold">
          {(client.name || "Sem Nome").toLowerCase()}
        </h4>
        <p className="text-xs text-slate-500">
          {client.cidade || "Cidade não informada"}
          {client.bairro ? ` - ${client.bairro}` : ""}
        </p>
      </View>

      {/* Área de ações ou status (Badge) */}
      <View tag="client-badge">{options}</View>
    </View>

);
}
<<< end >>>
