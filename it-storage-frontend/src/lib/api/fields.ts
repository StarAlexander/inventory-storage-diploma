import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { DynamicField, FieldCreateData } from "../types";
import { getCategory } from "./categories";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getFields = async (): Promise<DynamicField[]> => {
  const response = await fetchWithAuth(`${API_URL}/dynamic-fields/`);
  if (!response.ok) throw new Error('Failed to fetch fields');
  const fields = await response.json()
  return await Promise.all(fields.map(async (f:any)=> {
    f["category"] = await getCategory(f.category_id)
    return f
  }))
};

export const getField = async (id: number): Promise<DynamicField> => {
  const response = await fetchWithAuth(`${API_URL}/dynamic-fields/${id}`);
  if (!response.ok) throw new Error('Failed to fetch field');
  const data = await response.json()
  data["category"] = await getCategory(data.category_id)
  return data
};

export const getFieldsByCategory = async (categoryId: number): Promise<DynamicField[]> => {
  const response = await fetchWithAuth(`${API_URL}/dynamic-fields/?category_id=${categoryId}`);
  if (!response.ok) throw new Error('Failed to fetch fields by category');
  return response.json();
};

export const createField = async (data: FieldCreateData): Promise<DynamicField> => {
  const response = await fetchWithAuth(`${API_URL}/dynamic-fields/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create field');
  return response.json();
};

export const updateField = async (id: number, data: FieldCreateData): Promise<DynamicField> => {
  const response = await fetchWithAuth(`${API_URL}/dynamic-fields/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update field');
  return response.json();
};

export const deleteField = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/dynamic-fields/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete field');
};