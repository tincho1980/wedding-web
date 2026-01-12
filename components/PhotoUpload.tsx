
import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { CameraIcon, CheckCircleIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

interface PhotoUploadProps {
  setView: (view: View) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ setView }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const objectUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSuccess(false);
      setIsFinishing(false);
      setError(null);
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    // Verificar que Supabase esté configurado
    if (!supabase || !supabase.storage) {
      setError('Error: Supabase no está configurado. Por favor, verifica las variables de entorno.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    let completed = 0;

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Verificar que storage.from sea una función
        if (typeof supabase.storage?.from !== 'function') {
          throw new Error('Supabase Storage no está disponible. Verifica la configuración.');
        }

        // 1. Subir al Storage bucket 'fotos'
        const { error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('fotos')
          .getPublicUrl(filePath);

        // 3. Guardar registro en la tabla 'fotos'
        const { error: dbError } = await supabase
          .from('fotos')
          .insert([{ url: publicUrl, nombre_archivo: file.name }]);

        if (dbError) throw dbError;

        completed++;
        setProgress(Math.round((completed / selectedFiles.length) * 100));
      }

      setUploadCount(completed);
      setIsFinishing(true);
      setTimeout(() => {
        setUploading(false);
        setSuccess(true);
        setSelectedFiles([]);
      }, 1000);

    } catch (err: any) {
      console.error('Error al subir fotos:', err);
      setError('Error al subir las fotos: ' + (err.message || 'Error desconocido'));
      setUploading(false);
    }
  };
  
  const reset = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setSuccess(false);
    setProgress(0);
    setUploadCount(0);
    setIsFinishing(false);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl text-center animate-fade-in-up">
      <CameraIcon className="w-16 h-16 text-[#a77b3b] mx-auto mb-4" />
      <h1 className="text-4xl font-serif mb-2 text-[#a77b3b]">Compartí tus Momentos</h1>
      <p className="text-gray-500 mb-8">Subí tus fotos a nuestro álbum digital de Supabase.</p>

      {success ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 animate-fade-in">
          <CheckCircleIcon className="w-12 h-12 mx-auto mb-3" />
          <h3 className="font-semibold text-lg">{uploadCount > 1 ? '¡Fotos subidas con éxito!' : '¡Foto subida con éxito!'}</h3>
          <p>Gracias por ser parte de nuestro álbum ❤️</p>
          <button onClick={reset} className="mt-4 bg-[#E1C16E] hover:bg-[#d4af37] text-white font-bold py-2 px-4 rounded-full transition-colors duration-300">Subir más fotos</button>
        </div>
      ) : (
        <>
          <div className="w-full min-h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 overflow-hidden p-4 bg-gray-50">
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {previews.map((src, index) => (
                  <div 
                    key={index} 
                    className={isFinishing ? 'animate-fly-away' : ''} 
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <img src={src} alt={`Vista previa ${index + 1}`} className="w-full h-24 object-cover rounded-md shadow-sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <CameraIcon className="w-12 h-12 mb-2" />
                <span>Arrastrá tus fotos acá o</span>
                <span className="font-semibold mt-1">Seleccioná los archivos</span>
              </div>
            )}
          </div>
          
          {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}

          {uploading ? (
            <div className="w-full max-w-sm mx-auto">
              <p className="text-gray-600 mb-2">Procesando {selectedFiles.length} archivos...</p>
              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                <div className="bg-[#E1C16E] h-4 rounded-full shadow-md transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="mt-2 text-sm text-[#a77b3b] font-bold">{progress}%</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <label htmlFor="file-upload" className="cursor-pointer bg-[#E1C16E] hover:bg-[#d4af37] text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 uppercase tracking-widest text-xs">
                {selectedFiles.length > 0 ? 'Cambiar selección' : 'Seleccionar fotos'}
              </label>
              <input id="file-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              
              {selectedFiles.length > 0 && (
                <button onClick={handleUpload} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 uppercase tracking-widest text-xs">
                  Subir a la Nube
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoUpload;
