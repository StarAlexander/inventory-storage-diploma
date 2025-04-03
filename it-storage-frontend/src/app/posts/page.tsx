"use client"

import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostsPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
  
    useEffect(() => {
      const fetchPosts = async () => {
        setIsLoading(true);
        try {
          const response = await fetchWithAuth("http://backend:8000/posts");
          if (!response.ok) throw new Error("Failed to fetch posts");
          const data = await response.json();
          setPosts(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch posts");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPosts();
    }, []);
  
    const handleDelete = async () => {
      if (!deleteId) return;
      setIsDeleting(true);
      try {
        const response = await fetchWithAuth(`http://backend:8000/posts/${deleteId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete post");
        setPosts(posts.filter(post => post.id !== deleteId));
        setDeleteId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete post");
      } finally {
        setIsDeleting(false);
      }
    };
  
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
  
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Должности</h1>
          <Link href="/posts/create">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Добавить должность
            </button>
          </Link>
        </div>
  
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Описание
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователи
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {post.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <Link href={`/posts/${post.id}/users`} className="mr-4">
                      <span className="text-indigo-600 hover:text-indigo-900">
                        Назначить пользователей
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/posts/${post.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => setDeleteId(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        <ConfirmModal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Удалить должность"
          message="Вы уверены, что хотите удалить эту должность? Это действие не может быть отменено."
          isLoading={isDeleting}
          danger
        />
      </div>
    );
  }