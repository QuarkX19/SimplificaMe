const fs = require('fs');
const path = require('path');

console.log('\n🔍 AUDITORÍA ARQUITECTURA ME\n');
console.log('='.repeat(50));

// ─── DUPLICADOS DETECTADOS ────────────────────────────────
const issues = [];

const checks = [
  // Duplicados
  { file: 'src/app/App.tsx.backup',       type: '🗑  ELIMINAR', reason: 'Backup temporal — ya no necesario' },
  { file: 'src/app/LoginScreen.tsx',      type: '🗑  ELIMINAR', reason: 'LoginScreen está embebido en App.tsx — duplicado' },
  { file: 'src/app/main.tsx',             type: '⚠️  REVISAR',  reason: 'main.tsx debe estar en src/, no en src/app/' },
  { file: 'src/index.tsx',               type: '⚠️  REVISAR',  reason: 'Posible duplicado de main.tsx' },
  { file: 'src/index.css',               type: '⚠️  REVISAR',  reason: 'Duplicado — también existe src/styles/index.css' },
  { file: 'src/styles/index.css',        type: '⚠️  REVISAR',  reason: 'Duplicado — también existe src/index.css' },
  { file: 'src/pages/SuperAdminPanel.tsx',type: '🗑  ELIMINAR', reason: 'Duplicado — ya existe src/app/SuperAdminPanel.tsx' },
  { file: 'src/erp.ts',                  type: '⚠️  REVISAR',  reason: 'Posible duplicado de src/services/erp/' },
  { file: 'src/company.ts',              type: '⚠️  REVISAR',  reason: 'Posible duplicado de src/services/company.service.ts' },
  { file: 'src/types.ts',               type: '⚠️  REVISAR',  reason: 'Posible duplicado de src/types/' },
  { file: 'src/features',               type: '⚠️  REVISAR',  reason: 'Carpeta vacía — eliminar o usar' },
];

console.log('\n📋 PROBLEMAS ENCONTRADOS:\n');
checks.forEach(({ file, type, reason }) => {
  const exists = fs.existsSync(file);
  if (exists) {
    console.log(`${type}: ${file}`);
    console.log(`   → ${reason}\n`);
    issues.push({ file, type, reason });
  }
});

// ─── LIMPIAR SEGUROS (backups y duplicados obvios) ────────
console.log('='.repeat(50));
console.log('\n🧹 LIMPIANDO ARCHIVOS SEGUROS...\n');

const toDelete = [
  'src/app/App.tsx.backup',
  'src/app/LoginScreen.tsx',
  'src/pages/SuperAdminPanel.tsx',
];

toDelete.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Eliminado: ${file}`);
  } else {
    console.log(`⏭  No existe: ${file}`);
  }
});

// ─── VERIFICAR main.tsx ───────────────────────────────────
console.log('\n📍 VERIFICANDO main.tsx...\n');
const mainApp = fs.existsSync('src/app/main.tsx');
const mainSrc = fs.existsSync('src/main.tsx');
const indexSrc = fs.existsSync('src/index.tsx');

console.log(`src/main.tsx:      ${mainSrc ? '✅ existe' : '❌ no existe'}`);
console.log(`src/app/main.tsx:  ${mainApp ? '⚠️  existe (mover a src/)' : '✅ no existe'}`);
console.log(`src/index.tsx:     ${indexSrc ? '⚠️  existe (posible duplicado)' : '✅ no existe'}`);

if (mainApp && !mainSrc) {
  fs.copyFileSync('src/app/main.tsx', 'src/main.tsx');
  fs.unlinkSync('src/app/main.tsx');
  console.log('\n✅ main.tsx movido de src/app/ a src/');
}

// ─── VERIFICAR index.css ──────────────────────────────────
console.log('\n📍 VERIFICANDO index.css...\n');
const css1 = fs.existsSync('src/index.css');
const css2 = fs.existsSync('src/styles/index.css');
console.log(`src/index.css:        ${css1 ? '✅' : '❌'}`);
console.log(`src/styles/index.css: ${css2 ? '✅' : '❌'}`);
if (css1 && css2) {
  console.log('⚠️  Ambos existen — revisar cuál importa vite.config / main.tsx');
}

// ─── RESUMEN FINAL ────────────────────────────────────────
console.log('\n' + '='.repeat(50));
console.log('\n📊 RESUMEN ESTRUCTURA LIMPIA:\n');
console.log(`
src/
├── main.tsx              ← entry point (debe importar i18n)
├── index.css             ← estilos globales
├── app/
│   ├── App.tsx           ← componente raíz v10
│   └── SuperAdminPanel.tsx
├── i18n/
│   ├── index.ts
│   ├── LanguageSwitcher.tsx
│   └── locales/es/ + en/
├── core/
│   ├── chat/
│   └── methodology/
├── hooks/
│   └── useMethodology.ts
├── services/
│   ├── api/ (supabase, gemini)
│   ├── auronMemory.ts
│   └── company.ts
├── ui/layers/
│   ├── LayersDashboard.tsx
│   ├── LayerRenderer.tsx
│   └── MatrixRenderer.tsx
└── types.ts
`);

console.log('✅ Auditoría completa\n');
