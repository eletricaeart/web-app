/** --- DeleteClientModal */
"use client";

import React from "react";
import ConfirmModal from "@/components/ModalConfirm";

// Interface para os dados do cliente que o modal precisa
interface ClientInfo {
  id: string | number;
  name: string;
}

interface DeleteClientModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientInfo | null;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteClientModal({
  isOpen,
  onOpenChange,
  client,
  onConfirm,
}: DeleteClientModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      variant="danger"
      title="Excluir Cliente"
      confirmText="Sim, Excluir"
      description={
        client ? (
          <>
            Você está prestes a excluir permanentemente o cliente{" "}
            <b className="text-slate-900">{client.name}</b>. Esta ação não pode
            ser desfeita.
          </>
        ) : (
          "Tem certeza que deseja excluir este cliente?"
        )
      }
    />
  );
}
