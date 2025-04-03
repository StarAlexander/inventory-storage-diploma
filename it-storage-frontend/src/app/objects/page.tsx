"use client"

import { useState, useEffect, useCallback } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import * as XLSX from "xlsx";
import { BarcodeGenerator } from "@/components/BarcodeGenerator";


export default function ObjectsPage() {
  const router = useRouter();
  const [objects, setObjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [barcodeSettings, setBarcodeSettings] = useState({
    format: "CODE128" as "CODE128" | "EAN13" | "QR",
    showBarcodes: false,
  });

  


  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [objectsRes, categoriesRes] = await Promise.all([
          fetchWithAuth("http://backend:8000/objects"),
          fetchWithAuth("http://backend:8000/object-categories")
        ]);
        
        if (!objectsRes.ok) throw new Error("Failed to fetch equipment");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        
        const [objectsData, categoriesData] = await Promise.all([
          objectsRes.json(),
          categoriesRes.json()
        ]);
        
        setObjects(objectsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`http://backend:8000/objects/${deleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete equipment");
      setObjects(objects.filter(obj => obj.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Apply filters
  const filteredObjects = objects.filter(obj => {
    const matchesSearch = 
      obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.inventory_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      !categoryFilter || obj.category_id === Number(categoryFilter);
    
    const matchesStatus = 
      !statusFilter || obj.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });


  const exportToXLSX = useCallback(() => {
    const data = filteredObjects.map(obj => ({
      "Название": obj.name,
      "Категория": categories.find(c => c.id === obj.category_id)?.name || '-',
      "Инв. номер": obj.inventory_number,
      "Серийный номер": obj.serial_number,
      "Статус": obj.status === 'active' ? 'Активно' : 
               obj.status === 'in_repair' ? 'В ремонте' : 'Списано',
      "Штрих-код": obj.inventory_number, // For barcode scanning
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Инвентаризация");
    
    // Generate Excel file with current date
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Инвентаризация_${date}.xlsx`);
  }, [filteredObjects, categories]);


  const generateBarcodes = useCallback(() => {
    setBarcodeSettings(prev => ({
      ...prev,
      showBarcodes: !prev.showBarcodes
    }));
  }, []);
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Инвентарный учет</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportToXLSX}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Экспорт в XLSX
          </button>
          <button 
            onClick={generateBarcodes}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {barcodeSettings.showBarcodes ? 'Скрыть штрих-коды' : 'Показать штрих-коды'}
          </button>
          <Link href="/objects/create">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Добавить оборудование
            </button>
          </Link>
        </div>
      </div>

      {/* Add barcode format selector */}
      {barcodeSettings.showBarcodes && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Формат штрих-кода</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={barcodeSettings.format === "CODE128"}
                onChange={() => setBarcodeSettings(prev => ({...prev, format: "CODE128"}))}
                className="form-radio"
              />
              <span className="ml-2">CODE128 (1D)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={barcodeSettings.format === "QR"}
                onChange={() => setBarcodeSettings(prev => ({...prev, format: "QR"}))}
                className="form-radio"
              />
              <span className="ml-2">QR-код (2D)</span>
            </label>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium mb-4">Фильтры и поиск</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              type="text"
              placeholder="По названию, инв. №, серийному №"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Все статусы</option>
              <option value="active">Активно</option>
              <option value="in_repair">В ремонте</option>
              <option value="decommissioned">Списано</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Инв. номер
              </th>
              {barcodeSettings.showBarcodes && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Штрих-код
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Серийный номер
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredObjects.map((obj) => (
              <tr key={obj.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {obj.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {categories.find(c => c.id === obj.category_id)?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {obj.inventory_number}
                </td>
                {barcodeSettings.showBarcodes && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BarcodeGenerator 
                      value={obj.inventory_number} 
                      format={barcodeSettings.format}
                      width={1.5}
                      height={50}
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {obj.serial_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    obj.status === 'active' ? 'bg-green-100 text-green-800' :
                    obj.status === 'in_repair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {obj.status === 'active' ? 'Активно' :
                     obj.status === 'in_repair' ? 'В ремонте' : 'Списано'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => router.push(`/objects/${obj.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => setDeleteId(obj.id)}
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
        title="Удалить оборудование"
        message="Вы уверены, что хотите удалить это оборудование? Это действие не может быть отменено."
        isLoading={isDeleting}
        danger
      />
    </div>
  );
}