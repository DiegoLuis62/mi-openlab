import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
    Timestamp,
  } from 'firebase/firestore';
  import { useEffect, useState } from 'react';
  import { db } from '../firebase';
  import { useAuth } from '../context/useAuth';
  
  type Proyecto = {
    id: string;
    titulo: string;
    descripcion: string;
  };
  
  export default function Profile() {
    const { user } = useAuth();
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null);
  
    useEffect(() => {
      if (!user) return;
  
      const cargarProyectos = async () => {
        const q = query(
          collection(db, 'proyectos'),
          where('uid', '==', user.uid)
        );
  
        const querySnapshot = await getDocs(q);
        const lista: Proyecto[] = [];
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          lista.push({
            id: doc.id,
            titulo: data.titulo,
            descripcion: data.descripcion,
          });
        });
  
        setProyectos(lista);
      };
  
      cargarProyectos();
    }, [user]);
  
    const handleCrear = async () => {
      if (!titulo.trim() || !descripcion.trim() || !user) return;
  
      try {
        const ref = await addDoc(collection(db, 'proyectos'), {
          uid: user.uid,
          autor: user.email,
          titulo,
          descripcion,
          creadoEn: Timestamp.now(),
        });
        console.log('Proyecto creado:', ref.id);
      } catch (error) {
        console.error('Error al crear proyecto en Firestore:', error);
      }
      
  
      limpiarFormulario();
      if (user) {
        const q = query(
          collection(db, 'proyectos'),
          where('uid', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const lista: Proyecto[] = [];
        snapshot.forEach((doc) =>
          lista.push({
            id: doc.id,
            titulo: doc.data().titulo,
            descripcion: doc.data().descripcion,
          })
        );
        setProyectos(lista);
      }
    };
  
    const handleEditar = (id: string) => {
      const proyecto = proyectos.find((p) => p.id === id);
      if (!proyecto) return;
  
      setTitulo(proyecto.titulo);
      setDescripcion(proyecto.descripcion);
      setModoEdicion(true);
      setIdEnEdicion(id);
    };
  
    const handleGuardarEdicion = async () => {
      if (!idEnEdicion || !titulo.trim() || !descripcion.trim()) return;
  
      const ref = doc(db, 'proyectos', idEnEdicion);
      await updateDoc(ref, {
        titulo,
        descripcion,
      });
  
      limpiarFormulario();
      if (user) {
        const q = query(
          collection(db, 'proyectos'),
          where('uid', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const lista: Proyecto[] = [];
        snapshot.forEach((doc) =>
          lista.push({
            id: doc.id,
            titulo: doc.data().titulo,
            descripcion: doc.data().descripcion,
          })
        );
        setProyectos(lista);
      }
    };
  
    const handleEliminar = async (id: string) => {
      if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
      await deleteDoc(doc(db, 'proyectos', id));
  
      if (user) {
        const q = query(
          collection(db, 'proyectos'),
          where('uid', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const lista: Proyecto[] = [];
        snapshot.forEach((doc) =>
          lista.push({
            id: doc.id,
            titulo: doc.data().titulo,
            descripcion: doc.data().descripcion,
          })
        );
        setProyectos(lista);
      }
    };
  
    const limpiarFormulario = () => {
      setTitulo('');
      setDescripcion('');
      setModoEdicion(false);
      setIdEnEdicion(null);
    };
  
    return (
      <div className="max-w-4xl mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4">Mis Proyectos</h2>
  
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {modoEdicion ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título"
              className="w-full p-2 rounded-md border dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <textarea
              placeholder="Descripción breve"
              className="w-full p-2 rounded-md border dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <div className="flex gap-2">
              {modoEdicion ? (
                <>
                  <button
                    onClick={handleGuardarEdicion}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={limpiarFormulario}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCrear}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Crear Proyecto
                </button>
              )}
            </div>
          </div>
        </div>
  
        <div className="grid md:grid-cols-2 gap-4">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md"
            >
              <h4 className="text-lg font-bold">{p.titulo}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{p.descripcion}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEditar(p.id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  