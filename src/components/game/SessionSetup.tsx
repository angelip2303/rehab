import { useMemo, useState } from "react";
import { CheckCheckIcon, CheckIcon, MinusIcon, PlusIcon, TargetIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Keyboard } from "@/components/game/Keyboard";
import { COLOR_EQUIPO } from "@/components/game/colores";
import { cn } from "@/lib/utils";
import { borrarPartida } from "@/lib/partida";
import { cargarSesion, guardarSesion, type Sesion } from "@/lib/session";
import { crearEquipos, nombrePersona } from "@/lib/turns";
import type { Modo, Nivel, NivelId, Panel, Tema } from "@/lib/types";

const MIN_PERSONAS = 2;
const MAX_PERSONAS = 20;
const OPCIONES_PANELES = [4, 6, 8, 10];
const MODOS: { id: Modo; nombre: string; icono: string; descripcion: string }[] = [
  { id: "light", nombre: "Light", icono: "🤝", descripcion: "Sin puntos: todo el grupo a por la misma misión" },
  { id: "concurso", nombre: "Concurso", icono: "🏆", descripcion: "Cada equipo suma puntos, la misión sigue siendo común" },
];
/** 0 = jugar todos los paneles disponibles */
const TODOS = 0;
const opcion =
  "h-auto px-5 py-3 text-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 data-[state=on]:hover:text-primary-foreground";

interface Props {
  temas: Tema[];
  niveles: Nivel[];
  paneles: Panel[];
}

