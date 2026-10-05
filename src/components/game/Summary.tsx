import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Estado } from "@/lib/game";
import { nombrePersona } from "@/lib/turns";
import { COLOR_EQUIPO } from "./colores";

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

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Misión completada</CardTitle>
          <CardDescription className="text-lg">
            El grupo ha resuelto {resueltos} de {total} paneles
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Progress value={(resueltos / Math.max(1, total)) * 100} className="h-4" />
          <Table className="text-lg">
            <TableHeader>
              <TableRow>
                <TableHead>Persona</TableHead>
                {conEquipos && <TableHead>Equipo</TableHead>}
                <TableHead className="text-right">Jugadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estado.equipos.flatMap((e, i) =>
                e.miembros.map((m) => (
                  <TableRow key={m}>
                    <TableCell>{nombrePersona(estado.sesion.personas, m)}</TableCell>
                    {conEquipos && (
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <span className="size-3 rounded-full" style={{ background: COLOR_EQUIPO[i] }} />
                          {e.nombre}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-right tabular-nums">{estado.participaciones[m]}</TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
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
