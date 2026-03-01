"use client";

// import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Color from "@tiptap/extension-color";
// import TextStyle from "@tiptap/extension-text-style";
// import Highlight from "@tiptap/extension-highlight";
// import Placeholder from "@tiptap/extension-placeholder";
// import Image from "@tiptap/extension-image";
// import Table from "@tiptap/extension-table";
// import TableRow from "@tiptap/extension-table-row";
// import TableCell from "@tiptap/extension-table-cell";
// import TableHeader from "@tiptap/extension-table-header";
// import { useEffect } from "react";

/* */
import React, { useEffect } from "react";

import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import { Extension } from "@tiptap/core";

import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
// import { Placeholder } from "@tiptap/extension-placeholder";
import { Placeholder } from "@tiptap/extensions";

// import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { BubbleMenu, FloatingMenu } from "@tiptap/react";

// import Suggestion from "@tiptap/suggestion";
import tippy from "tippy.js";

// import CommandList from "./CommandList";
import "./TipTapEditor.css";

import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

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
      {editor && (
        {/* <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}> */}
          <BubbleMenu editor={editor} {...({ tippyOptions: { duration: 100 } } as any)}>
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1.5 rounded-xl shadow-2xl border border-white/10">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
            >
              B
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: "#ffab00" })
                  .run()
              }
              active={editor.isActive("highlight")}
            >
              H
            </MenuButton>
            <div className="w-[1px] h-4 bg-white/20 mx-1" />
            <button
              onClick={() => editor.chain().focus().setColor("#ef4444").run()}
              className="w-4 h-4 bg-red-500 rounded-full ml-1"
            />
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

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
