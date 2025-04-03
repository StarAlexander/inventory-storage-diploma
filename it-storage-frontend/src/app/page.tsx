"use client"

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Добро пожаловать</h1>
        <p className="text-gray-600">
          Вы успешно авторизованы в системе управления оборудованием
        </p>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Быстрый старт</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/objects"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-800 mb-1">Управление объектами</h3>
            <p className="text-sm text-gray-500">Добавление и редактирование оборудования</p>
          </Link>
          <Link
            href="/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-800 mb-1">Управление пользователями</h3>
            <p className="text-sm text-gray-500">Настройка доступа и ролей</p>
          </Link>
        </div>
      </div>
    </div>
  );
}