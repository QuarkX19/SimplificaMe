import { useState, useCallback } from 'react';
import { getAuronResponse } from '../services/api/geminiService';
import { useMethodology } from './useMethodology';
import { InterrelationEngine, InterrelationContext } from '../core/methodology/interrelation.engine';

export type AFSEStatus = 'idle' | 'active' | 'complete';

export interface LayerState {
  id: number;
  status: AFSEStatus;
  score?: number;
  messages: Array<{ role: 'user' | 'auron', text: string, timestamp: string, advance?: boolean }>;
  context?: InterrelationContext | null; // Context from L1
}

export function useAuronLayer(userId: string, companyName: string) {
  const { layers: metaLayers, getLayer: getLayerMeta } = useMethodology();

  const [layers, setLayers] = useState<LayerState[]>(
    metaLayers.map((l, i) => ({
      id: l.id,
      status: i === 0 ? 'active' : 'idle',
      messages: []
    }))
  );

  const [activeLayerId, setActiveLayerId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Derivations
  const activeLayer = layers.find(l => l.id === activeLayerId);
  const activeLayerMeta = getLayerMeta(activeLayerId) || metaLayers[0];
  const validScores = layers.filter(l => l.score !== undefined);
  const afseScore = validScores.length ? validScores.reduce((acc, l) => acc + (l.score || 0), 0) / validScores.length : 0;

  const loadLayerContext = useCallback((targetLayerId: number) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const targetIndex = newLayers.findIndex(l => l.id === targetLayerId);
      if (targetIndex === -1) return prev;

      if (targetLayerId > 1 && newLayers[targetIndex].messages.length === 0) {
        const prevLayer = newLayers.find(l => l.id === targetLayerId - 1);
        if (prevLayer && prevLayer.status === 'complete') {
          const context = InterrelationEngine.extractInsightsFromLayer(prevLayer.id, prevLayer.messages);
          if (context) {
            newLayers[targetIndex].context = context;
          }
        }
      }
      return newLayers;
    });
  }, []);

  const goToLayer = (id: number) => {
    const layer = layers.find(l => l.id === id);
    if (layer && layer.status !== 'idle') {
      setActiveLayerId(id);
      loadLayerContext(id);
    }
  };

  const advanceLayer = (id: number) => {
    setLayers(prev => {
      const nextId = id + 1;
      return prev.map(l => {
        if (l.id === id) return { ...l, status: 'complete', score: l.score || 85 };
        if (l.id === nextId) {
          if (l.status === 'idle') {
            setTimeout(() => {
              setActiveLayerId(nextId);
              loadLayerContext(nextId);
            }, 500);
            return { ...l, status: 'active' };
          }
        }
        return l;
      });
    });
  };

  const sendMessage = async (text: string) => {
    if (!activeLayer || sending) return;
    setSending(true);

    const userMsg = { role: 'user' as const, text, timestamp: new Date().toISOString() };
    
    setLayers(prev => prev.map(l => 
      l.id === activeLayerId 
        ? { ...l, messages: [...l.messages, userMsg] }
        : l
    ));

    try {
      const history = activeLayer.messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }] as [{ text: string }] 
      }));

      let systemPrompt = `Eres AURON, guiando en la capa ${activeLayerMeta.name} (${activeLayerMeta.code}). Objetivo: ${activeLayerMeta.objective}. Empresa: ${companyName}.
Responde breve, directo. Si el usuario ha terminado, di 'capa completada'.`;

      if (activeLayer.context) {
        systemPrompt = InterrelationEngine.buildPromptWithContext(systemPrompt, activeLayer.context);
      }

      const rawResponse = await getAuronResponse(text, { systemPrompt, history });
      const responseText = rawResponse || 'Hubo un error.';

      const isAdvancing = responseText.toLowerCase().includes('completada') || responseText.toLowerCase().includes('avanzada');

      const auronMsg = { 
        role: 'auron' as const, 
        text: responseText, 
        timestamp: new Date().toISOString(),
        advance: isAdvancing 
      };

      setLayers(prev => prev.map(l => 
        l.id === activeLayerId 
          ? { ...l, messages: [...l.messages, auronMsg] }
          : l
      ));

      if (isAdvancing) {
        advanceLayer(activeLayerId);
      }

    } catch (error) {
      console.error(error);
      const errorMsg = { role: 'auron' as const, text: 'No pude procesar la capa.', timestamp: new Date().toISOString() };
      setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, messages: [...l.messages, errorMsg] } : l));
    } finally {
      setSending(false);
    }
  };

  return {
    afseScore: Math.round(afseScore),
    loading, sending,
    layers, activeLayerId, activeLayer, activeLayerMeta,
    sendMessage, goToLayer, advanceLayer
  };
}
