// components/editor/TipTapEditor.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Image } from '@tiptap/extension-image';
import {
  TextB,
  TextItalic,
  ListNumbers,
  Quotes,
  TextHOne,
  TextAa,
  ListBullets,
  Minus,
  ImageSquare,
  ArrowUUpLeft,
  ArrowUUpRight,
  SpinnerGap,
} from '@phosphor-icons/react';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

import './TipTapEditor.css';

const CLOUD = {
  name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

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
  placeholder = 'Descreva os detalhes...',
  bg = '#f8fafc',
  radius = '1rem',
}: TipTapEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
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
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      editor.commands.unsetAllMarks();
    },
    onFocus: ({ editor }) => {
      if (editor.isEmpty) {
        editor.commands.unsetAllMarks();
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4 text-slate-700',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD.name || !CLOUD.preset) {
      alert('Upload de imagem não configurado.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 4MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUD.preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD.name}/image/upload`,
        { method: 'POST', body: formData },
      );
      const data = await res.json();

      if (data.secure_url) {
        editor.chain().focus().setImage({ src: data.secure_url }).run();
      }
    } catch {
      alert('Erro ao subir imagem');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="tiptap-container relative border border-slate-100 shadow-inner overflow-hidden"
      style={{ background: bg, borderRadius: radius }}
    >
      <div className="tiptap-toolbar flex items-center gap-1 p-2 border-b border-slate-200 bg-white sticky top-0 z-20 overflow-x-auto">
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
        >
          {/* <TextHOne size={20} /> */}
          <TextAa size={20} weight="bold" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <TextB
            size={20}
            weight={editor.isActive('bold') ? 'bold' : 'regular'}
          />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <TextItalic
            size={20}
            weight={editor.isActive('italic') ? 'bold' : 'regular'}
          />
        </MenuButton>

        <MenuButton
          onClick={() => {
            const text = window.prompt('Texto do título estilizado:');
            if (text) {
              editor
                .chain()
                .focus()
                .insertContent(`<p class="tiptap-styled-title">${text}</p>`)
                .run();
            }
          }}
          // onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <TextHOne size={20} weight="regular" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          <ListNumbers size={20} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          <ListBullets size={20} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          <Quotes size={20} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={20} weight="bold" />
        </MenuButton>

        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

        <MenuButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <SpinnerGap size={20} className="animate-spin" />
          ) : (
            <ImageSquare size={20} weight="duotone" />
          )}
        </MenuButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <ArrowUUpLeft size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <ArrowUUpRight size={18} />
        </MenuButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function MenuButton({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 disabled:opacity-30 ${
        active
          ? 'bg-[#00559C] text-white shadow-md scale-105'
          : 'bg-transparent text-slate-500 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
