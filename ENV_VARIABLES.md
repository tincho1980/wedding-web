# Variables de Entorno - Configuración

Este documento describe todas las variables de entorno necesarias para el proyecto.

## Variables Requeridas

### 1. GEMINI_API_KEY
- **Descripción**: API Key de Google Gemini para generar respuestas inteligentes
- **Uso en código**: `process.env.API_KEY` y `process.env.GEMINI_API_KEY`
- **Definida en vite.config**: ✅ Ambos (`API_KEY` y `GEMINI_API_KEY`)
- **Archivo .env**: `GEMINI_API_KEY=tu_api_key_aqui`
- **Obtener en**: https://aistudio.google.com/app/apikey

### 2. VITE_SUPABASE_URL
- **Descripción**: URL de tu proyecto Supabase
- **Uso en código**: `process.env.VITE_SUPABASE_URL` (con fallbacks a `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_URL`)
- **Definida en vite.config**: ✅ Como `VITE_SUPABASE_URL` (con fallbacks)
- **Archivo .env**: `VITE_SUPABASE_URL=https://tu-proyecto.supabase.co`
- **Obtener en**: Supabase Dashboard > Settings > API > Project URL

### 3. VITE_SUPABASE_ANON_KEY
- **Descripción**: Clave anónima pública de Supabase
- **Uso en código**: `process.env.VITE_SUPABASE_ANON_KEY` (con fallbacks a `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_ANON_KEY`)
- **Definida en vite.config**: ✅ Como `VITE_SUPABASE_ANON_KEY` (con fallbacks)
- **Archivo .env**: `VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui`
- **Obtener en**: Supabase Dashboard > Settings > API > anon public key

### 4. VITE_ADMIN_PASSWORD
- **Descripción**: Contraseña para acceder al panel de administración
- **Uso en código**: `process.env.VITE_ADMIN_PASSWORD`
- **Definida en vite.config**: ✅
- **Archivo .env**: `VITE_ADMIN_PASSWORD=tu_contraseña_segura`
- **Nota**: Esta variable es pública (prefijo VITE_), úsala solo para desarrollo/demo

## Estructura del archivo .env

Crea un archivo `.env` en la raíz del proyecto con este formato:

```env
# API Key de Google Gemini
GEMINI_API_KEY=tu_api_key_de_gemini_aqui

# Configuración de Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Contraseña del panel de administración
VITE_ADMIN_PASSWORD=tu_contraseña_segura_aqui
```

## Verificación

Para verificar que las variables están configuradas correctamente:

1. Asegurate de que el archivo `.env` existe en la raíz del proyecto
2. Reiniciá el servidor de desarrollo (`npm run dev`)
3. Abrí la consola del navegador (F12) y verificá los mensajes de inicialización
4. Si ves advertencias sobre variables faltantes, revisá el archivo `.env`

## Notas Importantes

- ⚠️ **NUNCA** subas el archivo `.env` al repositorio (debe estar en `.gitignore`)
- ✅ Las variables con prefijo `VITE_` son accesibles en el código del cliente
- ✅ Las variables sin prefijo solo están disponibles en el servidor (build time)
- 🔄 Después de modificar `.env`, necesitás reiniciar el servidor de desarrollo
