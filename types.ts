
export type View = 'home' | 'rsvp' | 'photos' | 'gallery' | 'admin-login' | 'admin' | 'invitation';

export interface RSVPData {
  id?: string;
  nombre: string;
  asiste: boolean;
  invitados: number;
  nombres_invitados?: string;
  comentarios?: string;
  created_at?: string;
}
