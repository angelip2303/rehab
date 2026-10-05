import { Progress } from "@/components/ui/progress";

export function MissionBar({ hechos, total }: { hechos: number; total: number }) {
  return (
    <div className="flex min-w-64 flex-1 items-center gap-3">
      <span className="text-lg whitespace-nowrap text-muted-foreground">Misión</span>
      <Progress value={(hechos / total) * 100} className="h-4" aria-label="Progreso de la misión" />
      <span className="text-lg font-semibold whitespace-nowrap tabular-nums">
        {hechos} / {total}
      </span>
    </div>
  );
}
