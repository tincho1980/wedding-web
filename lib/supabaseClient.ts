import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    // En Vite, las variables de entorno están disponibles a través de process.env
    // cuando están definidas en vite.config.ts, o a través de import.meta.env
    // Intentar ambos métodos para máxima compatibilidad
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    // Fallback a import.meta.env (método nativo de Vite)
    // En Vite, import.meta.env está disponible directamente en módulos ES
    // Usamos una verificación segura para evitar errores en contextos donde no está disponible
    try {
      // Acceso directo a import.meta.env (Vite lo inyecta automáticamente)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - import.meta es válido en módulos ES
      const metaEnv = (import.meta as { env?: Record<string, string> })?.env;
      if (metaEnv && metaEnv[key]) {
        return metaEnv[key];
      }
    } catch {
      // import.meta no disponible en este contexto, usar solo process.env
    }
    return '';
  } catch {
    return '';
  }
};

// Obtener las variables de entorno (todas con prefijo VITE_)
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Inicialización segura para evitar que la app se rompa si faltan keys
let supabaseInstance: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase: Cliente inicializado correctamente');
  } else {
    console.warn("⚠️ Supabase: Credenciales incompletas o inválidas. La funcionalidad de DB/Storage estará limitada.");
    console.warn(`URL: ${supabaseUrl ? '✓' : '✗'}, Key: ${supabaseAnonKey ? '✓' : '✗'}`);
    // Creamos un proxy para evitar errores de 'cannot read property of null'
    // Este proxy maneja propiedades anidadas como storage.from()
    const errorResponse = { data: null, error: new Error("Supabase no configurado") };
    const createErrorProxy = (): any => new Proxy({}, {
      get: (target, prop) => {
        // Si se accede a 'storage', devolvemos un objeto con 'from'
        if (prop === 'storage') {
          return {
            from: () => ({
              upload: () => Promise.resolve(errorResponse),
              getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
          };
        }
        // Para otras propiedades, devolvemos funciones que retornan errores
        return createErrorProxy;
      },
      apply: () => errorResponse
    });
    supabaseInstance = createErrorProxy() as SupabaseClient;
  }
} catch (e) {
  console.error("❌ Error al inicializar Supabase:", e);
  supabaseInstance = null;
}

export const supabase = supabaseInstance;

/**
 * Función para verificar la conexión a Supabase
 * Solo verifica que el cliente esté configurado, sin hacer consultas
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabase) {
    console.error('❌ Supabase: No se puede verificar la conexión - Cliente no inicializado');
    return false;
  }

  // Solo verificamos que el cliente esté inicializado
  // La verificación de tablas se hace en checkDatabaseTables
  console.log('✅ Supabase: Cliente configurado correctamente');
  console.log(`   URL: ${supabaseUrl}`);
  return true;
}

/**
 * Función para verificar si las tablas necesarias existen
 * Retorna un objeto con el estado de cada tabla
 */
export async function checkDatabaseTables(): Promise<{
  confirmaciones: boolean;
  fotos: boolean;
  storageBucket: boolean;
}> {
  const result = {
    confirmaciones: false,
    fotos: false,
    storageBucket: false
  };

  if (!supabase) {
    console.error('❌ No se puede verificar las tablas - Cliente no inicializado');
    return result;
  }

  // Verificar tabla confirmaciones
  try {
    const { error } = await supabase.from('confirmaciones').select('id').limit(1);
    
    // Detectar si la tabla no existe (varios códigos de error posibles)
    const tableNotFound = 
      error?.code === '42P01' || 
      error?.code === 'PGRST116' ||
      error?.message?.includes('does not exist') ||
      error?.message?.includes('no existe') ||
      error?.message?.includes('schema cache') ||
      error?.message?.includes('Could not find the table');
    
    if (!error) {
      result.confirmaciones = true;
      console.log('✅ Tabla "confirmaciones" existe');
    } else if (tableNotFound) {
      console.warn('⚠️ Tabla "confirmaciones" no existe');
      console.log('   📋 Necesitás ejecutar el script SQL en Supabase');
    } else {
      // Otro tipo de error (permisos, etc.)
      result.confirmaciones = true;
      console.log('✅ Tabla "confirmaciones" existe (con posibles restricciones de permisos)');
    }
  } catch (err: any) {
    // Si es un error de red o similar, asumimos que la tabla no existe
    if (err?.message?.includes('schema cache') || err?.message?.includes('Could not find')) {
      console.warn('⚠️ Tabla "confirmaciones" no existe');
    } else {
      console.warn('⚠️ No se pudo verificar tabla "confirmaciones"');
    }
  }

  // Verificar tabla fotos
  try {
    const { error } = await supabase.from('fotos').select('id').limit(1);
    
    const tableNotFound = 
      error?.code === '42P01' || 
      error?.code === 'PGRST116' ||
      error?.message?.includes('does not exist') ||
      error?.message?.includes('no existe') ||
      error?.message?.includes('schema cache') ||
      error?.message?.includes('Could not find the table');
    
    if (!error) {
      result.fotos = true;
      console.log('✅ Tabla "fotos" existe');
    } else if (tableNotFound) {
      console.warn('⚠️ Tabla "fotos" no existe');
    } else {
      result.fotos = true;
      console.log('✅ Tabla "fotos" existe (con posibles restricciones de permisos)');
    }
  } catch (err: any) {
    if (err?.message?.includes('schema cache') || err?.message?.includes('Could not find')) {
      console.warn('⚠️ Tabla "fotos" no existe');
    } else {
      console.warn('⚠️ No se pudo verificar tabla "fotos"');
    }
  }

  // Verificar bucket de storage
  try {
    const { data, error } = await supabase.storage.from('fotos').list('', { limit: 1 });
    if (!error) {
      result.storageBucket = true;
      console.log('✅ Bucket de storage "fotos" existe');
    } else {
      console.warn('⚠️ Bucket de storage "fotos" no existe o no es accesible');
    }
  } catch (err: any) {
    console.warn('⚠️ No se pudo verificar bucket de storage "fotos"');
  }

  // Mostrar resumen e instrucciones si falta algo
  if (!result.confirmaciones || !result.fotos || !result.storageBucket) {
    console.log('\n📋 ============================================');
    console.log('   CONFIGURACIÓN REQUERIDA EN SUPABASE');
    console.log('============================================\n');
    console.log('Para que la aplicación funcione, necesitás:');
    console.log('');
    if (!result.confirmaciones || !result.fotos) {
      console.log('1️⃣  Crear las tablas en la base de datos:');
      console.log('   • Ve a: Supabase Dashboard > SQL Editor');
      console.log('   • Abrí el archivo "supabase-schema.sql" en este proyecto');
      console.log('   • Copiá y ejecutá todo el contenido del SQL');
      console.log('');
    }
    if (!result.storageBucket) {
      console.log('2️⃣  Crear el bucket de storage:');
      console.log('   • Ve a: Supabase Dashboard > Storage');
      console.log('   • Creá un bucket llamado "fotos" (público)');
      console.log('');
    }
    console.log('📄 También podés ver el archivo "SUPABASE_SETUP.md" para más detalles\n');
  } else {
    console.log('\n✅ ¡Todo está configurado correctamente!\n');
  }

  return result;
}
