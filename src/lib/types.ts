export type NivelId = "facil" | "moderado" | "dificil";
export type Modo = "light" | "concurso";

export interface Panel {
  id: string;
  tema: string;
  frase: string;
  pista: string;
  nivel: NivelId;
  fase: number;
  ayuda?: string;
}

export interface Tema {
  id: string;
  nombre: string;
  icono?: string;
  /** nº de paneles por nivel, para mostrarlo en la configuración */
  paneles: Record<NivelId, number>;
}

export interface Nivel {
  id: NivelId;
  nombre: string;
  descripcion?: string;
  /** "vocales", "ninguna" o una lista de letras, p. ej. "AEL" */
  letrasReveladas: string;
  ayudasPorPanel: number;
  fases: number[];
}
