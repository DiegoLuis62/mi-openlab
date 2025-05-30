// src/components/ProjectForm.tsx
import { useState, FormEvent } from "react";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/useAuth";
import { Project } from "../types";

const OPCIONES_CATEGORIAS = ["Web", "IA", "Mobile", "Data Science"];
const OPCIONES_TECNOLOGIAS = ["React", "Firebase", "Node.js", "Python"];
const OPCIONES_ETIQUETAS = ["open source", "educativo", "startup"];

export interface ProjectFormProps {
  existingProject: Project | null;
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
  const [descripcion, setDescripcion] = useState(existingProject?.descripcion || "");
  const [githubLink, setGithubLink] = useState(existingProject?.githubLink || "");
  const [demoLink, setDemoLink] = useState(existingProject?.demoLink || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(existingProject?.imageUrl || "");
  const [uploading, setUploading] = useState(false);

  // Estados de arrays para selección múltiple
  const [categorias, setCategorias] = useState<string[]>(existingProject?.categorias || []);
  const [tecnologias, setTecnologias] = useState<string[]>(existingProject?.tecnologias || []);
  const [etiquetas, setEtiquetas] = useState<string[]>(existingProject?.etiquetas || []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión para crear o editar proyectos.");
      return;
    }
    if (!titulo || !descripcion) return;

    let finalImageUrl = existingProject?.imageUrl || "";

    if (imageFile) {
      setUploading(true);
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `proyectos/${user.uid}/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      } catch {
        setUploading(false);
        alert("Error al subir la imagen. Intenta de nuevo.");
        return;
      }
      setUploading(false);
    }

    const data = {
      titulo,
      descripcion,
      autor: user.displayName || user.email || "Anónimo",
      uid: user.uid,
      imageUrl: finalImageUrl,
      githubLink,
      demoLink,
      categorias,
      tecnologias,
      etiquetas,
    };

    try {
      if (existingProject?.id) {
        await updateDoc(doc(db, "proyectos", existingProject.id), data);
      } else {
        await addDoc(collection(db, "proyectos"), data);
      }
      onSaved();
      onClose();
    } catch {
      alert("Error al guardar el proyecto.");
    }
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
        {/* Categorías */}
        <div className="mb-3">
          <span className="font-semibold dark:text-white">Categorías:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {OPCIONES_CATEGORIAS.map(cat => (
              <label key={cat} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={categorias.includes(cat)}
                  onChange={e =>
                    setCategorias(e.target.checked
                      ? [...categorias, cat]
                      : categorias.filter(c => c !== cat))
                  }
                />
                <span className="dark:text-white">{cat}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Tecnologías */}
        <div className="mb-3">
          <span className="font-semibold dark:text-white">Tecnologías:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {OPCIONES_TECNOLOGIAS.map(tech => (
              <label key={tech} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={tecnologias.includes(tech)}
                  onChange={e =>
                    setTecnologias(e.target.checked
                      ? [...tecnologias, tech]
                      : tecnologias.filter(t => t !== tech))
                  }
                />
                <span className="dark:text-white">{tech}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Etiquetas */}
        <div className="mb-3">
          <span className="font-semibold dark:text-white">Etiquetas:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {OPCIONES_ETIQUETAS.map(tag => (
              <label key={tag} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={etiquetas.includes(tag)}
                  onChange={e =>
                    setEtiquetas(e.target.checked
                      ? [...etiquetas, tag]
                      : etiquetas.filter(t => t !== tag))
                  }
                />
                <span className="dark:text-white">{tag}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Links externos */}
        <input
          type="url"
          placeholder="Link a GitHub"
          value={githubLink}
          onChange={(e) => setGithubLink(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:outline-none dark:bg-gray-800 dark:text-white"
        />
        <input
          type="url"
          placeholder="Link a demo en video"
          value={demoLink}
          onChange={(e) => setDemoLink(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:outline-none dark:bg-gray-800 dark:text-white"
        />
        {/* Imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-3"
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="preview"
            className="mb-3 h-32 w-full object-contain rounded border"
          />
        )}
        {uploading && (
          <div className="mb-3 text-blue-600">Subiendo imagen...</div>
        )}
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
            disabled={uploading}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
