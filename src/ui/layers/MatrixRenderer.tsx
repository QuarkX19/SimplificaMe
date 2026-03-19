/**
 * SIMPLIFICAME · MatrixRenderer (Neuro Code Style - Premium Refactor)
 * Renderiza campos de capa con alto valor estético, glassmorphism y feedback activo.
 */

import React, { useState } from 'react';
import type { MatrixField } from '../../core/methodology/methodology.engine';

interface Props {
  fields:    MatrixField[];
  values:    Record<string, string>;
  onChange:  (key: string, value: string) => void;
  disabled?: boolean;
}

// ─── Diseño Constantes ───────────────────────────────────────────────────────
const T = {
  cyan:      '#00E5FF',
  cyanGlow:  'rgba(0,229,255,0.3)',
  cyanRing:  'rgba(0,229,255,0.15)',
  text:      '#F1F5F9',
  textMid:   '#94A3B8',
  textDim:   '#475569',
  bgInput:   'rgba(255,255,255,0.03)',
  border:    'rgba(255,255,255,0.08)',
  green:     '#00E676',
};

export const MatrixRenderer: React.FC<Props> = ({ fields, values, onChange, disabled = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
    {fields.map(f => (
      <Field key={f.key} field={f} value={values[f.key] ?? ''} onChange={v => onChange(f.key, v)} disabled={disabled} />
    ))}
  </div>
);

// ─── Componente Input Individual ──────────────────────────────────────────────
const Field: React.FC<{
  field:    MatrixField;
  value:    string;
  onChange: (v: string) => void;
  disabled: boolean;
}> = ({ field, value, onChange, disabled }) => {

  const [focused, setFocused] = useState(false);
  const minChars = field.minChars ?? 10;
  const filled   = value.trim().length >= minChars;

  const accentColor = filled ? T.green : focused ? T.cyan : T.textDim;
  const borderColor = filled ? 'rgba(0,230,118,0.4)' : focused ? T.cyan : T.border;
  const shadow      = focused ? `0 0 0 4px ${T.cyanRing}` : 'none';

  return (
    <div style={{ position: 'relative', animation: 'fadeIn 0.5s ease both' }}>
      {/* Etiqueta Superior */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingLeft: 4 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: accentColor,
          boxShadow: `0 0 10px ${accentColor}`,
          transition: 'all 0.3s ease',
        }} />
        <label style={{
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em',
          color: filled ? T.text : T.textMid, transition: 'color 0.3s',
        }}>
          {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        
        {/* Indicador de Progreso */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {filled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)' }}>
               <span style={{ fontSize: 9, fontWeight: 900, color: T.green, letterSpacing: '0.1em' }}>✓ COMPLETADO</span>
            </div>
          ) : (
             field.required && value.trim().length > 0 && (
               <span style={{ fontSize: 10, fontWeight: 600, color: T.textDim, letterSpacing: '0.1em' }}>
                 {value.trim().length} / {minChars}
               </span>
             )
          )}
        </div>
      </div>

      {/* Contenedor del Input */}
      <div style={{ position: 'relative' }}>
        {field.type === 'textarea' ? (
          <textarea
            disabled={disabled}
            placeholder={field.placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={5}
            style={{
              width: '100%', minHeight: 120, resize: 'vertical',
              background: T.bgInput, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              border: `1.5px solid ${borderColor}`, borderRadius: 16,
              padding: '20px 24px', fontSize: 15, color: T.text, outline: 'none',
              boxShadow: shadow, transition: 'all 0.3s ease',
              lineHeight: 1.6, boxSizing: 'border-box' as const
            }}
          />
        ) : (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            disabled={disabled}
            placeholder={field.placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            min={field.type === 'number' ? 0 : undefined}
            max={field.type === 'number' ? 100 : undefined}
            style={{
              width: '100%',
              background: T.bgInput, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              border: `1.5px solid ${borderColor}`, borderRadius: 16,
              padding: '18px 24px', fontSize: 15, color: T.text, outline: 'none',
              boxShadow: shadow, transition: 'all 0.3s ease', boxSizing: 'border-box' as const
            }}
          />
        )}
      </div>

      {/* Hint / Pista Estratégica */}
      {field.hint && !filled && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingLeft: 16, opacity: 0.8 }}>
          <span style={{ color: T.cyan, fontSize: 12 }}>↳</span>
          <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.5, margin: 0 }}>
            {field.hint}
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};
