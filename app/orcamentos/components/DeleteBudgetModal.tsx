/** --- DeleteBudgetModal */
"use client";

import React from "react";
import ConfirmModal from "@/components/ModalConfirm";

interface BudgetInfo {
  id: string | number;
  clientName: string;
  documentTitle: string;
}

interface DeleteBudgetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetInfo | null;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteBudgetModal({
  isOpen,
  onOpenChange,
  budget,
  onConfirm,
}: DeleteBudgetModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      variant="danger"
      title="Excluir Orçamento"
      confirmText="Sim, Excluir"
      description={
        budget ? (
          <>
            Você está prestes a excluir o orçamento{" "}
            <b className="text-slate-900">"{budget.documentTitle}"</b>
            do cliente <b className="text-slate-900">{budget.clientName}</b>.
            Esta ação é permanente.
          </>
        ) : (
          "Tem certeza que deseja excluir este orçamento?"
        )
      }
    />
  );
}
