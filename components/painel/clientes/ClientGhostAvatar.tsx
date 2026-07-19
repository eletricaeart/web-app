// components/painel/clientes/ClientGhostAvatar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Ghost, GenderMale, GenderFemale, Camera } from '@phosphor-icons/react';
import { getGhostBackground, getGhostIconColor } from '@/lib/avatarColor';

interface ClientGhostAvatarProps {
  name: string;
  gender?: string;
  photoUrl?: string;
  size?: number;
  showGenderBadge?: boolean;
  /** Se definido, mostra um selo de câmera clicável no canto inferior esquerdo */
  onUploadClick?: () => void;
  uploading?: boolean;
}

export default function ClientGhostAvatar({
  name,
  gender,
  photoUrl,
  size = 96,
  showGenderBadge = true,
  onUploadClick,
  uploading = false,
}: ClientGhostAvatarProps) {
  const bg = getGhostBackground(name);
  const iconColor = getGhostIconColor(name);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="relative rounded-full overflow-hidden flex items-center justify-center w-full h-full border-4 border-white shadow-xl"
        style={{ background: photoUrl ? undefined : bg }}
      >
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill className="object-cover" />
        ) : (
          <Ghost size={size * 0.5} weight="duotone" color={iconColor} />
        )}
      </div>

      {showGenderBadge && gender && (
        <span
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-white shadow-md border-2 border-white"
          style={{ width: size * 0.3, height: size * 0.3 }}
        >
          {gender === 'fem' ? (
            <GenderFemale size={size * 0.16} weight="bold" color="#ec4899" />
          ) : (
            <GenderMale size={size * 0.16} weight="bold" color="#3b82f6" />
          )}
        </span>
      )}

      {onUploadClick && (
        <button
          type="button"
          onClick={onUploadClick}
          disabled={uploading}
          className="absolute bottom-0 left-0 flex items-center justify-center rounded-full bg-indigo-600 shadow-md border-2 border-white active:scale-90 transition-transform"
          style={{ width: size * 0.3, height: size * 0.3 }}
        >
          <Camera
            size={size * 0.15}
            weight="fill"
            color="#fff"
            className={uploading ? 'animate-pulse' : ''}
          />
        </button>
      )}
    </div>
  );
}
