import LikeButton from './LikeButton';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '../context/useAuth';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: () => void;
  userFavorites?: string[];
  onFavoritesChange?: () => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  userFavorites = [],
  onFavoritesChange
}: ProjectCardProps) {
  const { user } = useAuth();
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.titulo}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{project.descripcion}</p>
      <div className="flex gap-2 mt-3">
        {user && (
          <>
            <LikeButton
              projectId={project.id}
              likedBy={project.likedBy || []}
              userId={user.uid}
            />
            <FavoriteButton
              userId={user.uid}
              projectId={project.id}
              favorites={userFavorites}
              onFavoritesChange={onFavoritesChange}
            />
          </>
        )}
      </div>
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
