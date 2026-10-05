import { useMemo } from "react";
import { COLUMNAS, crearTablero } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface Props {
  frase: string;
  /** letras visibles en el tablero */
  visibles: string[];
  /** modo Resolver: letra propuesta por cada casilla de letra (por índice) */
  propuesta?: (string | undefined)[];
  /** modo Resolver: índice de la casilla que se está rellenando */
  cursor?: number;
  /** modo Resolver: índices de casillas marcadas como incorrectas */
  errores?: number[];
  /** modo Resolver: al tocar una casilla de letra oculta */
  onCasilla?: (indice: number) => void;
  className?: string;
}

/**
 * Tablero tipo "ruleta de la suerte": 4 filas × 14 columnas.
 * El tamaño de las casillas se adapta al espacio disponible (container queries).
 */
export function Board({ frase, visibles, propuesta, cursor, errores, onCasilla, className }: Props) {
  const tablero = useMemo(() => crearTablero(frase), [frase]);

  return (
    <div className={cn("[container-type:size] flex size-full items-center justify-center", className)}>
      <div
        className="grid gap-[calc(var(--casilla)*0.08)]"
        style={
          {
            "--casilla": "min(calc(100cqw / 14.2), calc(100cqh / 4.4 / 1.3))",
            gridTemplateColumns: `repeat(${COLUMNAS}, var(--casilla))`,
            gridAutoRows: "calc(var(--casilla) * 1.3)",
          } as React.CSSProperties
        }
        role="img"
        aria-label="Panel"
      >
        {tablero.filas.flatMap((fila, f) =>
          fila.map((casilla, c) => {
            const clave = `${f}-${c}`;
            if (casilla === undefined) return <div key={clave} />;
            if (casilla === null) return <div key={clave} className="rounded-md bg-sky-600 shadow-inner" />;

            const esLetra = casilla.letra !== null;
            const visible = !esLetra || visibles.includes(casilla.letra!);
            const propuesta_ = esLetra && !visible ? propuesta?.[casilla.indice] : undefined;
            const activa = esLetra && !visible && cursor === casilla.indice;
            const error = esLetra && errores?.includes(casilla.indice);

            return (
              <div
                key={clave}
                data-letra={casilla.letra ?? undefined}
                data-visible={visible}
                onClick={esLetra && !visible && onCasilla ? () => onCasilla(casilla.indice) : undefined}
                className={cn(
                  "flex items-center justify-center rounded-md border bg-card font-bold text-card-foreground shadow-sm transition-colors",
                  activa && "ring-4 ring-ring",
                  error && "border-destructive bg-destructive/10 text-destructive",
                )}
                style={{ fontSize: "calc(var(--casilla) * 0.7)" }}
              >
                {visible ? casilla.caracter.toLocaleUpperCase("es-ES") : (propuesta_ ?? "")}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
