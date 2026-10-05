import { useEffect, useReducer, useRef, useState } from "react";
import { CheckIcon, EyeIcon, SparklesIcon, TrophyIcon, KeyboardIcon, LightbulbIcon, LogOutIcon, SkipForwardIcon, SpellCheckIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { celebrarPanel } from "@/lib/celebrar";
import { apariciones, crearEstado, elegirPaneles, reducir, type Estado } from "@/lib/game";
import { vibrarFallo } from "@/lib/feedback";
import { letrasDe } from "@/lib/normalize";
import { borrarPartida, cargarPartida, guardarPartida } from "@/lib/partida";
import { borrarSesion, cargarSesion, guardarSesion, type Sesion } from "@/lib/session";
import { turnoEn } from "@/lib/turns";
import type { Nivel, Panel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Board } from "./Board";
import { Keyboard, type EstadoTecla } from "./Keyboard";
import { MissionBar } from "./MissionBar";
import { Scoreboard } from "./Scoreboard";
import { ScorePanel } from "./ScorePanel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SolveDialog } from "./SolveDialog";
import { Summary } from "./Summary";
import { TurnBanner } from "./TurnBanner";

interface Props {
  paneles: Panel[];
  niveles: Nivel[];
}

const inicio = () => `${import.meta.env.BASE_URL.replace(/\/$/, "")}/`;

function nuevaPartida(sesion: Sesion, paneles: Panel[], niveles: Nivel[]): Estado | null {
  const elegidos = elegirPaneles(paneles, sesion);
  if (elegidos.length === 0) return null;
  return crearEstado(sesion, elegidos, niveles.find((n) => n.id === sesion.nivel)!);
}

function estadoInicial({ paneles, niveles }: Props): Estado | null {
  const guardada = cargarPartida();
  if (guardada) return guardada;
  const sesion = cargarSesion();
  return sesion ? nuevaPartida(sesion, paneles, niveles) : null;
}

export function Game(props: Props) {
  const [estado, setEstado] = useState<Estado | null>(() => estadoInicial(props));

  if (!estado) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">No hay ninguna sesión en marcha</CardTitle>
            <CardDescription className="text-lg">Configura primero el nivel, las temáticas y el grupo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="h-14 px-8 text-lg">
              <a href={inicio()}>Ir a la configuración</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <Partida
      key={estado.sesion.jugados.length + ":" + estado.paneles.map((p) => p.id).join()}
      inicial={estado}
      niveles={props.niveles}
      onOtraRonda={(sesion) => {
        guardarSesion(sesion);
        borrarPartida();
        // Si ya se han jugado todos los paneles disponibles, se vuelve a empezar con ellos.
        setEstado(
          nuevaPartida(sesion, props.paneles, props.niveles) ??
            nuevaPartida({ ...sesion, jugados: [] }, props.paneles, props.niveles),
        );
      }}
    />
  );
}

