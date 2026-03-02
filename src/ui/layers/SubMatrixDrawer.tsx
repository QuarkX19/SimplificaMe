// src/ui/layers/SubMatrixDrawer.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SubMatrix } from "@/core/methodology/methodology.types";

interface Props {
  subMatrix: SubMatrix;
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const formatLabel = (field: string): string =>
  field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const SubMatrixDrawer: React.FC<Props> = ({ subMatrix, values, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filledCount = subMatrix.fields.filter(f => values[f]?.trim().length > 0).length;
  const totalCount = subMatrix.fields.length;
  const isComplete = filledCount === totalCount;

  return (
    <section className="border border-cyan-400/20 rounded-2xl bg-black/30 overflow-hidden">

      {/* ✅ Header con toggle */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* ✅ Indicador de completitud */}
          <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-[#00ffff]' : 'bg-slate-700'}`} />
          <h4 className="text-cyan-300 font-bold uppercase tracking-widest text-sm">
            {subMatrix.name ?? subMatrix.id} {/* ✅ fallback */}
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-bold tracking-widest">
            {filledCount}/{totalCount}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* ✅ Contenido colapsable */}
      {isOpen && (
        <div className="px-6 pb-6 grid gap-4 border-t border-white/5 pt-4">
          {subMatrix.fields.map((field) => {
            const isFilled = values[field]?.trim().length > 0;
            return (
              <div key={field} className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isFilled ? 'bg-[#00ffff]' : 'bg-slate-700'}`} />
                  {formatLabel(field)}
                </label>
                <textarea
                  value={values[field] ?? ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  placeholder={`Ingresa ${formatLabel(field).toLowerCase()}...`}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border bg-black/40 text-cyan-200 text-sm
                    tracking-wide outline-none resize-none transition-all duration-300
                    placeholder:text-slate-700 placeholder:text-xs
                    ${isFilled
                      ? 'border-[#00ffff]/50 shadow-[0_0_10px_rgba(0,255,255,0.05)]'
                      : 'border-white/5 focus:border-[#00ffff]/30'
                    }`}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};