import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from '../firebase';

interface LikeButtonProps {
  projectId: string;
  likedBy: string[];
  userId: string;
}

export default function LikeButton({ projectId, likedBy, userId }: LikeButtonProps) {
  const isLiked = likedBy.includes(userId);

  const handleLike = async () => {
    const ref = doc(db, "proyectos", projectId);
    if (isLiked) {
      await updateDoc(ref, { likedBy: arrayRemove(userId) });
    } else {
      await updateDoc(ref, { likedBy: arrayUnion(userId) });
    }
  };

  return (
    <button
      className={`px-2 py-1 rounded ${isLiked ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      onClick={handleLike}
      title={isLiked ? "Quitar Like" : "Dar Like"}
    >
      👍 {isLiked ? 'Quitar Like' : 'Like'}
    </button>
  );
}
