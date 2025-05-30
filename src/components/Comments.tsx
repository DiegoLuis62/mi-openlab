import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface CommentsProps {
  projectId: string;
  userId: string;
  userName: string;
}

type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: { toDate?: () => Date };
};

export default function Comments({ projectId, userId, userName }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'proyectos', projectId, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
    return unsub;
  }, [projectId]);

  const handleComment = async () => {
    if (!content.trim()) return;
    await addDoc(collection(db, 'proyectos', projectId, 'comments'), {
      authorId: userId,
      authorName: userName,
      content,
      createdAt: serverTimestamp(),
    });
    setContent('');
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('¿Eliminar comentario?')) {
      await deleteDoc(doc(db, 'proyectos', projectId, 'comments', commentId));
    }
  };

  return (
    <div className="mt-8">
      <h3 className="font-bold mb-2">Comentarios</h3>
      <div className="flex gap-2 mb-2">
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Agrega un comentario..."
          className="border rounded p-2 flex-1"
        />
        <button onClick={handleComment} className="bg-blue-600 text-white rounded px-2 py-1">Enviar</button>
      </div>
      <ul>
        {comments.map(c => (
          <li key={c.id} className="mt-2 flex items-center gap-2">
            <span className="font-semibold">{c.authorName}:</span>
            <span>{c.content}</span>
            <span className="text-xs text-gray-500 ml-2">
              {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ''}
            </span>
            {c.authorId === userId && (
              <button className="text-red-500 ml-2" onClick={() => handleDelete(c.id)}>
                Eliminar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
