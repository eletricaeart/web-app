"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Image } from "@tiptap/extension-image";
import {
  TextB,
  ListNumbers,
  Quotes,
  TextHOne,
  CurrencyDollar,
  ListBullets,
  Plus,
  Calculator,
} from "@phosphor-icons/react";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { valorPorExtenso } from "@/utils/helpers";

import "./TipTapEditor.css";

interface TipTapEditorProps {
  value: string;
  onChange: (val: string) => void;
  services?: any[];
  placeholder?: string;
  bg?: string;
  radius?: string;
}

export default function TipTapEditor({
  value,
  onChange,
  services = [],
  placeholder = "Descreva os detalhes...",
  bg = "#f8fafc",
  radius = "1rem",
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit,
      StarterKit.configure({
        // 1. Modificando a lógica da lista:
        // Desativamos a lista padrão do StarterKit para reconfigurar o comportamento
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color,
      Image,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // onCreate garante que ao criar o editor, ele resete as marcações
    onCreate: ({ editor }) => {
      editor.commands.unsetAllMarks();
    },
    onFocus: ({ editor }) => {
      // Se o conteúdo for apenas um parágrafo vazio, garante que não há negrito
      if (editor.isEmpty) {
        editor.commands.unsetAllMarks();
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4 text-slate-700",
      },
    },
  });

  // Atualiza o conteúdo se o valor externo mudar (ex: ao carregar edição)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  // Função para inserir o Shortcode de Preço
  const addPriceTag = () => {
    const price = window.prompt("Digite o valor do serviço (ex: 150.00):");
    if (price) {
      editor
        .chain()
        .focus()
        .insertContent(` <strong>[R$ ${price}]</strong> `)
        .run();
    }
  };

  // Função para inserir todos os serviços formatados
  const insertServicesList = () => {
    if (services.length === 0)
      return alert("Nenhum serviço adicionado no menu.");

    let htmlContent = "<ul>";
    services.forEach((s) => {
      const extenso = valorPorExtenso(s.totalValue);
      htmlContent += `<li>${s.description} (${s.quantity}x) ........... <strong>R$ ${s.totalValue.toFixed(2)} (${extenso})</strong></li>`;
    });
    htmlContent += "</ul>";

    editor.chain().focus().insertContent(htmlContent).run();
  };

  const insertSubtotal = () => {
    const total = services.reduce((acc, s) => acc + s.totalValue, 0);
    const extenso = valorPorExtenso(total);
    editor
      .chain()
      .focus()
      .insertContent(
        `<p><strong>TOTAL DA ETAPA: R$ ${total.toFixed(2)} (${extenso})</strong></p>`,
      )
      .run();
  };

  return (
    <div
      className="tiptap-container relative border border-slate-100 shadow-inner overflow-hidden"
      style={{ background: bg, borderRadius: radius }}
    >
      {/* TOOLBAR DINÂMICA (Aparece acima do editor no PC e acima do teclado no Mobile) 
          A classe 'tiptap-toolbar' no CSS deve lidar com o position: sticky
      */}
      <div className="tiptap-toolbar flex items-center gap-1 p-2 border-b border-slate-200 bg-white sticky top-0 z-20 overflow-x-auto">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <TextB
            size={20}
            weight={
              editor.isFocused && editor.isActive("bold") ? "bold" : "regular"
            }
          />
        </MenuButton>

        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          <TextHOne
            size={20}
            weight={
              editor.isFocused && editor.isActive("bold") ? "bold" : "regular"
            }
          />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListNumbers
            size={20}
            weight={
              editor.isFocused && editor.isActive("bold") ? "bold" : "regular"
            }
          />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <ListBullets
            size={20}
            weight={
              editor.isFocused && editor.isActive("bold") ? "bold" : "regular"
            }
          />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quotes
            size={20}
            weight={
              editor.isFocused && editor.isActive("bold") ? "bold" : "regular"
            }
          />
        </MenuButton>

        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

        <MenuButton
          onClick={addPriceTag}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
        >
          <CurrencyDollar size={16} weight="bold" />
          VALOR
        </MenuButton>

        {/* BOTÃO PARA INSERIR LISTA DE SERVIÇOS NO TEXTO */}
        <MenuButton
          onClick={insertServicesList}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold"
        >
          <Plus size={14} /> INSERIR LISTA
        </MenuButton>

        {/* BOTÃO PARA INSERIR TOTAL NO TEXTO */}
        <MenuButton
          onClick={insertSubtotal}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold"
        >
          <Calculator size={14} /> INSERIR TOTAL
        </MenuButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

/**
 * MenuButton atualizado com cores de fundo e texto dinâmicas
 * Quando ativo: Fundo azul e ícone branco
 * Quando inativo: Fundo transparente e ícone cinza/escuro
 */
function MenuButton({ onClick, active, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
        active
          ? "bg-[#00559C] text-white shadow-md scale-105" // Cor padrão da sua marca (Azul)
          : "bg-transparent text-slate-500 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
