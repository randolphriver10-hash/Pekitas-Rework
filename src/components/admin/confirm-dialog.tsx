"use client";

import { useState, useTransition, type ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ConfirmDialogProps = {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "destructive" | "default";
  onConfirm: () => Promise<{ error?: string } | void>;
  successMessage?: string;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  variant = "destructive",
  onConfirm,
  successMessage,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await onConfirm();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (successMessage) toast.success(successMessage);
      setOpen(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className={
              variant === "destructive"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : undefined
            }
          >
            {isPending ? "Procesando..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
