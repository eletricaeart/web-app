// hooks/useDeleteEntity.ts
"use client";

import { useState } from "react";

interface Entity {
  id: string | number;
  name: string;
}

export function useDeleteEntity(
  saveFunction: (payload: any, action: "delete") => Promise<any>,
  onSuccess?: () => void,
) {
  const [isDelOpen, setIsDelOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Entity | null>(null);

  const handleDeleteRequest = (id: string | number, name: string) => {
    setItemToDelete({ id, name });
    setIsDelOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      const res = await saveFunction({ id: itemToDelete.id }, "delete");
      if (res?.success || res) {
        // Ajuste conforme o retorno do seu useEASync
        setIsDelOpen(false);
        setItemToDelete(null);
        // Se houver uma função de redirect/sucesso, executa ela aqui
        if (onSuccess) onSuccess();
      }
    }
  };

  return {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  };
}
