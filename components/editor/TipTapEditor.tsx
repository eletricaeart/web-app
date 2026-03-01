"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Image } from "@tiptap/extension-image";
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
      StarterKit,
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

  return (
    <div
      className="tiptap-container relative border border-slate-100 shadow-inner overflow-hidden"
      style={{ background: bg, borderRadius: radius }}
    >
      {/* BubbleMenu removido conforme solicitado para evitar erros de build e simplificar o editor */}
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
