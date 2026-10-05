import { DeleteIcon, SpaceIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FILAS_ABC } from "@/lib/normalize";
import { cn } from "@/lib/utils";

export type EstadoTecla = "libre" | "acierto" | "fallo";

interface Props {
  onLetra: (letra: string) => void;
  estadoTecla?: (letra: string) => EstadoTecla;
  onBorrar?: () => void;
  onEspacio?: () => void;
  deshabilitado?: boolean;
  /** tecla que tiene que temblar (al fallar); `id` cambia en cada fallo para repetir la animación */
  temblor?: { letra: string; id: number } | null;
  className?: string;
}

/** Teclado en pantalla de la A a la Z para usar con el lápiz de la pizarra (sin teclado físico). */
export function Keyboard({ onLetra, estadoTecla, onBorrar, onEspacio, deshabilitado, temblor, className }: Props) {
  const filas = FILAS_ABC;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {filas.map((fila, i) => (
        <div key={i} className="flex gap-2">
          {fila.map((letra) => {
            const estado = estadoTecla?.(letra) ?? "libre";
            return (
              <Button
                key={temblor?.letra === letra ? `${letra}-${temblor.id}` : letra}
                type="button"
                variant="outline"
                data-estado={estado}
                disabled={deshabilitado || estado !== "libre"}
                onClick={() => onLetra(letra)}
                aria-label={`Letra ${letra}`}
                className={cn(
                  "size-16 border-2 border-neutral-400 text-3xl font-bold text-neutral-950",
                  estado === "acierto" && "border-emerald-700 bg-emerald-600 text-white disabled:opacity-100",
                  estado === "fallo" &&
                    "border-destructive bg-red-100 text-destructive line-through decoration-4 disabled:opacity-100",
                  temblor?.letra === letra && "animate-temblor",
                )}
              >
                {letra}
              </Button>
            );
          })}
          {i === filas.length - 1 && onEspacio && (
            <Button type="button" variant="outline" className="h-16 w-28 border-2 border-neutral-400" onClick={onEspacio} aria-label="Espacio" disabled={deshabilitado}>
              <SpaceIcon className="size-7" />
            </Button>
          )}
          {i === filas.length - 1 && onBorrar && (
            <Button type="button" variant="secondary" className="h-16 w-28" onClick={onBorrar} aria-label="Borrar" disabled={deshabilitado}>
              <DeleteIcon className="size-7" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
