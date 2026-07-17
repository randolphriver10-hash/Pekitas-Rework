"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations/promotions";
import { upsertTestimonialAction } from "@/app/admin/testimonios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TestimonialDialog({
  trigger,
  defaultValues,
}: {
  trigger: ReactElement;
  defaultValues?: TestimonialInput;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: defaultValues ?? { customer_name: "", content: "", status: "draft" },
  });

  const onSubmit = (data: TestimonialInput) => {
    startTransition(async () => {
      const result = await upsertTestimonialAction(data);
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
          <DialogTitle>{defaultValues ? "Editar testimonio" : "Nuevo testimonio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <input type="hidden" {...register("id")} />
            <Field data-invalid={!!errors.customer_name}>
              <FieldLabel htmlFor="t-name">Nombre del cliente</FieldLabel>
              <Input id="t-name" {...register("customer_name")} />
              <FieldError errors={errors.customer_name ? [errors.customer_name] : undefined} />
            </Field>
            <Field data-invalid={!!errors.content}>
              <FieldLabel htmlFor="t-content">Testimonio</FieldLabel>
              <Textarea id="t-content" rows={4} {...register("content")} />
              <FieldError errors={errors.content ? [errors.content] : undefined} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="t-rating">Calificación (1-5)</FieldLabel>
                <Input id="t-rating" type="number" min={1} max={5} {...register("rating")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="t-status">Estado</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      items={{ draft: "Borrador", published: "Publicado", archived: "Archivado" }}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="t-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="t-photo">Foto (URL, opcional)</FieldLabel>
              <Input id="t-photo" {...register("photo_url")} />
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
