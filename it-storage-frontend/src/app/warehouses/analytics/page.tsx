"use client";
import { useEffect, useState } from "react";
import "chart.js/auto"
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import styles from "./analytics.module.css";


import { fetchWithAuth } from "@/app/utils/fetchWithAuth";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [inventoryLevels, setInventoryLevels] = useState<any[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<any[]>([]);
  const [transactionByDay, setTransactionByDay] = useState<any[]>([]);
  const [lowStockZones, setLowStockZones] = useState<any[]>([]);
  const [threshold, setThreshold] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, transRes, lowRes,dayRes] = await Promise.all([
          fetchWithAuth("http://backend:8000/warehouses/analytics/inventory-levels").then((r) => r.json()),
          fetchWithAuth("http://backend:8000/warehouses/analytics/transactions-summary?days=7").then((r) => r.json()),
          fetchWithAuth(`http://backend:8000/warehouses/analytics/low-stock?threshold=${threshold}`).then((r) => r.json()),
          fetchWithAuth("http://backend:8000/warehouses/analytics/transactions-by-day?days=7").then((r) => r.json())
        ]);

        setInventoryLevels(invRes);
        setTransactionSummary(transRes);
        setLowStockZones(lowRes);
        setTransactionByDay(dayRes)
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [threshold]);

  // График: операции по типу
  const pieData = {
    labels: transactionSummary.map((t) => t.operation),
    datasets: [
      {
        label: "Типы операций",
        data: transactionSummary.map((t) => t.count),
        backgroundColor: ["#4f46e5", "#1d4ed8", "#0f172a", "#059669", "#ea580c"],
      },
    ],
  };

  // График: остатки по зонам
  const barLabels = inventoryLevels.map((z) => `Склад ${z.warehouseId}, Зона ${z.zoneId}`);
  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Оборудование",
        data: inventoryLevels.map((z) => z.totalCount),
        backgroundColor: "#3b82f6"
      }
    ]
  };

  // транзакции по дням
      const barDataByDay = {
      labels: transactionByDay.map(item => {
        const date = new Date(item.date);
        return ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][date.getDay()];
      }),
      datasets: [
        {
          label: "Операции за неделю",
          data: transactionByDay.map(item => item.count),
          backgroundColor: "#10b981"
        }
      ]
    };

    const optionsByDay = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Количество операций по дням" }
      },
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { autoSkip: false } }
      }
    };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Остатки по складам и зонам" }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "Распределение операций" }
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Аналитика</h1>

      {/* Круговая диаграмма */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-700 mb-2">Доли операций</h2>
          <Pie data={pieData} options={pieOptions as unknown as any} />
        </div>

        {/* Гистограмма */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-700 mb-2">Количество операций за неделю</h2>
          {transactionByDay.length === 0 ? (
          <p className="text-center text-gray-500">Нет данных за последние 7 дней</p>
            ) : (
            <Bar data={barDataByDay} options={optionsByDay} />
              )}
        </div>
      </div>

      {/* Таблица остатков */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold text-gray-700 mb-2">Остатки по складам и зонам</h2>
        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4">Склад ID</th>
              <th className="py-2 px-4">Зона ID</th>
              <th className="py-2 px-4">Количество</th>
            </tr>
          </thead>
          <tbody>
            {inventoryLevels.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                  Нет данных
                </td>
              </tr>
            )}
            {inventoryLevels.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{item.warehouseId}</td>
                <td className="py-2 px-4">{item.zoneId}</td>
                <td className="py-2 px-4">{item.totalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Предупреждения по низкому остатку */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold text-gray-700 mb-2">Низкий остаток</h2>
        <div className="flex items-center gap-2 mb-2">
          <span>Порог:</span>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-20 border rounded px-2 py-1"
          />
        </div>
        <table className="min-w-full border rounded overflow-hidden">
          <thead className="bg-red-100">
            <tr>
              <th className="py-2 px-4">Склад ID</th>
              <th className="py-2 px-4">Зона ID</th>
              <th className="py-2 px-4">Количество</th>
            </tr>
          </thead>
          <tbody>
            {lowStockZones.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-green-500">
                  Все зоны выше порога
                </td>
              </tr>
            )}
            {lowStockZones.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-red-50">
                <td className="py-2 px-4">{item.warehouseId}</td>
                <td className="py-2 px-4">{item.zoneId}</td>
                <td className="py-2 px-4 text-red-600">{item.totalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}