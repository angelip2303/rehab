import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Estado } from "@/lib/game";
import { nombrePersona, type Turno } from "@/lib/turns";
import { cn } from "@/lib/utils";
import { COLOR_EQUIPO } from "./colores";

/**
 * Marcador detallado (se abre y se cierra con el botón «Marcador»): puntos por equipo y,
 * por persona, jugadas, aciertos y puntos. En modo Light no se muestran puntos.
 */
export function ScorePanel({ estado, turno }: { estado: Estado; turno: Turno }) {
  const concurso = estado.sesion.modo === "concurso";
  const aciertos = estado.aciertos ?? estado.participaciones.map(() => 0);
  const puntosPersona = estado.puntosPersona ?? estado.participaciones.map(() => 0);
  const conEquipos = estado.equipos.length > 1;

  return (
    <aside className="flex min-h-0 w-[clamp(16rem,24vw,24rem)] shrink-0 flex-col gap-3 overflow-y-auto" aria-label="Marcador">
      {estado.equipos.map((e, i) => (
        <Card key={e.numero} className="gap-2 py-3">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="size-4 rounded-full" style={{ background: COLOR_EQUIPO[i] }} />
              {conEquipos ? e.nombre : "Grupo"}
              {concurso && (
                <span className="ml-auto text-3xl font-bold tabular-nums">
                  {estado.puntos[i]} <span className="text-base font-normal text-muted-foreground">pts</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-sm text-muted-foreground">
              <span />
              <span className="text-right">Jugadas</span>
              <span className="text-right">{concurso ? "Puntos" : "Aciertos"}</span>
            </div>
            {e.miembros.map((m) => {
              const leToca = turno.persona === m;
              return (
                <div
                  key={m}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-md px-1 text-lg",
                    leToca && "bg-amber-100 font-bold",
                  )}
                >
                  <span className="truncate">
                    {leToca && "👉 "}
                    {nombrePersona(estado.sesion.personas, m)}
                  </span>
                  <span className="w-14 text-right tabular-nums">{estado.participaciones[m]}</span>
                  <span className="w-14 text-right font-semibold tabular-nums">
                    {concurso ? puntosPersona[m] : aciertos[m]}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </aside>
  );
}
