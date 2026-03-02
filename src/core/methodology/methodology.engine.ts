import { methodology } from './methodology.v1';
import { Layer, Methodology } from './methodology.types';

const data: Methodology = methodology;

export function getLayerById(id: number): Layer | undefined {
  return data?.layers?.find(l => l.id === id);
}

export function getAllLayers(): Layer[] {
  return data?.layers ?? [];
}

export function getUnlockedLayers(currentLayerId: number): number[] {
  const layer = getLayerById(currentLayerId);
  if (!layer) {
    console.warn(`[getUnlockedLayers] Capa ${currentLayerId} no encontrada.`);
    return [];
  }
  return layer.unlocks ?? [];
}

// ✅ Bonus: navegación secuencial
export function getNextLayer(currentLayerId: number): Layer | undefined {
  return getLayerById(currentLayerId + 1);
}

// ✅ Bonus: capas desbloqueadas como objetos Layer completos
export function getUnlockedLayerObjects(currentLayerId: number): Layer[] {
  return getUnlockedLayers(currentLayerId)
    .map(id => getLayerById(id))
    .filter((l): l is Layer => l !== undefined);
}