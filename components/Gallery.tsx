
import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { GalleryIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

interface GalleryProps {
  setView: (view: View) => void;
}

interface PhotoItem {
  id: string;
  url: string;
  created_at: string;
  eliminada?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ setView }) => {
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchPhotos = async () => {
        setLoading(true);
        try {
          // Intentar filtrar por eliminada, si la columna no existe, simplemente obtener todas
          let query = supabase
            .from('fotos')
            .select('*')
            .order('created_at', { ascending: false });

          // Intentar agregar el filtro de eliminada
          const { data, error } = await query;

          if (error) {
            // Si el error es porque la columna no existe, intentar sin el filtro
            if (error.code === '42703' || error.message?.includes('does not exist')) {
              console.warn('Columna eliminada no existe, obteniendo todas las fotos');
              const { data: allData, error: allError } = await supabase
                .from('fotos')
                .select('*')
                .order('created_at', { ascending: false });
              
              if (allError) {
                console.error("Error al cargar fotos:", allError);
              } else if (allData) {
                setPhotos(allData);
              }
            } else {
              console.error("Error al cargar fotos:", error);
            }
          } else if (data) {
            // Filtrar fotos eliminadas en el cliente si la columna existe
            const fotosActivas = data.filter((photo: any) => !photo.eliminada);
            setPhotos(fotosActivas);
          }
        } catch (err) {
          console.error("Error inesperado al cargar fotos:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPhotos();
    }, []);

    return (
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
            <GalleryIcon className="w-16 h-16 text-[#a77b3b] mx-auto mb-4" />
            <h1 className="text-4xl font-serif mb-2 text-[#a77b3b]">Nuestros Recuerdos</h1>
            <p className="text-gray-500 mb-8">Momentos compartidos por nuestros invitados.</p>

            {loading ? (
              <div className="py-12 flex justify-center flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#E1C16E] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400 italic">Revelando fotos...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 italic">Todavía no hay fotos en el álbum. ¡Sé el primero en subir una!</p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {photos.map(photo => (
                      <div key={photo.id} className="break-inside-avoid rounded-lg shadow-md overflow-hidden cursor-pointer group bg-gray-100" onClick={() => setSelectedImg(photo.url)}>
                          <img 
                              src={photo.url} 
                              alt="Recuerdo de la boda" 
                              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                              loading="lazy"
                          />
                      </div>
                  ))}
              </div>
            )}

            {selectedImg && (
                <div 
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] animate-fade-in p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImg(null)}
                >
                    <div className="relative max-w-full max-h-full">
                      <img src={selectedImg} alt="Vista ampliada" className="max-w-[95vw] max-h-[90vh] rounded-lg shadow-2xl border-4 border-white/10"/>
                      <button className="absolute top-4 right-4 text-white bg-black/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black">✕</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
