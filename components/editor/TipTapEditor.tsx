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
} from "@phosphor-icons/react";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import "./TipTapEditor.css";

interface TipTapEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  bg?: string;
  radius?: string;
}

export default function TipTapEditor({
  value,
  onChange,
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
          <TextB size={20} />
        </MenuButton>

        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          <TextHOne size={20} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListNumbers size={20} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <ListBullets size={20} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quotes size={20} />
        </MenuButton>

        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={addPriceTag}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
        >
          <CurrencyDollar size={16} weight="bold" />
          VALOR
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

// Mantive a função MenuButton caso você queira usar em uma Toolbar fixa no futuro,
// mas ela não está mais sendo renderizada no componente principal.
function MenuButton({ onClick, active, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
        active ? "bg-indigo-500 text-white" : "text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
