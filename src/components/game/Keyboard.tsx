import { useState } from "react";
import { DeleteIcon, SpaceIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FILAS_ABC, FILAS_QWERTY } from "@/lib/normalize";
import { cn } from "@/lib/utils";

export type EstadoTecla = "libre" | "acierto" | "fallo";

interface Props {
  onLetra: (letra: string) => void;
  estadoTecla?: (letra: string) => EstadoTecla;
  onBorrar?: () => void;
  onEspacio?: () => void;
  deshabilitado?: boolean;
  className?: string;
}

/** Teclado en pantalla para usar con el lápiz de la pizarra (sin teclado físico). */
export function Keyboard({ onLetra, estadoTecla, onBorrar, onEspacio, deshabilitado, className }: Props) {
  const [distribucion, setDistribucion] = useState<"abc" | "qwerty">("abc");
  const filas = distribucion === "abc" ? FILAS_ABC : FILAS_QWERTY;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex w-full justify-end">
        <Tabs value={distribucion} onValueChange={(v) => setDistribucion(v as "abc" | "qwerty")}>
          <TabsList>
            <TabsTrigger value="abc" className="px-4">ABC…</TabsTrigger>
            <TabsTrigger value="qwerty" className="px-4">QWE…</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {filas.map((fila, i) => (
        <div key={i} className="flex gap-2">
          {fila.map((letra) => {
            const estado = estadoTecla?.(letra) ?? "libre";
            return (
              <Button
                key={letra}
                type="button"
                variant={estado === "acierto" ? "default" : "outline"}
                disabled={deshabilitado || estado !== "libre"}
                onClick={() => onLetra(letra)}
                aria-label={`Letra ${letra}`}
                className={cn(
                  "size-14 text-2xl font-semibold",
                  estado === "acierto" && "disabled:opacity-100",
                  estado === "fallo" && "line-through disabled:opacity-30",
                )}
              >
                {letra}
              </Button>
            );
          })}
          {i === filas.length - 1 && onEspacio && (
            <Button type="button" variant="outline" className="h-14 w-28" onClick={onEspacio} aria-label="Espacio" disabled={deshabilitado}>
              <SpaceIcon className="size-7" />
            </Button>
          )}
          {i === filas.length - 1 && onBorrar && (
            <Button type="button" variant="secondary" className="h-14 w-28" onClick={onBorrar} aria-label="Borrar" disabled={deshabilitado}>
              <DeleteIcon className="size-7" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
