import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type Proyecto = {
  id: string;
  titulo: string;
  autor: string;
  categorias?: string[];
  tecnologias?: string[];
  etiquetas?: string[];
};

export default function Explore() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para los filtros
  const [filters, setFilters] = useState({
    category: "",
    technology: "",
    tag: ""
  });

  const [proyectosFiltrados, setProyectosFiltrados] = useState<Proyecto[]>([]);

  useEffect(() => {
    const obtenerProyectos = async () => {
      setLoading(true);
      const colRef = collection(db, 'proyectos');
      const querySnapshot = await getDocs(colRef);
      const lista: Proyecto[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          titulo: data.titulo,
          autor: data.autor || 'anónimo',
          categorias: data.categorias || [],
          tecnologias: data.tecnologias || [],
          etiquetas: data.etiquetas || [],
        });
      });

      setProyectos(lista);
      setLoading(false);
    };

    obtenerProyectos();
  }, []);

  const allCategorias = Array.from(new Set(proyectos.flatMap(p => p.categorias ?? [])));
  const allTecnologias = Array.from(new Set(proyectos.flatMap(p => p.tecnologias ?? [])));
  const allEtiquetas = Array.from(new Set(proyectos.flatMap(p => p.etiquetas ?? [])));

  useEffect(() => {
    let resultado = proyectos;

    if (filters.category) {
      resultado = resultado.filter(p =>
        p.categorias && p.categorias.includes(filters.category)
      );
    }
    if (filters.technology) {
      resultado = resultado.filter(p =>
        p.tecnologias && p.tecnologias.includes(filters.technology)
      );
    }
    if (filters.tag) {
      resultado = resultado.filter(p =>
        p.etiquetas && p.etiquetas.includes(filters.tag)
      );
    }

    setProyectosFiltrados(resultado);
  }, [filters, proyectos]);

  return (
    <div className="flex">
      <div className="max-w-6xl mx-auto mt-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Proyectos Públicos</h2>

        {/* Filtros dinámicos */}
        <div className="flex gap-4 mb-4">
          <select
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="border rounded px-2 py-1"
          >
            <option value="">Todas las categorías</option>
            {allCategorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.technology}
            onChange={e => setFilters(f => ({ ...f, technology: e.target.value }))}
            className="border rounded px-2 py-1"
          >
            <option value="">Todas las tecnologías</option>
            {allTecnologias.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filters.tag}
            onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
            className="border rounded px-2 py-1"
          >
            <option value="">Todas las etiquetas</option>
            {allEtiquetas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Cargando proyectos...</p>
        ) : proyectosFiltrados.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay proyectos disponibles.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectosFiltrados.map((proyecto) => (
              <Link
                key={proyecto.id}
                to={`/project/${proyecto.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:ring-2 hover:ring-blue-400 transition"
              >
                <h3 className="text-lg font-semibold mb-1">{proyecto.titulo}</h3>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Autor: {proyecto.autor}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
