"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert } from "@/components/Alert";

interface RoleRightSchema {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  children?: RoleRightSchema[];
}

export function createRoleRightForm(url: string) {
  const entity = url.substring(url.lastIndexOf('/'));
  const entityName = entity === '/roles' ? 'роль' : 'право';
  const entityNameCapitalized = entity === '/roles' ? 'Роль' : 'Право';

  return function RoleRightFormPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const isEditing = id !== "create";

    const [allItems, setAllItems] = useState<RoleRightSchema[]>([]);
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      parent_id: null as number | null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [itemsRes, itemRes] = await Promise.all([
            fetchWithAuth(url),
            isEditing ? fetchWithAuth(`${url}/${id}`) : Promise.resolve(null)
          ]);

          if (!itemsRes.ok) throw new Error(`Failed to fetch ${entityName}s`);
          const itemsData = await itemsRes.json();
          setAllItems(itemsData);

          if (isEditing && itemRes) {
            if (!itemRes.ok) throw new Error(`Failed to fetch ${entityName}`);
            const itemData = await itemRes.json();
            setFormData({
              name: itemData.name,
              description: itemData.description || "",
              parent_id: itemData.parent_id
            });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : `Failed to load ${entityName}`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [id, isEditing, url]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
        const method = isEditing ? "PUT" : "POST";
        const fetchUrl = isEditing ? `${url}/${id}` : url;
        
        const response = await fetchWithAuth(fetchUrl, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to save ${entityName}`);
        }

        router.push(entity);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Save failed`);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'parent_id' ? (value ? parseInt(value) : null) : value 
      }));
    };

    if (isLoading) return <LoadingSpinner />;

    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditing ? `Изменить ${entityNameCapitalized}` : `Создать ${entityNameCapitalized}`}
          </h1>
        </div>

        {error && <Alert type="error" message={error} className="mb-4" />}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Название *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                Родитель: {entityNameCapitalized}
              </label>
              <select
                id="parent_id"
                name="parent_id"
                value={formData.parent_id || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- No parent --</option>
                {allItems
                  .filter(item => !isEditing || item.id !== parseInt(id as string))
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
}