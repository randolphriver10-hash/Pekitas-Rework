"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { faqSchema, type FaqInput } from "@/lib/validations/promotions";
import { upsertFaqAction } from "@/app/admin/faqs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";

export function FaqDialog({
  trigger,
  defaultValues,
}: {
  trigger: ReactElement;
  defaultValues?: FaqInput;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: defaultValues ?? { question: "", answer: "", is_active: true },
  });

  const onSubmit = (data: FaqInput) => {
    startTransition(async () => {
      const result = await upsertFaqAction(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Guardado.");
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Editar pregunta" : "Nueva pregunta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <input type="hidden" {...register("id")} />
            <Field data-invalid={!!errors.question}>
              <FieldLabel htmlFor="faq-q">Pregunta</FieldLabel>
              <Input id="faq-q" {...register("question")} />
              <FieldError errors={errors.question ? [errors.question] : undefined} />
            </Field>
            <Field data-invalid={!!errors.answer}>
              <FieldLabel htmlFor="faq-a">Respuesta</FieldLabel>
              <Textarea id="faq-a" rows={4} {...register("answer")} />
              <FieldError errors={errors.answer ? [errors.answer] : undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor="faq-cat">Categoría (opcional)</FieldLabel>
              <Input id="faq-cat" {...register("category")} />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="faq-active">Activa</FieldLabel>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch id="faq-active" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
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
