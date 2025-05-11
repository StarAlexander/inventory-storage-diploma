"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";

export default function DocumentDetailPage() {
  const [document, setDocument] = useState<any | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);
  const params = useParams();

  // Загрузка документа
  useEffect(() => {
    fetchWithAuth(`http://backend:8000/warehouses/documents/by-id/${params.doc}`)
      .then((res) => res.json())
      .then((data) => {
        setDocument(data);
        setHtmlContent(data.document || "<p>Начните редактировать</p>");
        setLoading(false);
      });
  }, []);

  const verifySignature = async () => {
    if (!document?.signed_by || !document?.signature || !document?.signer_public_key) {
      alert("Документ не подписан");
      return;
    }

    try {
      const response = await fetchWithAuth("http://backend:8000/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_id: document.id,
          public_key: document.signer_public_key,
          signature: document.signature,
        }),
      });

      const result = await response.json();
      setSignatureValid(result.valid);
    } catch (err) {
      console.error(err);
      alert("Ошибка при проверке подписи");
    }
  };

  // Сохранение изменений
  const handleSave = async () => {
    if (!document) return;

    const response = await fetchWithAuth(`http://backend:8000/warehouses/documents/${document.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document: htmlContent,
      }),
    });

    if (!response.ok) {
      alert("Не удалось сохранить");
      return;
    }

    alert("Документ сохранён");
  };

  if (loading) return <p>Загрузка...</p>;
  if (!document) return <p>Документ не найден</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Редактирование документа #{document.id}</h1>

      <div className="mb-4 flex gap-2">
        <button onClick={verifySignature} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Проверить ЭЦП
        </button>
      </div>

      {signatureValid === true && (
        <p className="mt-2 text-green-600">✅ Подпись верна</p>
      )}
      {signatureValid === false && (
        <p className="mt-2 text-red-600">❌ Подпись недействительна</p>
      )}

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