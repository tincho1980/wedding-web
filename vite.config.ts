import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // loadEnv lee de archivos .env locales
    const env = loadEnv(mode, '.', '');
    
    // Función helper para obtener variables de entorno (primero de process.env, luego de loadEnv)
    const getEnv = (key: string): string => {
      return process.env[key] || env[key] || '';
    };
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // API Keys de Gemini (ambas variantes para compatibilidad)
        'process.env.API_KEY': JSON.stringify(getEnv('GEMINI_API_KEY')),
        'process.env.GEMINI_API_KEY': JSON.stringify(getEnv('GEMINI_API_KEY')),
        
        // Supabase URL (con fallbacks para compatibilidad)
        'process.env.VITE_SUPABASE_URL': JSON.stringify(
          getEnv('VITE_SUPABASE_URL') || 
          getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
          getEnv('SUPABASE_URL') || 
          ''
        ),
        'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
          getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
          getEnv('VITE_SUPABASE_URL') || 
          getEnv('SUPABASE_URL') || 
          ''
        ),
        'process.env.SUPABASE_URL': JSON.stringify(
          getEnv('SUPABASE_URL') || 
          getEnv('VITE_SUPABASE_URL') || 
          getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
          ''
        ),
        
        // Supabase Anon Key (con fallbacks para compatibilidad)
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
          getEnv('VITE_SUPABASE_ANON_KEY') || 
          getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
          getEnv('SUPABASE_ANON_KEY') || 
          ''
        ),
        'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
          getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
          getEnv('VITE_SUPABASE_ANON_KEY') || 
          getEnv('SUPABASE_ANON_KEY') || 
          ''
        ),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(
          getEnv('SUPABASE_ANON_KEY') || 
          getEnv('VITE_SUPABASE_ANON_KEY') || 
          getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
          ''
        ),
        
        // Contraseña de administración
        'process.env.VITE_ADMIN_PASSWORD': JSON.stringify(getEnv('VITE_ADMIN_PASSWORD'))
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
