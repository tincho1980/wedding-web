/**
 * Cloudflare Pages Function para enviar emails de notificación usando Resend
 */

import { Resend } from 'resend';

// 1. Manejo de CORS (Preflight)
// Cloudflare llama a esta función automáticamente cuando recibe un pedido OPTIONS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// 2. Manejo del POST (El envío real)
// Al llamar la función 'onRequestPost', Cloudflare solo deja entrar peticiones POST
export async function onRequestPost({ request, env }) {
  try {
    // Verificación de la API Key
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada en las variables de entorno');
    }

    const data = await request.json();

    // Inicializar Resend
    const resend = new Resend(env.RESEND_API_KEY);

    // Lógica de textos
    const attendingText = data.attending ? '✅ SÍ asistirá' : '❌ NO asistirá';
    const guestsText = data.guests > 0 
      ? `${data.guests} acompañante${data.guests > 1 ? 's' : ''}${data.guestNames ? `: ${data.guestNames}` : ''}`
      : 'Sin acompañantes';

    // Crear el cuerpo del email
    const emailBody = `
Nueva confirmación de asistencia recibida:

👤 Nombre: ${data.name}
${attendingText}
👥 Acompañantes: ${guestsText}
💬 Comentarios: ${data.comments || 'Ninguno'}
📅 Fecha de confirmación: ${new Date().toLocaleString('es-AR', { 
  dateStyle: 'long', 
  timeStyle: 'short' 
})}
    `.trim();

    // Enviar el email usando la SDK de Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'Wedding RSVP <noreply@rosaliaymartin.com.ar>', // Asegúrate que este dominio esté verificado en Resend
      to: ['miramallo@gmail.com'], // Tu email personal
      subject: `Nueva confirmación: ${data.name} ${data.attending ? 'asistirá' : 'no asistirá'}`,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">Nueva confirmación de asistencia</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Nombre:</strong> ${data.name}</p>
            <p><strong>${data.attending ? '✅ SÍ asistirá' : '❌ NO asistirá'}</strong></p>
            <p><strong>👥 Acompañantes:</strong> ${guestsText}</p>
            <p><strong>💬 Comentarios:</strong> ${data.comments || 'Ninguno'}</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Error de Resend:', error);
      throw new Error(error.message);
    }

    // Respuesta exitosa
    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // CORS para la respuesta final
        },
      }
    );

  } catch (error) {
    console.error('Error general en la función:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error desconocido procesando la solicitud' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}