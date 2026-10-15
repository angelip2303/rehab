import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Equipo } from "@/lib/turns";
import { cn } from "@/lib/utils";
import { COLOR_EQUIPO } from "./colores";

/** Marcador compacto de la cabecera; el equipo que suma puntos da un pequeño salto. */
export function Scoreboard({ equipos, puntos }: { equipos: Equipo[]; puntos: number[] }) {
  return (
    <div className="flex gap-2">
      {equipos.map((e, i) => (
        <PuntosEquipo
          key={e.numero}
          nombre={equipos.length > 1 ? e.nombre : "Grupo"}
          color={COLOR_EQUIPO[i]}
          puntos={puntos[i]}
          compacto={equipos.length >= 4}
        />
      ))}
    </div>
  );
}

/** Con 4 o 5 equipos solo se muestra el color y los puntos, para que la cabecera quepa en una línea. */
function PuntosEquipo({
  nombre,
  color,
  puntos,
  compacto,
}: {
  nombre: string;
  color: string;
  puntos: number;
  compacto: boolean;
}) {
  const anterior = useRef(puntos);
  const [salto, setSalto] = useState(0);

  useEffect(() => {
    if (puntos > anterior.current) setSalto((s) => s + 1);
    anterior.current = puntos;
  }, [puntos]);

  return (
    <Badge
      key={salto}
      variant="secondary"
      aria-label={`${nombre}: ${puntos} ${puntos === 1 ? "punto" : "puntos"}`}
      className={cn("gap-2 border-2 px-3 py-1 text-lg", salto > 0 && "animate-puntos")}
    >
      <span className="size-4 rounded-full" style={{ background: color }} />
      {!compacto && nombre}
      <span className="font-bold tabular-nums">{puntos}</span>
    </Badge>
  );
}
