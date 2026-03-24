// src/core/methodology/interrelation.engine.ts

export interface InterrelationContext {
  previousLayerId: number;
  extractedInsights: string;
  injectedAt: string;
}

export class InterrelationEngine {
  /**
   * Resume el historial de la capa anterior para inyectarlo en la actual.
   * En un flujo corporativo real, esto podría usar Supabase Vector Search, pero
   * para este MVP, destila la conversación anterior y la pasa al nuevo prompt.
   */
  static extractInsightsFromLayer(layerId: number, messages: any[]): InterrelationContext | null {
    if (!messages || messages.length === 0) return null;

    // Tomar las últimas participaciones del usuario y Auron
    const userInputs = messages.filter(m => m.role === 'user').map(m => m.text).join(' | ');
    const auronOutputs = messages.filter(m => m.role === 'auron').map(m => m.text).join(' | ');

    // Limitar longitud para evitar desbordar el contexto
    const insights = `
--- RESUMEN DE COMPROBACIÓN (L${layerId}) ---
USER DIJO: ${userInputs.substring(0, 800)}...
AURON RESPONDIÓ: ${auronOutputs.substring(0, 800)}...
---------------------------------------------
    `.trim();

    return {
      previousLayerId: layerId,
      extractedInsights: insights,
      injectedAt: new Date().toISOString()
    };
  }

  static buildPromptWithContext(basePrompt: string, context?: InterrelationContext | null): string {
    if (!context) return basePrompt;
    return `${basePrompt}\n\n[SISTEMA INTERRELACIÓN AFSE - PRIORIDAD MÁXIMA]:\nEl usuario viene de completar la capa ${context.previousLayerId}. Aquí tienes todo el contexto para que NO le preguntes cosas que ya dijo:\n${context.extractedInsights}\nActúa basado en este conocimiento heredado.`;
  }
}
