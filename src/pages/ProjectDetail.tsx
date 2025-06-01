import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/useAuth';
import LikeButton from '../components/LikeButton';
import FavoriteButton from '../components/FavoriteButton';
import Comments from '../components/Comments';

type Proyecto = {
  id: string;
  titulo: string;
  descripcion: string;
  autor: string;
  uid?: string; // <-- aseguramos que este campo exista
  likedBy?: string[];
  categorias?: string[];
  tecnologias?: string[];
  etiquetas?: string[];
  githubLink?: string;
  demoLink?: string;
  imageUrl?: string;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const cargarProyecto = async () => {
      if (!id) return;

      const ref = doc(db, 'proyectos', id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProyecto({
          id: snap.id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          autor: data.autor || 'anónimo',
          uid: data.uid, // <-- aquí traemos el UID
          likedBy: data.likedBy || [],
          categorias: data.categorias || [],
          tecnologias: data.tecnologias || [],
          etiquetas: data.etiquetas || [],
          githubLink: data.githubLink || "",
          demoLink: data.demoLink || "",
          imageUrl: data.imageUrl || "",
        });
      } else {
        setProyecto(null);
      }
      setLoading(false);
    };

    cargarProyecto();
  }, [id]);

  // Cargar favoritos del usuario (para el botón)
  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setUserFavorites(data.favorites || []);
      }
    };
    cargarFavoritos();
  }, [user]);

  const handleDelete = async () => {
    if (window.confirm('¿Seguro que deseas eliminar este proyecto?')) {
      await deleteDoc(doc(db, 'proyectos', proyecto!.id));
      window.location.href = '/profile';
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center text-gray-600 dark:text-gray-300">
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center text-gray-600 dark:text-gray-300">
        <p>Proyecto no encontrado.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Volver a explorar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">{proyecto.titulo}</h2>
      {proyecto.imageUrl && (
        <img
          src={proyecto.imageUrl}
          alt="preview"
          className="mb-4 max-h-64 object-contain rounded border mx-auto"
        />
      )}
      <p className="text-gray-700 dark:text-gray-300 mb-4">{proyecto.descripcion}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Autor:{" "}
        <Link
          to={`/user/${proyecto.uid ?? ""}`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {proyecto.autor}
        </Link>
      </p>
      <div className="flex flex-wrap gap-3 mb-4">
        {proyecto.categorias && proyecto.categorias.length > 0 && (
          <div>
            <span className="font-bold">Categorías:</span>{" "}
            {proyecto.categorias.join(", ")}
          </div>
        )}
        {proyecto.tecnologias && proyecto.tecnologias.length > 0 && (
          <div>
            <span className="font-bold">Tecnologías:</span>{" "}
            {proyecto.tecnologias.join(", ")}
          </div>
        )}
        {proyecto.etiquetas && proyecto.etiquetas.length > 0 && (
          <div>
            <span className="font-bold">Etiquetas:</span>{" "}
            {proyecto.etiquetas.join(", ")}
          </div>
        )}
      </div>
      {/* Mostrar links si existen */}
      {(proyecto.githubLink || proyecto.demoLink) && (
        <div className="flex gap-4 my-2">
          {proyecto.githubLink && (
            <a
              href={proyecto.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-300 underline text-sm"
            >
              GitHub
            </a>
          )}
          {proyecto.demoLink && (
            <a
              href={proyecto.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-300 underline text-sm"
            >
              Demo/Video
            </a>
          )}
        </div>
      )}
      <div className="flex gap-2 my-4">
        {user && (
          <>
            <LikeButton
              projectId={proyecto.id}
              likedBy={proyecto.likedBy || []}
              userId={user.uid}
            />
            <FavoriteButton
              userId={user.uid}
              projectId={proyecto.id}
              favorites={userFavorites}
            />
          </>
        )}
      </div>
      {user && (
        <Comments
          projectId={proyecto.id}
          userId={user.uid}
          userName={(user.displayName ?? user.email) ?? "Usuario"}
        />
      )}
      {user && (user.displayName === proyecto.autor || user.email === proyecto.autor) && (
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded mt-4"
        >
          Eliminar proyecto
        </button>
      )}
      <div className="mt-6">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Volver a explorar
        </Link>
      </div>
    </div>
  );
}
