import { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Correo no registrado o error al enviar email');
      }
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-xl font-bold mb-2">Recuperar Contraseña</h2>
      {sent ? (
        <div className="text-green-600">Revisa tu correo para restaurar la contraseña.</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            className="border p-2 rounded"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div className="text-red-500">{error}</div>}
          <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">
            Enviar enlace
          </button>
        </form>
      )}
    </div>
  );
}
