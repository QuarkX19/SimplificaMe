const fs = require('fs');

let code = fs.readFileSync('src/app/App.tsx', 'utf8');

const newLogin = `// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
type Theme = 'dark' | 'light';

const DARK_T = {
  bg:'#06090F', bg2:'#0A0E18', bg3:'#0F1420',
  bgCard:'rgba(10,14,24,0.97)',
  border:'rgba(255,255,255,0.06)', border2:'rgba(255,255,255,0.12)',
  cyan:'#00E5FF', cyanGlow:'rgba(0,229,255,0.20)', cyanRing:'rgba(0,229,255,0.10)',
  green:'#00E676', text:'#F1F5F9', textMid:'#94A3B8', textDim:'#475569',
  error:'#FF3D57', shadow:'0 40px 100px rgba(0,0,0,0.60)',
  mesh1:'rgba(0,229,255,0.07)', mesh2:'rgba(124,77,255,0.05)',
  grid:'rgba(0,229,255,0.02)', ring:'rgba(0,229,255,0.04)',
};
const LIGHT_T = {
  bg:'#F0F4FA', bg2:'#FFFFFF', bg3:'#E8EEF6',
  bgCard:'rgba(255,255,255,0.98)',
  border:'rgba(0,0,0,0.07)', border2:'rgba(0,0,0,0.14)',
  cyan:'#0088BB', cyanGlow:'rgba(0,136,187,0.15)', cyanRing:'rgba(0,136,187,0.10)',
  green:'#00875A', text:'#0F172A', textMid:'#475569', textDim:'#94A3B8',
  error:'#DC2626', shadow:'0 24px 80px rgba(0,0,0,0.12)',
  mesh1:'rgba(0,136,187,0.06)', mesh2:'rgba(124,77,255,0.04)',
  grid:'rgba(0,136,187,0.03)', ring:'rgba(0,136,187,0.03)',
};

const LoginScreen: React.FC<{ email: string; setEmail: (v: string) => void }> = ({ email, setEmail }) => {
  const { t, i18n } = useTranslation();
  const [sent, setSent]       = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [theme, setTheme]     = React.useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const C = theme === 'dark' ? DARK_T : LIGHT_T;
  const currentLang = i18n.language.slice(0, 2);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) { setError(t('auth.errorEmail')); return; }
    setError(''); setLoading(true);
    try {
      const { error: supaErr } = await supabase.auth.signInWithOtp({ email });
      if (supaErr) throw supaErr;
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? t('auth.errorGeneric'));
    } finally { setLoading(false); }
  };

  const rings = [320, 500, 680, 860];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', background:C.bg, transition:'background 0.4s' }}>

      {/* Mesh background */}
      <div style={{ pointerEvents:'none', position:'fixed', inset:0, zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-160, left:-160, width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, ' + C.mesh1 + ' 0%, transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:-240, right:-240, width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, ' + C.mesh2 + ' 0%, transparent 70%)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(' + C.grid + ' 1px, transparent 1px), linear-gradient(90deg, ' + C.grid + ' 1px, transparent 1px)', backgroundSize:'80px 80px' }}/>
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}>
          {rings.map((size, i) => (
            <div key={size} style={{ position:'absolute', borderRadius:'50%', width:size, height:size, top:-size/2, left:-size/2, border:'1px solid ' + C.ring, animation:'loginSpin ' + (22+i*8) + 's linear infinite ' + (i%2===0?'':'reverse') }}/>
          ))}
        </div>
      </div>

      {/* Top-right controls */}
      <div style={{ position:'fixed', top:20, right:20, zIndex:100, display:'flex', alignItems:'center', gap:8 }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          style={{ width:40, height:40, borderRadius:12, border:'1px solid ' + C.border2, background:C.bg2, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'all 0.2s' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {/* Lang switcher */}
        <div style={{ display:'flex', alignItems:'center', gap:2, padding:4, borderRadius:12, background:C.bg2, border:'1px solid ' + C.border2 }}>
          {(['es','en']).map(lang => {
            const isActive = currentLang === lang;
            return (
              <button key={lang} onClick={() => applyPreferredLang(lang)}
                style={{ padding:'5px 11px', borderRadius:9, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, transition:'all 0.15s', background:isActive ? C.cyan : 'transparent', color:isActive ? '#000' : C.textDim }}>
                {lang.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:400, padding:'0 24px', display:'flex', flexDirection:'column', alignItems:'center', animation:'loginFadeIn 0.6s ease both' }}>

        {/* Logo */}
        <div style={{ marginBottom:24 }}>
          <CYSLogo />
        </div>

        {/* Brand */}
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.4em', textTransform:'uppercase' as const, color:C.textMid, marginBottom:12, textAlign:'center' }}>
          {t('brand.company')}
        </p>
        <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:'clamp(40px,10vw,54px)', fontWeight:900, letterSpacing:'-0.02em', lineHeight:1, textAlign:'center', margin:'0 0 8px', color:C.text }}>
          Arquitectura
          <span style={{ color:C.cyan, filter:'drop-shadow(0 0 24px ' + C.cyanGlow + ')' }}>ME</span>
          <sup style={{ fontSize:20, fontWeight:700, color:C.textDim, verticalAlign:'super' }}>™</sup>
        </h1>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.35em', textTransform:'uppercase' as const, color:C.textDim, marginBottom:32 }}>
          {t('brand.tagline')}
        </p>

        {/* Card */}
        <div style={{ width:'100%', borderRadius:24, padding:32, background:C.bgCard, border:'1px solid ' + C.border2, boxShadow:C.shadow, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>

          {/* Card header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:24 }}>
            <div style={{ height:1, flex:1, background:C.border2 }}/>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase' as const, color:C.textMid, whiteSpace:'nowrap' }}>
              {t('auth.access')}
            </p>
            <div style={{ height:1, flex:1, background:C.border2 }}/>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit}>
              {/* Floating label input */}
              <div style={{ marginBottom:16, position:'relative' }}>
                <label style={{
                  position:'absolute', left:16,
                  top: focused || email ? 10 : '50%',
                  transform: focused || email ? 'translateY(0) scale(0.75)' : 'translateY(-50%) scale(1)',
                  transformOrigin:'left',
                  fontSize:14, fontWeight:600,
                  color: focused ? C.cyan : C.textDim,
                  transition:'all 0.2s', pointerEvents:'none', zIndex:1,
                }}>
                  {t('auth.placeholder')}
                </label>
                <input
                  type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  disabled={loading}
                  style={{
                    width:'100%', borderRadius:14,
                    padding: email || focused ? '24px 16px 10px' : '17px 16px',
                    fontSize:15, outline:'none', boxSizing:'border-box' as const,
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    border: '1.5px solid ' + (error ? C.error : focused ? C.cyan : C.border2),
                    color:C.text, caretColor:C.cyan, transition:'all 0.2s',
                    boxShadow: focused ? '0 0 0 4px ' + C.cyanRing : 'none',
                  }}
                />
                {error && (
                  <p style={{ fontSize:12, fontWeight:600, color:C.error, marginTop:6, paddingLeft:4 }}>
                    ⚠ {error}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'15px 24px', borderRadius:14, fontSize:13, fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#000', background:C.cyan, border:'none', cursor:loading?'not-allowed':'pointer', boxShadow:'0 6px 28px ' + C.cyanGlow, transition:'all 0.2s', opacity:loading?0.7:1 }}>
                {loading ? t('auth.sending') : t('auth.submit')}
              </button>

              {/* Security */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:18 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, animation:'lgPulse 2s ease-in-out infinite' }}/>
                <span style={{ fontSize:12, fontWeight:600, color:C.textDim }}>{t('auth.security')}</span>
              </div>
            </form>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'8px 0', textAlign:'center', animation:'loginFadeIn 0.4s ease both' }}>
              <div style={{ width:60, height:60, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, background:'rgba(0,230,118,0.10)', border:'1px solid rgba(0,230,118,0.25)' }}>✉️</div>
              <p style={{ fontSize:16, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:C.green }}>{t('auth.sentTitle')}</p>
              <p style={{ fontSize:14, lineHeight:1.7, color:C.textMid }}>
                {t('auth.sentBody')}<br/>
                <span style={{ fontWeight:700, color:C.cyan }}>{email}</span>
              </p>
              <p style={{ fontSize:12, color:C.textDim }}>{t('auth.sentExpiry')}</p>
              <button onClick={() => { setSent(false); setEmail(''); }}
                style={{ fontSize:12, fontWeight:600, color:C.textDim, background:'none', border:'none', cursor:'pointer' }}>
                {t('auth.backButton')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign:'center', fontSize:13, fontWeight:500, marginTop:24, lineHeight:1.8, color:C.textDim }}>
          {t('brand.slogan')}<br/>
          <span style={{ color:C.cyan, fontWeight:700 }}>{t('brand.sloganAccent')}</span>
        </p>
      </div>

      <style>{\`
        @keyframes loginSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes loginFadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lgPulse     { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      \`}</style>
    </div>
  );
};`;

// Find and replace the LoginScreen block
const startMarker = '// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────';
const endMarker   = '// ─── MAIN APP ─────────────────────────────────────────────────────────────────';

const startIdx = code.indexOf(startMarker);
const endIdx   = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('ERROR: Markers not found in App.tsx');
  console.log('startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const newCode = code.slice(0, startIdx) + newLogin + '\n\n' + code.slice(endIdx);
fs.writeFileSync('src/app/App.tsx', newCode);
console.log('✅ LoginScreen replaced successfully');
