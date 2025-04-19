"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";



export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);




  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth("http://backend:8000/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`http://backend:8000/users/${deleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      setUsers(users.filter(user => user.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>
  return (
    <div className="container mx-auto p-4">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <h1 className="text-2xl font-bold">Пользователи</h1>
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Link href="/users/create" className="w-full sm:w-auto">
        <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Добавить пользователя
        </button>
      </Link>
      <Link href="/user-logs" className="w-full sm:w-auto">
        <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
          Посмотреть логи
        </button>
      </Link>
    </div>
  </div>

  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Имя пользователя
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              ФИО
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Статус
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Роли
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                {user.username}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                {user.email}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                {[user.last_name, user.first_name, user.middle_name].filter(Boolean).join(' ')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <Link 
                  href={`/users/${user.id}/roles`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Назначить роли
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                <button
                  onClick={() => router.push(`/users/${user.id}`)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Изменить
                </button>
                <button
                  onClick={() => setDeleteId(user.id)}
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
  </div>

  <ConfirmModal
    isOpen={deleteId !== null}
    onClose={() => setDeleteId(null)}
    onConfirm={handleDelete}
    title="Удалить пользователя"
    message="Вы уверены, что хотите удалить этого пользователя? Это действие не может быть отменено."
    isLoading={isDeleting}
    danger
  />
</div>
  );
}