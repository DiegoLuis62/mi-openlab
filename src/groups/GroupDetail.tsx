import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

type Group = {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdAt: Date | null;
};

type Post = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date | null;
};

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");

  // Traer info del grupo
  useEffect(() => {
    if (!id) return;
    const fetchGroup = async () => {
      const docRef = doc(db, "groups", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setGroup({
          id: snap.id,
          name: data.name,
          description: data.description,
          members: data.members ?? [],
          createdAt: data.createdAt
            ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt)
            : null,
        });
      }
    };
    fetchGroup();
  }, [id]);

  // Traer y escuchar posts del grupo
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "groups", id, "posts"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr: Post[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        arr.push({
          id: docSnap.id,
          authorId: data.authorId,
          authorName: data.authorName,
          content: data.content,
          createdAt: data.createdAt
            ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt)
            : null,
        });
      });
      setPosts(arr);
    });
    return () => unsub();
  }, [id]);

  // Crear post (mensaje en el foro)
  const handlePost = async () => {
    if (!content.trim() || !id || !user) return;
    await addDoc(collection(db, "groups", id, "posts"), {
      authorId: user.uid,
      authorName: user.email,
      content,
      createdAt: serverTimestamp(),
    });
    setContent("");
  };

  if (!group) return <p className="p-6">Cargando grupo...</p>;

  const isMember = group.members.includes(user?.uid ?? "");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
      <div className="text-gray-700 mb-4">{group.description}</div>
      <div className="mb-2 text-sm text-gray-500">Miembros: {group.members.length}
        {group.createdAt && (
          <> · {group.createdAt.toLocaleDateString()}</>
        )}
      </div>

      {/* SOLO miembros pueden ver/participar en el foro */}
      {isMember ? (
        <div>
          <div className="mb-4">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="border rounded w-full p-2 mb-2"
              placeholder="Escribe un mensaje..."
              rows={3}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handlePost}
            >
              Publicar
            </button>
          </div>
          <div className="mb-2 font-bold">Foro del grupo:</div>
          <ul>
            {posts.map(post => (
              <li key={post.id} className="mb-3 border-b pb-2">
                <div className="font-semibold">{post.authorName}</div>
                <div>{post.content}</div>
                <div className="text-xs text-gray-500">
                  {post.createdAt
                    ? post.createdAt.toLocaleString()
                    : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-red-600">Debes unirte al grupo para ver y participar en el foro.</div>
      )}
    </div>
  );
}
