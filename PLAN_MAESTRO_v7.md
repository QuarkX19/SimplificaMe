ARQUITECTURA ME
Neuro Code Style™
─────────────────────────────────────
PLAN MAESTRO v7.0 + PMBook Integrado
Documento de Contexto Estratégico, Técnico, Comercial y de Implementación

calidadysostenibilidad.com SAS
Propietario: Luis Reinaldo Ruiz Sarmiento | Fundador & CEO
Versión: 7.0 | Marzo 2026 | CONFIDENCIAL
 
⚙️ INSTRUCCIONES PARA LA IA PRINCIPAL (CLAUDE/GEMINI) — LEER PRIMERO
🎯 Propósito de este documento
Este Plan Maestro fusionado es el documento de contexto que debe leerse al inicio de CUALQUIER sesión nueva de ingeniería o estrategia. Contiene la arquitectura completa del proyecto, decisiones técnicas (Multi-Tenancy, Mercado Pago, RLS), stack, P.I., estructura de datos y el PMBook (estado actual del roadmap).

10 reglas críticas:
1. Propietario absoluto: calidadysostenibilidad.com SAS — Todo el código, métodos y datos generados pertenecen a esta empresa. Jamás a clientes/pilotos.
2. Piloto (TSI Logística): Cliente PILOTO, no dueño del desarrollo. Todo avance funcional queda en GestionaME para uso general.
3. Framework AFSE: Metodología propia de 8 capas (L1–L8) con respaldo universitario. No simplificar; usar herramientas estratégicas empresariales validadas.
4. AURON: Director Estratégico IA. Responde en el idioma del usuario, tiene memoria persistente, investiga de la web y guía de acuerdo a la ubicación y sector de la empresa.
5. Stack inamovible: React + Vite + TypeScript + Supabase + Gemini API + n8n + Mercado Pago. NO cambiar sin autorización explícita.
6. i18n Nativo: Español (default) e Inglés. Multi-tenant preferred_lang controla cada entorno.
7. Arquitectura Multi-Tenant (B2B SaaS): Entornos estrictamente aislados y bloqueados por RLS en Supabase. Cada empresa maneja su `activeCompany`. 
8. Roles y Perfiles ME: Estratégico, Táctico, Operativo. Gamificación (Score ME). 
9. El Hub de 5 Módulos: SimplificaME, GestionaME, CapacitaME, EvaluaME, ConsultaME.
10. Escalabilidad Fortune 500: Desde PYMES hasta corporativos masivos; el diseño de la base de datos y la pasarela PCI-DSS soportan flujos masivos.

***

## PARTE I — RESUMEN EJECUTIVO Y PROPUESTA DE VALOR
1.1 La Filosofía: Neuro Code Style
"Programar el cerebro de la empresa a tu manera". Une estrategia, operación, formación, certificación y consultoría humana bajo un solo acceso, impulsado por IA y metodología AFSE.

1.2 Escalabilidad y Monetización
- Vertical SaaS + Servicios Profesionales Integrados. 
- Checkout Pro (Mercado Pago): Ya implementado. Desbloquea planes instantáneamente sin intervención manual, con Edge Functions inyectadas para seguridad financiera.

***

## PARTE II — ARQUITECTURA TÉCNICA Y DE PLATAFORMA (Actualización v7.0)
2.1 Entornos Independientes (Multi-Tenant)
- Onboarding Autónomo: Intercepción "Cristal Neón" que obliga a nuevos usuarios a "Inicializar Entorno" declarando Nombre, NIT, y Sector. Esto crea al "Paciente 0".
- Company Switcher: Modal Glassmorphism trans-dimensional para saltar instantáneamente entre empresas sin mezclar datos.
- Unified Dark Aesthetic: La experiencia desde el Login hasta el Dashboard abraza un diseño Premium Deep Space (`PRO_DARK`), eliminando switches discordantes.

2.2 El Organigrama como Output (No Input)
SimplificaME analiza L1 (Contexto) a L4 (BSC) y genera automáticamente los `me_processes` y `me_positions` necesarios. 

