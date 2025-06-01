import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import FavoriteButton from '../components/FavoriteButton';

type Project = {
  id: string;
  titulo: string;
  descripcion: string;
  autor: string;
  uid: string;
  categorias?: string[];
  tecnologias?: string[];
  etiquetas?: string[];
  githubLink?: string;
  demoLink?: string;
  imageUrl?: string;
  likedBy?: string[];
};

type User = {
  id: string;
  email: string;
  following: string[];
  favorites?: string[];
  // otros campos...
};

export default function Feed() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  // Traer lista de usuarios y favoritos del usuario
  useEffect(() => {
    const fetchUsersAndFavorites = async () => {
      // Usuarios
      const snap = await getDocs(collection(db, 'users'));
      const usersList: User[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        usersList.push({
          id: docSnap.id,
          email: data.email ?? '',
          following: data.following ?? [],
          favorites: data.favorites ?? [],
        });
      });
      setAllUsers(usersList);

      // Favoritos del usuario
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snapFav = await getDoc(userRef);
        if (snapFav.exists()) {
          const data = snapFav.data();
          setUserFavorites(data.favorites || []);
        }
      }
    };
    fetchUsersAndFavorites();
  }, [user]);

  // Traer proyectos de usuarios seguidos
  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      setLoading(true);
      const userRef = query(collection(db, 'users'), where('__name__', '==', user.uid));
      const userSnap = await getDocs(userRef);
      if (!userSnap.empty) {
        const myData = userSnap.docs[0].data();
        const following: string[] = myData.following ?? [];
        if (following.length > 0) {
          // Firestore permite máximo 10 elementos en 'in'
          const batches = [];
          for (let i = 0; i < following.length; i += 10) {
            batches.push(following.slice(i, i + 10));
          }
          const allProjects: Project[] = [];
          for (const batch of batches) {
            const q = query(collection(db, 'proyectos'), where('uid', 'in', batch));
            const snap = await getDocs(q);
            snap.forEach(docSnap => {
              const data = docSnap.data();
              allProjects.push({
                id: docSnap.id,
                titulo: data.titulo,
                descripcion: data.descripcion,
                autor: data.autor || 'anónimo',
                uid: data.uid,
                categorias: data.categorias || [],
                tecnologias: data.tecnologias || [],
                etiquetas: data.etiquetas || [],
                githubLink: data.githubLink || "",
                demoLink: data.demoLink || "",
                imageUrl: data.imageUrl || "",
                likedBy: data.likedBy || [],
              });
            });
          }
          setProjects(allProjects);
        } else {
          setProjects([]);
        }
      }
      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  // Utilidad para obtener email/nombre del autor
  const getUserEmail = (uid: string) => {
    const u = allUsers.find(us => us.id === uid);
    return u?.email || "Usuario";
  };

  // Refrescar favoritos al instante tras dar/quitar favorito
  const refreshFavorites = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snapFav = await getDoc(userRef);
    if (snapFav.exists()) {
      const data = snapFav.data();
      setUserFavorites(data.favorites || []);
    }
  };

  return (
    <div className="flex">
      <div className="max-w-6xl mx-auto mt-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Proyectos de Usuarios que Sigues</h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Cargando proyectos...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No hay proyectos de usuarios que sigues.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proyecto) => (
              <div
                key={proyecto.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:ring-2 hover:ring-blue-400 transition"
              >
                <h3 className="text-lg font-semibold mb-1">{proyecto.titulo}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {proyecto.descripcion}
                </p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Autor:{" "}
                  <Link
                    to={`/user/${proyecto.uid}`}
                    className="underline hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    {getUserEmail(proyecto.uid)}
                  </Link>
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {proyecto.categorias && proyecto.categorias.length > 0 && (
                    <div>Categorías: {proyecto.categorias.join(", ")}</div>
                  )}
                  {proyecto.tecnologias && proyecto.tecnologias.length > 0 && (
                    <div>Tecnologías: {proyecto.tecnologias.join(", ")}</div>
                  )}
                  {proyecto.etiquetas && proyecto.etiquetas.length > 0 && (
                    <div>Etiquetas: {proyecto.etiquetas.join(", ")}</div>
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
                {/* Botones de interacción */}
                {user && (
                  <div className="flex gap-2 my-4">
                    <LikeButton
                      projectId={proyecto.id}
                      likedBy={proyecto.likedBy || []}
                      userId={user.uid}
                    />
                    <FavoriteButton
                      userId={user.uid}
                      projectId={proyecto.id}
                      favorites={userFavorites}
                      onFavoritesChange={refreshFavorites}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
