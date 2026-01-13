
import React, { useState } from 'react';
import type { View } from '../types';
import { generateRsvpResponse } from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon, TicketIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

interface RsvpFormProps {
  setView: (view: View) => void;
}

const RsvpForm: React.FC<RsvpFormProps> = ({ setView }) => {
  const [name, setName] = useState('');
  const [guests, setGuests] = useState(0);
  const [guestNames, setGuestNames] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [guestsInputFocused, setGuestsInputFocused] = useState(false);
  const [guestsInputValue, setGuestsInputValue] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('El sistema no está conectado a la base de datos. Verificá las credenciales.');
      return;
    }
    if (attending === null || !name) {
      setError('Por favor, completá tu nombre y confirmá tu reserva.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const { error: dbError } = await supabase
        .from('confirmaciones')
        .insert([{ 
          nombre: name, 
          asiste: attending, 
          invitados: guests, 
          nombres_invitados: guestNames, 
          comentarios: comments 
        }]);

      if (dbError) throw dbError;

      const message = await generateRsvpResponse(name, attending);
      setConfirmationMessage(message);
    } catch (err: any) {
      console.error(err);
      setError('Hubo un problema al procesar tu reserva. Por favor, intentá de nuevo.');
      setConfirmationMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (confirmationMessage) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-lg mx-auto animate-fade-in border-t-[12px] border-[#800020]">
        <div className="mb-6 inline-block p-4 bg-green-50 rounded-full">
          <CheckCircleIcon className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-serif text-[#a77b3b] mb-4">¡Respuesta Enviada!</h2>
        <div className="bg-[#FFFBF5] p-6 rounded-2xl border border-[#E1C16E]/30 text-left">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed italic text-sm md:text-base">
            "{confirmationMessage}"
          </p>
        </div>
        <button
          onClick={() => setView('home')}
          className="mt-8 bg-[#800020] hover:bg-black text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-xl tracking-widest uppercase text-xs"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-3xl shadow-2xl animate-fade-in-up border-b-[12px] border-[#800020]">
      <div className="flex justify-center mb-4">
        <TicketIcon className="w-12 h-12 text-[#800020] opacity-20" />
      </div>
      <h1 className="text-3xl font-serif text-center mb-2 text-[#a77b3b]">Reserva de Entradas</h1>
      <p className="text-center text-gray-400 text-sm mb-8 italic">Confirma tu asistencia al estreno más esperado.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div>
          <label htmlFor="name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre completo</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all"/>
        </div>
        
        <fieldset>
          <legend className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">¿Confirmás tu asistencia?</legend>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setAttending(true)} className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all duration-300 ${attending === true ? 'bg-[#800020] border-[#800020] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-[#800020]/30'}`}>
              <CheckCircleIcon className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold uppercase">Asistiré</span>
            </button>
            <button type="button" onClick={() => setAttending(false)} className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all duration-300 ${attending === false ? 'bg-gray-100 border-gray-200 text-gray-600 shadow-inner' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}>
              <XCircleIcon className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold uppercase">No podré</span>
            </button>
          </div>
        </fieldset>

        {attending && (
          <div className="animate-fade-in bg-[#800020]/5 p-6 rounded-2xl border border-[#800020]/10 space-y-4">
            <div>
              <label htmlFor="guests" className="block text-[10px] font-bold text-[#800020] uppercase tracking-widest mb-1">Acompañantes adicionales</label>
              <input 
                type="number" 
                id="guests" 
                value={guestsInputFocused ? guestsInputValue : guests} 
                onChange={(e) => {
                  const value = e.target.value;
                  setGuestsInputValue(value);
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue) && numValue >= 0) {
                    setGuests(numValue);
                  }
                }}
                onFocus={() => {
                  setGuestsInputFocused(true);
                  setGuestsInputValue('');
                }}
                onBlur={() => {
                  setGuestsInputFocused(false);
                  if (guestsInputValue === '' || isNaN(parseInt(guestsInputValue, 10))) {
                    setGuests(0);
                    setGuestsInputValue('');
                  } else {
                    const numValue = parseInt(guestsInputValue, 10);
                    setGuests(numValue >= 0 ? numValue : 0);
                    setGuestsInputValue('');
                  }
                }}
                min="0" 
                className="block w-full px-4 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none"
              />
            </div>
             {guests > 0 && (
                <div className="animate-fade-in">
                  <label htmlFor="guestNames" className="block text-[10px] font-bold text-[#800020] uppercase tracking-widest mb-1">Nombres de acompañantes</label>
                  <input type="text" id="guestNames" value={guestNames} onChange={(e) => setGuestNames(e.target.value)} placeholder="Ej: Juan Pérez y María González" className="block w-full px-4 py-3 bg-white border border-gray-100 rounded-lg focus:outline-none text-sm"/>
                </div>
              )}
          </div>
        )}

        <div>
          <label htmlFor="comments" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Comentarios o canciones</label>
          <textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} rows={3} placeholder="Alergias, dedicatorias, o algún mensaje especial..." className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 text-sm"></textarea>
        </div>

        {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tighter">{error}</p>}

        <div className="pt-4">
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-2xl text-white bg-[#800020] hover:bg-black focus:outline-none disabled:bg-gray-300 transition-all duration-300 font-bold tracking-[0.2em] uppercase text-xs">
            {isLoading ? 'Transmitiendo datos...' : 'ENVIAR CONFIRMACIÓN'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RsvpForm;
