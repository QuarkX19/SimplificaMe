/**
 * UI COMPONENT: LayerRenderer
 * ROLE: Orquestador visual de la capa activa.
 * STYLE: AFSE Strategic High-Contrast.
 */

import React from "react";
import { Layer } from "@/core/methodology/methodology.types";
import { MatrixRenderer } from "./MatrixRenderer";
import { SubMatrixDrawer } from "./SubMatrixDrawer";

interface Props {
  layer: Layer;
  values: Record<string, string>;                          // ✅ datos actuales
  onChange: (field: string, value: string) => void;        // ✅ handler de cambio
}

export const LayerRenderer: React.FC<Props> = ({ layer, values, onChange }) => {
  return (
    <div
      className="space-y-10"
      style={{ animation: 'fadeSlideIn 0.7s ease forwards' }} // ✅ sin dependencia de plugin
    >
      {/* HEADER */}
      <header className="border-l-4 border-[#00ffff] pl-6 py-2">
        <p className="text-[10px] text-[#00ffff]/50 font-black tracking-[0.5em] uppercase mb-1">
          {layer.code}
        </p>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
          {layer.name} {/* ✅ nombre completo */}
        </h2>
        <p className="text-slate-400 mt-3 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
          {layer.objective}
        </p>
      </header>

      {/* MATRIZ PRINCIPAL */}
      <section className="bg-black/40 border border-[#00ffff]/10 p-8 rounded-[3rem] shadow-inner">
        <h3 className="text-white font-black uppercase mb-6 tracking-widest text-xs flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00ffff] rounded-full animate-pulse" />
          {layer.mainMatrix.name}
        </h3>
        {/* ✅ values y onChange conectados */}
        <MatrixRenderer
          fields={layer.mainMatrix.fields}
          values={values}
          onChange={onChange}
        />
      </section>

      {/* SUB-MATRICES */}
      {layer.subMatrices && layer.subMatrices.length > 0 && (
        <div className="grid grid-cols-1 gap-8">
          {layer.subMatrices.map((sub) => (
            <SubMatrixDrawer key={sub.id} subMatrix={sub} />
          ))}
        </div>
      )}
    </div>
  );
};