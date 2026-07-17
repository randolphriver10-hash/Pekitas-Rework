import { Construction } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function ComingSoon({ title, stage }: { title: string; stage: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Construction />
          </EmptyMedia>
          <EmptyTitle>Todavía no está listo</EmptyTitle>
          <EmptyDescription>Este módulo se construye en {stage}.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
