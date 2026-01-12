-- ============================================
-- Script COMPLETO para corregir políticas RLS
-- ============================================
-- Este script es más agresivo y debería solucionar el problema
-- Ejecutá TODO este script en el SQL Editor de Supabase

-- PASO 1: Deshabilitar RLS temporalmente para limpiar
ALTER TABLE IF EXISTS public.confirmaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fotos DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas existentes (por si hay conflictos)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Eliminar todas las políticas de confirmaciones
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'confirmaciones' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.confirmaciones';
    END LOOP;
    
    -- Eliminar todas las políticas de fotos
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'fotos' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.fotos';
    END LOOP;
END $$;

-- PASO 3: Habilitar RLS nuevamente
ALTER TABLE public.confirmaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas PERMISIVAS para confirmaciones
-- Política de INSERT: Permitir a todos (anon y authenticated)
CREATE POLICY "anon_insert_confirmaciones"
    ON public.confirmaciones
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "authenticated_insert_confirmaciones"
    ON public.confirmaciones
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política de SELECT: Permitir a todos
CREATE POLICY "anon_select_confirmaciones"
    ON public.confirmaciones
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "authenticated_select_confirmaciones"
    ON public.confirmaciones
    FOR SELECT
    TO authenticated
    USING (true);

-- Política de DELETE: Solo authenticated
CREATE POLICY "authenticated_delete_confirmaciones"
    ON public.confirmaciones
    FOR DELETE
    TO authenticated
    USING (true);

-- PASO 5: Crear políticas PERMISIVAS para fotos
-- Política de INSERT: Permitir a todos (anon y authenticated)
CREATE POLICY "anon_insert_fotos"
    ON public.fotos
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "authenticated_insert_fotos"
    ON public.fotos
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política de SELECT: Permitir a todos
CREATE POLICY "anon_select_fotos"
    ON public.fotos
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "authenticated_select_fotos"
    ON public.fotos
    FOR SELECT
    TO authenticated
    USING (true);

-- Política de DELETE: Solo authenticated
CREATE POLICY "authenticated_delete_fotos"
    ON public.fotos
    FOR DELETE
    TO authenticated
    USING (true);

-- PASO 6: Verificar que las políticas se crearon
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename IN ('confirmaciones', 'fotos')
    AND schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- PASO 7: Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('confirmaciones', 'fotos')
    AND schemaname = 'public';
