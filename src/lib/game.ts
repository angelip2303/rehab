import { crearTablero } from "./layout";
import { letrasDe, VOCALES } from "./normalize";
import type { Sesion } from "./session";
import { crearEquipos, turnoEn, type Equipo } from "./turns";
import type { Nivel, Panel } from "./types";

export const PUNTOS_RESOLVER = 3;

/* ---------- Selección de paneles ---------- */

/** Nº de letras de la frase: cuanto más corta, más sencilla. */
export function dificultad(p: Panel): number {
  return crearTablero(p.frase).casillasLetra.length;
}

/**
 * Elige los paneles de la misión: del nivel y las temáticas elegidas, sin repetir los ya jugados.
 * Se eligen al azar (para variar entre sesiones) y se juegan de la frase más corta a la más
 * larga, así la sesión va de lo más sencillo a lo más complejo sin que haya que marcarlo.
 */
export function elegirPaneles(
  todos: Panel[],
  sesion: Pick<Sesion, "nivel" | "temas" | "paneles" | "jugados">,
  aleatorio: () => number = Math.random,
): Panel[] {
  const candidatos = todos.filter(
    (p) =>
      p.nivel === sesion.nivel &&
      (sesion.temas.length === 0 || sesion.temas.includes(p.tema)) &&
      !sesion.jugados.includes(p.id),
  );
  return barajar(candidatos, aleatorio)
    .slice(0, sesion.paneles)
    .sort((a, b) => dificultad(a) - dificultad(b));
}

