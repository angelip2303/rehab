import { getCollection } from "astro:content";
import type { Nivel, NivelId, Panel, Tema } from "./types";

const ORDEN: NivelId[] = ["facil", "moderado", "dificil"];

/** Lee las colecciones de contenido y las convierte en datos planos para las islas React. */
export async function cargarContenido(): Promise<{ temas: Tema[]; niveles: Nivel[]; paneles: Panel[] }> {
  const tematicas = (await getCollection("tematicas")).sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, "es"));
  const paneles: Panel[] = tematicas.flatMap((t) =>
    t.data.paneles.map((p, i) => ({ id: `${t.id}-${i + 1}`, tema: t.id, ...p })),
  );
  const temas: Tema[] = tematicas.map((t) => ({
    id: t.id,
    nombre: t.data.nombre,
    icono: t.data.icono,
    paneles: Object.fromEntries(
      ORDEN.map((n) => [n, t.data.paneles.filter((p) => p.nivel === n).length]),
    ) as Record<NivelId, number>,
  }));
  const niveles: Nivel[] = (await getCollection("niveles"))
    .map((n) => ({
      ...n.data,
      fases: [...new Set(paneles.filter((p) => p.nivel === n.data.id).map((p) => p.fase))].sort((a, b) => a - b),
    }))
    .sort((a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id));
  return { temas, niveles, paneles };
}
