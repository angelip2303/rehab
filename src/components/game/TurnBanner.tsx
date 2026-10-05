import { Badge } from "@/components/ui/badge";
import { nombrePersona, type Equipo, type Turno } from "@/lib/turns";
import { COLOR_EQUIPO } from "./colores";

export function TurnBanner({ turno, equipos, personas }: { turno: Turno; equipos: Equipo[]; personas: string[] }) {
  const equipo = equipos[turno.equipo];
  return (
    <div className="flex shrink-0 items-center gap-3 whitespace-nowrap" aria-live="polite">
      <span className="text-xl text-muted-foreground">Turno de</span>
      <span className="text-3xl font-bold">{nombrePersona(personas, turno.persona)}</span>
      {equipos.length > 1 && (
        <Badge variant="outline" className="gap-2 border-2 px-3 py-1 text-lg">
          <span className="size-4 rounded-full" style={{ background: COLOR_EQUIPO[turno.equipo] }} />
          {equipo.nombre}
        </Badge>
      )}
    </div>
  );
}
