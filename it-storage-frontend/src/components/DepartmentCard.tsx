import { DepartmentSchema } from "@/lib/types";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import Link from "next/link";
import { useState } from "react";


interface DepartmentCardProps {
    department: DepartmentSchema
}

export default function DepartmentCard({department}: DepartmentCardProps) {
    const [isDeleteModalOpen,setIsDeleteModalOpen] = useState(false)

    const handleDelete = async (id: number) => {
      const response = await fetchWithAuth(`http://backend:8000/departments/${id}`,{method:"DELETE"})
      if (response.ok) {
        window.location.reload()
      }
      setIsDeleteModalOpen(false)
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold mb-2">{department.name}</h2>
      <p className="text-gray-600 mb-4">{department.description}</p>
      <div className="flex justify-between items-center">
        <Link href={`/departments/${department.id}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Редактировать
          </button>
        </Link>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Удалить
        </button>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить отдел "{department.name}"?</p>
            <div className="flex justify-end space-x-4 mt-4">
                <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    onClick={() => setIsDeleteModalOpen(false)}
                >
                    Отмена
                </button>
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(department.id)}
                >
                    Удалить
                </button>
            </div>
        </div>
    </div>
      )}
    </div>
    )
}