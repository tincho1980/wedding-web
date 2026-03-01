import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { View } from '../types';
import { GalleryIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
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

const PAGE_SIZE = 12;

const Gallery: React.FC<GalleryProps> = ({ setView }) => {
    const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);
    
    // Swipe state
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const getThumbnailUrl = (url: string) => {
        if (url.includes('supabase.co')) {
            return `${url}?width=500&resize=contain`;
        }
        return url;
    };

    const lastPhotoElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
      const fetchPhotos = async () => {
        const client = supabase;
        if (!client) {
            console.error("Supabase no está inicializado");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = client
                .from('fotos')
                .select('*')
                .order('created_at', { ascending: true })
                .range(from, to);

            const { data, error } = await query;

            if (error) {
                 if (error.code === '42703' || error.message?.includes('does not exist')) {
                    console.warn('Columna eliminada no existe, obteniendo todas las fotos');
                    const { data: allData } = await client
                        .from('fotos')
                        .select('*')
                        .order('created_at', { ascending: true })
                        .range(from, to);
                    
                    if (allData) {
                        setPhotos(prev => {
                            const newPhotos = allData.filter((p: PhotoItem) => !prev.some(existing => existing.id === p.id));
                            return [...prev, ...newPhotos];
                        });
                        setHasMore(allData.length === PAGE_SIZE);
                    }
                 } else {
                    console.error("Error al cargar fotos:", error);
                 }
            } else if (data) {
                const fotosActivas = data.filter((photo: any) => !photo.eliminada);
                
                setPhotos(prev => {
                    const newPhotos = fotosActivas.filter((p: PhotoItem) => !prev.some(existing => existing.id === p.id));
                    return [...prev, ...newPhotos];
                });
                
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (err) {
          console.error("Error inesperado al cargar fotos:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPhotos();
    }, [page]);

    // Hook para detectar número de columnas
    const useColumns = () => {
      const [columns, setColumns] = useState(2);
      useEffect(() => {
        const updateColumns = () => {
          if (window.innerWidth >= 1024) setColumns(4);
          else if (window.innerWidth >= 768) setColumns(3);
          else setColumns(2);
        };
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
      }, []);
      return columns;
    };

    const numColumns = useColumns();
    const [columnsPhotos, setColumnsPhotos] = useState<PhotoItem[][]>([[], [], [], []]);

    // Distribuir fotos en columnas cuando cambian las fotos o el número de columnas
    useEffect(() => {
        const newCols: PhotoItem[][] = Array.from({ length: numColumns }, () => []);
        photos.forEach((photo, i) => {
            newCols[i % numColumns].push(photo);
        });
        setColumnsPhotos(newCols);
    }, [photos, numColumns]);

    // Navigation handlers
    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImgIndex !== null && selectedImgIndex > 0) {
            setSelectedImgIndex(selectedImgIndex - 1);
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImgIndex !== null && selectedImgIndex < photos.length - 1) {
            setSelectedImgIndex(selectedImgIndex + 1);
        }
    };

    // Swipe handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) {
            if (selectedImgIndex !== null && selectedImgIndex < photos.length - 1) {
                setSelectedImgIndex(selectedImgIndex + 1);
            }
        }
        if (isRightSwipe) {
            if (selectedImgIndex !== null && selectedImgIndex > 0) {
                setSelectedImgIndex(selectedImgIndex - 1);
            }
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImgIndex === null) return;
            
            if (e.key === 'ArrowLeft') {
                if (selectedImgIndex > 0) setSelectedImgIndex(selectedImgIndex - 1);
            } else if (e.key === 'ArrowRight') {
                if (selectedImgIndex < photos.length - 1) setSelectedImgIndex(selectedImgIndex + 1);
            } else if (e.key === 'Escape') {
                setSelectedImgIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImgIndex, photos.length]);

    return (
        <>
            <div className="max-w-5xl mx-auto text-center animate-fade-in pb-10">
                <GalleryIcon className="w-16 h-16 text-[#a77b3b] mx-auto mb-4" />
                <h1 className="text-4xl font-serif mb-2 text-[#a77b3b]">Nuestros Recuerdos</h1>
                <p className="text-gray-500 mb-8">Momentos compartidos por nuestros invitados.</p>

                {photos.length === 0 && !loading ? (
                <div className="py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 italic">Todavía no hay fotos en el álbum. ¡Sé el primero en subir una!</p>
                </div>
                ) : (
                <div className="flex gap-4">
                    {columnsPhotos.map((colPhotos, colIndex) => (
                        <div key={colIndex} className="flex-1 space-y-4">
                            {colPhotos.map((photo) => {
                                // Encontrar el índice real en el array original para el lightbox
                                const originalIndex = photos.findIndex(p => p.id === photo.id);
                                const isLastElement = photos.length === originalIndex + 1;
                                
                                return (
                                    <div 
                                        ref={isLastElement ? lastPhotoElementRef : null}
                                        key={photo.id} 
                                        className="rounded-lg shadow-md overflow-hidden cursor-pointer group bg-gray-100" 
                                        onClick={() => setSelectedImgIndex(originalIndex)}
                                    >
                                        <img 
                                            src={getThumbnailUrl(photo.url)} 
                                            alt="Recuerdo de la boda" 
                                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                                            loading="lazy"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                )}

                {loading && (
                    <div className="py-8 flex justify-center items-center w-full">
                        <div className="w-8 h-8 border-4 border-[#E1C16E] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!hasMore && photos.length > 0 && (
                    <p className="mt-8 text-gray-400 text-sm italic">Has llegado al final de la galería</p>
                )}
            </div>

            {selectedImgIndex !== null && photos[selectedImgIndex] && (
                <div 
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] animate-fade-in p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImgIndex(null)}
                >
                    <div 
                        className="relative flex items-center justify-center max-w-full max-h-full"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                      {/* Botón Anterior (Desktop) */}
                      {selectedImgIndex > 0 && (
                        <button 
                            className="hidden md:flex absolute -left-16 z-10 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-2 transition-all"
                            onClick={(e) => handlePrev(e)}
                        >
                            <ChevronLeftIcon className="w-12 h-12" />
                        </button>
                      )}

                      <img 
                        src={photos[selectedImgIndex].url} 
                        alt="Vista ampliada" 
                        className="max-w-[95vw] max-h-[85vh] md:max-w-[80vw] md:max-h-[90vh] rounded-lg shadow-2xl border-4 border-white/10 select-none"
                        draggable="false"
                      />

                      {/* Botón Siguiente (Desktop) */}
                      {selectedImgIndex < photos.length - 1 && (
                        <button 
                            className="hidden md:flex absolute -right-16 z-10 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-2 transition-all"
                            onClick={(e) => handleNext(e)}
                        >
                            <ChevronRightIcon className="w-12 h-12" />
                        </button>
                      )}

                      <button 
                        className="absolute -top-10 right-0 md:-top-8 md:-right-8 text-white/70 hover:text-white bg-black/20 hover:bg-black/50 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20"
                        onClick={() => setSelectedImgIndex(null)}
                      >
                        ✕
                      </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;
