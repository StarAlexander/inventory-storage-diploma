"use client"

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DatePicker } from "@/components/DatePicker";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { DepartmentSchema, OrganizationSchema } from "@/lib/types";

export default function ObjectDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEditing = id !== "create";

  const [object, setObject] = useState({
    name: "",
    category_id: "",
    department_id:"",
    inventory_number: "",
    serial_number: "",
    status: "active",
    purchase_date: "",
    warranty_expiry_date: "",
    cost: "",
    description: "",
    dynamic_values: [] as {field_id: number, value: string}[]
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations,setOrganizations] = useState<OrganizationSchema[]>([])
  const [currentOrg,setCurrentOrg] = useState<OrganizationSchema | null>(null)
  //const [departments,setDepartments] = useState<DepartmentSchema[]>([])
  const [error, setError] = useState<string | null>(null);
  console.log(currentOrg)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth("http://backend:8000/object-categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);

        const orgResponse = await fetchWithAuth("http://backend:8000/organizations")
        if (!orgResponse.ok) throw new Error("Failed to fetch organizations")
        const orgData = await orgResponse.json()
        setOrganizations(orgData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    const fetchObject = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(`http://backend:8000/objects/${id}`);
        if (!response.ok) throw new Error("Failed to fetch equipment");
        const data = await response.json();
        setObject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load equipment");
      } finally {
        setIsLoading(false);
      }
    };
    fetchObject();
  }, [id, isEditing]);

  useEffect(() => {
    if (!object.category_id) return;

    const fetchFields = async () => {
      try {
        const response = await fetchWithAuth(`http://backend:8000/dynamic-fields?category_id=${object.category_id}`);
        if (!response.ok) throw new Error("Failed to fetch fields");
        const data = await response.json();
        setDynamicFields(data);
        
        // Initialize dynamic values if creating new object
        if (!isEditing && object.dynamic_values.length === 0) {
          setObject(prev => ({
            ...prev,
            dynamic_values: data.map((field: any) => ({
              field_id: field.id,
              value: ""
            }))
          }));
        }
      } catch (err) {
        console.error("Failed to load dynamic fields", err);
      }
    };
    fetchFields();
  }, [object.category_id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `http://backend:8000/objects/${id}` : "http://backend:8000/objects";
      const method = isEditing ? "PUT" : "POST";
      
      // Generate inventory number if empty
      const submitData = {...object};
      if (!submitData.inventory_number && !isEditing) {
        submitData.inventory_number = `INV-${Date.now().toString().slice(-6)}`;
      }

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save equipment");
      }

      router.push("/objects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setObject(prev => ({ ...prev, [name]: value }));
  };

  const handleDynamicValueChange = (fieldId: number, value: string) => {
    setObject(prev => ({
      ...prev,
      dynamic_values: prev.dynamic_values.map(item => 
        item.field_id === fieldId ? { ...item, value } : item
      )
    }));
  };

  if (isLoading && isEditing) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Изменить оборудование' : 'Добавить оборудование'}
      </h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Название оборудования *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={object.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Категория *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={object.category_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700">
                Организация *
              </label>
              <select
                id="organization_id"
                name="organization_id"
                value={currentOrg?.id}
                onChange={(e) => setCurrentOrg(()=>organizations.find(o=>o.id==Number(e.target.value))!!)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Выберите организацию</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                Отдел *
              </label>
              <select
                id="department_id"
                name="department_id"
                value={object.department_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Выберите отдел</option>
                {currentOrg?.departments?.map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
            </div>

                      <div>
            <label htmlFor="inventory_number" className="block text-sm font-medium text-gray-700">
              Инвентарный номер *
            </label>
            <div className="flex gap-2">
              <input
                id="inventory_number"
                name="inventory_number"
                type="text"
                value={object.inventory_number}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {!isEditing && (
                <button 
                  type="button" 
                  onClick={() => {
                    const prefix = categories.find(c => c.id === object.category_id)?.prefix || 'INV';
                    const datePart = new Date().getFullYear().toString().slice(-2) + 
                                    (new Date().getMonth() + 1).toString().padStart(2, '0');
                    const randomPart = Math.floor(1000 + Math.random() * 9000);
                    setObject(prev => ({
                      ...prev,
                      inventory_number: `${prefix}-${datePart}-${randomPart}`
                    }));
                  }}
                  className="mt-1 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Сгенерировать
                </button>
              )}
            </div>
          </div>
            <div>
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
                Серийный номер *
              </label>
              <input
                id="serial_number"
                name="serial_number"
                type="text"
                value={object.serial_number}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Статус *
              </label>
              <select
                id="status"
                name="status"
                value={object.status}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="active">Активно</option>
                <option value="in_repair">В ремонте</option>
                <option value="decommissioned">Списано</option>
              </select>
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                Стоимость в рублях (₽) *
              </label>
              <input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                value={object.cost}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
                Дата покупки
              </label>
              <DatePicker
                id="purchase_date"
                value={object.purchase_date}
                onChange={(date) => setObject(prev => ({ ...prev, purchase_date: date }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="warranty_expiry_date" className="block text-sm font-medium text-gray-700">
                Срок гарантии
              </label>
              <DatePicker
                id="warranty_expiry_date"
                value={object.warranty_expiry_date}
                onChange={(date) => setObject(prev => ({ ...prev, warranty_expiry_date: date }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={object.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Dynamic Fields Section */}
          {dynamicFields.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Дополнительные характеристики</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {dynamicFields.map(field => {
                  const value = object.dynamic_values.find(v => v.field_id === field.id)?.value || '';
                  return (
                    <div key={field.id} className="space-y-1">
                      <label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700">
                        {field.name}
                      </label>
                      {field.field_type === 'text' && (
                        <input
                          id={`field-${field.id}`}
                          type="text"
                          value={value}
                          onChange={(e) => handleDynamicValueChange(field.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      )}
                      {field.field_type === 'number' && (
                        <input
                          id={`field-${field.id}`}
                          type="number"
                          value={value}
                          onChange={(e) => handleDynamicValueChange(field.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      )}
                      {field.field_type === 'date' && (
                        <DatePicker
                          id={`field-${field.id}`}
                          value={value}
                          onChange={(date) => handleDynamicValueChange(field.id, date)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      )}

                        {field.field_type === 'select' && (
                        <select
                          id={`field-${field.id}`}
                          value={value}
                          onChange={(e) => handleDynamicValueChange(field.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          {field.select_options?.map((option: any) => (
                            <option key={option.value} value={option.value}>
                              {option.display_name || option.value}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Назад
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}