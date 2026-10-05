import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { celebrarMision } from "@/lib/celebrar";
import type { Estado } from "@/lib/game";
import { nombrePersona } from "@/lib/turns";
import { COLOR_EQUIPO } from "./colores";

const FILAS_POR_COLUMNA = 5;

interface Props {
  estado: Estado;
  onOtraRonda: () => void;
  onNuevaSesion: () => void;
}

export function Summary({ estado, onOtraRonda, onNuevaSesion }: Props) {
  const total = estado.resultados.length;
  const resueltos = estado.resultados.filter((r) => r === "resuelto").length;
  const concurso = estado.sesion.modo === "concurso";
  const conEquipos = estado.equipos.length > 1;

  useEffect(() => {
    if (resueltos > 0) celebrarMision();
  }, [resueltos]);
  const columnas = estado.equipos.flatMap((e, i) => {
    const trozos = Math.ceil(e.miembros.length / FILAS_POR_COLUMNA);
    const tam = Math.ceil(e.miembros.length / trozos);
    return Array.from({ length: trozos }, (_, t) => ({ equipo: i, miembros: e.miembros.slice(t * tam, (t + 1) * tam) }));
  });

  return (
    <main className="mx-auto flex h-dvh max-w-7xl flex-col justify-center overflow-hidden p-6">
      <Card className="max-h-full min-h-0">
        <CardHeader>
          <CardTitle className="text-3xl">Misión completada</CardTitle>
          <CardDescription className="text-lg">
            El grupo ha resuelto {resueltos} de {total} paneles
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-col gap-6">
          <Progress value={(resueltos / Math.max(1, total)) * 100} className="h-4" />
          {/* Participación: una columna por equipo (en trozos de 5 filas) para que todo quepa en una pantalla */}
          <div className="grid min-h-0 auto-cols-fr grid-flow-col gap-4">
            {columnas.map(({ equipo, miembros }, c) => (
              <Table key={c}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base">
                      <span className="inline-flex items-center gap-2">
                        {conEquipos && (
                          <span className="size-3 rounded-full" style={{ background: COLOR_EQUIPO[equipo] }} />
                        )}
                        {conEquipos ? estado.equipos[equipo].nombre : "Persona"}
                      </span>
                    </TableHead>
                    <TableHead className="text-right text-base">Jugadas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {miembros.map((m) => (
                    <TableRow key={m}>
                      <TableCell className="text-lg">{nombrePersona(estado.sesion.personas, m)}</TableCell>
                      <TableCell className="text-right text-lg tabular-nums">{estado.participaciones[m]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}
          </div>
          {concurso && (
            <div className="flex flex-wrap gap-2">
              {estado.equipos.map((e, i) => (
                <Badge key={e.numero} variant="secondary" className="gap-2 px-4 py-2 text-lg">
                  <span className="size-3 rounded-full" style={{ background: COLOR_EQUIPO[i] }} />
                  {conEquipos ? e.nombre : "Grupo"}: {estado.puntos[i]} {estado.puntos[i] === 1 ? "punto" : "puntos"}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg" onClick={onNuevaSesion}>
            Nueva sesión
          </Button>
          <Button size="lg" className="h-14 px-8 text-lg" onClick={onOtraRonda}>
            Otra ronda
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
