"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth("http://backend:8000/warehouses")
      .then((res) => res.json())
      .then(setWarehouses);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Склады</h1>
        {/* Только суперпользователь или у кого есть право warehouse:create */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          <Link href={"/warehouses/edit/create"}>+ Новый склад</Link>
        </button>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Название</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Адрес</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Менеджер</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Действия</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((w:any) => (
            <tr key={w.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{w.id}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{w.name}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{w.address}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate"><Link className="text-indigo-400 underline" href={`/users/${w.id}`}>{w.manager?.username || "-"}</Link></td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate items-center flex justify-around">
                <Link href={`/warehouses/${w.id}`} className="text-blue-500 hover:underline">
                  Детали
                </Link>
                <Link href={`/warehouses/edit/${w.id}`} className="text-indigo-500 hover:underline">
                  Изменить склад
                </Link>
                <Link href={"#"} className="text-red-600 hover:text-red-900 hover:underline">
                  Удалить склад
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    </div>
  );
}