import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import { User } from "../types";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>(); // id = userId de la URL
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "users", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as User;
        setProfile({ ...data, id });
        // Verifica si el usuario logueado ya sigue a este usuario
        if (user?.uid) {
          setIsFollowing((data.followers ?? []).includes(user.uid));
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id, user?.uid]);

  const handleFollow = async () => {
    // VALIDACIÓN: solo ejecuta si ambos son string
    if (!user?.uid || !id) return;
    const myRef = doc(db, "users", user.uid);
    const targetRef = doc(db, "users", id);

    if (isFollowing) {
      await updateDoc(myRef, { following: arrayRemove(id) });
      await updateDoc(targetRef, { followers: arrayRemove(user.uid) });
      setIsFollowing(false);
    } else {
      await updateDoc(myRef, { following: arrayUnion(id) });
      await updateDoc(targetRef, { followers: arrayUnion(user.uid) });
      setIsFollowing(true);
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!profile) return <p>No se encontró el usuario.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{profile.email}</h2>
      {/* Información básica del perfil */}
      <div className="mb-2"><b>LinkedIn:</b>{" "}
        {profile.linkedin ? (
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Ver Perfil
          </a>
        ) : <span className="text-gray-400">No registrado</span>}
      </div>
      <div className="mb-2"><b>Stack tecnológico:</b> {profile.stack?.join(", ")}</div>
      <div className="mb-2"><b>Habilidades:</b> {profile.habilidades?.join(", ")}</div>
      {/* Puedes agregar experiencia, educación, badges, etc. */}
      {user?.uid && user.uid !== id && (
        <button
          className={`px-4 py-2 rounded ${isFollowing ? "bg-red-500" : "bg-green-500"} text-white`}
          onClick={handleFollow}
        >
          {isFollowing ? "Dejar de seguir" : "Seguir"}
        </button>
      )}
    </div>
  );
}
