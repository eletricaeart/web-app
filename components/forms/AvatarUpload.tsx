// components/forms/AvatarUpload.tsx
"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function AvatarUpload({ value, onChange, gender }) {
  const [uploading, setUploading] = useState(false);

  const CLOUD = {
    name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  const defaultAvatars = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !CLOUD.name || !CLOUD.preset) {
      console.error("Deu erro no Cloudinary Cloud Name ou no file");
      return;
    }

    // Validação básica de tamanho (ex: 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return toast.error("Imagem muito grande. Máximo 4MB.");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUD.preset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD.name}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (data.secure_url) {
        onChange(data.secure_url);
        toast.success("Foto carregada!");
      }
    } catch (err) {
      toast.error("Erro ao subir imagem");
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
        <label htmlFor="avatar-input" className="cursor-pointer block">
          <Avatar className="w-28 h-28 border-4 border-white shadow-xl hover:opacity-90 transition-opacity">
            <AvatarImage
              src={
                value ||
                defaultAvatars[gender as keyof typeof defaultAvatars] ||
                defaultAvatars.masc
              }
              className="object-cover"
            />
            <AvatarFallback className="bg-slate-100 text-slate-400">
              {uploading ? (
                <SpinnerGap className="animate-spin" size={32} />
              ) : (
                <Camera size={32} />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
            <Camera size={16} weight="bold" />
          </div>
        </label>
      </div>
      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        Foto do Cliente
      </span>
    </div>
  );
}
