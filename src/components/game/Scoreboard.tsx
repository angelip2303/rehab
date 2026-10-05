import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Equipo } from "@/lib/turns";
import { COLOR_EQUIPO } from "./colores";

/** Marcador compacto de la cabecera; al sumar puntos aparece un «+N» animado junto al equipo. */
export function Scoreboard({ equipos, puntos }: { equipos: Equipo[]; puntos: number[] }) {
  return (
    <div className="flex gap-2">
      {equipos.map((e, i) => (
        <PuntosEquipo key={e.numero} nombre={equipos.length > 1 ? e.nombre : "Grupo"} color={COLOR_EQUIPO[i]} puntos={puntos[i]} />
      ))}
    </div>
  );
}

function PuntosEquipo({ nombre, color, puntos }: { nombre: string; color: string; puntos: number }) {
  const anterior = useRef(puntos);
  const [suma, setSuma] = useState<{ n: number; id: number } | null>(null);

  useEffect(() => {
    const n = puntos - anterior.current;
    anterior.current = puntos;
    if (n <= 0) return;
    setSuma({ n, id: Date.now() });
    const t = setTimeout(() => setSuma(null), 1800);
    return () => clearTimeout(t);
  }, [puntos]);

  return (
    <Badge variant="secondary" className="relative gap-2 border-2 px-3 py-1 text-lg">
      <span className="size-4 rounded-full" style={{ background: color }} />
      {nombre}
      <span key={suma?.id} className={suma ? "animate-in zoom-in-150 font-bold tabular-nums duration-500" : "font-bold tabular-nums"}>
        {puntos}
      </span>
      {suma && (
        <span
          key={`mas-${suma.id}`}
          className="absolute -top-3 -right-3 animate-in fade-in slide-in-from-bottom-3 rounded-full bg-emerald-600 px-2 text-base font-bold text-white duration-300"
          aria-live="polite"
        >
          +{suma.n}
        </span>
      )}
    </Badge>
  );
}
