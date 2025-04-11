"use client"

import { FieldForm } from "@/components/FieldForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createField, getField, updateField } from "@/lib/api/fields";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FieldDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const isEditing = id !== 'create';
  
    const [field, setField] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
  
          // Only fetch field data if editing
          if (isEditing) {
            const fieldData = await getField(Number(id));
            setField(fieldData);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, [id, isEditing]);
  
    const handleSubmit = async (data: { 
      category_id: number;
      name: string;
      field_type: "number" | "text" | "date" | "select";
      description?: string;
      select_options:any
    }) => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        if (isEditing) {
          await updateField(Number(id), data);
        } else {
          await createField(data);
        }
        router.push('/fields');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save field');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    if (isLoading && isEditing) return <LoadingSpinner />;
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Изменить поле' : 'Создать поле'}
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <FieldForm
            initialData={field}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }