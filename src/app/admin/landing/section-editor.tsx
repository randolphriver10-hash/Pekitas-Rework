"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  sectionSchemas,
  type SectionType,
  type HeaderContent,
  type HeroContent,
  type BenefitsContent,
  type AnnouncementContent,
  type AboutContent,
  type FooterContent,
} from "@/lib/validations/landing-sections";
import { updateSectionContentAction } from "@/app/admin/landing/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import type { LandingSectionRow } from "@/lib/supabase/types";

type AnyContent =
  | HeaderContent
  | HeroContent
  | BenefitsContent
  | AnnouncementContent
  | AboutContent
  | FooterContent;

export function SectionEditor({ section }: { section: LandingSectionRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const type = section.type as SectionType;
  const schema = sectionSchemas[type];

  const form = useForm<AnyContent>({
    resolver: zodResolver(schema as never),
    defaultValues: (section.content ?? {}) as AnyContent,
  });

  const benefitsArray = useFieldArray({
    control: form.control as never,
    name: "items" as never,
  });
  const announcementArray = useFieldArray({
    control: form.control as never,
    name: "texts" as never,
  });

  const onSubmit = (data: AnyContent) => {
    startTransition(async () => {
      const result = await updateSectionContentAction({
        id: section.id,
        type,
        content: data,
        expectedUpdatedAt: section.updated_at,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Sección actualizada.");
      setOpen(false);
    });
  };

  const { register, handleSubmit, formState } = form;
  const errors = formState.errors as Record<string, { message?: string } | undefined>;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil />
        Editar
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Editar sección</SheetTitle>
          <SheetDescription>Los cambios se ven en la landing al guardar.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col px-4">
          <FieldGroup className="flex-1">
            {type === "header" && (
              <Field>
                <FieldLabel htmlFor="logo_url">URL del logo</FieldLabel>
                <Input id="logo_url" {...register("logo_url" as never)} />
              </Field>
            )}

            {type === "hero" && (
              <>
                <Field>
                  <FieldLabel htmlFor="eyebrow">Texto pequeño superior</FieldLabel>
                  <Input id="eyebrow" {...register("eyebrow" as never)} />
                </Field>
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="title">Título</FieldLabel>
                  <Textarea id="title" rows={2} {...register("title" as never)} />
                  <FieldError errors={errors.title ? [errors.title] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="subtitle">Subtítulo</FieldLabel>
                  <Textarea id="subtitle" rows={3} {...register("subtitle" as never)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="image_url">Imagen principal (URL)</FieldLabel>
                  <Input id="image_url" {...register("image_url" as never)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cta_label">Texto del botón</FieldLabel>
                  <Input id="cta_label" {...register("cta_label" as never)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cta_href">Link del botón</FieldLabel>
                  <Input id="cta_href" {...register("cta_href" as never)} />
                </Field>
              </>
            )}

            {type === "benefits" && (
              <div className="space-y-3">
                {benefitsArray.fields.map((field, i) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <Field className="w-16">
                      <FieldLabel>Ícono</FieldLabel>
                      <Input {...register(`items.${i}.icon` as never)} maxLength={4} />
                    </Field>
                    <Field className="flex-1">
                      <FieldLabel>Texto</FieldLabel>
                      <Input {...register(`items.${i}.title` as never)} />
                    </Field>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => benefitsArray.remove(i)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => benefitsArray.append({ icon: "✨", title: "" } as never)}
                  disabled={benefitsArray.fields.length >= 8}
                >
                  <Plus /> Agregar beneficio
                </Button>
              </div>
            )}

            {type === "announcement_bar" && (
              <div className="space-y-3">
                {announcementArray.fields.map((field, i) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <Field className="flex-1">
                      <FieldLabel>Texto {i + 1}</FieldLabel>
                      <Input {...register(`texts.${i}` as never)} />
                    </Field>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => announcementArray.remove(i)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => announcementArray.append("" as never)}
                  disabled={announcementArray.fields.length >= 6}
                >
                  <Plus /> Agregar texto
                </Button>
              </div>
            )}

            {type === "about" && (
              <>
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="about_title">Título</FieldLabel>
                  <Input id="about_title" {...register("title" as never)} />
                  <FieldError errors={errors.title ? [errors.title] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="text1">Párrafo 1</FieldLabel>
                  <Textarea id="text1" rows={4} {...register("text1" as never)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="text2">Párrafo 2</FieldLabel>
                  <Textarea id="text2" rows={4} {...register("text2" as never)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="about_image">Imagen (URL)</FieldLabel>
                  <Input id="about_image" {...register("image_url" as never)} />
                </Field>
              </>
            )}

            {type === "footer" && (
              <>
                <Field>
                  <FieldLabel htmlFor="tagline">Bajada del footer</FieldLabel>
                  <Textarea id="tagline" rows={3} {...register("tagline" as never)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="copyright">Texto de copyright</FieldLabel>
                  <Input id="copyright" {...register("copyright" as never)} />
                </Field>
              </>
            )}
          </FieldGroup>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
