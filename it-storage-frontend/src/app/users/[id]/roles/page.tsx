"use client"


import { LoadingSpinner } from "@/components/LoadingSpinner";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserRolesPage() {
    const router = useRouter();
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);
    const [allRoles, setAllRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [userRes, rolesRes] = await Promise.all([
            fetchWithAuth(`http://backend:8000/users/${id}`),
            fetchWithAuth("http://backend:8000/roles"),
          ]);
  
          if (!userRes.ok) throw new Error("Failed to fetch user");
          if (!rolesRes.ok) throw new Error("Failed to fetch roles");
  
          const [userData, rolesData] = await Promise.all([
            userRes.json(),
            rolesRes.json(),
          ]);
  
          setUser(userData);
          setAllRoles(rolesData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, [id]);
  
    const handleRoleToggle = async (roleId: number, isAssigned: boolean) => {
      setIsUpdating(true);
      try {
        const headers = isAssigned ? undefined : {
          "Content-Length":"0"
        }
        const response = await fetchWithAuth(`http://backend:8000/users/${id}/roles/${roleId}`, {
          method: isAssigned ? "DELETE" : "POST",
          headers
        });
  
        if (!response.ok) throw new Error("Failed to update role assignment");
  
        setUser((prev: any) => ({
          ...prev,
          roles: isAssigned
            ? prev.roles.filter((r: any) => r.id !== roleId)
            : [...prev.roles, allRoles.find(r => r.id === roleId)],
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update role");
      } finally {
        setIsUpdating(false);
      }
    };
  
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!user) return <div>Пользователь не найден</div>;
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          Назначение ролей пользователю: {user.username}
        </h1>
  
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Текущие роли</h2>
            {user.roles.length === 0 ? (
              <p className="text-gray-500">Нет назначенных ролей</p>
            ) : (
              <div className="space-y-2">
                {user.roles.map((role: any) => (
                  <div key={role.id} className="flex justify-between items-center p-3 border rounded-md">
                    <span>{role.name}</span>
                    <button
                      onClick={() => handleRoleToggle(role.id, true)}
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Доступные роли</h2>
            {allRoles.filter(role => !user.roles.some((r: any) => r.id === role.id)).length === 0 ? (
              <p className="text-gray-500">Нет доступных ролей для назначения</p>
            ) : (
              <div className="space-y-2">
                {allRoles
                  .filter(role => !user.roles.some((r: any) => r.id === role.id))
                  .map(role => (
                    <div key={role.id} className="flex justify-between items-center p-3 border rounded-md">
                      <span>{role.name}</span>
                      <button
                        onClick={() => handleRoleToggle(role.id, false)}
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
              onClick={() => router.push(`/users/${id}`)}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Назад к пользователю
            </button>
          </div>
        </div>
      </div>
    );
  }