export function SessionSetup({ temas, niveles, paneles }: Props) {
  const previa = useMemo(() => (typeof window === "undefined" ? null : cargarSesion()), []);
  const [nivel, setNivel] = useState<NivelId>(previa?.nivel ?? niveles[0].id);
  const [temasElegidos, setTemasElegidos] = useState<string[]>(previa?.temas ?? temas.map((t) => t.id));
  const [personas, setPersonas] = useState<string[]>(previa?.personas ?? Array(8).fill(""));
  const [equipos, setEquipos] = useState(previa?.equipos ?? 2);
  const [modo, setModo] = useState<Modo>(previa?.modo ?? "light");
  const [numPaneles, setNumPaneles] = useState(
    previa && OPCIONES_PANELES.includes(previa.paneles) ? previa.paneles : TODOS,
  );
  const [editandoNombres, setEditandoNombres] = useState(false);

  const disponibles = paneles.filter(
    (p) => p.nivel === nivel && temasElegidos.includes(p.tema),
  ).length;
  const repartos = crearEquipos(personas.length, equipos);

  const totalMision = numPaneles === TODOS ? disponibles : Math.min(numPaneles, disponibles);

  function cambiarPersonas(delta: number) {
    setPersonas((ps) => {
      const n = Math.max(MIN_PERSONAS, Math.min(MAX_PERSONAS, ps.length + delta));
      return n > ps.length ? [...ps, ...Array(n - ps.length).fill("")] : ps.slice(0, n);
    });
  }

  function empezar() {
    const sesion: Sesion = {
      nivel,
      temas: temasElegidos,
      personas,
      equipos: Math.min(equipos, personas.length),
      modo,
      paneles: totalMision,
      jugados: [],
    };
    guardarSesion(sesion);
    borrarPartida();
    window.location.href = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/jugar/`;
  }

  return (
    <main className="mx-auto flex h-dvh max-w-7xl flex-col gap-4 overflow-hidden p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de palabras</h1>
          <p className="text-muted-foreground">Configura la sesión y pulsa «¡A jugar!»</p>
        </div>
        <Button size="lg" className="h-16 px-10 text-2xl" disabled={disponibles === 0} onClick={empezar}>
          ¡A jugar!
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[auto_1fr] gap-4">
        <Card className="min-h-0 gap-4 py-5">
          <CardHeader>
            <CardTitle className="text-xl">Nivel</CardTitle>
            <CardDescription>Los paneles van de lo más sencillo a lo más complejo dentro de cada nivel</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              aria-label="Nivel"
              className="w-full flex-1 items-stretch"
              value={nivel}
              onValueChange={(v) => {
                if (!v) return;
                setNivel(v as NivelId);
              }}
            >
              {niveles.map((n) => (
                <ToggleGroupItem key={n.id} value={n.id} className={cn(opcion, "h-full flex-1 flex-col gap-1 py-4 whitespace-normal")}>
                  <span className="text-xl font-semibold">{n.nombre}</span>
                  {n.descripcion && <span className="text-sm opacity-80">{n.descripcion}</span>}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card className="min-h-0 gap-4 py-5">
          <CardHeader>
            <CardTitle className="text-xl">Temáticas</CardTitle>
            <CardDescription>
              {temasElegidos.length === temas.length
                ? "Todas elegidas · toca para quitar alguna"
                : `${temasElegidos.length} de ${temas.length} elegidas`}
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="lg"
                className="h-12 text-base"
                disabled={temasElegidos.length === temas.length}
                onClick={() => setTemasElegidos(temas.map((t) => t.id))}
              >
                <CheckCheckIcon /> Todas
              </Button>
            </CardAction>
          </CardHeader>
          {/* Carrusel: con muchas temáticas se desliza (dedo, lápiz o flechas) sin cambiar de tamaño */}
          <CardContent className="px-20">
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              className="block w-full"
              aria-label="Temáticas"
              value={temasElegidos}
              onValueChange={(v) => v.length > 0 && setTemasElegidos(v)}
            >
              <Carousel opts={{ align: "start", dragFree: true }}>
                <CarouselContent>
              {temas.map((t) => {
                const elegido = temasElegidos.includes(t.id);
                return (
                  <CarouselItem key={t.id} className="basis-1/2 xl:basis-1/4">
                  <ToggleGroupItem
                    value={t.id}
                    aria-label={t.nombre}
                    className="relative h-auto w-full flex-col gap-1 border-2 px-3 py-3 text-lg whitespace-normal data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:text-foreground data-[state=on]:hover:bg-primary/20"
                  >
                    {elegido && (
                      <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                    <span className="text-4xl leading-none" aria-hidden>
                      {t.icono ?? "🗂️"}
                    </span>
                    <span className="font-semibold">{t.nombre}</span>
                    <span className="text-sm text-muted-foreground">
                      {t.paneles[nivel]} {t.paneles[nivel] === 1 ? "panel" : "paneles"}
                    </span>
                  </ToggleGroupItem>
                  </CarouselItem>
                );
              })}
                </CarouselContent>
                <CarouselPrevious className="-left-16 size-12 [&_svg]:size-6" aria-label="Ver temáticas anteriores" />
                <CarouselNext className="-right-16 size-12 [&_svg]:size-6" aria-label="Ver más temáticas" />
              </Carousel>
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card className="min-h-0 gap-4 py-5">
          <CardHeader>
            <CardTitle className="text-xl">Grupo</CardTitle>
            <CardDescription>Los equipos se reparten solos y por turnos fijos: todo el mundo participa</CardDescription>
            <CardAction>
              <Button variant="outline" size="lg" className="h-12 text-base" onClick={() => setEditandoNombres(true)}>
                <UsersIcon /> Nombres
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-base">Personas</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="size-14" onClick={() => cambiarPersonas(-1)} aria-label="Una persona menos">
                    <MinusIcon className="size-6" />
                  </Button>
                  <span className="w-14 text-center text-3xl font-semibold tabular-nums">{personas.length}</span>
                  <Button variant="outline" className="size-14" onClick={() => cambiarPersonas(1)} aria-label="Una persona más">
                    <PlusIcon className="size-6" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-base">Equipos</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={2}
                  aria-label="Equipos"
              value={String(equipos)}
                  onValueChange={(v) => v && setEquipos(Number(v))}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <ToggleGroupItem key={n} value={String(n)} className={opcion} disabled={n > personas.length}>
                      {n === 1 ? "Todo el grupo" : n}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
            {/* Reparto: una columna por equipo, con todos los nombres visibles (sin cortes) */}
            <div
              className="grid min-h-0 flex-1 gap-2"
              style={{ gridTemplateColumns: `repeat(${repartos.length}, minmax(0, 1fr))` }}
            >
              {repartos.map((e, i) => (
                <div key={e.numero} className="h-full rounded-md border bg-background/60 px-3 py-2">
                  <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <span className="size-3 shrink-0 rounded-full" style={{ background: COLOR_EQUIPO[i] }} />
                    {repartos.length > 1 ? e.nombre : "Grupo"}
                  </p>
                  {/* nombres en rejilla compacta: con 20 personas sigue cabiendo sin estirar la tarjeta */}
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-x-2 text-sm leading-snug">
                    {e.miembros.map((m) => (
                      <li key={m} className="break-words">
                        {nombrePersona(personas, m)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-0 gap-4 py-5">
          <CardHeader>
            <CardTitle className="text-xl">Modo y misión</CardTitle>
            <CardDescription>Cómo se juega y cuántos paneles tiene que completar el grupo</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-col gap-4">
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              className="grid w-full grid-cols-2"
              aria-label="Modo"
              value={modo}
              onValueChange={(v) => v && setModo(v as Modo)}
            >
              {MODOS.map((m) => (
                <ToggleGroupItem
                  key={m.id}
                  value={m.id}
                  aria-label={m.nombre}
                  className={cn(opcion, "h-full w-full flex-row items-center justify-start gap-3 px-4 py-3 text-left whitespace-normal")}
                >
                  <span className="text-4xl leading-none" aria-hidden>
                    {m.icono}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-xl font-semibold">{m.nombre}</span>
                    <span className="text-sm opacity-80">{m.descripcion}</span>
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="flex flex-col gap-2">
              <Label className="text-base">¿Cuántos paneles se juegan?</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={2}
                className="flex-wrap"
                aria-label="Paneles de la misión"
                value={String(numPaneles >= disponibles ? TODOS : numPaneles)}
                onValueChange={(v) => v && setNumPaneles(Number(v))}
              >
                <ToggleGroupItem value={String(TODOS)} className={opcion}>
                  Todos ({disponibles})
                </ToggleGroupItem>
                {OPCIONES_PANELES.filter((n) => n < disponibles).map((n) => (
                  <ToggleGroupItem key={n} value={String(n)} className={cn(opcion, "min-w-14")}>
                    {n}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="mt-auto flex items-center gap-3 rounded-lg border-2 border-primary/40 bg-primary/10 px-4 py-3">
              <TargetIcon className="size-8 shrink-0 text-primary" />
              <p className="text-lg" data-testid="mision">
                {disponibles === 0 ? (
                  "No hay paneles de este nivel en las temáticas elegidas."
                ) : (
                  <>
                    <strong>Misión:</strong> resolver {totalMision} {totalMision === 1 ? "panel" : "paneles"} entre todo el
                    grupo{modo === "concurso" ? ", sumando puntos por equipo" : ""}.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <NombresDialog
        abierto={editandoNombres}
        onCerrar={() => setEditandoNombres(false)}
        nombres={personas}
        onCambiar={setPersonas}
      />
    </main>
  );
}

function NombresDialog({
  abierto,
  onCerrar,
  nombres,
  onCambiar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  nombres: string[];
  onCambiar: (n: string[]) => void;
}) {
  const [seleccionado, setSeleccionado] = useState(0);

  function editar(transformar: (actual: string) => string) {
    onCambiar(nombres.map((n, i) => (i === seleccionado ? transformar(n).slice(0, 20) : n)));
  }

  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Nombres o alias</DialogTitle>
          <DialogDescription>
            Toca una persona y escribe con el teclado. Se quedan solo en esta pantalla; si se deja vacío se muestra «Persona N».
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-5">
          {nombres.map((n, i) => (
            <Input
              key={i}
              value={n}
              placeholder={`Persona ${i + 1}`}
              onFocus={() => setSeleccionado(i)}
              onClick={() => setSeleccionado(i)}
              onChange={(e) => onCambiar(nombres.map((m, j) => (j === i ? e.target.value.slice(0, 20) : m)))}
              inputMode="none"
              className={i === seleccionado ? "h-12 text-lg ring-4 ring-ring" : "h-12 text-lg"}
            />
          ))}
        </div>
        <Keyboard
          onLetra={(l) => editar((n) => (n ? n + l.toLocaleLowerCase("es-ES") : l))}
          onEspacio={() => editar((n) => n + " ")}
          onBorrar={() => editar((n) => n.slice(0, -1))}
        />
        <DialogFooter>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSeleccionado((s) => Math.min(nombres.length - 1, s + 1))}
          >
            Siguiente persona
          </Button>
          <Button size="lg" onClick={onCerrar}>
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
