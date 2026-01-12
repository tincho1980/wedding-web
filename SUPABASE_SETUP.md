# Configuración de Supabase para Wedding Web

Este documento explica cómo configurar las tablas y el storage en Supabase para que la aplicación funcione correctamente.

## 📋 Pasos para configurar Supabase

### 1. Crear las tablas en la base de datos

1. Ve al **Dashboard de Supabase** de tu proyecto
2. Navega a **SQL Editor** (en el menú lateral)
3. Haz clic en **New Query**
4. Abre el archivo `supabase-schema.sql` en este proyecto
5. Copia **todo el contenido** del archivo
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)

Esto creará:
- ✅ Tabla `confirmaciones` (para el formulario RSVP)
- ✅ Tabla `fotos` (para la galería de fotos)
- ✅ Políticas de seguridad (RLS) configuradas
- ✅ Índices para mejorar el rendimiento

### 2. Crear el bucket de Storage para fotos

1. En el Dashboard de Supabase, ve a **Storage** (en el menú lateral)
2. Haz clic en **Create a new bucket**
3. Configura el bucket con estos valores:
   - **Name**: `fotos`
   - **Public bucket**: ✅ **Sí** (marca esta opción para que las fotos sean públicas)
   - **File size limit**: `5242880` (5MB) o el tamaño que prefieras
   - **Allowed MIME types**: `image/*` (opcional, pero recomendado)
4. Haz clic en **Create bucket**

### 3. Verificar la configuración

Una vez que hayas ejecutado el SQL y creado el bucket:

1. Inicia la aplicación (`npm run dev`)
2. Abre la consola del navegador (F12)
3. Deberías ver mensajes como:
   - ✅ `Supabase: Cliente inicializado correctamente`
   - ✅ `Supabase: Conexión exitosa y funcionando correctamente`
   - ✅ `Tabla "confirmaciones" existe`
   - ✅ `Tabla "fotos" existe`
   - ✅ `Bucket de storage "fotos" existe`

Si ves mensajes de advertencia (⚠️), significa que falta algo. Revisa los pasos anteriores.

## 🔍 Verificación desde la aplicación

La aplicación verifica automáticamente:
- ✅ La conexión a Supabase
- ✅ Si las tablas existen
- ✅ Si el bucket de storage existe

Si algo falta, verás mensajes en la consola indicando qué hacer.

## 📝 Estructura de las tablas

### Tabla `confirmaciones`
- `id` (UUID) - Identificador único
- `nombre` (TEXT) - Nombre del invitado
- `asiste` (BOOLEAN) - Si confirma asistencia
- `invitados` (INTEGER) - Número de acompañantes
- `nombres_invitados` (TEXT) - Nombres de los acompañantes
- `comentarios` (TEXT) - Comentarios adicionales
- `created_at` (TIMESTAMP) - Fecha de creación

### Tabla `fotos`
- `id` (UUID) - Identificador único
- `url` (TEXT) - URL pública de la foto
- `nombre_archivo` (TEXT) - Nombre original del archivo
- `created_at` (TIMESTAMP) - Fecha de creación

## 🔒 Seguridad (RLS)

Las políticas de Row Level Security están configuradas para:
- ✅ Permitir que **cualquiera** pueda insertar y leer datos (público)
- ✅ Permitir que **usuarios autenticados** puedan eliminar (para admin)

Si necesitas más seguridad, puedes modificar las políticas en el SQL Editor de Supabase.

## ❓ Solución de problemas

### Error: "relation does not exist"
- **Solución**: Ejecuta el script SQL en Supabase (paso 1)

### Error: "bucket not found"
- **Solución**: Crea el bucket "fotos" en Storage (paso 2)

### Error: "new row violates row-level security policy" o "403 Unauthorized"
- **Solución**: Las políticas RLS no están configuradas correctamente. Ejecuta el archivo `supabase-fix-rls.sql` en el SQL Editor de Supabase:
  1. Ve a Supabase Dashboard > SQL Editor
  2. Abre el archivo `supabase-fix-rls.sql` en este proyecto
  3. Copia y ejecuta todo el contenido
  4. Esto eliminará y recreará las políticas correctamente

### Error: "permission denied"
- **Solución**: Verifica que las políticas RLS estén creadas correctamente (usa `supabase-fix-rls.sql`)

### Las fotos no se suben
- **Solución**: 
  1. Verifica que el bucket "fotos" sea público y tenga permisos de escritura
  2. Verifica que las políticas RLS estén correctas (ejecuta `supabase-fix-rls.sql`)
