
import React, { useState } from 'react';
import type { View } from '../types';

interface AdminLoginProps {
  setView: (view: View) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ setView }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // La contraseña se configura mediante la variable de entorno VITE_ADMIN_PASSWORD
    // Intentar leer de process.env (definido en vite.config.ts) o import.meta.env (Vite nativo)
    let adminPassword = '';
    try {
      if (typeof process !== 'undefined' && process.env?.VITE_ADMIN_PASSWORD) {
        adminPassword = process.env.VITE_ADMIN_PASSWORD;
      } else {
        const metaEnv = (import.meta as any)?.env;
        if (metaEnv?.VITE_ADMIN_PASSWORD) {
          adminPassword = metaEnv.VITE_ADMIN_PASSWORD;
        }
      }
    } catch (e) {
      console.warn('Error al leer variables de entorno:', e);
    }
    
    if (!adminPassword) {
      console.error('⚠️ VITE_ADMIN_PASSWORD no está configurada en las variables de entorno');
      console.error('Debug - process.env:', typeof process !== 'undefined' ? process.env : 'no disponible');
      try {
        console.error('Debug - import.meta.env:', (import.meta as any)?.env || 'no disponible');
      } catch {
        console.error('Debug - import.meta.env: no disponible');
      }
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }

    if (password === adminPassword) {
      setView('admin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl mt-20 animate-fade-in">
      <h2 className="text-3xl font-serif text-center mb-6 text-[#a77b3b]">Acceso Backoffice</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E1C16E] focus:border-[#E1C16E]"
            placeholder="Ingrese la contraseña"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">Contraseña incorrecta</p>}
        <button
          type="submit"
          className="w-full py-3 px-4 border border-transparent rounded-full shadow-lg text-white bg-[#800020] hover:bg-[#6D071A] font-bold transition-all duration-300"
        >
          Ingresar
        </button>
      </form>
      <button 
        onClick={() => setView('home')}
        className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
      >
        Volver al inicio
      </button>
    </div>
  );
};

export default AdminLogin;
