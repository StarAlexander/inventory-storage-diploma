"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";

export default function DocumentDetailPage() {
  const [document, setDocument] = useState<any | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const [error,setError] = useState<string | null>(null)

  // Загрузка документа
  useEffect(() => {
    fetchWithAuth(`http://backend:8000/warehouses/documents/by-id/${params.doc}`)
      .then((res) => {
        if (res.status === 403) throw new Error("Нет доступа к документам")
          return res.json()
      })
      .then((data) => {
        setDocument(data);
        setHtmlContent(data.document || "<p>Начните редактировать</p>");
        setLoading(false);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Не удалось загрузить документ"));
  }, []);

  

  // Сохранение изменений
  const handleSave = async () => {
    if (!document) return;
    try {
      const response = await fetchWithAuth(`http://backend:8000/warehouses/documents/${document.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document: htmlContent,
      }),
    });

    if (response.status === 403) throw new Error("Нет доступа к документам")

    if (!response.ok) {
      alert("Не удалось сохранить");
      return;
    }

    alert("Документ сохранён");
    }
    catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить документ")
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (!document) return <p>Документ не найден</p>;
  if (error) return <p className="text-red-500">Ошибка: {error}</p>;
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Редактирование документа #{document.id}</h1>

      

      {/* Режим редактирования */}
      <div className="mb-4">
        <div
          contentEditable="true"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            minHeight: "400px",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
          onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Сохранить изменения
      </button>
    </div>
  );
}