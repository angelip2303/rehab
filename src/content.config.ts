import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { cabeEnTablero } from "./lib/layout";
import { letraDeTeclado } from "./lib/normalize";

const NIVELES = ["facil", "moderado", "dificil"] as const;

const frase = z
  .string({ error: "Falta la frase del panel" })
  .trim()
  .min(1, "La frase no puede estar vacía")
  .refine((f) => [...f].some((c) => letraDeTeclado(c)), "La frase tiene que tener alguna letra")
  .refine(
    (f) => cabeEnTablero(f),
    "La frase no cabe en el tablero (4 filas: 12, 14, 14 y 12 casillas; ninguna palabra puede tener más de 14 letras). Acórtala.",
  );

const panel = z.object({
  frase,
  pista: z.string({ error: "Falta la pista del panel" }).trim().min(1, "La pista no puede estar vacía"),
  nivel: z.enum(NIVELES, { error: "El nivel tiene que ser: facil, moderado o dificil" }),
  ayuda: z.string().trim().optional(),
});

const tematicas = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml}", base: "./src/content/tematicas" }),
  schema: z.object({
    nombre: z.string({ error: "Falta el nombre de la temática" }),
    icono: z.string().optional(),
    paneles: z.array(panel).min(1, "La temática necesita al menos un panel"),
  }),
});

const niveles = defineCollection({
  loader: file("src/content/niveles.yaml"),
  schema: z.object({
    id: z.enum(NIVELES),
    nombre: z.string(),
    descripcion: z.string().optional(),
    letrasReveladas: z.string().default("ninguna"),
    ayudasPorPanel: z.number().int().min(0).default(2),
  }),
});

export const collections = { tematicas, niveles };
