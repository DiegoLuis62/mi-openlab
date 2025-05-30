import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import ProjectCard from "../components/ProjectCard";
import { Project } from "../types";

export default function Feed() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState<string[]>([]);

    // Obtener lista de seguidos del usuario actual
    useEffect(() => {
        if (!user?.uid) return;
        const fetchFollowing = async () => {
            const userRef = collection(db, "users");
            const q = query(userRef, where("__name__", "==", user.uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const data = snap.docs[0].data();
                setFollowing(data.following ?? []);
            }
        };
        fetchFollowing();
    }, [user]);

    // Traer proyectos de los usuarios seguidos
    useEffect(() => {
        if (!user?.uid || following.length === 0) {
            setProjects([]);
            setLoading(false);
            return;
        }
        const fetchProjects = async () => {
            const fetched: Project[] = [];
            // Firestore 'in' limita a 10 elementos por consulta
            const batches = [];
            for (let i = 0; i < following.length; i += 10) {
                batches.push(following.slice(i, i + 10));
            }
            for (const batch of batches) {
                const q = query(
                    collection(db, "proyectos"),
                    where("uid", "in", batch),
                    orderBy("createdAt", "desc") // Asegúrate de tener este campo
                );
                const snap = await getDocs(q);
                snap.forEach((docSnap) => {
                    const data = docSnap.data();
                    fetched.push({
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
                    });
                });
            }
            setProjects(fetched);
            setLoading(false);
        };
        fetchProjects();
    }, [user, following]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Feed personalizado</h2>
            {loading ? (
                <p>Cargando...</p>
            ) : projects.length === 0 ? (
                <p>No hay proyectos recientes de usuarios que sigues.</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) =>
                        project.id ? (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onEdit={() => alert("No puedes editar proyectos ajenos")}
                                onDelete={() => alert("No puedes eliminar proyectos ajenos")}
                                userFavorites={[]}
                            />
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
}
