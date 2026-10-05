import { Badge } from "@/components/ui/badge";
import type { Equipo } from "@/lib/turns";
import { COLOR_EQUIPO } from "./colores";

export function Scoreboard({ equipos, puntos }: { equipos: Equipo[]; puntos: number[] }) {
  return (
    <div className="flex gap-2">
      {equipos.map((e, i) => (
        <Badge key={e.numero} variant="secondary" className="gap-2 px-3 py-1 text-base">
          <span className="size-3 rounded-full" style={{ background: COLOR_EQUIPO[i] }} />
          {equipos.length > 1 ? e.nombre : "Grupo"}
          <span className="font-bold tabular-nums">{puntos[i]}</span>
        </Badge>
      ))}
    </div>
  );
}
