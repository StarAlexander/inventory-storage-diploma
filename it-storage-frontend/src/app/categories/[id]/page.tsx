"use client"

import { CategoryForm } from "@/components/CategoryForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createCategory, getCategory, updateCategory } from "@/lib/api/categories";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CategoryDetailPage(){
  const router = useRouter();
  const { id } = useParams();
  const isEditing = id !== 'create';

  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        const data = await getCategory(Number(id));
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch category');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id, isEditing]);

  const handleSubmit = async (data: { name: string; description?: string }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isEditing) {
        await updateCategory(Number(id), data);
      } else {
        await createCategory(data);
      }
      router.push('/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isEditing) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Редактировать категорию' : 'Создать новую категорию'}
      </h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <CategoryForm
          initialData={category}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};
