import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useDarkMode } from '../context/DarkModeContext';
import { Project } from '../types';

const ProjectSidebar: React.FC = () => {
  const { darkMode } = useDarkMode();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'proyectos'));
        const data = snapshot.docs.map(doc => {
          const projectData = doc.data() as Omit<Project, 'id'>; // Excluimos 'id' del cast
          return {
            id: doc.id,
            ...projectData,
          };
        });
        setProjects(data);
      } catch (error) {
        console.error('Error al cargar los proyectos:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, []);
  

  const filteredProjects = projects.filter(project =>
    project.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className={`w-64 h-screen p-4 overflow-y-auto border-r transition-colors ${
        darkMode
          ? 'bg-gray-800 text-white border-gray-700'
          : 'bg-gray-100 text-gray-900 border-gray-300'
      }`}
    >
      <input
        type="text"
        placeholder="Buscar proyecto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={`w-full px-3 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:border-blue-400 ${
          darkMode
            ? 'bg-gray-700 text-white border-gray-600'
            : 'bg-white text-black border-gray-300'
        }`}
      />

      {loading ? (
        <p className="text-sm text-gray-500 px-2">Cargando proyectos...</p>
      ) : (
        <ul>
          {filteredProjects.map(project => (
            <li
              key={project.id}
              className={`px-3 py-2 rounded cursor-pointer transition ${
                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
              }`}
              // Aquí puedes agregar un onClick para navegar o mostrar detalles
            >
              {project.titulo}
            </li>
          ))}
          {filteredProjects.length === 0 && (
            <p className="text-gray-500 text-sm px-2">No se encontraron resultados.</p>
          )}
        </ul>
      )}
    </aside>
  );
};

export default ProjectSidebar;
