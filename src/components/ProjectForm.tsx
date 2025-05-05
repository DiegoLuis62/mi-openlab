import { useState, FormEvent } from "react";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/useAuth";
import { Project } from "../types";

export interface ProjectFormProps {
  existingProject: Project | null; // Acepta null aquí
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectForm({
  existingProject,
  onClose,
  onSaved,
}: ProjectFormProps) {
  const { user } = useAuth();

  const [titulo, setTitulo] = useState(existingProject?.titulo || "");
  const [descripcion, setDescripcion] = useState(
    existingProject?.descripcion || ""
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión para crear o editar proyectos.");
      return;
    }

    if (!titulo || !descripcion) return;

    if (existingProject?.id) {
      await updateDoc(doc(db, "proyectos", existingProject.id), {
        titulo,
        descripcion,
      });
    } else {
      await addDoc(collection(db, "proyectos"), {
        titulo,
        descripcion,
        uid: user.uid,
        autor: user.displayName || user.email || "Anónimo", 
      });
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h3 className="text-lg font-bold mb-4 dark:text-white">
          {existingProject ? "Editar Proyecto" : "Nuevo Proyecto"}
        </h3>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:outline-none dark:bg-gray-800 dark:text-white"
          required
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:outline-none dark:bg-gray-800 dark:text-white"
          required
        ></textarea>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
