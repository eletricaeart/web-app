// components/forms/AvatarUpload.tsx
'use client';

import React, { useState } from 'react';
import { Camera, SpinnerGap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  gender: string;
  /** Usado para gerar o avatar-fantasma quando ainda não há foto */
  name?: string;
}

export default function AvatarUpload({
  value,
  onChange,
  gender,
  name = '',
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);

  const CLOUD = {
    name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !CLOUD.name || !CLOUD.preset) {
      console.error('Configurações do Cloudinary ou arquivo ausentes');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      return toast.error('Imagem muito grande. Máximo 4MB.');
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUD.preset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD.name}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await res.json();

      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success('Foto carregada!');
      }
    } catch (err) {
      toast.error('Erro ao subir imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-8 mt-4">
      <div className="relative group">
        <input
          type="file"
          className="hidden"
          id="avatar-input"
          onChange={handleUpload}
          accept="image/*"
          disabled={uploading}
        />
        <label htmlFor="avatar-input" className="cursor-pointer block relative">
          <ClientGhostAvatar
            name={name || 'Novo'}
            gender={gender}
            photoUrl={value || undefined}
            size={112}
            showGenderBadge={false}
          />
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <SpinnerGap className="animate-spin text-white" size={32} />
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
            <Camera size={16} weight="bold" />
          </div>
        </label>
      </div>
      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        Foto
      </span>
    </div>
  );
}