2.3 Seguridad de Datos (RLS)
Nuestras tablas maestras (`companies`, `company_members`, `afse_cycles`) cuentan con estrictas políticas de Row Level Security (RLS) en Supabase para bloquear accesos y forzar contención inter-company.

***

## PARTE III — STACK, BASES DE DATOS Y PMBOOK (ROADMAP)

### STACK TÉCNICO VALIDADO
- Frontend: React 18, Vite, TypeScript, TailwindCSS (Deep Dark Theme).
- Backend DB: Supabase (Postgres) + RLS + Edge Functions (Deno).
- Orquestación IA: n8n global + Supabase Vector + Gemini API.
- Pasarela B2B: Mercado Pago (Checkout Pro PCI-DSS).

### PMBook — EL PLAN DE IMPLEMENTACIÓN ESTRATÉGICA (v7.0)
Fases Completadas (Ya en Producción): 10 de 16 fases ✅
~80 horas invertidas con IA (Ahorro del >85% frente a desarrollo tradicional de >800h).

* FASE 1: Infraestructura VPS + n8n (Completada). Resolvimos Crash loops, SSL, subdominios.
* FASE 2: Supabase Schema + Tablas Core (Completada). Multi-tenant design, RLS por company_id.
* FASE 3: AURON Chat Flow n8n + Gemini (Completada). Prompt maestro, Detección Leads Telegram.
* FASE 4: Edge Function AURON (Completada). Proxy Deno seguro, Advance Layer logic.
* FASE 5: auronMemory Service (Completada). Memoria persistente, estrategia jerárquica.
* FASE 6: useAuronLayer + LayersDashboard (Completada). Navegación fluida L1-L8.
* FASE 7: i18n + Unificación Estética Dark "Pro" (Completada). Login y Onboarding totalmente inmersivos en modo oscuro sin toggles.
* FASE 8: Arquitectura Multi-Tenant Frontend (Completada). Company Switcher, validación de onboarding interactivo y creación autónoma.
* FASE 9: Pasarela de Cobros B2B Mercado Pago (Completada). Edge function preparada para el accessToken y botón UICheckout en React.
* FASE 10: Hardening de Base de Datos y RLS (Completada). Políticas maestras desbloqueadas para inserción de nuevos tenants (plan starter, lang, roles).

Fases Pendientes (En Curso / Próximas): 6 fases por ejecutar ⏳
* FASE 11 (Bloqueante): Motor de Interrelación AFSE (Methodology Engine). L2 depende de L1. El árbol de BSC fluye desde metas.
* FASE 12 (Negocio): Acuerdo Piloto TSI + Onboarding en vivo de su capa L1.
* FASE 13 (Legal y Marca): Protección de P.I., DNDA Colombia, Registro SIC.
* FASE 14: GestionaME SGC — Integración con ERP (AS400). Sincronización en tiempo real.
* FASE 15: Gamificación y Perfiles ME. Dashboards individuales y "streak_days".
* FASE 16: Lanzamiento Comercial y Pitch Inversionistas (ARR Target: $3M USD).

***

## PARTE IV — PROPIEDAD INTELECTUAL
Todo desarrollo (código base, UX, Prompts, BD) reside exclusiva y legalmente bajo la propiedad de calidadysostenibilidad.com SAS. Cliente TSI Logística probará en calidad de "Cliente Fundador (Piloto)", firmando el respectivo NDA y renuncias de co-autoría técnica.

***

## PARTE V — PRÓXIMO SPRINT (Acciones Inmediatas para la IA)
1. Iniciar la codificación del Motor de Interrelación AFSE (interrelation.engine.ts) – Prioridad Máxima.
2. Extender el Backend HSEQ y métricas para sincronizar el AS400 del cliente piloto (GestionaME).
3. Documentación y firma legal del marco para TSI.

─────────────────────────────────────────────────────
Plan Maestro v7.0 — calidadysostenibilidad.com SAS
DOCUMENTO CONFIDENCIAL — Propiedad exclusiva de Luis Reinaldo Ruiz Sarmiento y Juan Pablo Dueñas Mejía.
