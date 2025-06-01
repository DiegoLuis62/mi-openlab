import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from '../firebase';
import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  userId: string;
  projectId: string;
  favorites: string[];
}

export default function FavoriteButton({ userId, projectId, favorites }: FavoriteButtonProps) {
  const [localFavorites, setLocalFavorites] = useState<string[]>(favorites);
  const isFav = localFavorites.includes(projectId);

  // Sincroniza favoritos si cambian en props
  useEffect(() => {
    setLocalFavorites(favorites);
  }, [favorites]);

  const handleFavorite = async () => {
    const ref = doc(db, "users", userId);
    try {
      if (isFav) {
        await updateDoc(ref, { favorites: arrayRemove(projectId) });
        setLocalFavorites(prev => prev.filter(id => id !== projectId));
      } else {
        await updateDoc(ref, { favorites: arrayUnion(projectId) });
        setLocalFavorites(prev => [...prev, projectId]);
      }
    } catch (error) {
      console.error("Error actualizando favoritos:", error);
    }
  };
  
  return (
    <button
      className={`px-2 py-1 rounded ${isFav ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
      onClick={handleFavorite}
      title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      ⭐ {isFav ? 'Quitar Favorito' : 'Favorito'}
    </button>
  );
}
