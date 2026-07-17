"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { socialLinkSchema, type SocialLinkInput } from "@/lib/validations/site";
import { upsertSocialLinkAction } from "@/app/admin/redes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";

export function SocialLinkDialog({
  trigger,
  defaultValues,
}: {
  trigger: ReactElement;
  defaultValues?: SocialLinkInput;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialLinkInput>({
    resolver: zodResolver(socialLinkSchema),
    defaultValues: defaultValues ?? { platform: "", url: "", is_active: true },
  });

  const onSubmit = (data: SocialLinkInput) => {
    startTransition(async () => {
      const result = await upsertSocialLinkAction(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Guardado.");
      reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar red social" : "Agregar red social"}</DialogTitle>
          <DialogDescription>Aparece en el footer de la landing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <input type="hidden" {...register("id")} />
            <Field data-invalid={!!errors.platform}>
              <FieldLabel htmlFor="platform">Plataforma</FieldLabel>
              <Input id="platform" placeholder="Instagram" {...register("platform")} />
              <FieldError errors={errors.platform ? [errors.platform] : undefined} />
            </Field>
            <Field data-invalid={!!errors.url}>
              <FieldLabel htmlFor="url">URL</FieldLabel>
              <Input id="url" placeholder="https://instagram.com/..." {...register("url")} />
              <FieldError errors={errors.url ? [errors.url] : undefined} />
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
