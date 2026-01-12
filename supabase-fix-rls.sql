-- ============================================
-- Script para corregir políticas RLS
-- ============================================
-- Ejecutá este script si recibís errores de "row-level security policy"
-- en el SQL Editor de Supabase

-- 1. Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Permitir inserción pública de confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "Permitir lectura pública de confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "Permitir eliminación para autenticados" ON public.confirmaciones;

DROP POLICY IF EXISTS "Permitir inserción pública de fotos" ON public.fotos;
DROP POLICY IF EXISTS "Permitir lectura pública de fotos" ON public.fotos;
DROP POLICY IF EXISTS "Permitir eliminación de fotos para autenticados" ON public.fotos;

-- 2. Asegurar que RLS esté habilitado
ALTER TABLE public.confirmaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para confirmaciones (público puede insertar y leer)
CREATE POLICY "Permitir inserción pública de confirmaciones"
    ON public.confirmaciones
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de confirmaciones"
    ON public.confirmaciones
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Permitir eliminación para autenticados"
    ON public.confirmaciones
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Crear políticas para fotos (público puede insertar y leer)
CREATE POLICY "Permitir inserción pública de fotos"
    ON public.fotos
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de fotos"
    ON public.fotos
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Permitir eliminación de fotos para autenticados"
    ON public.fotos
    FOR DELETE
    TO authenticated
    USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('confirmaciones', 'fotos')
ORDER BY tablename, policyname;
