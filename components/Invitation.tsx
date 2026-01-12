
import React, { useEffect, useState } from 'react';
import type { View } from '../types';
import { HeartIcon, HangerIcon, UsersIcon, GiftIcon, CopyIcon, CheckIcon, RsvpIcon } from './Icons';
import Countdown from './Countdown';

interface InvitationProps {
  setView: (view: View) => void;
  guestNames?: string;
}

const Invitation: React.FC<InvitationProps> = ({ setView, guestNames }) => {
  const weddingDate = new Date('2026-02-28T18:00:00');
  const [copied, setCopied] = useState(false);
  const alias = "BODA.ROSALIA.MARTIN";

  // Formatear los nombres para el saludo
  const formatGuestNames = (names?: string): string => {
    if (!names) return 'Queridos invitados';
    
    const nameList = names.split(',').map(n => n.trim()).filter(n => n);
    if (nameList.length === 0) return 'Queridos invitados';
    if (nameList.length === 1) return nameList[0];
    if (nameList.length === 2) return `${nameList[0]} y ${nameList[1]}`;
    
    const last = nameList.pop();
    return `${nameList.join(', ')} y ${last}`;
  };

  const guestName = formatGuestNames(guestNames);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(alias);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmAttendance = () => {
    // Redirigir al formulario RSVP con los nombres prellenados si hay
    setView('rsvp');
  };

  return (
    <div className="relative min-h-screen bg-[#FFFBF5] text-[#5D4037]">
      <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        
        {/* Header Principal */}
        <header className="mb-12 w-full">
          <h2 className="text-xl md:text-2xl tracking-[0.3em] text-[#800020] font-serif mb-4 font-bold opacity-80 uppercase">
            Estreno Mundial de nuestra Boda
          </h2>
          
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-serif text-[#800020] leading-tight mb-4">
              Rosalía <span className="text-3xl md:text-4xl text-[#a77b3b] my-2">&</span> Martín
            </h1>
            <p className="text-[#a77b3b] italic font-serif text-lg mb-6 opacity-80">
              "Las historias de amor no solo se ven en las películas..."
            </p>
          </div>

          {/* Saludo Personalizado */}
          <div className="bg-white/80 p-8 rounded-3xl shadow-xl border-2 border-[#E1C16E] mb-8 animate-fade-in-up">
            <p className="text-2xl md:text-3xl font-serif text-[#800020] mb-4">
              ¡{guestName}!
            </p>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
              Estamos emocionados de invitarte a celebrar con nosotros el día más importante de nuestras vidas.
            </p>
          </div>

          {/* Fecha y Lugar */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mt-8 text-lg font-light tracking-wide">
            <div className="border-y border-[#E1C16E] py-2 px-6 text-[#800020] font-bold uppercase">
              SÁBADO 28 FEB 2026
            </div>
            <HeartIcon className="w-5 h-5 text-[#800020]" />
            <div className="border-y border-[#E1C16E] py-2 px-6 text-[#800020] font-bold">
              LA PLATA, ARG
            </div>
          </div>
        </header>

        {/* Countdown */}
        <div className="w-full mb-12">
          <Countdown targetDate={weddingDate} />
        </div>

        {/* Botón Principal de Confirmación */}
        <div className="w-full mb-16">
          <button
            onClick={handleConfirmAttendance}
            className="bg-[#800020] hover:bg-[#6D071A] text-white font-bold py-5 px-16 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 tracking-[0.2em] uppercase text-base md:text-lg flex items-center mx-auto"
          >
            <RsvpIcon className="w-6 h-6 mr-3" />
            Confirmar Asistencia
          </button>
        </div>

        {/* Información Importante */}
        <div className="w-full space-y-8 mb-12">
          {/* Dress Code */}
          <div className="bg-white/60 p-8 rounded-3xl shadow-inner border border-white flex flex-col items-center animate-fade-in-up">
            <HangerIcon className="w-12 h-12 text-[#800020] mb-4" />
            <h4 className="font-serif text-3xl font-bold text-[#800020] mb-3 uppercase tracking-tight">Dress Code</h4>
            <p className="text-gray-700 font-bold text-xl mb-2">Elegante Sport</p>
            <p className="text-base text-gray-600 italic mt-2 leading-relaxed text-center max-w-md">
              Amamos el color, pero el único color prohibido es{' '}
              <span className="text-[#800020] font-bold uppercase underline">el morado</span>.
            </p>
          </div>

          {/* Niños */}
          <div className="bg-white/60 p-8 rounded-3xl shadow-inner border border-white flex flex-col items-center animate-fade-in-up" style={{animationDelay: '150ms'}}>
            <UsersIcon className="w-12 h-12 text-[#800020] mb-4" />
            <h4 className="font-serif text-3xl font-bold text-[#800020] mb-3 uppercase tracking-tight">Niños</h4>
            <p className="text-base text-gray-600 leading-relaxed italic px-4 text-center max-w-md">
              Nos encantan los niños, pero hemos decidido tener una noche solo para adultos. ¡Agradecemos su comprensión!
            </p>
          </div>
        </div>

        {/* Lista de Regalos */}
        <div className="w-full px-6 py-12 bg-[#800020]/5 rounded-[3rem] border-2 border-[#800020]/10 animate-fade-in-up">
          <GiftIcon className="w-16 h-16 text-[#800020] mx-auto mb-6" />
          <h3 className="font-serif text-4xl md:text-5xl mb-4 text-[#800020]">Lista de Regalos</h3>
          <p className="text-gray-600 italic mb-8 max-w-md mx-auto leading-relaxed text-lg">
            Si deseás hacernos un presente, agradeceríamos mucho tu colaboración para nuestra luna de miel.
          </p>
          
          <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 font-bold">Datos Bancarios</span>
            <div className="flex items-center space-x-3 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 mb-4 w-full justify-between">
              <span className="text-xl font-mono font-bold text-[#5D4037] tracking-tighter">{alias}</span>
              <button 
                onClick={copyToClipboard}
                className={`p-2 rounded-full transition-all duration-300 ${copied ? 'bg-green-100 text-green-600' : 'bg-white shadow-sm text-gray-500 hover:text-[#800020]'}`}
              >
                {copied ? <CheckIcon className="w-6 h-6" /> : <CopyIcon className="w-6 h-6" />}
              </button>
            </div>
            
            <div className="w-full text-center space-y-2">
              <p className="text-sm text-gray-400">Banco: <span className="font-bold text-gray-600">Galicia</span></p>
              <p className="text-sm text-gray-400">Titular: <span className="font-bold text-gray-600">Martín Pérez</span></p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mt-16 w-full">
          <h3 className="font-serif text-3xl mb-6 text-[#a77b3b] border-b border-[#E1C16E] pb-2 inline-block">Ubicación</h3>
          <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.272102046896!2d-57.95856412431792!3d-34.922883572841915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a2e62b1f00e49d%3A0x3d58e2a22f20739c!2sCatedral%20de%20La%20Plata!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar" 
              width="100%" 
              height="350px" 
              style={{border:0}} 
              allowFullScreen={true}
              loading="lazy" 
              title="Catedral de La Plata">
            </iframe>
          </div>
        </div>

        {/* Mensaje Final */}
        <div className="mt-16 bg-white/60 p-8 rounded-3xl shadow-inner border border-white max-w-2xl">
          <p className="text-xl md:text-2xl font-serif text-[#800020] italic leading-relaxed">
            "Esperamos compartir este momento tan especial con vos. Tu presencia es el mejor regalo que podríamos recibir."
          </p>
          <p className="text-lg text-[#a77b3b] font-serif mt-6">
            Con amor,<br/>
            <span className="text-2xl font-bold">Rosalía & Martín</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invitation;
