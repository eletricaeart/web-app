/**
 * --- ModalConfirm
 *  */
"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description: React.ReactNode; // Permite texto ou HTML (como o <b> que você usou)
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary"; // Para mudar a cor do botão principal
}

export default function ConfirmModal({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Tem certeza?",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
}: ConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90%] rounded-2xl border-none shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-800">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row gap-2 justify-end mt-4">
          <AlertDialogCancel className="rounded-xl mt-0 border-slate-200 text-slate-600 hover:bg-slate-50">
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              /* e.preventDefault(); // Evita fechamento precoce se houver lógica assíncrona */
              onConfirm();
            }}
            className={cn(
              "rounded-xl font-bold transition-all active:scale-95",
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white",
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
