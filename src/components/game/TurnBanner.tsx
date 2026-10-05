import { Badge } from "@/components/ui/badge";
import { nombrePersona, type Equipo, type Turno } from "@/lib/turns";
import { COLOR_EQUIPO } from "./colores";

export function TurnBanner({ turno, equipos, personas }: { turno: Turno; equipos: Equipo[]; personas: string[] }) {
  const equipo = equipos[turno.equipo];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <span className="text-lg text-muted-foreground">Turno de</span>
      <span className="text-2xl font-semibold">{nombrePersona(personas, turno.persona)}</span>
      {equipos.length > 1 && (
        <Badge variant="outline" className="gap-2 px-3 py-1 text-base">
          <span className="size-3 rounded-full" style={{ background: COLOR_EQUIPO[turno.equipo] }} />
          {equipo.nombre}
        </Badge>
      )}
    </div>
  );
}
