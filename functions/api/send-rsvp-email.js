/**
 * Cloudflare Function para enviar emails de notificación usando Resend
 * Esta función se ejecuta en el servidor de Cloudflare, evitando problemas de CORS
 */

import { Resend } from 'resend';

export default {
  async fetch(request, env) {
    // Manejar CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Solo permitir POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      if (!env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY no está configurada');
      }

      const data = await request.json();

      const resend = new Resend(env.RESEND_API_KEY);

      const attendingText = data.attending ? '✅ SÍ asistirá' : '❌ NO asistirá';
      const guestsText = data.guests > 0 
        ? `${data.guests} acompañante${data.guests > 1 ? 's' : ''}${data.guestNames ? `: ${data.guestNames}` : ''}`
        : 'Sin acompañantes';

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

---
Este email fue enviado automáticamente desde el sistema de confirmaciones de boda.
      `.trim();

      const { data: emailData, error } = await resend.emails.send({
        from: 'Wedding RSVP <noreply@rosaliaymartin.com.ar>', // Cambiá esto por tu dominio verificado en Resend
        to: ['miramallo@gmail.com'],
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
              <p><strong>📅 Fecha de confirmación:</strong> ${new Date().toLocaleString('es-AR', { 
                dateStyle: 'long', 
                timeStyle: 'short' 
              })}</p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Este email fue enviado automáticamente desde el sistema de confirmaciones de boda.
            </p>
          </div>
        `
      });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, data: emailData }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error) {
      console.error('Error al enviar email:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || 'Error desconocido' 
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
  },
};
