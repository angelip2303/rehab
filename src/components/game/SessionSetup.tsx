import { useMemo, useState } from "react";
import { MinusIcon, PlusIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Keyboard } from "@/components/game/Keyboard";
import { borrarPartida } from "@/lib/partida";
import { cargarSesion, guardarSesion, type Sesion } from "@/lib/session";
import { crearEquipos, nombrePersona } from "@/lib/turns";
import type { Modo, Nivel, NivelId, Panel, Tema } from "@/lib/types";

const MIN_PERSONAS = 2;
const MAX_PERSONAS = 15;
const OPCIONES_PANELES = [4, 6, 8, 10];
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
  const [faseInicial, setFaseInicial] = useState(previa?.faseInicial ?? 1);
  const [temasElegidos, setTemasElegidos] = useState<string[]>(previa?.temas ?? temas.map((t) => t.id));
  const [personas, setPersonas] = useState<string[]>(previa?.personas ?? Array(8).fill(""));
  const [equipos, setEquipos] = useState(previa?.equipos ?? 2);
  const [modo, setModo] = useState<Modo>(previa?.modo ?? "light");
  const [numPaneles, setNumPaneles] = useState(previa?.paneles ?? 6);
  const [editandoNombres, setEditandoNombres] = useState(false);

  const nivelActual = niveles.find((n) => n.id === nivel)!;
  const disponibles = paneles.filter(
    (p) => p.nivel === nivel && p.fase >= faseInicial && temasElegidos.includes(p.tema),
  ).length;
  const repartos = crearEquipos(personas.length, equipos);

  function cambiarPersonas(delta: number) {
    setPersonas((ps) => {
      const n = Math.max(MIN_PERSONAS, Math.min(MAX_PERSONAS, ps.length + delta));
      return n > ps.length ? [...ps, ...Array(n - ps.length).fill("")] : ps.slice(0, n);
    });
  }

  function empezar() {
    const sesion: Sesion = {
      nivel,
      faseInicial,
      temas: temasElegidos,
      personas,
      equipos: Math.min(equipos, personas.length),
      modo,
      paneles: Math.min(numPaneles, disponibles),
      jugados: [],
    };
    guardarSesion(sesion);
    borrarPartida();
    window.location.href = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/jugar/`;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de palabras</h1>
          <p className="text-muted-foreground">Configura la sesión y pulsa «¡A jugar!»</p>
        </div>
        <Button size="lg" className="h-16 px-10 text-2xl" disabled={disponibles === 0} onClick={empezar}>
          ¡A jugar!
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Nivel</CardTitle>
            <CardDescription>{nivelActual.descripcion}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              aria-label="Nivel"
              value={nivel}
              onValueChange={(v) => {
                if (!v) return;
                setNivel(v as NivelId);
                setFaseInicial(1);
              }}
            >
              {niveles.map((n) => (
                <ToggleGroupItem key={n.id} value={n.id} className={opcion}>
                  {n.nombre}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex flex-col gap-2">
              <Label className="text-base">Empezar en la fase</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={2}
                aria-label="Fase inicial"
              value={String(faseInicial)}
                onValueChange={(v) => v && setFaseInicial(Number(v))}
              >
                {nivelActual.fases.map((f) => (
                  <ToggleGroupItem key={f} value={String(f)} className={opcion}>
                    Fase {f}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Temáticas</CardTitle>
            <CardDescription>Puedes elegir varias</CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              className="flex-wrap"
              aria-label="Temáticas"
              value={temasElegidos}
              onValueChange={(v) => v.length > 0 && setTemasElegidos(v)}
            >
              {temas.map((t) => (
                <ToggleGroupItem key={t.id} value={t.id} className={opcion}>
                  {t.icono} {t.nombre}
                  <Badge variant="secondary">{t.paneles[nivel]}</Badge>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Grupo</CardTitle>
            <CardDescription>Los equipos se reparten solos y por turnos fijos: todo el mundo participa</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-6">
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
            <div className="grid gap-2 sm:grid-cols-2">
              {repartos.map((e) => (
                <div key={e.numero} className="rounded-md border p-3">
                  <p className="mb-1 font-medium">{repartos.length > 1 ? e.nombre : "Grupo"}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.miembros.map((m) => nombrePersona(personas, m)).join(", ")}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="lg" className="h-12 self-start text-base" onClick={() => setEditandoNombres(true)}>
              <UsersIcon /> Poner nombres (opcional)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Modo y misión</CardTitle>
            <CardDescription>
              {modo === "light"
                ? "Light: sin puntos, todo el grupo a por la misma misión"
                : "Concurso: cada equipo suma puntos, pero la misión sigue siendo común"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ToggleGroup type="single" variant="outline" spacing={2} aria-label="Modo"
              value={modo} onValueChange={(v) => v && setModo(v as Modo)}>
              <ToggleGroupItem value="light" className={opcion}>Light</ToggleGroupItem>
              <ToggleGroupItem value="concurso" className={opcion}>Concurso</ToggleGroupItem>
            </ToggleGroup>
            <div className="flex flex-col gap-2">
              <Label className="text-base">Paneles de la misión</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={2}
                aria-label="Paneles de la misión"
              value={String(numPaneles)}
                onValueChange={(v) => v && setNumPaneles(Number(v))}
              >
                {OPCIONES_PANELES.map((n) => (
                  <ToggleGroupItem key={n} value={String(n)} className={opcion}>
                    {n}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-sm text-muted-foreground">
                {disponibles === 0
                  ? "No hay paneles para esta combinación de nivel, fase y temáticas."
                  : disponibles < numPaneles
                    ? `Solo hay ${disponibles} paneles disponibles con esta selección; se jugarán todos.`
                    : `${disponibles} paneles disponibles con esta selección.`}
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
