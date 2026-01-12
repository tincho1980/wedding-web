-- ============================================
-- Script de DIAGNÓSTICO de políticas RLS
-- ============================================
-- Ejecutá este script primero para ver qué políticas existen

-- Ver todas las políticas actuales
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
    AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar si RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('confirmaciones', 'fotos')
    AND schemaname = 'public';

-- Verificar permisos de la tabla
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name IN ('confirmaciones', 'fotos');
