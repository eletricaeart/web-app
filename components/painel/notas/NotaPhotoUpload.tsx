// components/painel/notas/NotaPhotoUpload.tsx
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, X, SpinnerGap } from '@phosphor-icons/react';
import { toast } from 'sonner';

const CLOUD = {
  name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

interface NotaPhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function NotaPhotoUpload({
  photos,
  onChange,
  maxPhotos = 6,
}: NotaPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!CLOUD.name || !CLOUD.preset) {
      toast.error('Upload de imagem não configurado.');
      return;
    }

    const remaining = maxPhotos - photos.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        if (file.size > 4 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande (máx 4MB).`);
          continue;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUD.preset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD.name}/image/upload`,
          { method: 'POST', body: formData },
        );
        const data = await res.json();
        if (data.secure_url) uploaded.push(data.secure_url);
      }

      onChange([...photos, ...uploaded]);
    } catch {
      toast.error('Erro ao subir fotos');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  return (
    <div>
      <div className="flex gap-3 flex-wrap">
        {photos.map((url) => (
          <div
            key={url}
            className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200"
          >
            <Image
              src={url}
              alt="Foto do serviço"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 active:scale-95 transition-transform"
          >
            {uploading ? (
              <SpinnerGap size={20} className="animate-spin" />
            ) : (
              <>
                <Camera size={20} weight="duotone" />
                <span className="text-[9px] font-bold">ADICIONAR</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
