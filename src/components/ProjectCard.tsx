type Project = {
    id: string;
    titulo: string;
    descripcion: string;
    autor?: string; // ahora coinciden los tipos
  };
  
  interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: () => void;
  }
  
  export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.titulo}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{project.descripcion}</p>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={() => onEdit(project)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 hover:underline text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    );
  }
  