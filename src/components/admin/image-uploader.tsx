"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function ImageUploader({
  bucket,
  folder,
  onUploaded,
  label = "Subir imagen",
}: {
  bucket: "product-images" | "site-assets";
  folder: string;
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Formato no permitido. Usá JPG, PNG, WebP o AVIF.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("La imagen no puede pesar más de 5MB.");
      return;
    }

    setIsUploading(true);
    setProgress(30);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      setProgress(80);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      setProgress(100);
      onUploaded(publicUrl);
      toast.success("Imagen subida.");
    } catch {
      toast.error("No se pudo subir la imagen.");
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
      }}
      className="border-input hover:bg-muted/40 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-1 text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Subiendo... {progress}%
        </div>
      ) : (
        <>
          <Upload className="text-muted-foreground h-5 w-5" />
          <p className="text-muted-foreground text-xs">Arrastrá una imagen o</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            {label}
          </Button>
        </>
      )}
    </div>
  );
}
