
import React, { useState, useEffect } from 'react';
import type { View } from './types';
import Home from './components/Home';
import RsvpForm from './components/RsvpForm';
import PhotoUpload from './components/PhotoUpload';
import Gallery from './components/Gallery';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Invitation from './components/Invitation';
import { HomeIcon, RsvpIcon, CameraIcon, GalleryIcon } from './components/Icons';
import { checkSupabaseConnection, checkDatabaseTables } from './lib/supabaseClient';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [guestNames, setGuestNames] = useState<string | undefined>(undefined);

  // Leer query params al montar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const names = urlParams.get('nombres');
    const viewParam = urlParams.get('view');
    const fotosParam = urlParams.get('fotos');
    
    // Si hay un parámetro 'view' o 'fotos', redirigir a esa vista
    if (viewParam === 'photos' || fotosParam !== null) {
      setView('photos');
    } else if (names) {
      setGuestNames(names);
      setView('invitation');
    }
  }, []);

  // Verificar conexión a Supabase y tablas al montar el componente
  useEffect(() => {
    const verifySetup = async () => {
      const connected = await checkSupabaseConnection();
      if (connected) {
        // Si la conexión funciona, verificar que las tablas existan
        await checkDatabaseTables();
      }
    };
    verifySetup();
  }, []);

  const renderView = () => {
    switch (view) {
      case 'invitation':
        return <Invitation setView={setView} guestNames={guestNames} />;
      case 'rsvp':
        return <RsvpForm setView={setView} />;
      case 'photos':
        return <PhotoUpload setView={setView} />;
      case 'gallery':
        return <Gallery setView={setView} />;
      case 'admin-login':
        return <AdminLogin setView={setView} />;
      case 'admin':
        return <AdminPanel setView={setView} />;
      case 'home':
      default:
        return <Home setView={setView} />;
    }
  };

  const NavItem: React.FC<{
    targetView: View;
    icon: React.ReactNode;
    label: string;
    featured?: boolean;
  }> = ({ targetView, icon, label, featured }) => {
    const isActive = view === targetView;
    
    if (featured) {
      return (
        <button
          onClick={() => setView(targetView)}
          className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
            isActive ? 'translate-y-[-1rem]' : 'animate-jump-up'
          }`}
        >
          <div className={`p-4 rounded-full shadow-2xl transition-all duration-300 border-4 border-[#FFFBF5] ${
            isActive 
              ? 'bg-black text-white scale-110' 
              : 'bg-[#800020] text-white glow-rsvp'
          }`}>
            {icon}
          </div>
          <span className={`mt-1 text-[10px] uppercase font-bold tracking-tighter text-center leading-tight max-w-[80px] ${
            isActive ? 'text-black' : 'text-[#800020]'
          }`}>
            {label}
          </span>
        </button>
      );
    }

    return (
      <button
        onClick={() => setView(targetView)}
        className={`flex flex-col items-center justify-center w-full transition-all duration-300 ${
          isActive 
            ? 'text-[#800020] font-bold' 
            : 'text-gray-400 hover:text-[#800020]'
        }`}
      >
        <div className="flex flex-col items-center">
          {icon}
          <span className="mt-1 uppercase tracking-tighter text-center px-1 text-[10px] md:text-xs">{label}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-[#FFFBF5] min-h-screen text-[#4a4a4a] flex flex-col font-sans">
      <main className="flex-grow container mx-auto p-4 md:p-6 mb-20">
        {renderView()}
      </main>

      {/* Admin Link - Sutil pero accesible */}
      {!view.startsWith('admin') && view !== 'invitation' && (
        <div className="flex justify-center pb-28 opacity-30 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setView('admin-login')} 
            className="text-[10px] text-gray-400 hover:underline tracking-widest uppercase"
          >
            Acceso Backstage
          </button>
        </div>
      )}

      <nav className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-[0_-10px_40px_rgba(0,0,0,0.12)] z-50 border-t border-gray-100 h-20 ${view === 'invitation' ? 'hidden' : ''}`}>
        <div className="container mx-auto flex items-center justify-around max-w-xl h-full px-2">
          <div className="flex-1 flex justify-center">
            <NavItem targetView="home" icon={<HomeIcon className="w-5 h-5" />} label="Inicio" />
          </div>
          
          <div className="flex-1 flex justify-center">
            <NavItem 
              targetView="rsvp" 
              icon={<RsvpIcon className="w-7 h-7" />} 
              label="confirmar asistencia" 
              featured={true}
            />
          </div>
          
          <div className="flex-1 flex justify-center">
            <NavItem targetView="photos" icon={<CameraIcon className="w-5 h-5" />} label="Fotos" />
          </div>
          
          <div className="flex-1 flex justify-center">
            <NavItem targetView="gallery" icon={<GalleryIcon className="w-5 h-5" />} label="Galería" />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default App;
