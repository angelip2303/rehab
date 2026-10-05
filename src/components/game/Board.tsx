import { useMemo } from "react";
import { COLUMNAS, crearTablero } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface Props {
  frase: string;
  /** letras descubiertas */
  visibles: string[];
  /** casillas iluminadas pendientes de destapar con el lápiz */
  porVoltear?: number[];
  onVoltear?: (indice: number) => void;
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
export function Board({ frase, visibles, porVoltear = [], onVoltear, propuesta, cursor, errores, onCasilla, className }: Props) {
  const tablero = useMemo(() => crearTablero(frase), [frase]);

  return (
    <div className={cn("[container-type:size] flex size-full items-center justify-center", className)}>
      <div
        className="grid gap-[calc(var(--casilla)*0.08)] rounded-2xl border-4 border-nord3/30 bg-nord4 p-[calc(var(--casilla)*0.18)] shadow-md"
        style={
          {
            "--casilla": "min(calc(100cqw / 15.2), calc(100cqh / 4.9 / 1.3))",
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
            if (casilla === null) return <div key={clave} className="rounded-md bg-nord10 shadow-inner" aria-hidden />;

            const esLetra = casilla.letra !== null;
            const iluminada = esLetra && porVoltear.includes(casilla.indice);
            const visible = !esLetra || (visibles.includes(casilla.letra!) && !iluminada);
            const propuesta_ = esLetra && !visible ? propuesta?.[casilla.indice] : undefined;
            const activa = esLetra && !visible && cursor === casilla.indice;
            const error = esLetra && errores?.includes(casilla.indice);

            return (
              <div
                key={clave}
                data-letra={casilla.letra ?? undefined}
                data-visible={visible}
                data-iluminada={iluminada || undefined}
                role={iluminada ? "button" : undefined}
                aria-label={iluminada ? "Destapar casilla" : undefined}
                onClick={
                  iluminada && onVoltear
                    ? () => onVoltear(casilla.indice)
                    : esLetra && !visible && onCasilla
                      ? () => onCasilla(casilla.indice)
                      : undefined
                }
                className={cn(
                  "flex items-center justify-center rounded-md border-[3px] border-nord3 bg-nord6 font-bold text-nord0 shadow transition-colors",
                  activa && "border-nord10 ring-4 ring-nord8",
                  iluminada &&
                    "cursor-pointer border-nord12 bg-nord13 shadow-[0_0_calc(var(--casilla)*0.35)_var(--color-nord13)] animate-pulse",
                  error && "border-nord11 bg-nord11/15 text-nord11",
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