function barajar<T>(lista: T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* ---------- Estado de la partida ---------- */

export type ResultadoPanel = "resuelto" | "mostrado";

export interface EstadoPanel {
  panel: Panel;
  /** letras ya descubiertas (acertadas, de ayuda o de partida) */
  visibles: string[];
  /**
   * Casillas iluminadas que aún no se han destapado: la persona que dinamiza
   * las va tocando con el lápiz para descubrirlas una a una, como en la ruleta.
   */
  porVoltear: number[];
  /** letras tocadas en el teclado (aciertos y fallos) */
  probadas: string[];
  ayudasUsadas: number;
  ayudaTextoVista: boolean;
  resultado: ResultadoPanel | null;
}

export interface Estado {
  sesion: Sesion;
  equipos: Equipo[];
  paneles: Panel[];
  actual: number;
  panel: EstadoPanel;
  /** contador global de turnos */
  turno: number;
  /** jugadas por persona (letras, resolver) para el resumen */
  participaciones: number[];
  /** jugadas con premio por persona (letra que estaba o panel resuelto) */
  aciertos: number[];
  /** puntos aportados por cada persona (se cuentan siempre; solo se enseñan en Concurso) */
  puntosPersona: number[];
  puntos: number[];
  resultados: ResultadoPanel[];
  terminado: boolean;
}

export function letrasIniciales(frase: string, nivel: Nivel): string[] {
  const enFrase = letrasDe(frase);
  const regla = nivel.letrasReveladas.trim().toUpperCase();
  const reveladas =
    regla === "VOCALES" ? VOCALES : regla === "NINGUNA" || regla === "" ? [] : [...regla];
  return reveladas.filter((l) => enFrase.has(l));
}

function nuevoPanel(panel: Panel, nivel: Nivel): EstadoPanel {
  const visibles = letrasIniciales(panel.frase, nivel);
  return {
    panel,
    visibles,
    porVoltear: [],
    probadas: [...visibles],
    ayudasUsadas: 0,
    ayudaTextoVista: false,
    resultado: null,
  };
}

export function crearEstado(sesion: Sesion, paneles: Panel[], nivel: Nivel): Estado {
  const equipos = crearEquipos(sesion.personas.length, sesion.equipos);
  return {
    sesion,
    equipos,
    paneles,
    actual: 0,
    panel: nuevoPanel(paneles[0], nivel),
    turno: 0,
    participaciones: sesion.personas.map(() => 0),
    aciertos: sesion.personas.map(() => 0),
    puntosPersona: sesion.personas.map(() => 0),
    puntos: equipos.map(() => 0),
    resultados: [],
    terminado: false,
  };
}

export function letrasPendientes(ep: EstadoPanel): string[] {
  return [...letrasDe(ep.panel.frase)].filter((l) => !ep.visibles.includes(l));
}

export function apariciones(frase: string, letra: string): number {
  return crearTablero(frase).casillasLetra.filter((c) => c.letra === letra).length;
}

/** Letra pendiente más frecuente (desempate alfabético): la ayuda es siempre la misma, sin azar. */
export function letraDeAyuda(ep: EstadoPanel): string | null {
  const pendientes = letrasPendientes(ep);
  if (pendientes.length === 0) return null;
  return pendientes
    .map((l) => ({ l, n: apariciones(ep.panel.frase, l) }))
    .sort((a, b) => b.n - a.n || a.l.localeCompare(b.l, "es"))[0].l;
}

/** Índices de las casillas cuyas letras están en `letras`. */
export function casillasDe(frase: string, letras: string[]): number[] {
  return crearTablero(frase)
    .casillasLetra.filter((c) => letras.includes(c.letra!))
    .map((c) => c.indice);
}

function iluminar(ep: EstadoPanel, letras: string[]): number[] {
  const nuevas = casillasDe(ep.panel.frase, letras).filter((i) => !ep.porVoltear.includes(i));
  return [...ep.porVoltear, ...nuevas];
}

export type Accion =
  | { tipo: "letra"; letra: string }
  | { tipo: "ayuda"; nivel: Nivel }
  | { tipo: "resolver"; correcto: boolean }
  | { tipo: "mostrar" }
  | { tipo: "saltarTurno" }
  | { tipo: "voltear"; indice: number }
  | { tipo: "voltearTodas" }
  | { tipo: "siguiente"; nivel: Nivel };

function avanzarTurno(e: Estado, puntos = 0): Estado {
  const { equipo, persona } = turnoEn(e.equipos, e.turno);
  const participaciones = [...e.participaciones];
  participaciones[persona]++;
  // partidas guardadas antes de existir estos contadores
  const aciertos = [...(e.aciertos ?? e.participaciones.map(() => 0))];
  const puntosPersona = [...(e.puntosPersona ?? e.participaciones.map(() => 0))];
  if (puntos > 0) {
    aciertos[persona]++;
    puntosPersona[persona] += puntos;
  }
  const marcador = [...e.puntos];
  if (e.sesion.modo === "concurso") marcador[equipo] += puntos;
  return { ...e, turno: e.turno + 1, participaciones, aciertos, puntosPersona, puntos: marcador };
}

function cerrarPanel(e: Estado, resultado: ResultadoPanel): Estado {
  const pendientes = letrasPendientes(e.panel);
  const visibles = [...letrasDe(e.panel.panel.frase)];
  return { ...e, panel: { ...e.panel, visibles, porVoltear: iluminar(e.panel, pendientes), resultado } };
}

export function reducir(e: Estado, a: Accion): Estado {
  const ep = e.panel;
  switch (a.tipo) {
    case "letra": {
      if (ep.resultado || ep.probadas.includes(a.letra)) return e;
      const n = ep.visibles.includes(a.letra) ? 0 : apariciones(ep.panel.frase, a.letra);
      const visibles = n > 0 ? [...ep.visibles, a.letra] : ep.visibles;
      const porVoltear = n > 0 ? iluminar(ep, [a.letra]) : ep.porVoltear;
      let siguiente: Estado = {
        ...e,
        panel: { ...ep, visibles, porVoltear, probadas: [...ep.probadas, a.letra] },
      };
      const completo = letrasPendientes(siguiente.panel).length === 0;
      siguiente = avanzarTurno(siguiente, n + (completo ? PUNTOS_RESOLVER : 0));
      return completo ? cerrarPanel(siguiente, "resuelto") : siguiente;
    }
    case "ayuda": {
      if (ep.resultado || ep.ayudasUsadas >= a.nivel.ayudasPorPanel) return e;
      if (ep.panel.ayuda && !ep.ayudaTextoVista) {
        return { ...e, panel: { ...ep, ayudaTextoVista: true, ayudasUsadas: ep.ayudasUsadas + 1 } };
      }
      const letra = letraDeAyuda(ep);
      if (!letra) return e;
      const panel: EstadoPanel = {
        ...ep,
        visibles: [...ep.visibles, letra],
        porVoltear: iluminar(ep, [letra]),
        probadas: ep.probadas.includes(letra) ? ep.probadas : [...ep.probadas, letra],
        ayudasUsadas: ep.ayudasUsadas + 1,
      };
      const siguiente = { ...e, panel };
      return letrasPendientes(panel).length === 0 ? cerrarPanel(siguiente, "resuelto") : siguiente;
    }
    case "resolver": {
      if (ep.resultado) return e;
      if (!a.correcto) return avanzarTurno(e);
      return cerrarPanel(avanzarTurno(e, PUNTOS_RESOLVER), "resuelto");
    }
    case "mostrar":
      return ep.resultado ? e : cerrarPanel(e, "mostrado");
    case "saltarTurno":
      return { ...e, turno: e.turno + 1 };
    case "voltear":
      return { ...e, panel: { ...ep, porVoltear: ep.porVoltear.filter((i) => i !== a.indice) } };
    case "voltearTodas":
      return { ...e, panel: { ...ep, porVoltear: [] } };
    case "siguiente": {
      if (!ep.resultado) return e;
      const resultados = [...e.resultados, ep.resultado];
      const jugados = [...e.sesion.jugados, ep.panel.id];
      const sesion = { ...e.sesion, jugados };
      const actual = e.actual + 1;
      if (actual >= e.paneles.length) return { ...e, sesion, resultados, terminado: true };
      return { ...e, sesion, resultados, actual, panel: nuevoPanel(e.paneles[actual], a.nivel) };
    }
  }
}

/** Comprueba una propuesta del modo Resolver (una letra por casilla, sin tildes). */
export function propuestaCorrecta(frase: string, propuesta: string[]): boolean {
  const casillas = crearTablero(frase).casillasLetra;
  return casillas.length === propuesta.length && casillas.every((c, i) => c.letra === propuesta[i]);
}
