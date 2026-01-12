-- ============================================
-- SOLUCIÓN SIMPLE Y DIRECTA
-- ============================================
-- Si el script completo no funciona, probá este enfoque más simple

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE public.confirmaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas manualmente (cambia los nombres si son diferentes)
DROP POLICY IF EXISTS "Permitir inserción pública de confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "Permitir lectura pública de confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "Permitir eliminación para autenticados" ON public.confirmaciones;
DROP POLICY IF EXISTS "anon_insert_confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "authenticated_insert_confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "anon_select_confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "authenticated_select_confirmaciones" ON public.confirmaciones;
DROP POLICY IF EXISTS "authenticated_delete_confirmaciones" ON public.confirmaciones;

DROP POLICY IF EXISTS "Permitir inserción pública de fotos" ON public.fotos;
DROP POLICY IF EXISTS "Permitir lectura pública de fotos" ON public.fotos;
DROP POLICY IF EXISTS "Permitir eliminación de fotos para autenticados" ON public.fotos;
DROP POLICY IF EXISTS "anon_insert_fotos" ON public.fotos;
DROP POLICY IF EXISTS "authenticated_insert_fotos" ON public.fotos;
DROP POLICY IF EXISTS "anon_select_fotos" ON public.fotos;
DROP POLICY IF EXISTS "authenticated_select_fotos" ON public.fotos;
DROP POLICY IF EXISTS "authenticated_delete_fotos" ON public.fotos;

-- 3. Habilitar RLS
ALTER TABLE public.confirmaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas usando PERMISSIVE (más permisivo)
-- Para confirmaciones
CREATE POLICY "confirmaciones_insert_all"
    ON public.confirmaciones
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "confirmaciones_select_all"
    ON public.confirmaciones
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

-- Para fotos
CREATE POLICY "fotos_insert_all"
    ON public.fotos
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "fotos_select_all"
    ON public.fotos
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

-- Verificar
SELECT policyname, tablename, cmd, roles FROM pg_policies 
WHERE tablename IN ('confirmaciones', 'fotos') AND schemaname = 'public';
