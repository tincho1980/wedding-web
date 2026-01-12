
import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
    try {
        // Intentar obtener de process.env (definido en vite.config.ts)
        if (typeof process !== 'undefined' && process.env) {
            return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
        }
        // Fallback para otros entornos
        return (window as any)._env_?.API_KEY || (window as any)._env_?.GEMINI_API_KEY || '';
    } catch {
        return '';
    }
};

const API_KEY = getApiKey();

const getAiClient = () => {
  if (!API_KEY) return null;
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateRsvpResponse = async (name: string, attending: boolean): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    if (attending) {
      return `¡Entrada reservada, ${name}!\n\nNo podemos esperar a verte en la alfombra roja.\n\nRecordá: Elegante Sport (sin morado) y solo adultos. ¡Nos vemos en el estreno! ❤️`;
    } else {
      return `¡Qué pena que no puedas venir al estreno, ${name}! Te vamos a extrañar mucho.`;
    }
  }

  const attendingText = attending ? "ha RESERVADO SU ENTRADA" : "lamentablemente NO PODRÁ ASISTIR";
  const prompt = `Eres el asistente de bodas de Rosalía y Martín. Invitado: "${name}" respondió: ${attendingText}. 
  Escribe una respuesta corta (máx 3 frases), estilo gala de estreno de cine, muy cálida. 
  Si asiste, recuerda: Dress Code "Elegante Sport" (prohibido morado), solo adultos y alias "BODA.ROSALIA.MARTIN".
  Si no asiste, dile que se le extrañará en la premier. Usa emojis 🎬✨.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "¡Gracias por tu respuesta! La hemos registrado correctamente.";
  }
};

export const generateAdminSummary = async (data: any[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "La IA no está configurada o falta la API_KEY.";
  if (!data || data.length === 0) return "No hay datos de invitados para analizar aún.";

  // Validar y limpiar los datos antes de procesarlos
  const validData = data.filter(d => d && d.nombre);
  if (validData.length === 0) return "No hay datos válidos de invitados para analizar.";

  // Preparamos un string simplificado para no exceder tokens innecesariamente
  const guestInfo = validData.map(d => {
    const nombre = d.nombre || 'Sin nombre';
    const asiste = d.asiste ? 'SI' : 'NO';
    const invitados = d.invitados || 0;
    const comentarios = (d.comentarios || '').trim() || 'Ninguno';
    // Limitar longitud de comentarios para no exceder tokens
    const comentariosLimitados = comentarios.length > 200 ? comentarios.substring(0, 200) + '...' : comentarios;
    return `- ${nombre}: ${asiste} (${invitados} extras). Comentario: ${comentariosLimitados}`;
  }).join('\n');

  const prompt = `Actúa como el Director de Producción de una Gran Premiere de Cine (la boda de Rosalía y Martín). 
  Analiza la siguiente lista de invitados y sus comentarios:
  
  ${guestInfo}
  
  Genera un informe rápido de "Producción" que incluya:
  1. Resumen de Asistencia: ¿Cuántos van en total (incluyendo extras)? ¿Hay alguna tendencia?
  2. Análisis de Comentarios: Detecta específicamente ALERGIAS, pedidos de MÚSICA, o mensajes importantes.
  3. Notas Creativas: ¿Qué dicen los fans (invitados) sobre el estreno?
  4. Alerta de Seguridad: Recordatorio sobre el dress code (no morado) si alguien mencionó algo al respecto.

  Usa un tono cinematográfico, profesional y ameno. Formatea con negritas y viñetas. Máximo 250 palabras.`;

  try {
    // Intentar con diferentes modelos disponibles, empezando por los más recientes
    let response;
    let lastError: any = null;
    
    // Lista de modelos a intentar en orden de preferencia
    const modelsToTry = [
      'gemini-3-flash-preview',
      'gemini-3-pro-preview', 
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-pro'
    ];
    
    for (const model of modelsToTry) {
      try {
        console.log(`Intentando con modelo: ${model}`);
        response = await ai.models.generateContent({
          model: model,
          contents: prompt
        });
        console.log(`Modelo ${model} funcionó correctamente`);
        break; // Si funciona, salir del loop
      } catch (modelError: any) {
        console.warn(`Modelo ${model} no disponible:`, modelError?.error?.message || modelError?.message);
        lastError = modelError;
        continue; // Intentar siguiente modelo
      }
    }
    
    // Si ningún modelo funcionó
    if (!response) {
      throw lastError || new Error('Ningún modelo de Gemini está disponible');
    }
    
    // Manejar diferentes estructuras de respuesta
    let text = '';
    if (typeof response.text === 'string') {
      text = response.text;
    } else if (response.response?.text) {
      text = response.response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else if (response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.response.candidates[0].content.parts[0].text;
    } else {
      console.error("Estructura de respuesta inesperada:", response);
      return "Error: No se pudo obtener la respuesta de la IA. Por favor intente de nuevo.";
    }
    
    return text.trim();
  } catch (error: any) {
    console.error("Error en resumen IA:", error);
    const errorMessage = error?.message || error?.toString() || 'Error desconocido';
    
    // Mensajes de error más específicos
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return "Error: La API key de Gemini no está configurada correctamente. Verificá las variables de entorno.";
    }
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return "Error: Se alcanzó el límite de uso de la API. Por favor intentá más tarde.";
    }
    
    return `Hubo un error al procesar el resumen inteligente: ${errorMessage}. Por favor intente de nuevo.`;
  }
};
