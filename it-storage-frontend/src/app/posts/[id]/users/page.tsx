"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostUsersPage() {
    const router = useRouter();
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [postRes, usersRes] = await Promise.all([
            fetchWithAuth(`http://backend:8000/posts/${id}`),
            fetchWithAuth("http://backend:8000/users"),
          ]);
  
          if (!postRes.ok) throw new Error("Failed to fetch post");
          if (!usersRes.ok) throw new Error("Failed to fetch users");
  
          const [postData, usersData] = await Promise.all([
            postRes.json(),
            usersRes.json(),
          ]);
  
          setPost(postData);
          setAllUsers(usersData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, [id]);
  
    const handleUserToggle = async (userId: number, isAssigned: boolean) => {
      setIsUpdating(true);
      try {
        const response = await fetchWithAuth(`http://backend:8000/posts/${id}/users/${userId}`, {
          method: isAssigned ? "DELETE" : "POST",
        });
  
        if (!response.ok) throw new Error("Failed to update user assignment");
  
        setPost((prev: any) => ({
          ...prev,
          users: isAssigned
            ? prev.users.filter((u: any) => u.id !== userId)
            : [...prev.users, allUsers.find(u => u.id === userId)],
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update assignment");
      } finally {
        setIsUpdating(false);
      }
    };
  
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!post) return <div>Должность не найдена</div>;
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          Назначение пользователей на должность: {post.name}
        </h1>
  
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Текущие пользователи</h2>
            {post.users.length === 0 ? (
              <p className="text-gray-500">Нет назначенных пользователей</p>
            ) : (
              <div className="space-y-2">
                {post.users.map((user: any) => (
                  <div key={user.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleUserToggle(user.id, true)}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
  
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Доступные пользователи</h2>
            {allUsers.filter(user => !post.users.some((u: any) => u.id === user.id)).length === 0 ? (
              <p className="text-gray-500">Нет доступных пользователей для назначения</p>
            ) : (
              <div className="space-y-2">
                {allUsers
                  .filter(user => !post.users.some((u: any) => u.id === user.id))
                  .map(user => (
                    <div key={user.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleUserToggle(user.id, false)}
                        disabled={isUpdating}
                        className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                      >
                        Назначить
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
  
          <div className="mt-6">
            <button
              onClick={() => router.replace(`/posts`)}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }