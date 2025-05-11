"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const isEditing = id !== "create";
  
    const [post, setPost] = useState({
      name: "",
      description: "",
      organization_id: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orgs,setOrgs] = useState<any[]>([])
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
  
      const fetchPost = async () => {
        setIsLoading(true);
        try {
          const response = await fetchWithAuth(`http://backend:8000/posts/${id}`);
          if (!response.ok) throw new Error("Failed to fetch post");
          const data = await response.json();
          setPost(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch post");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchPost();
    }, [id, isEditing]);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
  
      try {
        const url = isEditing ? `http://backend:8000/posts/${id}` : "http://backend:8000/posts";
        const method = isEditing ? "PUT" : "POST";
        
        const response = await fetchWithAuth(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(post),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to save post");
        }
  
        router.push("/posts");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save post");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleChange = (e: any) => {
      const { name, value } = e.target;
      setPost(prev => ({
        ...prev,
        [name]: value,
      }));
    };
  
    if (isLoading && isEditing) return <LoadingSpinner />;
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Изменить должность' : 'Создать должность'}
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Название *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={post.name}
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
                value={post.organization_id}
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={post.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
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