
import React, { useEffect, useState } from 'react';
import type { View } from '../types';
import { HeartIcon, HangerIcon, UsersIcon, GiftIcon, CopyIcon, CheckIcon, RsvpIcon } from './Icons';
import Countdown from './Countdown';

interface InvitationProps {
  setView: (view: View) => void;
  guestNames?: string;
}

const CinemaBanner: React.FC<{ 
  images: { src: string; title: string }[]; 
  side: 'left' | 'right';
  onImageClick: (src: string) => void;
}> = ({ images, side, onImageClick }) => {
  const rotations = side === 'left' ? [-3, 2, -1.5] : [2.5, -2, 3];
  
  return (
    <div 
      className={`hidden lg:flex flex-col gap-12 w-64 fixed top-0 h-screen justify-center z-0 ${
        side === 'left' ? 'left-6 animate-slide-in-left' : 'right-6 animate-slide-in-right'
      }`}
    >
      {images.map((img, idx) => (
        <div 
          key={idx} 
          className="relative group rounded-sm shadow-2xl transition-all duration-500 hover:scale-110 hover:z-10 cursor-pointer"
          style={{ transform: `rotate(${rotations[idx % rotations.length]}deg)` }}
          onClick={() => onImageClick(img.src)}
        >
          <div className="bg-white p-2 pb-6 shadow-md border border-gray-200">
            <div className="aspect-video w-full overflow-hidden bg-black">
              <img 
                src={img.src} 
                alt={img.title} 
                className="w-full h-full object-cover filter sepia-[0.2] brightness-95 grayscale-[0.1] transition-transform duration-700 group-hover:scale-105" 
                onError={(e) => {
                  console.error(`Error cargando imagen: ${img.src}`);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="mt-3 text-center">
              <span className="text-[#a77b3b] text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-serif italic font-semibold">{img.title}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MobileCinemaStack: React.FC<{ 
  images: { src: string; title: string }[];
  onImageClick: (src: string) => void;
}> = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="lg:hidden relative h-64 w-full max-w-[320px] mx-auto mb-16 mt-8">
      {images.map((img, idx) => {
        const offset = (idx - currentIndex + images.length) % images.length;
        const isTop = offset === 0;
        const rotations = [3, -4, 2, -2, 5, -3];
        const rotation = rotations[idx % rotations.length];

        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-white p-2 pb-6 shadow-xl border border-gray-100 rounded-sm cursor-pointer`}
            style={{
              zIndex: images.length - offset,
              transform: isTop 
                ? `rotate(${rotation}deg) translateY(0) scale(1)` 
                : `rotate(${rotation}deg) translateY(${offset * 4}px) scale(${1 - offset * 0.05})`,
              opacity: offset > 3 ? 0 : 1,
              visibility: offset > 3 ? 'hidden' : 'visible'
            }}
            onClick={() => onImageClick(img.src)}
          >
            <div className="aspect-video w-full overflow-hidden bg-black">
              <img 
                src={img.src} 
                alt={img.title} 
                className="w-full h-full object-cover filter sepia-[0.1] brightness-90" 
                onError={(e) => {
                  console.error(`Error cargando imagen: ${img.src}`);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-[#a77b3b] text-[10px] uppercase tracking-widest font-serif italic">{img.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Invitation: React.FC<InvitationProps> = ({ setView, guestNames }) => {
  const weddingDate = new Date('2026-02-28T18:00:00');
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const alias = "BODA.ROSI.MARTIN";

  const allScenes = [
    { src: "/images/banners/titanic.jpg", title: "Titanic" },
    { src: "/images/banners/pritty_woman.jpg", title: "Pretty Woman" },
    { src: "/images/banners/harry_conocio_sally.jpg", title: "Cuando Harry Conocio a Sally" },
    { src: "/images/banners/ghost.png", title: "Ghost" },
    { src: "/images/banners/starwars.png", title: "Star Wars" },
    { src: "/images/banners/casa_blanca.png", title: "Casablanca" }
  ];

  const leftScenes = allScenes.slice(0, 3);
  const rightScenes = allScenes.slice(3, 6);

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

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
  };

  return (
    <div className="relative min-h-screen bg-[#FFFBF5] text-[#5D4037]">
      <CinemaBanner images={leftScenes} side="left" onImageClick={handleImageClick} />
      <CinemaBanner images={rightScenes} side="right" onImageClick={handleImageClick} />

      <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto px-4 py-12 animate-fade-in relative z-10">
        
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

        <MobileCinemaStack images={allScenes} onImageClick={handleImageClick} />

        {/* Countdown */}
        <div className="w-full mb-12">
          <Countdown targetDate={weddingDate} />
        </div>

        {/* Información Importante */}
        <div className="w-full space-y-8 mb-12">
          {/* Dress Code */}
          <div className="bg-white/60 p-8 rounded-3xl shadow-inner border border-white flex flex-col items-center animate-fade-in-up">
            <HangerIcon className="w-12 h-12 text-[#800020] mb-4" />
            <h4 className="font-serif text-3xl font-bold text-[#800020] mb-3 uppercase tracking-tight">Dress Code</h4>
            <p className="text-gray-700 font-bold text-xl mb-2">Elegante Sport</p>
            <p className="text-base text-gray-500 italic mt-2 leading-relaxed text-center max-w-md">
              Venite lindo/a y cómodo/a,<br/>
            </p>
            <p className="text-base text-gray-500 italic mt-2 leading-relaxed text-center max-w-md">
              el único color prohibido es <br/>
              <span className="text-[#800020] font-bold uppercase underline">el morado</span>.
            </p>
          </div>

          {/* Niños */}
          <div className="bg-white/60 p-8 rounded-3xl shadow-inner border border-white flex flex-col items-center animate-fade-in-up" style={{animationDelay: '150ms'}}>
            <UsersIcon className="w-12 h-12 text-[#800020] mb-4" />
            <h4 className="font-serif text-3xl font-bold text-[#800020] mb-3 uppercase tracking-tight">Niños</h4>
            <p className="text-base text-gray-600 leading-relaxed italic px-4 text-center max-w-md">
              Nos encantan los niños, pero hemos decidido tener una noche solo para adultos.
            </p>
            <p className="text-base text-gray-600 leading-relaxed italic px-4 text-center max-w-md">
              ¡Agradecemos su comprensión!
            </p>
          </div>
        </div>

        {/* Lista de Regalos */}
        <div className="w-full px-6 py-12 bg-[#800020]/5 rounded-[3rem] border-2 border-[#800020]/10 animate-fade-in-up">
          <GiftIcon className="w-16 h-16 text-[#800020] mx-auto mb-6" />
          <h3 className="font-serif text-4xl md:text-5xl mb-4 text-[#800020]">Lista de Regalos</h3>
          <p className="text-gray-600 italic mb-8 max-w-md mx-auto leading-relaxed text-lg">
          Nuestro mejor regalo es tu presencia...
          <br/>
          ¡pero la luna de miel no se paga sola!
          <br/>
          ¡Ayudanos con el viaje!
          </p>
          
          <div className="flex flex-col items-center bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm mx-auto w-full">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 font-bold">Datos Bancarios</span>
            <div className="flex items-center space-x-2 md:space-x-3 bg-gray-50 px-3 md:px-6 py-3 md:py-4 rounded-2xl border border-gray-100 mb-4 w-full min-w-0">
              <span className="text-sm md:text-xl font-mono font-bold text-[#5D4037] tracking-tighter truncate flex-1 min-w-0">{alias}</span>
              <button 
                onClick={copyToClipboard}
                className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${copied ? 'bg-green-100 text-green-600' : 'bg-white shadow-sm text-gray-500 hover:text-[#800020]'}`}
              >
                {copied ? <CheckIcon className="w-5 h-5 md:w-6 md:h-6" /> : <CopyIcon className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
            </div>
            
            <div className="w-full text-center space-y-2">
            <p className="text-xs text-gray-400">Billetera: <span className="font-bold text-gray-600">Naranja X</span></p>
              <p className="text-xs text-gray-400">CBU: <span className="font-bold text-gray-600">4530000800015271711245</span></p>
              <p className="text-xs text-gray-400">Titular: <span className="font-bold text-gray-600">Martín Ramallo</span></p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mt-16 w-full">
          <h3 className="font-serif text-3xl mb-6 text-[#a77b3b] border-b border-[#E1C16E] pb-2 inline-block">Ubicación</h3>
          <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
            <iframe 
              src="https://www.google.com/maps?q=-34.82784390680582,-57.9646773662116&hl=es&z=15&output=embed&markers=color:red%7Clabel:V%7C-34.82784390680582,-57.9646773662116"
              width="100%" 
              height="350px" 
              style={{border:0}} 
              allowFullScreen={true}
              loading="lazy" 
              title="Villa Punta Lara">
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

      {/* Modal para ver imagen ampliada */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] animate-fade-in p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={selectedImage} 
              alt="Vista ampliada" 
              className="max-w-[95vw] max-h-[90vh] rounded-lg shadow-2xl border-4 border-white/10 object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitation;
