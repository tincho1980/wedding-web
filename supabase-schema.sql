-- ============================================
-- Esquema de Base de Datos para Wedding Web
-- ============================================
-- Ejecutá este script en el SQL Editor de Supabase
-- (Dashboard > SQL Editor > New Query)

-- 1. Crear tabla de confirmaciones (RSVP)
CREATE TABLE IF NOT EXISTS public.confirmaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    asiste BOOLEAN NOT NULL,
    invitados INTEGER DEFAULT 0 NOT NULL,
    nombres_invitados TEXT,
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla de fotos
CREATE TABLE IF NOT EXISTS public.fotos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    nombre_archivo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.confirmaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad para confirmaciones
-- Primero eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Permitir inserción pública de confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "Permitir lectura pública de confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "Permitir eliminación para autenticados" ON public.confirmaciones;

-- Permitir que cualquiera pueda insertar confirmaciones (público)
CREATE POLICY "Permitir inserción pública de confirmaciones"
    ON public.confirmaciones
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Permitir que cualquiera pueda leer confirmaciones (público)
CREATE POLICY "Permitir lectura pública de confirmaciones"
    ON public.confirmaciones
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Permitir que usuarios autenticados puedan eliminar (para admin)
CREATE POLICY "Permitir eliminación para autenticados"
    ON public.confirmaciones
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Políticas de seguridad para fotos
-- Primero eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Permitir inserción pública de fotos" ON public.fotos;
DROP POLICY IF EXISTS "Permitir lectura pública de fotos" ON public.fotos;
DROP POLICY IF EXISTS "Permitir eliminación de fotos para autenticados" ON public.fotos;

-- Permitir que cualquiera pueda insertar fotos (público)
CREATE POLICY "Permitir inserción pública de fotos"
    ON public.fotos
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Permitir que cualquiera pueda leer fotos (público)
CREATE POLICY "Permitir lectura pública de fotos"
    ON public.fotos
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Permitir que usuarios autenticados puedan eliminar (para admin)
CREATE POLICY "Permitir eliminación de fotos para autenticados"
    ON public.fotos
    FOR DELETE
    TO authenticated
    USING (true);

-- 6. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_confirmaciones_created_at ON public.confirmaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_asiste ON public.confirmaciones(asiste);
CREATE INDEX IF NOT EXISTS idx_fotos_created_at ON public.fotos(created_at DESC);

-- ============================================
-- NOTA: También necesitás crear el bucket de Storage
-- ============================================
-- Ve a: Storage > Create a new bucket
-- Nombre: "fotos"
-- Público: Sí (para que las fotos sean accesibles públicamente)
-- File size limit: El que prefieras (ej: 5MB)
-- Allowed MIME types: image/*
