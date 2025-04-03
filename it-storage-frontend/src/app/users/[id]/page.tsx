"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const isEditing = id !== "create";
  
    const [user, setUser] = useState({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      middle_name: "",
      phone: "",
      password: "",
      is_active: true,
      is_system: false,  // Added missing field
      department_id: null  // Added missing field
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordHint,setShowPasswordHint] = useState(false)
  
    useEffect(() => {
      if (!isEditing) return;
  
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const response = await fetchWithAuth(`http://backend:8000/users/${id}`);
          if (!response.ok) throw new Error("Failed to fetch user");
          const data = await response.json();
          setUser(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch user");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchUser();
    }, [id, isEditing]);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
  
      try {

        const payload = {
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name,
          phone: user.phone,
          is_active: user.is_active,
          is_system: user.is_system,
          department_id: user.department_id,
          // Only include password if it's not empty (for creates)
          ...(!isEditing && { password: user.password })
        };
        const url = isEditing ? `http://backend:8000/users/${id}` : "http://backend:8000/users/register";
        const method = isEditing ? "PUT" : "POST";
        console.log(method)
        const response = await fetchWithAuth(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to save user");
        }
  
        router.push("/users");
      } catch (err) {
        console.dir(err)
        setError(String(err));
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setUser(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    };
  
    if (isLoading && isEditing) return <LoadingSpinner />;
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Изменить пользователя' : 'Создать пользователя'}
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow sm:rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Имя пользователя *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={user.username}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
  
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
  
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Фамилия
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={user.last_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
  
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Имя
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={user.first_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
  
              <div>
                <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">
                  Отчество
                </label>
                <input
                  id="middle_name"
                  name="middle_name"
                  type="text"
                  value={user.middle_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
  
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Телефон
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={user.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
  
              {!isEditing && (
                <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Пароль</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={user.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  onFocus={() => setShowPasswordHint(true)}
                  onBlur={() => setShowPasswordHint(false)}
                />
                {showPasswordHint && (
                  <div className="absolute z-50 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg overflow-visible">
                    <p className="text-sm font-medium text-gray-800">Требования к паролю:</p>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Минимум 8 символов</li>
                      <li>Хотя бы одна буква</li>
                      <li>Хотя бы одна цифра</li>
                      <li>Хотя бы один специальный символ (@$!%*?&)</li>
                    </ul>
                  </div>
                )}
                  </div>
              )}
  
              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={user.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Активен
                </label>
              </div>
            </div>
  
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }