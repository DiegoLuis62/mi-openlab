import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { Project, User, Portfolio, ActivityLogEntry } from "../types";
import { addActivity } from "../utils/activity";

export default function Profile() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Para favoritos
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);

  // Seguimiento de usuarios
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Portafolio profesional
  const [portfolio, setPortfolio] = useState<Portfolio>({
    habilidades: [],
    experiencia: [],
    educacion: [],
    linkedin: "",
    stack: [],
    badges: [],
    puntos: 0,
  });

  // Actividad
  const [lastActivity, setLastActivity] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  // Cargar mis proyectos
  useEffect(() => {
    if (user && user.uid) {
      const fetchProjects = async () => {
        const q = query(
          collection(db, "proyectos"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const lista: Project[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const project: Project = {
            id: docSnap.id,
            titulo: data.titulo,
            descripcion: data.descripcion,
            autor: data.autor,
            uid: data.uid,
            imageUrl: data.imageUrl,
            githubLink: data.githubLink,
            demoLink: data.demoLink,
            categorias: data.categorias ?? [],
            tecnologias: data.tecnologias ?? [],
            etiquetas: data.etiquetas ?? [],
            likedBy: data.likedBy ?? [],
            name: data.name ?? '',
          };
          lista.push(project);
        });
        setProjects(lista);
        setLoading(false);
      };
      fetchProjects();
    }
  }, [user]);

  // Cargar favoritos del usuario y sus proyectos + actividad
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !user.uid) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as User;
        const favs: string[] = data.favorites ?? [];
        setUserFavorites(favs);

        // Seguimiento, portafolio, badges y puntos
        setFollowing(data.following ?? []);
        setPortfolio({
          habilidades: data.habilidades ?? [],
          experiencia: data.experiencia ?? [],
          educacion: data.educacion ?? [],
          linkedin: data.linkedin ?? "",
          stack: data.stack ?? [],
          badges: data.badges ?? [],
          puntos: data.points ?? 0,
        });

        // Actividad
        setLastActivity(data.lastActivity ?? null);
        setActivityLog(
          Array.isArray(data.activityLog)
            ? data.activityLog
                .slice()
                .sort((a, b) => (b.timestamp ?? 0).localeCompare(a.timestamp ?? 0))
            : []
        );

        if (favs.length > 0) {
          // Firestore 'in' permite hasta 10 elementos por consulta
          const batches = [];
          for (let i = 0; i < favs.length; i += 10) {
            batches.push(favs.slice(i, i + 10));
          }
          const allFavProjects: Project[] = [];
          for (const batch of batches) {
            const q = query(collection(db, "proyectos"), where("__name__", "in", batch));
            const snapFavs = await getDocs(q);
            snapFavs.forEach((docSnap) => {
              const data = docSnap.data();
              const project: Project = {
                id: docSnap.id,
                titulo: data.titulo,
                descripcion: data.descripcion,
                autor: data.autor,
                uid: data.uid,
                imageUrl: data.imageUrl,
                githubLink: data.githubLink,
                demoLink: data.demoLink,
                categorias: data.categorias ?? [],
                tecnologias: data.tecnologias ?? [],
                etiquetas: data.etiquetas ?? [],
                likedBy: data.likedBy ?? [],
                name: data.name ?? '',
              };
              allFavProjects.push(project);
            });
          }
          setFavoriteProjects(allFavProjects);
        } else {
          setFavoriteProjects([]);
        }
      } else {
        setUserFavorites([]);
        setFavoriteProjects([]);
      }
    };
    fetchFavorites();
  }, [user]);

  // Cargar todos los usuarios para seguidores/seguidos
  useEffect(() => {
    const fetchAllUsers = async () => {
      const querySnap = await getDocs(collection(db, "users"));
      const usersList: User[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        usersList.push({
          id: docSnap.id,
          email: data.email ?? "",
          following: data.following ?? [],
          favorites: data.favorites ?? [],
          habilidades: data.habilidades ?? [],
          experiencia: data.experiencia ?? [],
          educacion: data.educacion ?? [],
          linkedin: data.linkedin ?? "",
          stack: data.stack ?? [],
          badges: data.badges ?? [],
          points: data.points ?? 0,
        });
      });
      setAllUsers(usersList);
    };
    fetchAllUsers();
  }, []);

  // Calcular seguidores dinámicamente (quién me sigue)
  useEffect(() => {
    if (!user?.uid) return;
    const filtered = allUsers.filter(u => (u.following ?? []).includes(user.uid));
    setFollowers(filtered.map(u => u.id));
  }, [allUsers, user]);

  // Likes recibidos
  const totalLikes = projects.reduce((sum, p) => sum + (p.likedBy ? p.likedBy.length : 0), 0);

  // Botón Seguir/Dejar de Seguir
  const handleFollow = async (targetUserId: string) => {
    if (!user?.uid || user.uid === targetUserId) return;
    const myRef = doc(db, "users", user.uid);
    let newFollowing = following;
    if (following.includes(targetUserId)) {
      await updateDoc(myRef, { following: arrayRemove(targetUserId) });
      newFollowing = following.filter((id) => id !== targetUserId);
    } else {
      await updateDoc(myRef, { following: arrayUnion(targetUserId) });
      newFollowing = [...following, targetUserId];
    }
    setFollowing(newFollowing);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id || !user?.uid) return;
    const proj = projects.find((p) => p.id === id);
    await deleteDoc(doc(db, "proyectos", id));
    await addActivity(user.uid, "delete", `Eliminó el proyecto "${proj?.titulo ?? ""}"`); // REGISTRO ACTIVIDAD
    setProjects(projects.filter((p) => p.id !== id));
    setProjectToDelete(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      {/* IZQUIERDA: Perfil y comunidad */}
      <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 md:mb-0">
        <h2 className="text-xl font-bold mb-4">Mi Perfil</h2>
        <div className="mb-2"><b>Email:</b> {user?.email}</div>
        <div className="mb-2"><b>LinkedIn:</b>{" "}
          {portfolio.linkedin ? (
            <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Ver Perfil
            </a>
          ) : <span className="text-gray-400">No registrado</span>}
        </div>
        <div className="mb-2"><b>Stack tecnológico:</b> {portfolio.stack.join(", ")}</div>
        <div className="mb-2"><b>Habilidades:</b> {portfolio.habilidades.join(", ")}</div>
        <div className="mb-2"><b>Experiencia:</b>
          <ul className="list-disc ml-6 text-sm">
            {portfolio.experiencia.map((exp, idx) => (
              <li key={idx}>{exp.rol} en {exp.empresa} ({exp.desde} - {exp.hasta})</li>
            ))}
          </ul>
        </div>
        <div className="mb-2"><b>Educación:</b>
          <ul className="list-disc ml-6 text-sm">
            {portfolio.educacion.map((edu, idx) => (
              <li key={idx}>{edu.titulo} - {edu.institucion} ({edu.desde} - {edu.hasta})</li>
            ))}
          </ul>
        </div>
        {/* BADGES */}
        <div className="mb-2"><b>Badges:</b> {portfolio.badges.length > 0 ? (
          portfolio.badges.map((b, idx) => <span key={idx} className="inline-block px-2 py-1 bg-yellow-200 rounded mr-1">{b}</span>)
        ) : <span className="text-gray-400">Ninguno aún</span>}
        </div>
        <div className="mb-2"><b>Puntos:</b> {portfolio.puntos}</div>
        {/* Seguidores/Seguidos */}
        <div className="my-4">
          <div><b>Siguiendo:</b> {following.length}</div>
          <div><b>Seguidores:</b> {followers.length}</div>
        </div>
        {/* Listas de seguidores/seguidos */}
        <div>
          <b>Usuarios que sigues:</b>
          <ul className="text-sm ml-4">
            {allUsers.filter(u => following.includes(u.id)).map(u => (
              <li key={u.id}>
                <span>{u.email}</span>
                <button
                  className="ml-2 text-blue-600 underline"
                  onClick={() => handleFollow(u.id)}
                >Dejar de seguir</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2">
          <b>Te siguen:</b>
          <ul className="text-sm ml-4">
            {allUsers.filter(u => followers.includes(u.id)).map(u => (
              <li key={u.id}>{u.email}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* DERECHA: Dashboard y proyectos */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Mis Proyectos</h2>
          <button
            onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo Proyecto
          </button>
        </div>

        {/* DASHBOARD */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex gap-6 flex-wrap">
          <div><b>Proyectos:</b> {projects.length}</div>
          <div><b>Likes recibidos:</b> {totalLikes}</div>
          <div><b>Favoritos:</b> {userFavorites.length}</div>
          <div>
            <b>Última actividad:</b><br />
            {lastActivity
              ? new Date(lastActivity).toLocaleString()
              : "Sin actividad reciente"}
          </div>
        </div>

        {/* TIMELINE DE ACTIVIDAD */}
        <div className="mb-8">
          <h3 className="text-xl font-bold dark:text-white mb-2">Actividad reciente</h3>
          {activityLog.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">Sin actividad reciente.</p>
          ) : (
            <ul className="space-y-2">
              {activityLog.slice(0, 20).map((act, i) => (
                <li key={i} className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">{new Date(act.timestamp).toLocaleString()}:</span>{" "}
                  {act.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-300">
            Cargando proyectos...
          </p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">
            No tienes proyectos aún.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) =>
              project.id ? (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={() => setProjectToDelete(project)}
                  userFavorites={userFavorites}
                />
              ) : null
            )}
          </div>
        )}

        {/* FAVORITOS */}
        <div className="mt-10">
          <h3 className="text-xl font-bold dark:text-white mb-4">Mis Favoritos</h3>
          {favoriteProjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No tienes proyectos favoritos.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProjects.map((project) =>
                project.id ? (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                    onDelete={() => setProjectToDelete(project)}
                    userFavorites={userFavorites}
                  />
                ) : null
              )}
            </div>
          )}
        </div>

        {showForm && (
          <ProjectForm
            existingProject={editingProject}
            onClose={() => setShowForm(false)}
            onSaved={() => window.location.reload()}
          />
        )}

        {projectToDelete && (
          <ConfirmDialog
            message="¿Estás seguro de que deseas eliminar este proyecto?"
            onConfirm={() => handleDelete(projectToDelete.id)}
            onCancel={() => setProjectToDelete(null)}
          />
        )}
      </div>
    </div>
  );
}
