import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from '../firebase';

interface FavoriteButtonProps {
  userId: string;
  projectId: string;
  favorites: string[];
}

export default function FavoriteButton({ userId, projectId, favorites }: FavoriteButtonProps) {
  const isFav = favorites.includes(projectId);

  const handleFavorite = async () => {
    const ref = doc(db, "users", userId);
    if (isFav) {
      await updateDoc(ref, { favorites: arrayRemove(projectId) });
    } else {
      await updateDoc(ref, { favorites: arrayUnion(projectId) });
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
