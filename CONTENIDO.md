# Cómo añadir o cambiar paneles

No hace falta saber programar. Todos los paneles están en archivos de texto dentro de
`src/content/tematicas/`, **un archivo por temática** (`animales.yaml`, `comida.yaml`…).

## Editar desde la web de GitHub

1. Entra en el repositorio y abre la carpeta `src/content/tematicas/`.
2. Abre la temática que quieras y pulsa el **lápiz** (✏️ *Edit this file*).
3. Cambia o añade paneles (ver formato abajo).
4. Pulsa **Commit changes…** y confirma.
5. En un par de minutos la web se actualiza sola. Si algo está mal escrito, la publicación
   se para y en la pestaña **Actions** aparece un mensaje en español diciendo qué panel corregir;
   la versión anterior de la web sigue funcionando mientras tanto.

Para crear una **temática nueva**: dentro de `src/content/tematicas/` pulsa
**Add file → Create new file**, ponle un nombre terminado en `.yaml` (por ejemplo `deportes.yaml`)
y copia la estructura de otra temática.

## Formato de un panel

```yaml
nombre: Animales        # nombre que aparece en la configuración
icono: "🐾"             # opcional
paneles:
  - frase: El ratón come queso                    # lo que hay que adivinar
    pista: Pequeño animal al que le gusta el queso # se ve siempre encima del panel
    nivel: facil                                   # facil, moderado o dificil
    fase: 1                                        # 1, 2, 3… (la sesión avanza de fase poco a poco)
    ayuda: Vive en agujeros                        # opcional: se enseña al pulsar «Ayuda»
```

Reglas importantes:

- Cada panel empieza con un guion `-` y las líneas de debajo van **alineadas** con `frase`.
- Usa espacios, **no tabuladores**.
- Si un texto lleva dos puntos `:` o empieza por comillas, escríbelo entre comillas: `ayuda: "Por ejemplo: Almazán"`.
- La frase tiene que caber en el tablero: 4 filas de 12, 14, 14 y 12 casillas, y ninguna palabra de más de 14 letras.
- Las tildes se escriben normal (ratón). En el juego basta con pulsar la letra sin tilde.

## Niveles y fases

- **Nivel**: Fácil, Moderado o Difícil (como en NeuronUP).
- **Fase**: dentro de cada nivel, la fase 1 es la más sencilla. Al jugar solo se elige el nivel; la sesión
  empieza por los paneles de fase 1 y va avanzando sola. Conviene que en cada nivel haya paneles en todas las fases.

Los ajustes de cada nivel están en `src/content/niveles.yaml`:

- `letrasReveladas`: letras que salen destapadas al empezar (`vocales`, `ninguna` o una lista como `AE`).
- `ayudasPorPanel`: cuántas veces se puede pulsar «Ayuda» en cada panel.
