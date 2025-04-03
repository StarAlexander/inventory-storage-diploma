import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FieldCreateData } from '@/lib/types';
import { getCategories } from '@/lib/api/categories';

interface FieldFormProps {
  initialData?: FieldCreateData;
  onSubmit: (data: FieldCreateData) => Promise<void>;
  isSubmitting: boolean;
}

export const FieldForm = ({ initialData, onSubmit, isSubmitting }: FieldFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FieldCreateData>({
    defaultValues: initialData,
  });
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.map(cat => ({ id: cat.id, name: cat.name })));
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    loadCategories();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Категория *
        </label>
        <select
          id="category_id"
          defaultValue={initialData?.category_id ?? ""}
          {...register('category_id', { required: 'Category is required', valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Название поля *
        </label>
        <input
          id="name"
          type="text"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="field_type" className="block text-sm font-medium text-gray-700">
          Тип поля *
        </label>
        <select
          id="field_type"
          {...register('field_type', { required: 'Field type is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Выберите тип</option>
          <option value="text">Текстовый</option>
          <option value="number">Числовой</option>
          <option value="date">Дата</option>
          <option value="select">Выпадающий список</option>
        </select>
        {errors.field_type && <p className="mt-1 text-sm text-red-600">{errors.field_type.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

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
          {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
};