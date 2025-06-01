import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { Project, User } from "../types";
import ProjectCard from "../components/ProjectCard";
import { useAuth } from "../context/useAuth";

export default function UserProfile() {
  const { id: profileId } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [myFollowing, setMyFollowing] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(false); // 👈

  useEffect(() => {
    if (!profileId) return;
    const fetchData = async () => {

      const ref = doc(db, "users", profileId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as User;
        setProfileUser({
          id: snap.id,
          email: data.email ?? "",
          following: data.following ?? [],
          favorites: data.favorites ?? [],
          habilidades: data.habilidades ?? [],
          followers: data.followers ?? [],
          experiencia: data.experiencia ?? [],
          educacion: data.educacion ?? [],
          linkedin: data.linkedin ?? "",
          stack: data.stack ?? [],
          badges: data.badges ?? [],
          points: data.points ?? 0,
        });
      }

      const q = query(collection(db, "proyectos"), where("uid", "==", profileId));
      const querySnapshot = await getDocs(q);
      const lista: Project[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        lista.push({
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
          name: data.name ?? "",
          timestamp: data.timestamp ?? 0,
        });
      });
      setProjects(lista);

      const usersSnap = await getDocs(collection(db, "users"));
      const usersList: User[] = [];
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        usersList.push({
          id: docSnap.id,
          email: data.email ?? "",
          following: data.following ?? [],
          favorites: data.favorites ?? [],
          habilidades: data.habilidades ?? [],
          followers: data.followers ?? [],
          experiencia: data.experiencia ?? [],
          educacion: data.educacion ?? [],
          linkedin: data.linkedin ?? "",
          stack: data.stack ?? [],
          badges: data.badges ?? [],
          points: data.points ?? 0,
        });
      });
      setAllUsers(usersList);

      if (user?.uid) {
        const mySnap = await getDoc(doc(db, "users", user.uid));
        if (mySnap.exists()) {
          setMyFollowing(mySnap.data().following ?? []);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [profileId, user?.uid, refresh]); // 👈 ahora depende de refresh

  // Seguidores dinámicamente: quienes tienen mi id en su following
  const followers = allUsers.filter(u => (u.following ?? []).includes(profileId!));
  const following = profileUser?.following ?? [];

  // --- LÓGICA DE BOTÓN SEGUIR ---
  const isMe = user?.uid === profileId;
  const isFollowing = myFollowing.includes(profileId!);

  const handleFollow = async () => {
    if (!user?.uid || isMe) return;
    const myRef = doc(db, "users", user.uid);
    if (isFollowing) {
      await updateDoc(myRef, { following: arrayRemove(profileId) });
      setMyFollowing(prev => prev.filter(id => id !== profileId));
    } else {
      await updateDoc(myRef, { following: arrayUnion(profileId) });
      setMyFollowing(prev => [...prev, profileId!]);
    }
    setRefresh(r => !r); // 👈 fuerza refresco tras seguir/dejar de seguir
  };

  if (loading || !profileUser) {
    return <div className="p-6 text-gray-500 dark:text-gray-400">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-2 dark:text-white">Perfil de Usuario</h2>
      <div className="mb-2"><b>Email:</b> {profileUser.email}</div>
      <div className="mb-2">
        <b>LinkedIn:</b>{" "}
        {profileUser.linkedin ? (
          <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver Perfil</a>
        ) : <span className="text-gray-400">No registrado</span>}
      </div>
      <div className="mb-2"><b>Stack tecnológico:</b> {(profileUser.stack ?? []).join(", ")}</div>
      <div className="mb-2"><b>Habilidades:</b> {(profileUser.habilidades ?? []).join(", ")}</div>
      <div className="mb-2"><b>Siguiendo:</b> {following.length}</div>
      <div className="mb-2"><b>Seguidores:</b> {followers.length}</div>

      {/* Botón Seguir/Dejar de seguir */}
      {!isMe && user && (
        <button
          className={`px-3 py-1 rounded ${isFollowing ? 'bg-gray-300' : 'bg-blue-500 text-white'} mt-2`}
          onClick={handleFollow}
        >
          {isFollowing ? 'Dejar de seguir' : 'Seguir'}
        </button>
      )}

      <div className="my-4">
        <h3 className="font-bold text-lg dark:text-white mb-2">Proyectos</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No hay proyectos públicos de este usuario.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={() => {}} 
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
