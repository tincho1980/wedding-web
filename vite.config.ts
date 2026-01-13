import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // loadEnv lee de archivos .env locales
    const env = loadEnv(mode, '.', '');
    
    // Función helper para obtener variables de entorno (primero de process.env, luego de loadEnv)
    // En Cloudflare Pages, las variables están disponibles en process.env durante el build
    const getEnv = (key: string): string => {
      const value = process.env[key] || env[key] || '';
      // Log durante el build para debugging (solo en desarrollo)
      if (mode === 'development' && value) {
        console.log(`✅ Variable ${key} encontrada`);
      } else if (mode === 'development' && !value) {
        console.warn(`⚠️ Variable ${key} no encontrada`);
      }
      return value;
    };
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // API Key de Gemini
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(getEnv('VITE_GEMINI_API_KEY')),
        'process.env.API_KEY': JSON.stringify(getEnv('VITE_GEMINI_API_KEY')), // Compatibilidad con código existente
        'process.env.GEMINI_API_KEY': JSON.stringify(getEnv('VITE_GEMINI_API_KEY')), // Compatibilidad con código existente
        
        // Supabase URL
        'process.env.VITE_SUPABASE_URL': JSON.stringify(getEnv('VITE_SUPABASE_URL')),
        
        // Supabase Anon Key
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(getEnv('VITE_SUPABASE_ANON_KEY')),
        
        // Contraseña de administración
        'process.env.VITE_ADMIN_PASSWORD': JSON.stringify(getEnv('VITE_ADMIN_PASSWORD')),
        
        // Resend API Key para envío de emails
        'process.env.VITE_RESEND_API_KEY': JSON.stringify(getEnv('VITE_RESEND_API_KEY'))
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
