"use client";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import SearchableObjectInput from "@/components/SearchableObjectInput";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const operationOptions = {
  "RECEIPT":"Прием оборудования",
  "ISSUE": "Обнаружение дефекта",
  "MOVE": "Перемещение внутри организации",
  "WRITE_OFF": "Списание оборудования"
}

export default function NewTransactionPage() {
  const [operation, setOperation] = useState("");
  const {id} = useParams()
  const router = useRouter()
  const [equipment, setEquipment] = useState("");
  const [fromZone, setFromZone] = useState("");
  const [toZone, setToZone] = useState("");
  const [comment, setComment] = useState("");
  const [zoneOptions,setZoneOptions] = useState<any[]>([])


  useEffect(()=> {
    fetchWithAuth(`http://backend:8000/warehouses/${id}/zones`)
    .then(res=>res.json())
    .then(setZoneOptions)
    .catch(err=>console.log(err))
  },[])
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    await fetchWithAuth("http://backend:8000/warehouses/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipment_id: parseInt(equipment),
        from_zone_id: fromZone ? parseInt(fromZone) : null,
        to_zone_id: toZone ? parseInt(toZone) : null,
        operation,
        note: comment,
      }),
    });
    router.push(`/warehouses/${id}`)
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Новая операция</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Тип операции</label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            required
            className="w-full mt-1 border rounded px-3 py-2"
          >
            <option value="">Выберите тип</option>
            {Object.entries(operationOptions).map((op) => (
              <option key={op[0]} value={op[0]}>
                {op[1]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Оборудование</label>
          <SearchableObjectInput
            onSelect={(obj) => setEquipment(String(obj?.id || null))}
            selectedId={null}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Из зоны</label>
            <select
              value={fromZone}
              onChange={(e) => setFromZone(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2"
            >
              <option value="">—</option>
              {zoneOptions.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">В зону</label>
            <select
              value={toZone}
              onChange={(e) => setToZone(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2"
            >
              <option value="">—</option>
              {zoneOptions.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Комментарий</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Сохранить
        </button>
      </form>
    </div>
  );
}