import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { CategoryCreateData, ObjectCategory } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCategories = async (): Promise<ObjectCategory[]> => {
  const response = await fetchWithAuth(`${API_URL}/object-categories/`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const getCategory = async (id: number): Promise<ObjectCategory> => {
  const response = await fetchWithAuth(`${API_URL}/object-categories/${id}`);
  if (!response.ok) throw new Error('Failed to fetch category');
  return response.json();
};

export const createCategory = async (data: CategoryCreateData): Promise<ObjectCategory> => {
  const response = await fetchWithAuth(`${API_URL}/object-categories/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create category');
  return response.json();
};

export const updateCategory = async (id: number, data: CategoryCreateData): Promise<ObjectCategory> => {
  const response = await fetchWithAuth(`${API_URL}/object-categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update category');
  return response.json();
};

export const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/object-categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete category');
};