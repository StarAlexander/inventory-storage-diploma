import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { InventoryObject, ObjectCreateData } from "../types";



const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getObjects = async (): Promise<InventoryObject[]> => {
  const response = await fetchWithAuth(`${API_URL}/objects/`);
  if (!response.ok) throw new Error('Failed to fetch objects');
  return response.json();
};

export const getObject = async (id: number): Promise<InventoryObject> => {
  const response = await fetchWithAuth(`${API_URL}/objects/${id}`);
  if (!response.ok) throw new Error('Failed to fetch object');
  return response.json();
};

export const createObject = async (data: ObjectCreateData): Promise<InventoryObject> => {
  const response = await fetchWithAuth(`${API_URL}/objects/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
  if (!response.ok) throw new Error('Failed to create object');
  return response.json();
};

export const updateObject = async (id: number, data: Partial<ObjectCreateData>): Promise<InventoryObject> => {
  const response = await fetchWithAuth(`${API_URL}/objects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update object');
  return response.json();
};

export const deleteObject = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/objects/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete object');
};