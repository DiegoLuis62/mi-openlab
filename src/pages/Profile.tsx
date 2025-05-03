import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";
import ConfirmDialog from "../components/ConfirmDialog";
import RepoSidebar from "../components/RepoSidebar";
import { Project } from "../types"; // Importa el tipo Project

export default function Profile() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]); // Usa el tipo Project aquí
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null); // Usamos Project o null
  const [showForm, setShowForm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null); // Usamos Project o null

  useEffect(() => {
    if (user) {
      const fetchProjects = async () => {
        const q = query(
          collection(db, "proyectos"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const lista: Project[] = [];
        querySnapshot.forEach((doc) => {
          // Asegurándote de que el id no sea undefined
          const project = { id: doc.id, ...doc.data() } as Project;
          lista.push(project);
        });
        setProjects(lista);
        setLoading(false);
      };
      fetchProjects();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "proyectos", id));
    setProjects(projects.filter((p) => p.id !== id));
    setProjectToDelete(null);
  };

  const handleEdit = (project: Project) => {
    // Ahora pasas un Project en lugar de any
    setEditingProject(project);
    setShowForm(true);
  };

  return (
    <div className="flex">
      <RepoSidebar />

      <div className="flex-1 p-6">
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
              project.id ? ( // Verifica que 'id' esté definido
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={() => setProjectToDelete(project)}
                />
              ) : null // Si no tiene 'id', no se renderiza el 'ProjectCard'
            )}
          </div>
        )}

        {showForm && (
          <ProjectForm
            existingProject={editingProject}
            onClose={() => setShowForm(false)}
            onSaved={() => window.location.reload()} // simple recarga
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
