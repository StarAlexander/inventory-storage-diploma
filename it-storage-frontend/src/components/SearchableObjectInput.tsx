"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";

interface ObjectOption {
  id: number;
  name: string;
  organization?: string;
  department?: string;
  category?: string;
}

export default function SearchableObjectInput({
  onSelect,
  selectedId,
}: {
  onSelect: (obj: ObjectOption | null) => void;
  selectedId?: number | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ObjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ObjectOption | null>(null);

  // Получаем текущий объект при загрузке, если передан selectedId
  useEffect(() => {
    if (selectedId) {
      fetchWithAuth(`http://backend:8000/objects/${selectedId}`)
        .then((res) => res.json())
        .then((data) => {
          setSelected({
            id: data.id,
            name: data.name,
            organization: data.organization?.name || "-",
            department: data.department?.name || "-",
            category: data.category?.name || "-",
          });
        })
        .catch(console.error);
    }
  }, [selectedId]);

  // Поиск при вводе
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          `http://backend:8000/objects/search?query=${encodeURIComponent(searchTerm)}`
        );
        const data = await res.json();

        const options = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          organization: item.organization?.name || "-",
          department: item.department?.name || "-",
          category: item.category?.name || "-",
        }));

        setResults(options);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (obj: ObjectOption) => {
    setSearchTerm("");
    setResults([]);
    setSelected(obj);
    onSelect(obj);
  };

  const handleClear = () => {
    setSelected(null);
    onSelect(null);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Поиск оборудования..."
        value={selected ? `${selected.id} — ${selected.name}` : searchTerm}
        onChange={(e) => {
          if (!selected) setSearchTerm(e.target.value);
        }}
        onFocus={() => selected && setSelected(null)}
        className="w-full mt-1 border rounded px-3 py-2"
      />
      {selected && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}

      {/* Результаты поиска */}
      {results.length > 0 && !selected && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {results.map((obj) => (
            <li
              key={obj.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(obj)}
            >
              <div className="font-medium">{obj.name}</div>
              <div className="text-sm text-gray-500">
                ID: {obj.id} | Организация: {obj.organization} | Отдел: {obj.department} | Категория: {obj.category}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}