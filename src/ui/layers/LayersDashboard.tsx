/**
 * ARQUITECTURA ME — Neuro Code Style
 * LayersDashboard.tsx — Dashboard AFSE completo para pilotos
 * Chat · Navegación · Score · Persistencia
 * v3.0 — Dark/Light/Auto
 * ARCHITECT: Luis Reinaldo Ruiz Sarmiento
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuronLayer, AFSEStatus } from '../../hooks/useAuronLayer';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;900&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  :root {
    --bg:#F8FAFC;--bg2:#FFFFFF;--bg3:#F1F5F9;
    --border:rgba(0,0,0,0.07);--border2:rgba(0,0,0,0.12);
    --text:#0F172A;--textMid:#475569;--textDim:#94A3B8;
    --cyan:#0099CC;--cyan-bg:rgba(0,153,204,0.08);--cyan-dim:rgba(0,153,204,0.15);
    --green:#00875A;--green-bg:rgba(0,135,90,0.08);
    --orange:#D97706;--red:#DC2626;
    --card-idle:rgba(0,0,0,0.02);--card-active:rgba(0,153,204,0.06);--card-done:rgba(0,135,90,0.06);
    --num-color:rgba(0,0,0,0.05);
    --sh-active:0 8px 32px rgba(0,153,204,0.14);
    --auron-user:rgba(0,153,204,0.10);--auron-bot:rgba(0,0,0,0.04);
  }
  @media(prefers-color-scheme:dark){:root{
    --bg:#06090F;--bg2:#0A0E18;--bg3:#0F1420;
    --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.10);
    --text:#F1F5F9;--textMid:#94A3B8;--textDim:#475569;
    --cyan:#00E5FF;--cyan-bg:rgba(0,229,255,0.08);--cyan-dim:rgba(0,229,255,0.15);
    --green:#00E676;--green-bg:rgba(0,230,118,0.08);
    --orange:#F59E0B;--red:#FF3D57;
    --card-idle:rgba(255,255,255,0.02);--card-active:rgba(0,229,255,0.06);--card-done:rgba(0,230,118,0.06);
    --num-color:rgba(255,255,255,0.04);
    --sh-active:0 8px 40px rgba(0,229,255,0.14);
    --auron-user:rgba(0,229,255,0.10);--auron-bot:rgba(255,255,255,0.04);
  }}
  @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes thinking{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}
  @keyframes spin{to{transform:rotate(360deg)}}

  *{box-sizing:border-box;margin:0;padding:0}
  .ld{display:flex;height:100vh;overflow:hidden;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif}

  .ld-side{width:68px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:6px;overflow-y:auto}
  .ld-logo{width:38px;height:38px;border-radius:11px;background:var(--cyan-bg);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;color:var(--cyan);font-family:'Syne',sans-serif;font-size:13px;font-weight:900;margin-bottom:12px;flex-shrink:0}
  .ld-sb-btn{width:46px;height:46px;border-radius:13px;border:1px solid var(--border);background:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:all 0.18s;color:var(--textDim);flex-shrink:0}
  .ld-sb-btn:hover{background:var(--bg3);border-color:var(--border2)}
  .ld-sb-btn.sb-active{background:var(--cyan-bg);border-color:var(--cyan);color:var(--cyan);box-shadow:var(--sh-active)}
  .ld-sb-btn.sb-done{background:var(--green-bg);border-color:var(--green);color:var(--green)}
  .ld-sb-btn.sb-idle{opacity:0.35;cursor:not-allowed}
  .sb-num{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;line-height:1}
  .sb-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
  .sb-active .sb-dot{animation:pulse 1.4s ease-in-out infinite}

  .ld-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

  .ld-top{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--border);background:var(--bg2);flex-shrink:0;gap:12px}
  .ld-top-l{display:flex;flex-direction:column;gap:2px;min-width:0}
  .ld-tag{font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:var(--textDim)}
  .ld-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:900;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ld-title .acc{color:var(--cyan)}
  .ld-top-r{display:flex;align-items:center;gap:10px;flex-shrink:0}
  .ld-spill{display:flex;align-items:center;gap:5px;padding:4px 11px;border-radius:100px;background:var(--cyan-bg);border:1px solid var(--border2);font-size:12px;font-weight:700;color:var(--cyan)}
  .ld-spill-dot{width:5px;height:5px;border-radius:50%;background:var(--cyan);animation:pulse 2s ease-in-out infinite}
  .ld-adv-btn{display:flex;align-items:center;gap:5px;padding:6px 13px;border-radius:9px;background:var(--green-bg);border:1px solid var(--green);color:var(--green);font-size:11px;font-weight:700;cursor:pointer;transition:all 0.18s;letter-spacing:0.05em;white-space:nowrap}
  .ld-adv-btn:hover{background:var(--green);color:#fff}
  .ld-co{font-size:11px;color:var(--textDim);font-weight:500;white-space:nowrap}

  .ld-scorebar{padding:12px 20px;border-bottom:1px solid var(--border);background:var(--bg2);flex-shrink:0}
  .ld-sr{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
  .ld-sl{font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:var(--textMid)}
  .ld-sv{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:var(--cyan)}
  .ld-st{height:3px;border-radius:100px;background:var(--border2);overflow:hidden}
  .ld-sf{height:100%;border-radius:100px;transition:width 0.8s cubic-bezier(.34,1.2,.64,1)}
  .ld-sticks{display:flex;justify-content:space-between;margin-top:4px;font-size:9px;color:var(--textDim)}

  .ld-body{flex:1;display:flex;overflow:hidden;min-height:0}

  .ld-ov{width:260px;flex-shrink:0;border-right:1px solid var(--border);overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:7px}
  .ld-ov-h{font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:var(--textDim);padding:0 4px;margin-bottom:4px}
  .mc{border-radius:12px;padding:11px 13px;border:1px solid var(--border);cursor:pointer;background:var(--card-idle);transition:all 0.18s;animation:fadein 0.4s ease both}
  .mc:hover{border-color:var(--border2)}
  .mc.mca{background:var(--card-active);border-color:rgba(0,229,255,0.25);box-shadow:var(--sh-active)}
  .mc.mcd{background:var(--card-done);border-color:rgba(0,230,118,0.20)}
  .mc.mci{opacity:0.45;cursor:not-allowed}
  .mc-r{display:flex;align-items:center;gap:7px;margin-bottom:5px}
  .mc-dot{width:6px;height:6px;border-radius:50%}
  .mc-dot-i{background:var(--textDim)}.mc-dot-a{background:var(--cyan);animation:pulse 1.4s ease-in-out infinite}.mc-dot-d{background:var(--green)}
  .mc-n{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:var(--textDim)}
  .mc-c{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--textDim);margin-left:auto}
  .mc-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:900;color:var(--text);letter-spacing:-0.01em}
  .mc.mca .mc-name{color:var(--cyan)}.mc.mcd .mc-name{color:var(--green)}
  .mc-sub{font-size:9px;text-transform:uppercase;letter-spacing:0.08em;color:var(--textDim);margin-top:1px}
  .mc-sr{display:flex;align-items:center;gap:6px;margin-top:7px}
  .mc-tr{flex:1;height:2px;border-radius:100px;background:var(--border2);overflow:hidden}
  .mc-fa{height:100%;background:var(--cyan);border-radius:100px}
  .mc-fd{height:100%;background:var(--green);border-radius:100px}
  .mc-sv{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--textDim)}

  .ld-chat{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
  .ld-obj{padding:12px 20px;border-bottom:1px solid var(--border);background:var(--bg3);flex-shrink:0}
  .ld-obj-l{font-size:9px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:var(--textDim);margin-bottom:2px}
  .ld-obj-t{font-size:13px;color:var(--textMid);line-height:1.5}

  .ld-msgs{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:11px;min-height:0}
  .ld-m{display:flex;gap:9px;animation:fadein 0.3s ease both;max-width:84%}
  .ld-m-u{align-self:flex-end;flex-direction:row-reverse}
  .ld-av{width:26px;height:26px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700}
  .av-a{background:var(--cyan-bg);color:var(--cyan);border:1px solid var(--border2)}
  .av-u{background:var(--bg3);color:var(--textMid);border:1px solid var(--border2)}
  .ld-bub{padding:9px 13px;border-radius:13px;font-size:13px;line-height:1.6;color:var(--text)}
  .bub-a{background:var(--auron-bot);border:1px solid var(--border)}
  .bub-u{background:var(--auron-user);border:1px solid var(--cyan-dim)}
  .ld-m-t{font-size:9px;color:var(--textDim);margin-top:3px;text-align:right}
  .ld-adv-notice{align-self:center;padding:5px 14px;border-radius:100px;background:var(--green-bg);border:1px solid var(--green);font-size:10px;font-weight:700;color:var(--green);letter-spacing:0.1em;text-transform:uppercase}
  .ld-thinking{display:flex;gap:4px;align-items:center;padding:9px 13px;background:var(--auron-bot);border:1px solid var(--border);border-radius:13px}
  .ld-thinking span{width:5px;height:5px;border-radius:50%;background:var(--cyan);animation:thinking 1.2s ease-in-out infinite}
  .ld-thinking span:nth-child(2){animation-delay:0.2s}
  .ld-thinking span:nth-child(3){animation-delay:0.4s}

  .ld-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:32px;text-align:center}
  .ld-empty-ic{width:52px;height:52px;border-radius:14px;background:var(--cyan-bg);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;color:var(--cyan);font-size:20px}
  .ld-empty-t{font-family:'Syne',sans-serif;font-size:15px;font-weight:900;color:var(--text)}
  .ld-empty-s{font-size:13px;color:var(--textMid);line-height:1.6;max-width:260px}

  .ld-inp-row{padding:14px 20px;border-top:1px solid var(--border);background:var(--bg2);display:flex;gap:9px;flex-shrink:0}
  .ld-inp{flex:1;border-radius:13px;padding:11px 15px;font-size:14px;outline:none;background:var(--bg3);border:1px solid var(--border2);color:var(--text);caret-color:var(--cyan);font-family:'DM Sans',sans-serif;transition:border-color 0.2s,box-shadow 0.2s;resize:none;min-height:44px;max-height:110px}
  .ld-inp::placeholder{color:var(--textDim)}
  .ld-inp:focus{border-color:var(--cyan);box-shadow:0 0 0 3px var(--cyan-bg)}
  .ld-inp:disabled{opacity:0.5}
  .ld-send{width:44px;height:44px;border-radius:13px;flex-shrink:0;background:var(--cyan);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:filter 0.18s,transform 0.1s;color:#000}
  .ld-send:hover:not(:disabled){filter:brightness(1.1)}
  .ld-send:active:not(:disabled){transform:scale(0.95)}
  .ld-send:disabled{opacity:0.45;cursor:not-allowed}
  .ld-spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(0,0,0,0.2);border-top-color:#000;animation:spin 0.7s linear infinite}

  .ld-loader{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg);z-index:100;flex-direction:column;gap:10px;font-size:13px;color:var(--textMid)}
`;

const LAYER_META = [
  { id:1, code:'ENTENDER',     name:'Escucha',     subtitle:'Diagnóstico humano',   objective:'Escucha profunda del empresario y equipo directivo. Siempre humana, sin excepción.',                kpisEnabled:false },
  { id:2, code:'DIAGNOSTICAR', name:'Diagnóstico', subtitle:'FODA · PESTEL · KPIs', objective:'Análisis completo desde todas las fuentes disponibles: AS400, GestionaME, ERP y entrevista.',       kpisEnabled:true  },
  { id:3, code:'RUMBO',        name:'Rumbo',        subtitle:'Visión estratégica',   objective:'Propósito, visión y ejes estratégicos de la organización.',                                          kpisEnabled:false },
  { id:4, code:'BSC',          name:'BSC',          subtitle:'4 perspectivas',       objective:'Balanced Scorecard en tiempo real con las 4 perspectivas AFSE.',                                     kpisEnabled:true  },
  { id:5, code:'PLANEAR',      name:'Planear',      subtitle:'Mando',                objective:'Cuadro de Mando Integral consolidado desde el BSC.',                                                 kpisEnabled:false },
  { id:6, code:'ACCIONAR',     name:'Accionar',     subtitle:'Ejecución',            objective:'OKRs generados por AURON desde brechas reales del diagnóstico.',                                     kpisEnabled:false },
  { id:7, code:'ACOMPAÑAR',    name:'Acompañar',    subtitle:'Seguimiento',          objective:'Seguimiento en tiempo real o check-ins estructurados con el equipo directivo.',                      kpisEnabled:true  },
  { id:8, code:'MEJORAR',      name:'Mejorar',      subtitle:'→ L1',                 objective:'Cierre de ciclo, aprendizaje organizacional y retrospectivas AFSE.',                                 kpisEnabled:false },
];

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
function scoreStyle(s: number) {
  if (s >= 90) return { color: 'var(--green)',  label: 'ÓPTIMO'    };
  if (s >= 70) return { color: 'var(--cyan)',   label: 'ESTABLE'   };
  if (s >= 50) return { color: 'var(--orange)', label: 'EN RIESGO' };
  return             { color: 'var(--red)',     label: 'CRÍTICO'   };
}

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 8L14 2L10 8L14 14L2 8Z" fill="currentColor"/>
  </svg>
);

interface Props { userId: string; companyName: string; }

const LayersDashboard: React.FC<Props> = ({ userId, companyName }) => {
  const {
    afseScore, loading, sending,
    layers, activeLayerId, activeLayer, activeLayerMeta,
    sendMessage, goToLayer, advanceLayer,
  } = useAuronLayer(userId, companyName);

  const [input, setInput] = useState('');
  const [showDevView, setShowDevView] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeLayer?.messages, sending]);

  const handleSend = () => {
    const t = input.trim(); if (!t || sending) return;
    setInput(''); sendMessage(t); inputRef.current?.focus();
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const st = scoreStyle(afseScore);

  if (loading) return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{CSS}</style>
      <div className="ld-loader">
        <div className="ld-spinner" style={{ borderTopColor: 'var(--cyan)' }} />
        Cargando progreso AFSE…
      </div>
    </div>
  );

  return (
    <div className="ld">
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <div className="ld-side">
        <div className="ld-logo">A</div>
        {layers.map(l => {
          const isAct = l.id === activeLayerId;
          const cls = isAct ? 'sb-active' : l.status === 'complete' ? 'sb-done' : l.status === 'idle' ? 'sb-idle' : 'sb-active';
          return (
            <button key={l.id} className={`ld-sb-btn ${cls}`}
              onClick={() => l.status !== 'idle' && goToLayer(l.id)}
              title={LAYER_META[l.id-1].name}>
              <span className="sb-num">{String(l.id).padStart(2,'0')}</span>
              {l.status === 'idle' ? <span style={{fontSize:9,opacity:0.5}}>🔒</span> : <div className="sb-dot"/>}
            </button>
          );
        })}
      </div>

      {/* MAIN */}
      <div className="ld-main">

        {/* TOP */}
        <div className="ld-top">
          <div className="ld-top-l">
            <span className="ld-tag">L{String(activeLayerId).padStart(2,'0')} · {activeLayerMeta.code}</span>
            <span className="ld-title">{activeLayerMeta.name}{activeLayerMeta.kpisEnabled && <span className="acc"> · KPI</span>}</span>
          </div>
          <div className="ld-top-r">
            <div className="ld-spill">
              <div className="ld-spill-dot"/>
              <span style={{color:st.color}}>{afseScore}</span>
              <span style={{opacity:.5,fontSize:10}}>/100</span>
            </div>
            {activeLayer?.status === 'active' && (
              <button className="ld-adv-btn" onClick={() => advanceLayer(activeLayerId)}>
                ✓ Completar L{activeLayerId}
              </button>
            )}
            <button className="ld-adv-btn" style={{ background: 'var(--bg3)', color: 'var(--textMid)', borderColor: 'var(--border2)' }} onClick={() => setShowDevView(true)}>
              Vista Técnica / Académica
            </button>
            <span className="ld-co">{companyName}</span>
          </div>
        </div>

        {/* SCORE BAR */}
        <div className="ld-scorebar">
          <div className="ld-sr">
            <span className="ld-sl">Score AFSE</span>
            <span className="ld-sv" style={{color:st.color}}>
              {afseScore}<span style={{fontSize:10,opacity:.5}}>/100 · {st.label}</span>
            </span>
          </div>
          <div className="ld-st">
            <div className="ld-sf" style={{width:`${afseScore}%`,background:st.color}}/>
          </div>
          <div className="ld-sticks">
            <span>0 Crítico</span><span>50 En riesgo</span><span>70 Estable</span><span>90 Óptimo</span>
          </div>
        </div>

        {/* BODY */}
        <div className="ld-body">

          {/* OVERVIEW */}
          <div className="ld-ov">
            <div className="ld-ov-h">8 Capas AFSE</div>
            {layers.map((l,i) => {
              const m = LAYER_META[i];
              const isAct = l.id === activeLayerId;
              const mc = isAct ? 'mca' : l.status === 'complete' ? 'mcd' : l.status === 'idle' ? 'mci' : 'mca';
              const dc = l.status === 'complete' ? 'mc-dot-d' : l.status === 'active' ? 'mc-dot-a' : 'mc-dot-i';
              return (
                <div key={l.id} className={`mc ${mc}`}
                  style={{animationDelay:`${i*.05}s`,cursor:l.status==='idle'?'not-allowed':'pointer'}}
                  onClick={() => l.status!=='idle' && goToLayer(l.id)}>
                  <div className="mc-r">
                    <div className={`mc-dot ${dc}`}/>
                    <span className="mc-n">{String(l.id).padStart(2,'0')}</span>
                    <span className="mc-c">{m.code}</span>
                  </div>
                  <div className="mc-name">{m.name}</div>
                  <div className="mc-sub">{m.subtitle}</div>
                  {l.score!==undefined && (
                    <div className="mc-sr">
                      <div className="mc-tr">
                        <div className={l.status==='complete'?'mc-fd':'mc-fa'} style={{width:`${l.score}%`}}/>
                      </div>
                      <span className="mc-sv">{l.score}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CHAT */}
          <div className="ld-chat">
            <div className="ld-obj">
              <div className="ld-obj-l">Objetivo de la capa</div>
              <div className="ld-obj-t">{activeLayerMeta.objective}</div>
            </div>

            <div className="ld-msgs">
              {activeLayer?.context && (
                <div className="ld-adv-notice" style={{ alignSelf: 'center', background: 'var(--cyan-bg)', borderColor: 'var(--cyan)', color: 'var(--cyan)', marginBottom: '10px' }}>
                  ✓ Contexto heredado de L{activeLayer.context.previousLayerId}
                </div>
              )}
              {!activeLayer?.messages?.length ? (
                <div className="ld-empty">
                  <div className="ld-empty-ic">⚡</div>
                  <div className="ld-empty-t">AURON listo</div>
                  <div className="ld-empty-s">
                    Cuéntale a AURON sobre tu empresa para comenzar con <strong>{activeLayerMeta.name}</strong>.
                    Diagnostica antes de proponer.
                  </div>
                </div>
              ) : (
                activeLayer.messages.map((msg, i) => (
                  <React.Fragment key={i}>
                    <div className={`ld-m ${msg.role==='user'?'ld-m-u':''}`}>
                      <div className={`ld-av ${msg.role==='auron'?'av-a':'av-u'}`}>
                        {msg.role==='auron'?'A':'Tú'}
                      </div>
                      <div>
                        <div className={`ld-bub ${msg.role==='auron'?'bub-a':'bub-u'}`}>{msg.text}</div>
                        <div className="ld-m-t">{fmtTime(msg.timestamp)}</div>
                      </div>
                    </div>
                    {msg.advance && (
                      <div className="ld-adv-notice">
                        ✓ Capa {activeLayerId} completada — avanzando a L{activeLayerId+1}
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
              {sending && (
                <div className="ld-m">
                  <div className="ld-av av-a">A</div>
                  <div className="ld-thinking"><span/><span/><span/></div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            <div className="ld-inp-row">
              <textarea ref={inputRef} className="ld-inp"
                placeholder={`Habla con AURON sobre ${activeLayerMeta.name.toLowerCase()}…`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={sending || activeLayer?.status==='complete'}
                rows={1}/>
              <button className="ld-send"
                onClick={handleSend}
                disabled={!input.trim()||sending||activeLayer?.status==='complete'}>
                {sending ? <div className="ld-spinner"/> : <SendIcon/>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONSULTANT VIEW MODAL */}
      {showDevView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: '"Syne", sans-serif', fontSize: '18px', fontWeight: 900, color: 'var(--text)' }}>Instrumento de Output (Vista Técnica)</h3>
                <p style={{ fontSize: '11px', color: 'var(--textDim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Datos consolidados por el Motor de Interrelación L{activeLayerId - 1} ➔ L{activeLayerId}</p>
              </div>
              <button onClick={() => setShowDevView(false)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--textDim)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg3)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border2)' }}>
              {!activeLayer?.context ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--textDim)' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>🔍</span>
                  Aún no hay instrumentos generados en esta capa.<br/>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>Completa una capa previa interactuando con Auron para que el Motor extraiga los insights.</span>
                </div>
              ) : (
                <pre style={{ margin: 0, fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--cyan)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {JSON.stringify(activeLayer.context, null, 2)}
                </pre>
              )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDevView(false)} className="ld-adv-btn" style={{ fontSize: '12px', padding: '8px 16px' }}>
                Cerrar vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersDashboard;
