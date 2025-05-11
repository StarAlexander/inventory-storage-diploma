"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";

export default function WarehouseDetailPage() {
  const router = useRouter();
  const { id } = useParams(); // 'create' or numeric ID
  const isEditing = id !== "create";
  const [warehouse, setWarehouse] = useState({
    name: "",
    address: "",
    organization_id: 0,
    manager_id: 0,
  });
  const [orgs,setOrgs] = useState<any[]>([])
  const [users,setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      setIsLoading(true)
      try {
        
        const response = await fetchWithAuth(`http://backend:8000/organizations`)
        if (!response.ok) throw new Error("Ошибка при загрузке организаций")
          const data = await response.json()
          setOrgs(data)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить организации")
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchOrgs()

    if (!isEditing) return;
    const fetchWarehouse = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(`http://backend:8000/warehouses/${id}`);
        if (!response.ok) throw new Error("Ошибка при загрузке данных");
        const data = await response.json();
        setWarehouse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить данные");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWarehouse();
  }, [id, isEditing]);


  useEffect(()=> {
    if (!warehouse.organization_id) return;

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const res = await fetchWithAuth(`http://backend:8000/posts/users/organizations/${warehouse.organization_id}`)
        if (!res.ok) throw new Error("Failed to fetch users");
        const users = await res.json()
        setUsers(users)
      }
      catch (err) {
        setError(err instanceof Error? err.message : "failed to fetch users")
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  },[warehouse.organization_id])

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setWarehouse((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://backend:8000/warehouses/${id}`
        : "http://backend:8000/warehouses/";

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(warehouse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось сохранить данные");
      }

      router.push("/warehouses");
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Редактировать склад" : "Создать новый склад"}
        </h1>
        <Link href="/warehouses">
          <span className="inline-flex items-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
            Назад к списку
          </span>
        </Link>
      </nav>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Название *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={warehouse.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Адрес *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={warehouse.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700">
                Организация *
              </label>
              <select
                id="organization_id"
                name="organization_id"
                value={warehouse.organization_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option key={0} value={0}>Выберите организацию</option>
                {orgs.map(o=>(
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700">
                ID менеджера
              </label>
              <select
                id="manager_id"
                name="manager_id"
                value={warehouse.manager_id}
                onChange={(e) =>
                  setWarehouse((prev) => ({
                    ...prev,
                    manager_id: Number(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={0} key={0}>Выберите менеджера</option>
                {users.map(u=>(
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Назад
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}