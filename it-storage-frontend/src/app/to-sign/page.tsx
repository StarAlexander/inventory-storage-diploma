"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function ToSignPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Получаем список документов
  useEffect(() => {
    fetchWithAuth("http://backend:8000/warehouses/documents/to-sign")
      .then((res) => res.json())
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, []);

  // Предпросмотр документа
  const previewDocument = async (docId: number) => {
    const res = await fetchWithAuth(`http://backend:8000/warehouses/documents/by-id/${docId}`);
    const data = await res.json();
    setPreviewId(docId);
    setPreviewContent(data.document);
  };

  // Подписание документа
  const signDocument = async (docId: number) => {
    const res = await fetchWithAuth(`http://backend:8000/warehouses/documents/${docId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      alert("Не удалось подписать документ");
      return;
    }

    const updated = await res.json();
    setDocuments(documents.filter(d => d.id !== docId));
    alert("Документ подписан");
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">На подпись</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Список документов */}
        <div className="space-y-2">
          {documents.length === 0 && <p>Нет документов</p>}
          {documents.map((doc) => (
            <div key={doc.id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span>Документ #{doc.id}</span>
                <div>
                  <button
                    onClick={() => previewDocument(doc.id)}
                    className="text-blue-500 hover:underline mr-3"
                  >
                    Предпросмотр
                  </button>
                  <button
                    onClick={() => signDocument(doc.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Подписать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Предпросмотр документа */}
        <div className="border rounded-lg p-4 min-h-[400px] overflow-auto">
          {previewContent ? (
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          ) : (
            <p className="text-center text-gray-500">Выберите документ для предпросмотра</p>
          )}
        </div>
      </div>
    </div>
  );
}