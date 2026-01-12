
import React, { useEffect, useState } from 'react';
import type { View, RSVPData } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateAdminSummary } from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface AdminPanelProps {
  setView: (view: View) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ setView }) => {
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalGuests: 0, totalAttending: 0, totalNotAttending: 0 });

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
    if (!supabase || !confirm('¿Estás seguro de eliminar este registro?')) return;
    const { error } = await supabase.from('confirmaciones').delete().eq('id', id);
    if (!error) fetchRSVPs();
  };

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

      {/* Tabla de Invitados */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
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
    </div>
  );
};

export default AdminPanel;
