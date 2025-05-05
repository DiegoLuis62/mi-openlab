export type Project = {
    id: string;  // Asegúrate de que 'id' siempre sea un string, no undefined
    titulo: string;
    descripcion: string;
    autor?: string;
    uid?: string;
    name: string; // ← Esta línea debe existir
  };