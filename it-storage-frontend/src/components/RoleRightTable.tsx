"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface RoleRightTableProps {
  url: string;
  entityName: string;
}

export function RoleRightTable({ url, entityName }: RoleRightTableProps) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(url);
        if (!response.ok) throw new Error(`Failed to fetch ${entityName}s`);
        const data = await response.json();
        
        // Create a deep copy of the data to avoid modifying the original array
        const itemsCopy = JSON.parse(JSON.stringify(data));
        
        // Build hierarchy
        const itemMap = new Map(itemsCopy.map((item: any) => [item.id, item]));
        const rootItems: any[] = [];
        
        itemsCopy.forEach((item: any) => {
          if (item.parent_id) {
            const parent = itemMap.get(item.parent_id) as any;
            if (parent) {
              parent.children = parent.children || [];
              // Only add if not already present
              if (!parent.children.some((child: any) => child.id === item.id)) {
                parent.children.push(item);
              }
            }
          } else {
            // Only add root items that haven't been added yet
            if (!rootItems.some(rootItem => rootItem.id === item.id)) {
              rootItems.push(item);
            }
          }
        });
        
        setItems(rootItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to load ${entityName}s`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [url, entityName]);
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`${url}/${deleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to delete ${entityName}`);
      setDeleteId(null);
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = (item: any, depth = 0) => {
    return (
      <>
        <tr key={item.id} className="border-t border-gray-200">
          <td className={`px-6 py-4 truncate max-w-xs text-sm font-medium text-gray-900 ${depth > 0 ? `pl-${depth * 4}` : ''}`}>
            <div style={{ paddingLeft: `${depth * 20}px` }}>
              {depth > 0 && (
                <span className="text-gray-400 mr-2">↳</span>
              )}
              <Link href={`${url}/${item.id}`} className="text-indigo-600 hover:text-indigo-900">
                {item.name}
              </Link>
            </div>
          </td>
          <td className="px-6 py-4 truncate max-w-xs text-sm text-gray-500">
            {item.description || '-'}
          </td>
          <td className="px-6 py-4 truncate max-w-xs text-sm text-gray-500">
            {item.parent_id ? 'Потомок' : 'Корневой'}
          </td>
          <td className="px-6 py-4 truncate max-w-xs text-sm font-medium">
            <button
              onClick={() => router.push(`/roles/${item.id}`)}
              className="text-indigo-600 hover:text-indigo-900 mr-4"
            >
              Изменить
            </button>
            <button
              onClick={() => setDeleteId(item.id)}
              className="text-red-600 hover:text-red-900"
            >
              Удалить
            </button>
          </td>
        </tr>
        {item.children?.map((child: any) => renderItem(child, depth + 1))}
      </>
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{entityName == "Роль" ? "Роли" : "Права"}</h1>
        <Link href={`${entityName == "Роль" ? "/roles" : "/rights"}/create`}>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Создать {entityName}
          </button>
        </Link>
      </div>
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Вид
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => renderItem(item))}
          </tbody>
        </table>
      </div>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={`Удалить ${entityName}`}
        message={`Вы уверены, что хотите удалить ${entityName}? Это действие невозвратно.`}
        isLoading={isDeleting}
        danger
      />
    </div>
  );
}