import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FirebaseError } from 'firebase/app';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile');
    } catch (error) {
      const err = error as FirebaseError;
      console.error('Login error:', err);

      switch (err.code) {
        case 'auth/user-not-found':
          setErrorMsg('Usuario no encontrado');
          break;
        case 'auth/wrong-password':
          setErrorMsg('Contraseña incorrecta');
          break;
        case 'auth/invalid-email':
          setErrorMsg('Correo inválido');
          break;
        default:
          setErrorMsg('Error al iniciar sesión');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Correo electrónico</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMsg && (
          <div className="text-red-500 text-sm">{errorMsg}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
        >
          Iniciar sesión
        </button>
      </form>
      <p className="text-sm mt-2 text-center">
        <Link to="/password-reset" className="text-blue-600 underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      <p className="text-sm mt-4 text-center">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
