const { getLayerById } = useMethodology();
const activeLayer = getLayerById(activeLayerId);
import React, { useState } from "react";
import { useMethodology } from "@/hooks/useMethodology";
import { LayerRenderer } from "@/ui/layers/LayerRenderer";

export const LayersView: React.FC = () => {
  const { getLayer } = useMethodology();

  const [activeLayerId] = useState<number>(1);

  const activeLayer = getLayer(activeLayerId);

  if (!activeLayer) {
    return (
      <div className="text-red-500 font-bold text-xl p-10">
        ❌ Capa no encontrada
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 text-white">
      <LayerRenderer layer={activeLayer} />
    </main>
  );
};
