
import React, { useEffect, useState } from 'react';
import type { View, RSVPData } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateAdminSummary } from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon, CameraIcon } from './Icons';
import * as XLSX from 'xlsx';

interface AdminPanelProps {
  setView: (view: View) => void;
}

interface PhotoItem {
  id: string;
  url: string;
  nombre_archivo: string;
  created_at: string;
  eliminada?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ setView }) => {
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalGuests: 0, totalAttending: 0, totalNotAttending: 0 });
  
  // Estados para la sección de fotos
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'invitados' | 'fotos'>('invitados');

  const fetchRSVPs = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('confirmaciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RSVPs:', error);
    } else if (data) {
      setRsvps(data as RSVPData[]);
      const attending = data.filter((r: any) => r.asiste);
      const totalGuests = attending.reduce((acc: number, curr: any) => acc + 1 + (curr.invitados || 0), 0);
      setStats({
        totalGuests,
        totalAttending: attending.length,
        totalNotAttending: data.length - attending.length
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRSVPs();
  }, []);

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    setAiSummary(null); // Limpiar resumen anterior
    try {
      const summary = await generateAdminSummary(rsvps);
      setAiSummary(summary);
    } catch (error) {
      console.error('Error generando resumen:', error);
      setAiSummary('Error al generar el resumen. Por favor, intentá de nuevo.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) {
      alert('Error: No hay conexión a la base de datos');
      return;
    }
    
    if (!id) {
      alert('Error: ID inválido');
      return;
    }
    
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
      console.log('Intentando eliminar registro con ID:', id);
      const { error } = await supabase
        .from('confirmaciones')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error al eliminar:', error);
        // Si es error de permisos RLS
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          alert(`Error de permisos: No tenés permisos para eliminar invitados.\n\nVerificá que las políticas RLS permitan DELETE. Error: ${error.message}`);
          return;
        }
        alert(`Error al eliminar: ${error.message}\n\nCódigo: ${error.code || 'N/A'}\n\nDetalles: ${JSON.stringify(error)}`);
        return;
      }
      
      console.log('Registro eliminado exitosamente');
      
      // Actualizar el estado local inmediatamente para mejor UX
      setRsvps(prevRsvps => prevRsvps.filter(rsvp => rsvp.id !== id));
      
      // Recargar la lista para asegurar sincronización
      await fetchRSVPs();
    } catch (err: any) {
      console.error('Error inesperado:', err);
      alert(`Error inesperado: ${err.message || err}`);
    }
  };

  const handleExportGuestsToExcel = () => {
    const attendingRsvps = rsvps.filter((rsvp) => rsvp.asiste);
    const totalGuests = attendingRsvps.reduce((acc, curr) => acc + 1 + (curr.invitados || 0), 0);

    const rows = attendingRsvps.map((rsvp) => [
      rsvp.nombre,
      rsvp.nombres_invitados?.trim() || '',
      1 + (rsvp.invitados || 0)
    ]);

    const worksheetData: (string | number)[][] = [
      [`Elenco de Oro - Total general de invitados: ${totalGuests}`],
      [],
      ['Invitado', 'Acompanante', 'Total por confirmacion'],
      ...rows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    worksheet['!cols'] = [{ wch: 30 }, { wch: 45 }, { wch: 24 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `invitados-${date}.xlsx`);
  };

  // Funciones para gestión de fotos
  const fetchPhotos = async () => {
    if (!supabase) return;
    setPhotosLoading(true);
    try {
      // Obtener todas las fotos (incluyendo eliminadas para admin)
      const { data, error } = await supabase
        .from('fotos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Si el error es porque la columna eliminada no existe, está bien, simplemente no la usamos
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          console.warn('Columna eliminada no existe todavía. Ejecutá el script supabase-add-soft-delete.sql');
        } else {
          console.error('Error fetching photos:', error);
        }
      }
      
      if (data) {
        // Si la columna eliminada no existe, todas las fotos tendrán eliminada = undefined
        setPhotos(data as PhotoItem[]);
      }
    } catch (err) {
      console.error('Error inesperado al cargar fotos:', err);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleSoftDeletePhoto = async (id: string) => {
    if (!supabase || !confirm('¿Estás seguro de ocultar esta foto? (Se puede restaurar después)')) return;
    
    try {
      console.log('Intentando ocultar foto con ID:', id);
      const { data, error } = await supabase
        .from('fotos')
        .update({ eliminada: true })
        .eq('id', id)
        .select();
      
      if (error) {
        // Si la columna no existe, mostrar mensaje informativo
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          alert('La funcionalidad de ocultar fotos no está disponible todavía.\n\nPor favor, ejecutá el script "supabase-add-soft-delete.sql" en Supabase para habilitarla.');
          return;
        }
        // Si es error de permisos RLS
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.error('Error de permisos RLS:', error);
          alert(`Error de permisos: No tenés permisos para actualizar fotos.\n\nVerificá que las políticas RLS permitan UPDATE. Error: ${error.message}`);
          return;
        }
        console.error('Error al ocultar foto:', error);
        alert(`Error al ocultar foto: ${error.message}\n\nCódigo: ${error.code || 'N/A'}\n\nDetalles: ${JSON.stringify(error)}`);
        return;
      }
      
      console.log('Foto ocultada exitosamente:', data);
      
      // Actualizar el estado local inmediatamente para mejor UX
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === id ? { ...photo, eliminada: true } : photo
        )
      );
      
      // Recargar la lista para asegurar sincronización
      await fetchPhotos();
    } catch (err: any) {
      console.error('Error inesperado:', err);
      alert(`Error inesperado: ${err.message || err}`);
    }
  };

  const handleRestorePhoto = async (id: string) => {
    if (!supabase) return;
    
    try {
      console.log('Intentando restaurar foto con ID:', id);
      const { data, error } = await supabase
        .from('fotos')
        .update({ eliminada: false })
        .eq('id', id)
        .select();
      
      if (error) {
        // Si la columna no existe, mostrar mensaje informativo
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          alert('La funcionalidad de restaurar fotos no está disponible todavía.\n\nPor favor, ejecutá el script "supabase-add-soft-delete.sql" en Supabase para habilitarla.');
          return;
        }
        // Si es error de permisos RLS
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.error('Error de permisos RLS:', error);
          alert(`Error de permisos: No tenés permisos para actualizar fotos.\n\nVerificá que las políticas RLS permitan UPDATE. Error: ${error.message}`);
          return;
        }
        console.error('Error al restaurar foto:', error);
        alert(`Error al restaurar foto: ${error.message}\n\nCódigo: ${error.code || 'N/A'}`);
        return;
      }
      
      console.log('Foto restaurada exitosamente:', data);
      
      // Actualizar el estado local inmediatamente para mejor UX
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === id ? { ...photo, eliminada: false } : photo
        )
      );
      
      // Recargar la lista para asegurar sincronización
      await fetchPhotos();
    } catch (err: any) {
      console.error('Error inesperado:', err);
      alert(`Error inesperado: ${err.message || err}`);
    }
  };

  useEffect(() => {
    fetchRSVPs();
    fetchPhotos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-[#a77b3b]">Panel de Control</h1>
          <p className="text-gray-400 text-sm">Gestión de la Premier: Rosalía & Martín</p>
        </div>
        <button 
          onClick={() => setView('home')}
          className="bg-[#800020] hover:bg-black text-white font-bold py-2 px-8 rounded-full transition-all text-xs uppercase tracking-widest shadow-lg"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Total Espectadores</p>
          <p className="text-4xl font-serif text-[#800020]">{stats.totalGuests}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-green-500">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Confirmados</p>
          <p className="text-4xl font-serif text-green-600">{stats.totalAttending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-red-500">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Bajas</p>
          <p className="text-4xl font-serif text-red-400">{stats.totalNotAttending}</p>
        </div>
      </div>

      {/* IA Summary Section */}
      <div className="bg-[#FFFBF5] border-2 border-dashed border-[#E1C16E] rounded-3xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif text-[#a77b3b] flex items-center">
            <span className="mr-2">🎬</span> Notas del Director (IA)
          </h2>
          <button 
            onClick={handleGenerateSummary}
            disabled={summarizing || rsvps.length === 0}
            className="text-xs font-bold uppercase tracking-widest text-[#800020] hover:underline disabled:opacity-30"
          >
            {summarizing ? 'Analizando...' : 'Generar Análisis'}
          </button>
        </div>
        
        {aiSummary ? (
          <div className="prose prose-sm max-w-none text-gray-700 italic animate-fade-in bg-white p-6 rounded-xl shadow-inner border border-gray-50">
            {aiSummary.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm italic">
            {rsvps.length > 0 ? "Haz clic en 'Generar Análisis' para obtener un resumen inteligente de los comentarios y alertas." : "No hay datos suficientes para analizar."}
          </div>
        )}
      </div>

      {/* Tabs para cambiar entre Invitados y Fotos */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('invitados')}
          className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all ${
            activeTab === 'invitados'
              ? 'text-[#800020] border-b-2 border-[#800020]'
              : 'text-gray-400 hover:text-[#800020]'
          }`}
        >
          Invitados
        </button>
        <button
          onClick={() => setActiveTab('fotos')}
          className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === 'fotos'
              ? 'text-[#800020] border-b-2 border-[#800020]'
              : 'text-gray-400 hover:text-[#800020]'
          }`}
        >
          <CameraIcon className="w-4 h-4" />
          Fotos
        </button>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'invitados' ? (
        /* Tabla de Invitados */
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-[#FFFBF5]">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Backoffice de Invitados</p>
            <p className="text-sm text-[#a77b3b]">Descargá el listado en Excel con total por confirmación.</p>
          </div>
          <button
            onClick={handleExportGuestsToExcel}
            disabled={loading || rsvps.filter((rsvp) => rsvp.asiste).length === 0}
            className="bg-[#800020] hover:bg-black text-white font-bold py-2 px-5 rounded-full transition-all text-xs uppercase tracking-widest shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Descargar Excel Invitados
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Espectador</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acompañantes</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comentarios de Producción</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Cargando cartelera...</td></tr>
              ) : rsvps.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Aún no hay confirmaciones.</td></tr>
              ) : (
                rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">{rsvp.nombre}</div>
                      <div className="text-[10px] text-gray-400">{new Date(rsvp.created_at!).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${rsvp.asiste ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rsvp.asiste ? 'CONFIRMADO' : 'CANCELA'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {rsvp.invitados > 0 ? (
                        <div>
                          <span className="font-bold">{rsvp.invitados}</span>
                          <p className="text-[10px] italic">{rsvp.nombres_invitados}</p>
                        </div>
                      ) : 'Solo'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate italic">
                      {rsvp.comentarios || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(rsvp.id!)} className="text-red-300 hover:text-red-600 transition-colors p-2">
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        /* Sección de Fotos */
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6">
            <h2 className="text-2xl font-serif text-[#a77b3b] mb-6 flex items-center">
              <CameraIcon className="w-6 h-6 mr-2" />
              Gestión de Fotos
            </h2>
            
            {photosLoading ? (
              <div className="py-12 text-center text-gray-400 italic">
                Cargando fotos...
              </div>
            ) : photos.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic">
                Aún no hay fotos en el álbum.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative group rounded-lg overflow-hidden shadow-md transition-all ${
                      photo.eliminada === true 
                        ? 'opacity-30 border-2 border-red-400 bg-red-50/50' 
                        : 'opacity-100 border border-gray-200'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={photo.url}
                        alt={photo.nombre_archivo}
                        className={`w-full h-48 object-cover transition-all ${
                          photo.eliminada === true ? 'grayscale blur-sm' : ''
                        }`}
                      />
                      {photo.eliminada === true && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-white">
                            <span className="text-sm font-bold uppercase tracking-wider">OCULTA</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                      {photo.eliminada === true ? (
                        <button
                          onClick={() => handleRestorePhoto(photo.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs font-bold uppercase transition-all shadow-lg"
                        >
                          Restaurar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSoftDeletePhoto(photo.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-bold uppercase transition-all shadow-lg"
                        >
                          Ocultar
                        </button>
                      )}
                    </div>
                    {photo.eliminada === true && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase shadow-lg border-2 border-white z-20">
                        OCULTA
                      </div>
                    )}
                    <div className={`p-2 transition-all ${
                      photo.eliminada === true ? 'bg-red-50/50' : 'bg-white'
                    }`}>
                      <p className={`text-xs truncate ${
                        photo.eliminada === true ? 'text-gray-400 line-through' : 'text-gray-600'
                      }`} title={photo.nombre_archivo}>
                        {photo.nombre_archivo}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
