# Panel de palabras

Juego cooperativo tipo *La ruleta de la suerte* para sesiones de grupo (7–12 personas) en una
**pizarra interactiva** (lápiz y pantalla táctil, sin teclado). Inspirado en el formato de NeuronUP:
niveles Fácil / Moderado / Difícil con fases progresivas.

- **Sin azar**: no hay ruleta; los turnos rotan de forma fija entre equipos y personas para que todo el mundo participe.
- **Misión común**: todo el grupo va a por los mismos paneles. Los equipos son solo logística.
- **Modos**: *Light* (sin puntos) y *Concurso* (cada equipo suma puntos, la misión sigue siendo común).
- Nada sale del navegador: los nombres solo se guardan en la pestaña abierta.

## Cómo se juega

1. **Configuración**: nivel, temáticas, nº de personas y equipos (nombres opcionales),
   modo y cuántos paneles se juegan (por defecto todos). Pulsar **¡A jugar!**.
2. **Panel**: arriba la pista; abajo se indica a quién le toca. La persona de turno toca una letra en el
   teclado de pantalla. Acierte o no, el turno pasa a la siguiente persona.
   - Las casillas acertadas se **iluminan** y se destapan tocándolas con el lápiz una a una
     (o todas a la vez con **Destapar las iluminadas**).
   - **Resolver**: se rellena la frase casilla a casilla con el teclado y se pulsa *Comprobar*.
   - **Ayuda**: primero muestra la ayuda escrita del panel (si tiene) y después ilumina la letra que más se repite.
   - **Saltar turno** (junto al nombre): pasa a la siguiente persona sin jugar.
   - **Ver solución**: abandona el panel, lo destapa entero y se pasa al siguiente.
   - **Marcador**: muestra u oculta en cualquier momento los puntos por equipo y las jugadas,
     aciertos y puntos de cada persona.
3. **Resumen**: paneles resueltos, jugadas de cada persona (para ver que todos han participado) y puntos en modo Concurso.

## Contenido

Los paneles se editan en YAML, sin programar: ver **[CONTENIDO.md](CONTENIDO.md)**.

## Desarrollo

Astro 7 + React 19 + shadcn/ui (Tailwind CSS v4).

```sh
npm install
npm run dev       # http://localhost:4321/rehab/
npm test          # tests de la lógica (vitest)
npm run build     # valida el contenido y genera dist/
npx playwright test   # prueba de extremo a extremo
```

Los componentes de `src/components/ui/` son los de shadcn/ui (`new-york`); se añaden más con
`npx shadcn@latest add <componente>`.

## Publicación (GitHub Pages)

Cada push a `main` ejecuta `.github/workflows/deploy.yml`, que pasa los tests, compila y publica.
La primera vez hay que activar en GitHub **Settings → Pages → Source: GitHub Actions**.
La web queda en `https://angelip2303.github.io/rehab/` (si cambia el nombre del repositorio,
actualiza `base` en `astro.config.mjs`).
