"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";

export default function NewZonePage() {
  const router = useRouter();
  const { id } = useParams(); // ID склада
  const [formData, setFormData] = useState({
    warehouse_id:id,
    department_id: 0,
    name: "",
    type: "STORAGE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deps,setDeps] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null);


  useEffect(()=> {
    const fetchDeps = async () => {
      try {
      const res = await fetchWithAuth(`http://backend:8000/departments`)
      if (!res.ok) throw new Error("Failed to fetch departments")
      const data = await res.json()
      setDeps(data)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : "failed to fetch departments")
      }
    }
    fetchDeps()
  },[])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`http://backend:8000/warehouses/${id}/zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка при создании зоны");
      }

      router.push(`/warehouses/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Создать новую зону</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Название *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Тип *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="RECEIPT">Приемка</option>
            <option value="STORAGE">Хранение</option>
            <option value="SHIPPING">Отгрузка</option>
            <option value="REPAIR">Ремонт</option>
          </select>
        </div>
        <div>
          <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">Подразделение *</label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option key={0} value={0}>Выберите подразделение</option>
            {deps.map(d=>(
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}