import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, serverTimestamp, updateDoc, doc, arrayUnion} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";

type Group = {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdAt: Date | null;
};

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  // Traer grupos
  useEffect(() => {
    const fetchGroups = async () => {
      const snap = await getDocs(collection(db, "groups"));
      const arr: Group[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        arr.push({
          id: docSnap.id,
          name: data.name,
          description: data.description,
          members: data.members ?? [],
          createdAt: data.createdAt
            ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt)
            : null,
        });
      });
      setGroups(arr);
    };
    fetchGroups();
  }, []);

  // Crear grupo
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user?.uid) return;
    const docRef = await addDoc(collection(db, "groups"), {
      name,
      description,
      members: [user.uid],
      createdAt: serverTimestamp(),
    });
    setName("");
    setDescription("");
    navigate(`/groups/${docRef.id}`);
  };

  // Unirse a grupo
  const handleJoin = async (groupId: string, members: string[]) => {
    if (!user?.uid || members.includes(user.uid)) return;
    await updateDoc(doc(db, "groups", groupId), {
      members: arrayUnion(user.uid)
    });
    setGroups(groups => groups.map(g =>
      g.id === groupId ? { ...g, members: [...g.members, user.uid] } : g
    ));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Grupos</h2>

      <form onSubmit={handleCreate} className="mb-6">
        <input
          className="border rounded p-2 mr-2"
          type="text"
          placeholder="Nombre del grupo"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="border rounded p-2 mr-2"
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Crear grupo
        </button>
      </form>

      <ul>
        {groups.map(group => (
          <li key={group.id} className="mb-4 border-b pb-2">
            <Link to={`/groups/${group.id}`} className="font-semibold text-blue-700 hover:underline">
              {group.name}
            </Link>
            <div className="text-sm text-gray-700">{group.description}</div>
            <div className="text-xs text-gray-500 mb-1">
              Miembros: {group.members.length}
              {group.createdAt && (
                <> · {group.createdAt.toLocaleDateString()}</>
              )}
            </div>
            {user?.uid && !group.members.includes(user.uid) && (
              <button
                className="text-sm bg-green-600 text-white px-2 py-1 rounded"
                onClick={() => handleJoin(group.id, group.members)}
              >
                Unirse
              </button>
            )}
            {user?.uid && group.members.includes(user.uid) && (
              <span className="text-xs text-green-700 ml-2">Ya eres miembro</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
