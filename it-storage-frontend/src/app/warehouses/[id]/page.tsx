"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";

const operationOptions = {
  "RECEIPT":"Прием оборудования",
  "STORAGE": "Хранилище",
  "SHIPPING": "Отгрузка",
  "REPAIR": "Ремонт"
}


export default function WarehouseDetail() {
  const [warehouse, setWarehouse] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("zones");
  const params = useParams()
  useEffect(() => {
    fetchWithAuth(`http://backend:8000/warehouses/${params.id}`)
      .then((res) => res.json())
      .then(setWarehouse);
  }, [params.id]);

  if (!warehouse) return <p>Загрузка...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{warehouse.name}</h1>
      <p className="mb-6">{warehouse.address}</p>

      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("zones")}
          className={`px-4 py-2 ${activeTab === "zones" ? "border-b-2 border-blue-500" : ""}`}
        >
          Зоны
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 ${activeTab === "transactions" ? "border-b-2 border-blue-500" : ""}`}
        >
          Операции
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 ${activeTab === "documents" ? "border-b-2 border-blue-500" : ""}`}
        >
          Документы
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 ${activeTab === "reports" ? "border-b-2 border-blue-500" : ""}`}
        >
          Отчёты
        </button>
      </div>

      {activeTab === "zones" && <ZonesTab warehouseId={params.id as unknown as number} />}
      {activeTab === "transactions" && <TransactionsTab warehouseId={params.id as unknown as number} />}
      {activeTab === "documents" && <DocumentsTab warehouseId={params.id as unknown as number} />}
    </div>
  );
}

function ZonesTab({ warehouseId } : {warehouseId: number}) {
  const [zones, setZones] = useState<any[]>([]);
  useEffect(() => {
    fetchWithAuth(`http://backend:8000/warehouses/${warehouseId}/zones`)
      .then((res) => res.json())
      .then(setZones);
  }, [warehouseId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Зоны</h2>
      <Link
        href={`/warehouses/${warehouseId}/tabs/zones`}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block"
      >
        + Новая зона
      </Link>
      <table className="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Название</th>
            <th className="py-3 px-4 text-left">Подразделение</th>
            <th className="py-3 px-4 text-left">Тип</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4">{z.id}</td>
              <td className="py-3 px-4">{z.name}</td>
              <td className="py-3 px-4">{z.department.name}</td>
              <td className="py-3 px-4">{operationOptions[z.type as "RECEIPT" | "STORAGE" | "SHIPPING" | "REPAIR"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionsTab({ warehouseId }: {warehouseId: number}) {
  const [transactions, setTransactions] = useState<any[]>([]);
  useEffect(() => {
    fetchWithAuth(`http://backend:8000/warehouses/transactions?warehouse_id=${warehouseId}`)
      .then((res) => res.json())
      .then(setTransactions);
  }, [warehouseId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Операции</h2>
      <Link href={`/warehouses/${warehouseId}/tabs/transactions`} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 inline-block">
        + Новая операция
      </Link>
      <table className="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Оборудование</th>
            <th className="py-3 px-4 text-left">Из → Куда</th>
            <th className="py-3 px-4 text-left">Операция</th>
            <th className="py-3 px-4 text-left">Дата</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4">{t.equipment?.name}</td>
              <td className="py-3 px-4">{`${t.from_zone?.name || "-"} → ${t.to_zone?.name || "-"}`}</td>
              <td className="py-3 px-4">{t.operation}</td>
              <td className="py-3 px-4">{new Date(t.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function DocumentsTab({ warehouseId }: { warehouseId: number }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth(`http://backend:8000/warehouses/documents?warehouse_id=${warehouseId}`)
      .then((res) => res.json())
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (documentId: number) => {
    const response = await fetchWithAuth(`http://backend:8000/documents/${documentId}/generate`,{
      method:"POST"
    })
    if (!response.ok) {
      alert("Не удалось сгенерировать PDF")
      return
    }

        // Показываем сообщение о том, что PDF создаётся
      alert("PDF начата генерация. Скачайте через несколько секунд.");

      // Перекидываем пользователя на страницу загрузки
      window.open(`http://localhost:8000/documents/pdf/${documentId}`);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="text-red-500">Ошибка: {error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Документы</h2>
      <table className="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Шаблон</th>
            <th className="py-3 px-4 text-left">Дата генерации</th>
            <th className="py-3 px-4 text-left">Подписан</th>
            <th className="py-3 px-4 text-left">Просмотр</th>
            <th className="py-3 px-4 text-left">PDF</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4">{d.id}</td>
              <td className="py-3 px-4">{d.template?.name || "-"}</td>
              <td className="py-3 px-4">{new Date(d.generated_at).toLocaleString()}</td>
              <td className="py-3 px-4">{d.signed ? "Да" : "Нет"}</td>
              <td className="py-3 px-4">
                <Link href={`/warehouses/${warehouseId}/tabs/documents/${d.id}`} legacyBehavior>
                  <a className="text-blue-500 hover:underline">Просмотреть</a>
                </Link>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleExport(d.id)}
                  className="text-indigo-500 hover:underline"
                >
                  Экспорт в PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


