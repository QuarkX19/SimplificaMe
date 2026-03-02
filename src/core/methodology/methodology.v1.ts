import { Methodology } from './methodology.types';

export const methodology: Methodology = {
  name: "SimplificaME – Metodología Estratégica de 8 Capas",
  version: "1.0.0",
  language: "es",
  loop: true,
  layers: [
    {
      id: 1,
      code: "ENTENDER",
      name: "Entender el Contexto",
      objective: "Comprender el contexto organizacional, actores, restricciones y expectativas.",
      mainMatrix: {
        id: "context_matrix",
        name: "Matriz de Contexto Estratégico",
        fields: ["problema_central", "alcance", "horizonte_estrategico", "restricciones", "supuestos"]
      },
      subMatrices: [
        { id: "stakeholders", name: "Mapa de Stakeholders", fields: ["actor", "interes", "poder", "expectativa"] },
        { id: "needs_pains", name: "Necesidades y Dolencias", fields: ["stakeholder", "necesidad", "dolencia"] }
      ],
      kpisEnabled: false,
      outputs: ["contexto_validado", "stakeholders_priorizados"],
      unlocks: [2]
    },
    {
      id: 2,
      code: "DIAGNOSTICAR",
      name: "Diagnóstico Integral",
      objective: "Identificar la situación actual mediante análisis interno y externo.",
      mainMatrix: {
        id: "diagnostic_matrix",
        name: "Matriz Diagnóstica Integral",
        fields: ["dimension", "hallazgo", "impacto", "riesgo", "prioridad"]
      },
      subMatrices: [
        { id: "foda", name: "FODA Cruzado", fields: ["fortaleza", "oportunidad", "debilidad", "amenaza"] },
        { id: "pestel", name: "Análisis PESTEL", fields: ["factor", "descripcion", "impacto"] }
      ],
      kpisEnabled: true,
      outputs: ["brechas_priorizadas", "riesgos_criticos"],
      unlocks: [3]
    },
    {
      id: 3,
      code: "RUMBO",
      name: "Direccionamiento Estratégico",
      objective: "Definir el rumbo estratégico de la organización.",
      mainMatrix: {
        id: "strategy_matrix",
        name: "Matriz de Direccionamiento",
        fields: ["proposito", "vision", "objetivo_estrategico", "eje_estrategico"]
      },
      kpisEnabled: false,
      outputs: ["objetivos_estrategicos_definidos"],
      unlocks: [4]
    },
    {
      id: 4,
      code: "BSC",
      name: "Balanced Scorecard",
      objective: "Traducir la estrategia en indicadores medibles.",
      mainMatrix: {
        id: "bsc_matrix",
        name: "Balanced Scorecard",
        fields: ["perspectiva", "objetivo", "indicador", "meta", "responsable"]
      },
      kpisEnabled: true, // ✅ agregado
      outputs: ["kpis_definidos"],
      unlocks: [5]
    },
    {
      id: 5,
      code: "CMI",
      name: "Cuadro de Mando Integral",
      objective: "Analizar la relación causa–efecto entre objetivos.",
      mainMatrix: {
        id: "strategy_map",
        name: "Mapa Estratégico Causa-Efecto",
        fields: ["objetivo_origen", "objetivo_destino", "tipo_relacion"]
      },
      kpisEnabled: false,
      outputs: ["mapa_estrategico"],
      unlocks: [6]
    },
    {
      id: 6,
      code: "ACCIONAR",
      name: "Plan de Acción Estratégico",
      objective: "Ejecutar la estrategia mediante iniciativas.",
      mainMatrix: {
        id: "action_plan",
        name: "Plan Estratégico de Acción",
        fields: ["iniciativa", "objetivo_asociado", "responsable", "fecha_inicio", "fecha_fin"]
      },
      kpisEnabled: false,
      outputs: ["plan_aprobado"],
      unlocks: [7]
    },
    {
      id: 7,
      code: "ACOMPANAR",
      name: "Seguimiento y Control",
      objective: "Monitorear la ejecución y evidencias.",
      mainMatrix: {
        id: "tracking_matrix",
        name: "Matriz de Seguimiento",
        fields: ["iniciativa", "avance", "semaforo", "evidencia"]
      },
      kpisEnabled: true, // ✅ agregado
      outputs: ["ejecucion_controlada"],
      unlocks: [8]
    },
    {
      id: 8,
      code: "MEJORAR",
      name: "Mejora Continua",
      objective: "Ajustar y mejorar la estrategia con base en resultados. Al completar esta capa, el ciclo reinicia desde la Capa 1.",
      mainMatrix: {
        id: "improvement_matrix",
        name: "Matriz de Mejora Continua",
        fields: ["leccion_aprendida", "ajuste_propuesto", "impacto"]
      },
      kpisEnabled: false,
      outputs: ["nueva_iteracion"],
      unlocks: [1]
    }
  ]
};