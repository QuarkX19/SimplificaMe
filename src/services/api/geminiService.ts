// src/services/api/geminiService.ts
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('[geminiService] VITE_GEMINI_API_KEY no está definida en .env.local');
}

const ai = new GoogleGenAI({ apiKey });

export const getAuronResponse = async (
  userPrompt: string,
  systemInstruction: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // ✅ modelo real
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // ✅ response.text() es un método en el SDK moderno
    return response.text() || "No se pudo obtener respuesta del Cerebro Cognitivo.";

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[geminiService]', error.message);
      if (error.message.includes('403') || error.message.includes('API_KEY')) {
        return "Error de autenticación con Auron. Verifica la clave API.";
      }
      if (error.message.includes('404')) {
        return "Modelo no disponible. Contacta al administrador.";
      }
    }
    return "Error de enlace con Auron. Reintente en unos momentos.";
  }
};