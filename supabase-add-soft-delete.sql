-- ============================================
-- Agregar campo para soft delete en tabla fotos
-- ============================================
-- Ejecutá este script en el SQL Editor de Supabase

-- Agregar campo eliminada a la tabla fotos
ALTER TABLE public.fotos 
ADD COLUMN IF NOT EXISTS eliminada BOOLEAN DEFAULT false NOT NULL;

-- Crear índice para mejorar consultas de fotos no eliminadas
CREATE INDEX IF NOT EXISTS idx_fotos_eliminada ON public.fotos(eliminada) WHERE eliminada = false;

-- Actualizar política de SELECT para excluir fotos eliminadas por defecto
-- (Las fotos eliminadas solo las verán los admins)
DROP POLICY IF EXISTS "Permitir lectura pública de fotos" ON public.fotos;

CREATE POLICY "Permitir lectura pública de fotos"
    ON public.fotos
    FOR SELECT
    TO anon, authenticated
    USING (eliminada = false);

-- Política para que admins puedan ver todas las fotos (incluyendo eliminadas)
DROP POLICY IF EXISTS "Permitir lectura completa de fotos para autenticados" ON public.fotos;

CREATE POLICY "Permitir lectura completa de fotos para autenticados"
    ON public.fotos
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para actualizar el campo eliminada (soft delete)
-- Permitir tanto para anon como authenticated (ya que el backoffice usa contraseña simple)
DROP POLICY IF EXISTS "Permitir soft delete de fotos para autenticados" ON public.fotos;
DROP POLICY IF EXISTS "Permitir actualización de fotos para todos" ON public.fotos;

CREATE POLICY "Permitir actualización de fotos para todos"
    ON public.fotos
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
