import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { vibrarFallo } from "@/lib/feedback";
import { crearTablero } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { Board } from "./Board";
import { Keyboard } from "./Keyboard";

interface Props {
  abierto: boolean;
  frase: string;
  pista: string;
  visibles: string[];
  /** correcto = true si la frase propuesta es la buena; null si se cierra sin comprobar */
  onTerminar: (correcto: boolean | null) => void;
}

/** Modo Resolver: se rellenan las casillas ocultas una a una con el teclado en pantalla. */
export function SolveDialog({ abierto, frase, pista, visibles, onTerminar }: Props) {
  const casillas = useMemo(() => crearTablero(frase).casillasLetra, [frase]);
  const ocultas = useMemo(
    () => casillas.filter((c) => !visibles.includes(c.letra!)).map((c) => c.indice),
    [casillas, visibles],
  );
  const [propuesta, setPropuesta] = useState<(string | undefined)[]>([]);
  const [cursor, setCursor] = useState(0);
  const [errores, setErrores] = useState<number[]>([]);
  const [intentado, setIntentado] = useState(false);
  const [fallos, setFallos] = useState(0);

  useEffect(() => {
    if (!abierto) return;
    setPropuesta([]);
    setCursor(ocultas[0] ?? 0);
    setErrores([]);
    setIntentado(false);
  }, [abierto, ocultas]);

  const siguienteOculta = (desde: number) => ocultas.find((i) => i > desde) ?? desde;
  const anteriorOculta = (desde: number) => [...ocultas].reverse().find((i) => i < desde) ?? desde;
  const completa = ocultas.every((i) => propuesta[i]);

  function escribir(letra: string) {
    setPropuesta((p) => Object.assign([...p], { [cursor]: letra }));
    setErrores((e) => e.filter((i) => i !== cursor));
    setCursor(siguienteOculta(cursor));
  }

  function borrar() {
    const objetivo = propuesta[cursor] ? cursor : anteriorOculta(cursor);
    setPropuesta((p) => Object.assign([...p], { [objetivo]: undefined }));
    setCursor(objetivo);
  }

  function comprobar() {
    setIntentado(true);
    const malas = ocultas.filter((i) => propuesta[i] !== casillas[i].letra);
    if (malas.length === 0) onTerminar(true);
    else {
      setErrores(malas);
      setFallos((f) => f + 1);
      vibrarFallo();
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onTerminar(intentado ? false : null)}>
      <DialogContent className="flex h-[95vh] flex-col sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Resolver el panel</DialogTitle>
          <DialogDescription className="text-lg">{pista}</DialogDescription>
        </DialogHeader>
        <Board
          frase={frase}
          visibles={visibles}
          propuesta={propuesta}
          cursor={cursor}
          errores={errores}
          onCasilla={setCursor}
          key={`resolver-${fallos}`}
          className={cn("min-h-0 flex-1", fallos > 0 && "animate-temblor")}
        />
        <Keyboard onLetra={escribir} onBorrar={borrar} />
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg" onClick={() => onTerminar(intentado ? false : null)}>
            Volver al panel
          </Button>
          <Button size="lg" className="h-14 px-8 text-lg" disabled={!completa} onClick={comprobar}>
            Comprobar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
