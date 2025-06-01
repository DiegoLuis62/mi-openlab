import { useState, FormEvent } from "react";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/useAuth";
import { Project } from "../types";
import ChipsInput from "./ChipsInput";
import { addActivity } from "../utils/activity"; // NUEVO: importa el utilitario

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

  // Arrays de chips personalizables
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
      githubLink: githubLink || "",
      demoLink: demoLink || "",
      categorias,
      tecnologias,
      etiquetas,
    };

    // Para debug:
    // console.log("Datos a guardar:", data);

    try {
      if (existingProject?.id) {
        await updateDoc(doc(db, "proyectos", existingProject.id), data);
        await addActivity(user.uid, "edit", `Editó el proyecto "${titulo}"`); // REGISTRO ACTIVIDAD
      } else {
        await addDoc(collection(db, "proyectos"), data);
        await addActivity(user.uid, "create", `Creó el proyecto "${titulo}"`); // REGISTRO ACTIVIDAD
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

        <ChipsInput
          label="Categorías:"
          values={categorias}
          setValues={setCategorias}
          placeholder="Añade categoría y Enter..."
        />
        <ChipsInput
          label="Tecnologías:"
          values={tecnologias}
          setValues={setTecnologias}
          placeholder="Añade tecnología y Enter..."
        />
        <ChipsInput
          label="Etiquetas:"
          values={etiquetas}
          setValues={setEtiquetas}
          placeholder="Añade etiqueta y Enter..."
        />

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
