# Panel de palabras

Un juego en grupo parecido a *La ruleta de la suerte*, pensado para jugar en una **pizarra digital**
con el lápiz. Todo el grupo colabora para adivinar frases a partir de una pista.

👉 **Jugar:** [angelip2303.github.io/rehab](https://angelip2303.github.io/rehab/)

Esta guía explica **cómo cambiar las frases y las pistas** del juego. No hace falta saber programar:
todo se hace desde la web de GitHub, como quien edita un documento.

---

## Índice

1. [Dónde están las frases](#1-dónde-están-las-frases)
2. [Cambiar o añadir una frase](#2-cambiar-o-añadir-una-frase)
3. [Crear una temática nueva](#3-crear-una-temática-nueva)
4. [Cómo se escribe cada frase](#4-cómo-se-escribe-cada-frase)
5. [Ajustes de los niveles](#5-ajustes-de-los-niveles)
6. [Ver los cambios en el juego](#6-ver-los-cambios-en-el-juego)
7. [Si algo sale mal](#7-si-algo-sale-mal)

---

## 1. Dónde están las frases

Las frases están agrupadas por **temáticas**. Cada temática es un archivo de texto:

| Temática | Archivo |
| --- | --- |
| 🐾 Animales | [`animales.yaml`](src/content/tematicas/animales.yaml) |
| 🍲 Comida | [`comida.yaml`](src/content/tematicas/comida.yaml) |
| 🏠 La casa | [`casa.yaml`](src/content/tematicas/casa.yaml) |
| 🗺️ Lugares | [`lugares.yaml`](src/content/tematicas/lugares.yaml) |

Todos están en la carpeta [`src/content/tematicas`](src/content/tematicas).

## 2. Cambiar o añadir una frase

1. Abre el archivo de la temática (pulsa en su nombre en la tabla de arriba).
2. Pulsa el **lápiz ✏️** que hay arriba a la derecha (*Edit this file*).
3. Cambia lo que quieras. Para **añadir** una frase, copia un bloque entero que empiece por `- frase:`
   y pégalo al final, cambiando el texto.
4. Pulsa el botón verde **Commit changes…** y, en la ventana que sale, otra vez **Commit changes**.

Listo: en unos minutos el juego se actualiza solo (ver el [paso 6](#6-ver-los-cambios-en-el-juego)).

## 3. Crear una temática nueva

1. Entra en la carpeta [`src/content/tematicas`](src/content/tematicas).
2. Pulsa **Add file → Create new file**.
3. Escribe el nombre del archivo, sin espacios ni tildes y terminado en `.yaml`. Por ejemplo: `deportes.yaml`.
4. Copia y pega esta plantilla y cámbiala a tu gusto:

```yaml
nombre: Deportes
icono: "⚽"
paneles:
  - frase: Balón de fútbol
    pista: Se juega con los pies
    nivel: facil

  - frase: Los Juegos Olímpicos
    pista: Se celebran cada cuatro años
    nivel: moderado
    ayuda: Tienen cinco aros de colores
```

5. Pulsa **Commit changes…** como en el paso anterior.

La temática nueva aparecerá sola en la pantalla de configuración del juego.

## 4. Cómo se escribe cada frase

Cada frase es un bloque como este:

```yaml
  - frase: El ratón come queso
    pista: Pequeño animal al que le gusta el queso
    nivel: facil
    ayuda: Vive en agujeros
```

| Línea | Qué es | ¿Obligatoria? |
| --- | --- | --- |
| `frase` | Lo que hay que adivinar. | Sí |
| `pista` | Lo que se ve siempre encima del panel. | Sí |
| `nivel` | `facil`, `moderado` o `dificil` (sin tildes). | Sí |
| `ayuda` | Una segunda pista que sale al pulsar **Ayuda** en el juego. | No |

Arriba del archivo van el `nombre` de la temática y un `icono` (un emoji, entre comillas).

**Reglas para que todo funcione:**

- ✅ Cada frase empieza con un guion `-` y las líneas de debajo van **alineadas** con la palabra `frase`.
- ✅ Usa la barra espaciadora para alinear, **no la tecla Tab**.
- ✅ Las tildes y la ñ se escriben normal (ratón, España). En el juego basta con pulsar la letra sin tilde.
- ✅ Si un texto lleva **dos puntos** (`:`), ponlo entre comillas: `ayuda: "Por ejemplo: Almazán"`.
- ✅ La frase tiene que caber en el tablero: como máximo 4 filas de unas 12–14 letras, y ninguna palabra de más de 14 letras.
- ℹ️ No hace falta ordenar las frases: el juego siempre empieza por las más cortas y va subiendo poco a poco.

## 5. Ajustes de los niveles

En el archivo [`niveles.yaml`](src/content/niveles.yaml) se puede cambiar cómo es cada nivel:

- `descripcion`: el texto que aparece debajo del nombre del nivel.
- `letrasReveladas`: letras que salen ya destapadas al empezar cada panel.
  Puede ser `vocales`, `ninguna` o una lista de letras, por ejemplo `AE`.
- `ayudasPorPanel`: cuántas veces se puede pulsar **Ayuda** en cada panel.

Se edita igual que las frases (lápiz ✏️ y **Commit changes**).

## 6. Ver los cambios en el juego

Después de guardar, el juego se actualiza solo en unos **2–3 minutos**.

- Puedes ver cómo va en la pestaña [**Actions**](https://github.com/angelip2303/rehab/actions):
  un círculo amarillo 🟡 significa que se está actualizando y una marca verde ✅ que ya está listo.
- Después, recarga la página del [juego](https://angelip2303.github.io/rehab/).

## 7. Si algo sale mal

Si en [**Actions**](https://github.com/angelip2303/rehab/actions) aparece una **cruz roja ❌**, es que algo
está mal escrito. **El juego no se rompe**: sigue funcionando con la versión anterior hasta que se corrija.

Para saber qué pasa, pulsa en la cruz roja y busca el mensaje en español. Por ejemplo:

> `paneles.3.nivel: El nivel tiene que ser: facil, moderado o dificil`

Esto quiere decir que en la **frase número 4** del archivo (se empieza a contar desde el 0) el nivel está mal escrito.
Otros mensajes habituales:

| Mensaje | Qué hacer |
| --- | --- |
| *La frase no cabe en el tablero* | Acorta la frase o usa palabras más cortas. |
| *Falta la pista del panel* | Añade la línea `pista:` a esa frase. |
| *El nivel tiene que ser…* | Escribe `facil`, `moderado` o `dificil`, sin tildes. |
| Cualquier otro error raro | Revisa que las líneas estén bien alineadas y que no haya tabuladores. |

Corrige el archivo con el lápiz ✏️ y guarda de nuevo. Si no consigues arreglarlo, siempre puedes deshacer:
abre el archivo, pulsa **History** y copia la versión anterior.

---

<sub>¿Eres desarrollador o desarrolladora? La parte técnica está en [DESARROLLO.md](DESARROLLO.md).</sub>
