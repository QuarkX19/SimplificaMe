// ✅ Tipo para campos conocidos (ajusta según tu metodología real)
export type FieldName =
  | "Objetivo" | "KPI" | "Responsable"
  | "Plazo" | "Presupuesto" | "Estado" | "Riesgo";

export type OutputType =
  | "Informe" | "Dashboard" | "Plan" | "Acta" | "KPI" | "Reporte";

// ✅ Base única para matrices
export interface BaseMatrix {
  id: string;
  name: string; // ✅ requerido
  fields: FieldName[];
}

// ✅ Matrix principal (sin cambios estructurales)
export type Matrix = BaseMatrix;

// ✅ SubMatrix con diferencia semántica real
export interface SubMatrix extends BaseMatrix {
  parentMatrixId?: string;
}

export interface Layer {
  id: number;
  code: `L${number}`;        // ✅ formato validado: "L1", "L2"...
  name: string;
  objective: string;
  mainMatrix: Matrix;
  subMatrices?: SubMatrix[];
  outputs: OutputType[];     // ✅ outputs tipados
  kpisEnabled?: boolean;
  unlocks: number[];
}

export interface Methodology {
  name: string;
  version: `${number}.${number}.${number}`; // ✅ semver: "1.0.0"
  language: string;
  loop: boolean;
  layers: Layer[];
}