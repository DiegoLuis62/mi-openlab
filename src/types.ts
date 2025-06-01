export interface Project {
  id: string;
  titulo: string;
  descripcion: string;
  autor: string;
  uid: string;
  imageUrl?: string;
  githubLink?: string;
  demoLink?: string;
  categorias: string[];
  tecnologias: string[];
  etiquetas: string[];
  likedBy?: string[];
  name: string;
}

export interface User {
  id: string;
  email: string;
  following: string[];
  favorites?: string[];
  habilidades?: string[];
  followers?: string[];
  experiencia?: {
    rol: string;
    empresa: string;
    desde: string;
    hasta: string;
  }[];
  educacion?: {
    titulo: string;
    institucion: string;
    desde: string;
    hasta: string;
  }[];
  linkedin?: string;
  stack?: string[];
  badges?: string[];
  points?: number;
  lastActivity?: string;
  activityLog?: ActivityLogEntry[];
}

export interface ActivityLogEntry {
  type: string;
  message: string;
  timestamp: string;
}

export interface Portfolio {
  habilidades: string[];
  experiencia: { rol: string; empresa: string; desde: string; hasta: string }[];
  educacion: { titulo: string; institucion: string; desde: string; hasta: string }[];
  linkedin: string;
  stack: string[];
  badges: string[];
  puntos: number;
}
