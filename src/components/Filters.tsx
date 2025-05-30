const categorias = ["Web", "IA", "Mobile", "Data Science"];
const tecnologias = ["React", "Firebase", "Node.js", "Python"];
const etiquetas = ["open source", "educativo", "startup"];

export interface FiltersProps {
  filters: {
    category: string;
    technology: string;
    tag: string;
  };
  setFilters: (f: { category: string; technology: string; tag: string }) => void;
}

export default function Filters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {/* Categorías */}
      <div>
        <span className="font-semibold">Categoría:</span>
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`px-2 py-1 rounded ${
              filters.category === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white"
            }`}
            onClick={() =>
              setFilters({
                ...filters,
                category: filters.category === cat ? "" : cat,
              })
            }
          >
            {cat}
          </button>
        ))}
      </div>
      {/* Tecnologías */}
      <div>
        <span className="font-semibold">Tecnología:</span>
        {tecnologias.map((tech) => (
          <button
            key={tech}
            className={`px-2 py-1 rounded ${
              filters.technology === tech
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white"
            }`}
            onClick={() =>
              setFilters({
                ...filters,
                technology: filters.technology === tech ? "" : tech,
              })
            }
          >
            {tech}
          </button>
        ))}
      </div>
      {/* Etiquetas */}
      <div>
        <span className="font-semibold">Etiqueta:</span>
        {etiquetas.map((tag) => (
          <button
            key={tag}
            className={`px-2 py-1 rounded ${
              filters.tag === tag
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white"
            }`}
            onClick={() =>
              setFilters({
                ...filters,
                tag: filters.tag === tag ? "" : tag,
              })
            }
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
