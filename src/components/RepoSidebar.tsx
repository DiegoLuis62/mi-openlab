import React, { useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

interface Repo {
  id: number;
  name: string;
}

const RepoSidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const { darkMode } = useDarkMode(); // Usando el contexto

  const repos: Repo[] = [
    { id: 1, name: 'mi-proyecto-frontend' },
    { id: 2, name: 'api-restful' },
    { id: 3, name: 'portafolio-web' },
    { id: 4, name: 'pruebas-unitarias' },
    { id: 5, name: 'sistema-login' },
  ];

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`w-64 h-screen p-4 overflow-y-auto border-r transition-colors
      ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}>
      <input
        type="text"
        placeholder="Buscar repositorio..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={`w-full px-3 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:border-blue-400
          ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
      />
      <ul>
        {filteredRepos.map(repo => (
          <li
            key={repo.id}
            className={`px-3 py-2 rounded cursor-pointer transition 
              ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
          >
            {repo.name}
          </li>
        ))}
        {filteredRepos.length === 0 && (
          <p className="text-gray-500 text-sm px-2">No se encontraron resultados.</p>
        )}
      </ul>
    </aside>
  );
};

export default RepoSidebar;
