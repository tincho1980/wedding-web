# Configuración de Cloudflare Function para Resend

Esta guía explica cómo configurar la Cloudflare Function para enviar emails usando Resend.

## 📋 Estructura

La función está en `functions/send-rsvp-email.ts` y se desplegará automáticamente con Cloudflare Pages.

## 🔧 Configuración

### 1. Instalar dependencias

El paquete `resend` ya está instalado. Si necesitás reinstalarlo:

```bash
npm install resend
```

### 2. Configurar variable de entorno en Cloudflare

1. Ve a tu proyecto en **Cloudflare Dashboard** > **Pages**
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega la variable:
   - **Variable name**: `RESEND_API_KEY`
   - **Value**: Tu API key de Resend (empieza con `re_`)
   - **Environment**: Production (y Preview si querés probarlo)
5. **IMPORTANTE**: No marques "Available in Build", solo debe estar disponible en runtime

### 3. Actualizar el dominio en la función

Edita `functions/send-rsvp-email.ts` y cambia:

```typescript
from: 'Wedding RSVP <noreply@tudominio.com>',
```

Por tu dominio verificado en Resend, por ejemplo:

```typescript
from: 'Wedding RSVP <noreply@tudominio.com>',
```

### 4. Desplegar

La función se desplegará automáticamente cuando hagas push a tu repositorio o cuando Cloudflare Pages haga un nuevo build.

Para desplegar manualmente:

1. Haz commit y push de los cambios
2. Cloudflare Pages detectará los cambios automáticamente
3. O ve a Cloudflare Dashboard > Pages > tu proyecto > **Deployments** > **Retry deployment**

## ✅ Verificación

1. Después del deploy, hacé una confirmación de prueba desde la aplicación
2. Verificá que recibas el email en miramallo@gmail.com
3. Revisá los logs en Cloudflare Dashboard > Pages > tu proyecto > **Functions** > **Logs**

## 🔍 Troubleshooting

### Error: "RESEND_API_KEY not found"
- Verificá que la variable esté configurada en Cloudflare Pages
- Asegurate de que NO esté marcada como "Available in Build"
- Verificá que esté en el ambiente correcto (Production/Preview)

### Error: "Function not found" o 404
- Verificá que el archivo esté en `functions/send-rsvp-email.ts`
- Asegurate de que el nombre del archivo coincida exactamente
- Verificá que el deploy se haya completado correctamente

### No recibís emails
- Verificá que tu dominio esté verificado en Resend
- Revisá los logs de la función en Cloudflare
- Verificá que el email "from" use tu dominio verificado
- Revisá la consola del navegador para ver si hay errores

### Error de CORS
- La función ya maneja CORS automáticamente
- Si hay problemas, verificá que la función esté desplegada correctamente

## 📝 Notas

- La función se ejecuta en el servidor de Cloudflare, evitando problemas de CORS
- El API key de Resend se guarda como variable de entorno en Cloudflare (seguro)
- La función está disponible en `/api/send-rsvp-email` automáticamente
- Podés ver los logs en tiempo real en Cloudflare Dashboard

## 🔗 URLs

- La función estará disponible en: `https://tu-dominio.pages.dev/api/send-rsvp-email`
- O si usás un dominio personalizado: `https://tudominio.com/api/send-rsvp-email`
