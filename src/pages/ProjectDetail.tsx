import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

type Proyecto = {
  id: string;
  titulo: string;
  descripcion: string;
  autor: string;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);

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
        });
      } else {
        setProyecto(null);
      }

      setLoading(false);
    };

    cargarProyecto();
  }, [id]);

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
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {proyecto.descripcion}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Autor: <span className="font-medium">{proyecto.autor}</span>
      </p>

      <div className="mt-6">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Volver a explorar
        </Link>
      </div>
    </div>
  );
}
