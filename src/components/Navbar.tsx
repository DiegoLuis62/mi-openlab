import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useDarkMode } from '../context/DarkModeContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Ahora incluye FEED si el usuario está logueado
  const navItems = [
    { label: 'Explorar', path: '/' },
    ...(user
      ? [
          { label: 'Feed', path: '/feed' },      // <-- Añadido aquí
          { label: 'Perfil', path: '/profile' }
        ]
      : [
          { label: 'Login', path: '/login' },
          { label: 'Registro', path: '/register' },
        ]),
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Mi OpenLab</h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium ${
                  location.pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400 underline'
                    : 'text-gray-700 dark:text-gray-300 hover:underline'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Cerrar sesión
              </button>
            )}
          </div>
          <button
            onClick={toggleDarkMode}
            className="text-gray-800 dark:text-gray-200"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}
