# SimplificaME — Guía de Despliegue Seguro

## 1. Variables de entorno

### Frontend (.env en D:\SimplificaMe\)
```env
# SOLO estas dos — nunca pongas GEMINI_API_KEY aquí
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Edge Function (secrets del servidor)
```bash
# Ejecutar una sola vez desde tu terminal con Supabase CLI
supabase secrets set GEMINI_API_KEY=AIza...
```

---

## 2. Estructura de archivos a crear/reemplazar

```
D:\SimplificaMe\
├── supabase/
│   ├── functions/
│   │   └── auron-chat/
│   │       └── index.ts          ← NUEVO (Edge Function)
│   └── rls_policies.sql          ← NUEVO (ejecutar en SQL Editor)
└── src/
    └── services/
        └── api/
            └── geminiService.ts  ← REEMPLAZAR (ya no expone API key)
```

---

## 3. Instalar Supabase CLI (si no lo tienes)

```bash
# Windows PowerShell
winget install Supabase.CLI

# O con npm
npm install -g supabase
```

---

## 4. Vincular tu proyecto

```bash
cd D:\SimplificaMe
supabase login
supabase link --project-ref <tu-project-ref>
# El project-ref está en: Supabase Dashboard > Settings > General
```

---

## 5. Deployer la Edge Function

```bash
# Desde D:\SimplificaMe
supabase functions deploy auron-chat --no-verify-jwt

# Configurar la API key de Gemini (solo una vez)
supabase secrets set GEMINI_API_KEY=AIza<tu_key_real>

# Verificar que el secret fue guardado
supabase secrets list
```

---

## 6. Ejecutar las políticas RLS

1. Abrir Supabase Dashboard
2. Ir a **SQL Editor**
3. Pegar el contenido de `supabase/rls_policies.sql`
4. Ejecutar
5. Verificar con:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```
Todas las tablas deben mostrar `rowsecurity = true`.

---

## 7. Probar la Edge Function localmente

```bash
supabase start
supabase functions serve auron-chat --env-file .env.local
```

Luego en otra terminal:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/auron-chat' \
  --header 'Authorization: Bearer <tu_anon_key>' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"¿Qué es AFSE?","layerNumber":1}'
```

---

## 8. Checklist de seguridad final

- [ ] `GEMINI_API_KEY` NO está en `.env` del frontend
- [ ] `.env` está en `.gitignore`
- [ ] RLS habilitado en las 13 tablas
- [ ] Edge Function deployada
- [ ] `geminiService.ts` actualizado (llama a Edge Function)
- [ ] Test de que un usuario sin auth recibe 401
- [ ] Test de que un usuario no puede ver datos de otra empresa

---

## 9. URL de la Edge Function en producción

```
https://<tu-proyecto>.supabase.co/functions/v1/auron-chat
```

El cliente NO necesita esta URL directamente — `supabase.functions.invoke('auron-chat')` 
la construye automáticamente con el `SUPABASE_URL` configurado.
