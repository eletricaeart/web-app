/* components/layout/AppBar.tsx */
'use client';

import React from 'react';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';

interface Option {
  icon?: React.ReactNode;
  label: string;
  action: string | (() => void);
}

interface AppBarProps {
  options?: Option[] | React.ReactNode;
  title?: string | null;
  backAction?: string | (() => void) | null;
  position?: 'sticky' | 'relative' | 'absolute' | 'fixed';
  bg?: string;
  borderb?: string;
  shadow?: string;
  transparent?: boolean;
}

export default function AppBar({
  options = [],
  title = null,
  backAction = null,
  transparent = false,
}: AppBarProps) {
  return (
    <PainelAppBar
      backAction={backAction}
      transparent={transparent}
      actions={
        typeof options === 'object' && !Array.isArray(options) ? options : null
      }
    />
  );
}
