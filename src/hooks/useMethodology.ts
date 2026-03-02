// src/hooks/useMethodology.ts
import { useMemo } from 'react';
import { methodology } from '../core/methodology/methodology.v1';
import { Layer } from '../core/methodology/methodology.types';

export function useMethodology() {
  // ✅ Map indexado por id para O(1) lookup
  const layerMap = useMemo(() => {
    const map = new Map<number, Layer>();
    methodology.layers.forEach((layer) => map.set(layer.id, layer));
    return map;
  }, []);

  const layers: Layer[] = methodology.layers;

  // ✅ Obtener capa por id
  const getLayer = (id: number): Layer | undefined =>
    layerMap.get(id);

  // ✅ Obtener nombre legible de la capa
  const getLabel = (id: number): string =>
    layerMap.get(id)?.name ?? `Capa ${id}`;

  // ✅ Obtener código de la capa (ENTENDER, BSC, etc.)
  const getCode = (id: number): string =>
    layerMap.get(id)?.code ?? `L${id}`;

  // ✅ Verificar si la capa tiene KPIs habilitados
  const hasKPIs = (id: number): boolean =>
    layerMap.get(id)?.kpisEnabled ?? false;

  // ✅ Verificar si una capa está desbloqueada desde otra
  const isUnlocked = (fromId: number, targetId: number): boolean =>
    layerMap.get(fromId)?.unlocks.includes(targetId) ?? false;

  // ✅ Obtener todas las capas con KPIs activos
  const kpiLayers = useMemo(
    () => layers.filter((l) => l.kpisEnabled),
    [layers]
  );

  return {
    methodology,
    layers,
    kpiLayers,
    getLayer,
    getLabel,
    getCode,
    hasKPIs,
    isUnlocked,
  };
}
