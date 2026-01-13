/**
 * Servicio para enviar emails de notificación de confirmaciones RSVP
 * Usa Cloudflare Functions como proxy para Resend (evita problemas de CORS)
 */

interface RsvpData {
  name: string;
  attending: boolean;
  guests: number;
  guestNames: string;
  comments: string;
}

const getFunctionUrl = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      // En producción, la función estará en el mismo dominio
      // En desarrollo, podés usar la URL de tu deploy de Cloudflare Pages
      return process.env.VITE_CLOUDFLARE_FUNCTION_URL || '/api/send-rsvp-email';
    }
    return '/api/send-rsvp-email';
  } catch {
    return '/api/send-rsvp-email';
  }
};

export const sendRsvpNotification = async (data: RsvpData): Promise<boolean> => {
  try {
    const functionUrl = getFunctionUrl();
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error al enviar email: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email de notificación enviado correctamente');
      return true;
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error: any) {
    console.error('❌ Error al enviar email:', error);
    // No bloqueamos la confirmación si falla el email
    return false;
  }
};
