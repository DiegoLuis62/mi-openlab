import { useState } from "react";

interface ChipsInputProps {
  label: string;
  values: string[];
  setValues: (v: string[]) => void;
  placeholder?: string;
}

export default function ChipsInput({ label, values, setValues, placeholder }: ChipsInputProps) {
  const [input, setInput] = useState("");

  const addChip = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim() !== "") {
      e.preventDefault();
      const val = input.trim();
      if (val.length > 0 && !values.includes(val)) {
        setValues([...values, val]);
      }
      setInput("");
    }
  };

  const removeChip = (val: string) => {
    setValues(values.filter(v => v !== val));
  };

  return (
    <div className="mb-3">
      <span className="font-semibold dark:text-white">{label}</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map(val => (
          <span key={val} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
            {val}
            <button type="button" onClick={() => removeChip(val)} className="text-red-500 font-bold ml-1">×</button>
          </span>
        ))}
        <input
          className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={addChip}
        />
      </div>
      <small className="text-xs text-gray-500">Presiona Enter o Coma para agregar</small>
    </div>
  );
}
