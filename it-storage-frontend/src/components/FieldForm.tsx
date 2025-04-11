import { useForm, useFieldArray } from 'react-hook-form';
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
  const { 
    register, 
    handleSubmit, 
    control,
    watch,
    reset,
    formState: { errors} 
  } = useForm<FieldCreateData & { select_options: { value: string }[] }>({
    defaultValues: {
      ...initialData,
      category_id: initialData?.category_id,
      select_options: initialData?.select_options || [{ value: '' }]
    },
  });
  
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const fieldType = watch('field_type');
  const [currentCategory,setCurrentCategory] = useState<{id: number; name:string} | null>(null)
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'select_options'
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        select_options: initialData.select_options || [{ value: '' }]
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.map(cat => ({ id: cat.id, name: cat.name })));
        if (initialData?.category_id) {
          setCurrentCategory(data.find(el => el.id == initialData?.category_id)!!)
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    loadCategories();
  }, []);

  const handleFormSubmit = async (data: any) => {
    const selectOptions = data.select_options 
      ? data.select_options.filter((opt: { value: string }) => opt.value.trim() !== '')
      : [];
    
    await onSubmit({
      ...data,
      selectOptions: fieldType === 'select' ? selectOptions : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Категория *
        </label>
        <select
          id="category_id"
          {...register('category_id', { required: 'Category is required', valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option selected={initialData?.category_id == category.id} key={category.id} value={category.id}>
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

      {fieldType === 'select' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Варианты выбора *
          </label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`select_options.${index}.value`, { 
                    required: "Значение обязательно" 
                  })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Введите значение"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ value: '' })}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              + Добавить вариант
            </button>
          </div>
        </div>
      )}

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