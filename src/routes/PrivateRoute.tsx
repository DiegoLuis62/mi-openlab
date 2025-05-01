import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { JSX } from 'react';

interface Props {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600 dark:text-gray-300">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
