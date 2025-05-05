// src/pages/Explore.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';


type Proyecto = {
  id: string;
  titulo: string;
  descripcion: string;
  autor: string;
};

export default function Explore() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerProyectos = async () => {
      const querySnapshot = await getDocs(collection(db, 'proyectos'));
      const lista: Proyecto[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          autor: data.autor || 'anónimo',
        });
      });

      setProyectos(lista);
      setLoading(false);
    };

    obtenerProyectos();
  }, []);

  return (
    <div className="flex">
 

      {/* El contenido principal */}
      <div className="max-w-6xl mx-auto mt-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Proyectos Públicos</h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Cargando proyectos...</p>
        ) : proyectos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay proyectos disponibles.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectos.map((proyecto) => (
              <Link
                key={proyecto.id}
                to={`/project/${proyecto.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:ring-2 hover:ring-blue-400 transition"
              >
                <h3 className="text-lg font-semibold mb-1">{proyecto.titulo}</h3>
                {/* <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {proyecto.descripcion}
                </p> */}
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Autor: {proyecto.autor}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
