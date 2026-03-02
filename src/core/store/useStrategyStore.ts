// src/core/store/useStrategyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ✅ IDs tipados para evitar typos en tiempo de compilación
export type GerenciaId = 'OPER' | 'FIN' | 'RRHH' | 'TECH' | 'COME' | 'SOST';

export interface KpiCritico {
  nombre: string;
  valor: number;
  meta: number;
  tendencia: 'up' | 'down';
}

export interface Gerencia {
  id: GerenciaId;
  nombre: string;
  capaActual: number;
  progreso: number; // 0 a 100
  kpiCritico: KpiCritico;
  alertas: string[];
}

interface StrategyState {
  proyectoName: string;
  gerencias: Gerencia[];
  // Acciones
  updateGerencia: (id: GerenciaId, data: Partial<Omit<Gerencia, 'id'>>) => void;
  addAlerta: (id: GerenciaId, alerta: string) => void;
  removeAlerta: (id: GerenciaId, index: number) => void;
  resetStore: () => void;
}

// ✅ Estado inicial extraído para poder usarlo en resetStore
const initialGerencias: Gerencia[] = [
  {
    id: 'OPER',
    nombre: 'Operaciones y Logística',
    capaActual: 7,
    progreso: 85,
    kpiCritico: {
      nombre: 'Costo x KM',
      valor: 1.25,
      meta: 1.10,
      tendencia: 'up',
    },
    alertas: ['Desviación en combustible detectada por ERP'],
  },
  {
    id: 'FIN',
    nombre: 'Administración y Finanzas',
    capaActual: 4,
    progreso: 100,
    kpiCritico: {
      nombre: 'EBITDA',
      valor: 18,
      meta: 15,
      tendencia: 'up',
    },
    alertas: [],
  },
];

const initialState = {
  proyectoName: 'ZAM Group - Consolidado 2026',
  gerencias: initialGerencias,
};

// ✅ totalEjecucion como selector derivado (siempre sincronizado)
export const useTotalEjecucion = () =>
  useStrategyStore((state) =>
    state.gerencias.length === 0
      ? 0
      : Math.round(
          state.gerencias.reduce((acc, g) => acc + g.progreso, 0) /
            state.gerencias.length
        )
  );

// ✅ Selector de alertas activas totales
export const useTotalAlertas = () =>
  useStrategyStore((state) =>
    state.gerencias.reduce((acc, g) => acc + g.alertas.length, 0)
  );

// ✅ Selector de gerencia individual por id
export const useGerencia = (id: GerenciaId) =>
  useStrategyStore((state) => state.gerencias.find((g) => g.id === id));

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ✅ updateGerencia con validación de existencia
      updateGerencia: (id, data) => {
        const existe = get().gerencias.some((g) => g.id === id);
        if (!existe) {
          console.warn(`[useStrategyStore] Gerencia con id "${id}" no encontrada.`);
          return;
        }
        set((state) => ({
          gerencias: state.gerencias.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        }));
      },

      // ✅ Acción específica para agregar alerta
      addAlerta: (id, alerta) => {
        const existe = get().gerencias.some((g) => g.id === id);
        if (!existe) {
          console.warn(`[useStrategyStore] Gerencia con id "${id}" no encontrada.`);
          return;
        }
        set((state) => ({
          gerencias: state.gerencias.map((g) =>
            g.id === id ? { ...g, alertas: [...g.alertas, alerta] } : g
          ),
        }));
      },

      // ✅ Acción específica para remover alerta por índice
      removeAlerta: (id, index) => {
        set((state) => ({
          gerencias: state.gerencias.map((g) =>
            g.id === id
              ? { ...g, alertas: g.alertas.filter((_, i) => i !== index) }
              : g
          ),
        }));
      },

      // ✅ Reset completo al estado inicial
      resetStore: () => set(initialState),
    }),
    {
      name: 'strategy-storage', // clave en localStorage
      // ✅ Solo persiste datos, no las funciones
      partialize: (state) => ({
        proyectoName: state.proyectoName,
        gerencias: state.gerencias,
      }),
    }
  )
);