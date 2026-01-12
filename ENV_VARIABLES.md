# Variables de Entorno - Configuración

Este documento describe todas las variables de entorno necesarias para el proyecto.

## Variables Requeridas

Todas las variables de entorno usan el prefijo `VITE_` para que sean accesibles en el código del cliente.

### 1. VITE_GEMINI_API_KEY
- **Descripción**: API Key de Google Gemini para generar respuestas inteligentes
- **Uso en código**: `process.env.VITE_GEMINI_API_KEY` (también disponible como `process.env.API_KEY` y `process.env.GEMINI_API_KEY` para compatibilidad)
- **Definida en vite.config**: ✅
- **Archivo .env**: `VITE_GEMINI_API_KEY=tu_api_key_aqui`
- **Obtener en**: https://aistudio.google.com/app/apikey

### 2. VITE_SUPABASE_URL
- **Descripción**: URL de tu proyecto Supabase
- **Uso en código**: `process.env.VITE_SUPABASE_URL`
- **Definida en vite.config**: ✅
- **Archivo .env**: `VITE_SUPABASE_URL=https://tu-proyecto.supabase.co`
- **Obtener en**: Supabase Dashboard > Settings > API > Project URL

### 3. VITE_SUPABASE_ANON_KEY
- **Descripción**: Clave anónima pública de Supabase
- **Uso en código**: `process.env.VITE_SUPABASE_ANON_KEY`
- **Definida en vite.config**: ✅
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
VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui

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

## Configuración en Cloudflare Pages

Para desplegar en Cloudflare Pages, necesitás configurar las variables de entorno en el dashboard de Cloudflare:

1. Ve a tu proyecto en Cloudflare Pages
2. Navega a **Settings** > **Environment Variables**
3. Agrega las siguientes variables (pueden tener cualquiera de estos nombres, el código las detectará automáticamente):

### Variables requeridas en Cloudflare:

- **VITE_GEMINI_API_KEY**: Tu API key de Google Gemini
- **VITE_SUPABASE_URL**: URL de tu proyecto Supabase
- **VITE_SUPABASE_ANON_KEY**: Clave anónima de Supabase
- **VITE_ADMIN_PASSWORD**: Contraseña del panel de administración

### ⚠️ IMPORTANTE - Configuración en Cloudflare:

1. **Marcar variables como "Available in Build"**: 
   - Cuando agregues cada variable, asegurate de marcar la opción **"Available in Build"** o **"Available in Production"**
   - Esto es CRÍTICO porque Vite necesita las variables durante el proceso de build
   - Sin esta opción marcada, las variables no estarán disponibles durante el build y no se inyectarán en el código

2. **Después de agregar/modificar variables**:
   - Necesitás hacer un **nuevo deploy** para que los cambios surtan efecto
   - Las variables se leen durante el build, no en runtime

3. **Verificación**:
   - Podés ejecutar `npm run check-env` localmente para verificar que las variables estén disponibles
   - En Cloudflare, revisá los logs del build para ver si hay advertencias sobre variables faltantes

### Notas para Cloudflare:

- ✅ Todas las variables usan el prefijo `VITE_` para consistencia
- ✅ Las variables se inyectan durante el build automáticamente
- ⚠️ **CRÍTICO**: Las variables DEBEN estar marcadas como "Available in Build" o no funcionarán
- ⚠️ Después de agregar/modificar variables, necesitás hacer un nuevo deploy

## Notas Importantes

- ⚠️ **NUNCA** subas el archivo `.env` al repositorio (debe estar en `.gitignore`)
- ✅ Las variables con prefijo `VITE_` son accesibles en el código del cliente
- ✅ Las variables sin prefijo solo están disponibles en el servidor (build time)
- 🔄 Después de modificar `.env`, necesitás reiniciar el servidor de desarrollo
- 🌐 En Cloudflare, las variables se leen de `process.env` durante el build, no del archivo `.env`