function Partida({
  inicial,
  niveles,
  onOtraRonda,
}: {
  inicial: Estado;
  niveles: Nivel[];
  onOtraRonda: (sesion: Sesion) => void;
}) {
  const [estado, despachar] = useReducer(reducir, inicial);
  const [resolviendo, setResolviendo] = useState(false);
  const [tecladoVisible, setTecladoVisible] = useState(true);
  /** última letra jugada, para el feedback de acierto/fallo */
  const [jugada, setJugada] = useState<{ letra: string; n: number; id: number } | null>(null);
  const [temblorPanel, setTemblorPanel] = useState(0);

  function jugarLetra(letra: string) {
    const n = apariciones(estado.panel.panel.frase, letra);
    setJugada({ letra, n, id: Date.now() });
    if (n === 0) {
      vibrarFallo();
      setTemblorPanel((t) => t + 1);
    }
    despachar({ tipo: "letra", letra });
  }

  // El aviso de la última jugada desaparece a los pocos segundos y al cambiar de panel.
  useEffect(() => {
    if (!jugada) return;
    const t = setTimeout(() => setJugada(null), 2500);
    return () => clearTimeout(t);
  }, [jugada]);
  useEffect(() => setJugada(null), [estado.actual]);

  useEffect(() => guardarPartida(estado), [estado]);

  // Confeti cuando el grupo resuelve el panel y ya se han destapado todas sus casillas
  // (no al mostrar la solución ni al recargar una partida ya celebrada).
  const resueltoYDestapado = estado.panel.resultado === "resuelto" && (estado.panel.porVoltear ?? []).length === 0;
  const panelCelebrado = useRef(resueltoYDestapado ? estado.actual : -1);
  useEffect(() => {
    if (!resueltoYDestapado || panelCelebrado.current === estado.actual) return;
    panelCelebrado.current = estado.actual;
    celebrarPanel();
  }, [resueltoYDestapado, estado.actual]);

  const nivel = niveles.find((n) => n.id === estado.sesion.nivel)!;
  const { panel } = estado;
  const turno = turnoEn(estado.equipos, estado.turno);
  const enFrase = letrasDe(panel.panel.frase);
  const terminado = panel.resultado !== null;
  const ayudasRestantes = nivel.ayudasPorPanel - panel.ayudasUsadas;
  const hechos = estado.resultados.length + (terminado ? 1 : 0);

  if (estado.terminado) {
    return (
      <Summary
        estado={estado}
        onOtraRonda={() => onOtraRonda(estado.sesion)}
        onNuevaSesion={() => {
          borrarPartida();
          borrarSesion();
          window.location.href = inicio();
        }}
      />
    );
  }

  const estadoTecla = (letra: string): EstadoTecla =>
    !panel.probadas.includes(letra) ? "libre" : enFrase.has(letra) ? "acierto" : "fallo";

  return (
    <main className="flex h-dvh flex-col gap-3 overflow-hidden p-4">
      <header className="flex flex-wrap items-center gap-4">
        <MissionBar hechos={hechos} total={estado.paneles.length} />
        {estado.sesion.modo === "concurso" && <Scoreboard equipos={estado.equipos} puntos={estado.puntos} />}
        <Badge variant="outline" className="px-3 py-1 text-base">
          {nivel.nombre}
        </Badge>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="h-12 gap-2 px-4 text-lg">
              <TrophyIcon className="size-5" /> Marcador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-3xl">Marcador 🏆</DialogTitle>
              <DialogDescription className="text-lg">
                Panel {estado.actual + 1} de {estado.paneles.length} ·{" "}
                {estado.sesion.modo === "concurso" ? "puntos por equipo y por persona" : "jugadas y aciertos de cada persona"}
              </DialogDescription>
            </DialogHeader>
            <ScorePanel estado={estado} turno={turno} />
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="lg" aria-label="Salir">
              <LogOutIcon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Terminar la sesión?</AlertDialogTitle>
              <AlertDialogDescription>Se perderá el progreso de la misión actual.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Seguir jugando</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  borrarPartida();
                  window.location.href = inicio();
                }}
              >
                Terminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <Card className="gap-1 py-4">
        <CardContent className="text-center">
          <p className="text-4xl font-bold">{panel.panel.pista}</p>
          {panel.ayudaTextoVista && panel.panel.ayuda && (
            <p className="mt-1 text-2xl text-muted-foreground">💡 {panel.panel.ayuda}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex min-h-0 flex-1 gap-4">
        <Board
          key={`tablero-${temblorPanel}`}
          frase={panel.panel.frase}
          visibles={panel.visibles}
          porVoltear={panel.porVoltear ?? []}
          onVoltear={(indice) => despachar({ tipo: "voltear", indice })}
          className={cn("min-h-0 min-w-0 flex-1", temblorPanel > 0 && "animate-temblor")}
        />
      </div>

      <Separator />

      <section className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          {terminado ? (
            <span className="text-2xl font-semibold">
              {panel.resultado === "mostrado"
                ? "Solución 👀"
                : resueltoYDestapado
                  ? "¡Panel resuelto! 🎉"
                  : "¡Resuelto! Destapad el panel ✨"}
            </span>
          ) : (
            <div className="flex items-center gap-4">
              <TurnBanner turno={turno} equipos={estado.equipos} personas={estado.sesion.personas} />
              <Button variant="ghost" size="lg" className="h-12 px-3 text-base text-muted-foreground" onClick={() => despachar({ tipo: "saltarTurno" })}>
                <SkipForwardIcon className="size-5" /> Saltar turno
              </Button>
              {jugada && jugada.n > 0 && (
                <Badge
                  key={jugada.id}
                  role="status"
                  className="animate-in fade-in zoom-in-95 gap-2 bg-nord14 px-4 py-1.5 text-xl font-bold text-nord0"
                >
                  <CheckIcon className="size-5" />
                  Hay {jugada.n} {jugada.letra}
                  {estado.sesion.modo === "concurso" && ` · +${jugada.n}`}
                </Badge>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(panel.porVoltear ?? []).length > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="h-14 border-2 border-nord12 bg-nord13 px-6 text-lg font-semibold text-nord0 hover:bg-nord13/80"
                onClick={() => despachar({ tipo: "voltearTodas" })}
              >
                <SparklesIcon className="size-6" /> Destapar las iluminadas ({panel.porVoltear.length})
              </Button>
            )}
            {terminado ? (
              <Button size="lg" className="h-16 px-10 text-2xl" onClick={() => despachar({ tipo: "siguiente", nivel })}>
                {estado.actual + 1 < estado.paneles.length ? "Siguiente panel" : "Ver resumen"}
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="h-14 px-6 text-lg"
                  onClick={() => {
                    despachar({ tipo: "voltearTodas" });
                    setResolviendo(true);
                  }}
                >
                  <SpellCheckIcon className="size-6" /> Resolver
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-14 px-6 text-lg"
                  disabled={ayudasRestantes <= 0}
                  onClick={() => despachar({ tipo: "ayuda", nivel })}
                >
                  <LightbulbIcon className="size-6" /> Ayuda
                  <Badge variant="outline">{ayudasRestantes}</Badge>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="lg" className="h-14 px-6 text-lg">
                      <EyeIcon className="size-6" /> Ver solución
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Mostrar la solución?</AlertDialogTitle>
                      <AlertDialogDescription>Se abandona este panel: se destapa entero (también lo que nadie ha acertado) y se pasa al siguiente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => despachar({ tipo: "mostrar" })}>Mostrar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="flex items-end gap-2">
          {tecladoVisible && !terminado && (
            <Keyboard
              estadoTecla={estadoTecla}
              onLetra={jugarLetra}
              temblor={jugada && jugada.n === 0 ? { letra: jugada.letra, id: jugada.id } : null}
            />
          )}
          {!terminado && (
            <Button
              variant={tecladoVisible ? "secondary" : "outline"}
              className="size-16"
              onClick={() => setTecladoVisible((v) => !v)}
              aria-label={tecladoVisible ? "Ocultar teclado" : "Mostrar teclado"}
            >
              <KeyboardIcon className="size-8" />
            </Button>
          )}
        </div>
      </section>

      <SolveDialog
        abierto={resolviendo}
        frase={panel.panel.frase}
        pista={panel.panel.pista}
        visibles={panel.visibles}
        onTerminar={(correcto) => {
          setResolviendo(false);
          if (correcto !== null) despachar({ tipo: "resolver", correcto });
        }}
      />
    </main>
  );
}
