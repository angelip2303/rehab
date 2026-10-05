# Desarrollo

Guía técnica. Para editar el contenido del juego, ver el [README](README.md).

## Qué es

Juego cooperativo tipo *La ruleta de la suerte* para sesiones de grupo (hasta 20 personas) en una
pizarra interactiva (lápiz y pantalla táctil, sin teclado). Niveles Fácil / Moderado / Difícil al estilo
NeuronUP; dentro de cada nivel los paneles se juegan de la frase más corta a la más larga.

- **Sin azar**: los turnos rotan de forma fija entre equipos y personas para que todo el mundo participe.
- **Misión común**: todo el grupo va a por los mismos paneles; los equipos son logística.
- **Modos**: *Light* (sin puntos) y *Concurso* (cada equipo suma puntos).
- Las casillas acertadas se iluminan y la persona que dinamiza las destapa tocándolas con el lápiz.
- Nada sale del navegador: la sesión se guarda en `sessionStorage`.

## Cómo se juega

1. **Configuración**: nivel, temáticas, nº de personas y equipos (nombres opcionales), modo y cuántos
   paneles se juegan (por defecto todos). Pulsar **¡A jugar!**.
2. **Panel**: arriba la pista; abajo, a quién le toca. La persona de turno toca una letra; acierte o no,
   el turno pasa a la siguiente.
   - Las casillas acertadas se **iluminan** y se destapan tocándolas una a una, o todas a la vez con el
     botón ✨ junto al tablero.
   - **Resolver**: se rellena la frase casilla a casilla y se pulsa *Comprobar*.
   - **Ayuda**: primero la ayuda escrita (si la hay) y después ilumina la letra que más se repite.
   - **Saltar turno**: pasa a la siguiente persona sin jugar.
   - 👁 (junto al tablero): enseña la solución sin resolver el panel; se puede volver a ocultar o pasar al siguiente.
   - **Marcador**: diálogo con puntos por equipo y jugadas, aciertos y puntos por persona.
3. **Resumen**: paneles resueltos, participación de cada persona y puntos en modo Concurso.

## Stack

Astro 7 + React 19 + shadcn/ui (Tailwind CSS v4), paleta Nord. Sitio estático.

- Contenido: colecciones `astro:content` en [`src/content.config.ts`](src/content.config.ts)
  (YAML validado con Zod, mensajes de error en español).
- Lógica pura y testeada en [`src/lib`](src/lib) (`game.ts`, `layout.ts`, `turns.ts`…).
- Pantallas como islas React en [`src/components/game`](src/components/game).
- Componentes de shadcn en [`src/components/ui`](src/components/ui); se añaden más con
  `npx shadcn@latest add <componente>`.

## Comandos

```sh
npm install
npm run dev           # http://localhost:4321/rehab/
npm test              # tests de la lógica (vitest)
npm run build         # valida el contenido y genera dist/
npx playwright test   # prueba de extremo a extremo (sin scroll ni cortes en 1366×768 y 1280×720)
```

## Publicación (GitHub Pages)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) pasa los tests, compila y publica en cada
push a `main` (y a la rama de trabajo). La primera vez hay que activar
**Settings → Pages → Source: GitHub Actions**.
La web queda en `https://angelip2303.github.io/rehab/`; si cambia el nombre del repositorio, actualiza
`base` en [`astro.config.mjs`](astro.config.mjs).
