// src/ui/layers/MatrixRenderer.tsx
import React from "react";

interface Props {
  fields: string[];
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const formatLabel = (field: string): string =>
  field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const MatrixRenderer: React.FC<Props> = ({ fields, values, onChange }) => {
  return (
    <div className="grid gap-4">
      {fields.map((field) => {
        const isFilled = values[field]?.trim().length > 0;

        return (
          <div key={field} className="flex flex-col gap-2">

            {/* ✅ Label formateado */}
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              {/* ✅ Indicador visual de completitud */}
              <span className={`w-1.5 h-1.5 rounded-full ${isFilled ? 'bg-[#00ffff]' : 'bg-slate-700'}`} />
              {formatLabel(field)}
            </label>

            {/* ✅ Input editable */}
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
  );
};