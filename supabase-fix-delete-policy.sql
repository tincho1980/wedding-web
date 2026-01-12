-- ============================================
-- Corregir política de DELETE para confirmaciones
-- ============================================
-- Ejecutá este script en el SQL Editor de Supabase

-- Eliminar política existente
DROP POLICY IF EXISTS "Permitir eliminación para autenticados" ON public.confirmaciones;

-- Crear política que permita DELETE tanto para anon como authenticated
-- (necesario porque el backoffice usa contraseña simple, no autenticación real)
CREATE POLICY "Permitir eliminación de confirmaciones para todos"
    ON public.confirmaciones
    FOR DELETE
    TO anon, authenticated
    USING (true);
