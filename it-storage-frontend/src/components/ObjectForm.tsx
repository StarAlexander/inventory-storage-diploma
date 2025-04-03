import { getCategories } from "@/lib/api/categories";
import { getFieldsByCategory } from "@/lib/api/fields";
import { InventoryObject, ObjectCreateData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DatePicker } from "./DatePicker";




interface ObjectFormProps {
    initialData?: ObjectCreateData | InventoryObject;
    onSubmit: (data: ObjectCreateData) => Promise<void>;
    isSubmitting: boolean;
  }
  
  export const ObjectForm = ({ initialData, onSubmit, isSubmitting }: ObjectFormProps) => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ObjectCreateData>({
      defaultValues: initialData,
    });
    const router = useRouter();
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [dynamicFields, setDynamicFields] = useState<{ id: number; name: string; field_type: string }[]>([]);
    const selectedCategoryId = watch('category_id');
  
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
  
    useEffect(() => {
      const loadFields = async () => {
        if (selectedCategoryId) {
          try {
            const fields = await getFieldsByCategory(selectedCategoryId);
            setDynamicFields(fields);
            
            // Initialize dynamic values if they don't exist
            if (initialData?.dynamic_values) return;
            
            const defaultValues = fields.map(field => ({
              field_id: field.id,
              value: '',
            }));
            setValue('dynamic_values', defaultValues);
          } catch (error) {
            console.error('Failed to load fields', error);
          }
        }
      };
      loadFields();
    }, [selectedCategoryId, setValue, initialData?.dynamic_values]);
  
    const handleDynamicValueChange = (fieldId: number, value: string) => {
      const currentValues = watch('dynamic_values') || [];
      const updatedValues = currentValues.map(item => 
        item.field_id === fieldId ? { ...item, value } : item
      );
      setValue('dynamic_values', updatedValues);
    };
  
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              Название оборудования *
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
            <label htmlFor="inventory_number" className="block text-sm font-medium text-gray-700">
              Инвентарный номер *
            </label>
            <input
              id="inventory_number"
              type="text"
              {...register('inventory_number', { required: 'Inventory number is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.inventory_number && <p className="mt-1 text-sm text-red-600">{errors.inventory_number.message}</p>}
          </div>
  
          <div>
            <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
              Серийный номер *
            </label>
            <input
              id="serial_number"
              type="text"
              {...register('serial_number', { required: 'Serial number is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.serial_number && <p className="mt-1 text-sm text-red-600">{errors.serial_number.message}</p>}
          </div>
  
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Стоимость
            </label>
            <input
              id="cost"
              type="number"
              step="0.01"
              {...register('cost', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
  
          <div>
            <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
              Дата покупки
            </label>
            <DatePicker
              id="purchase_date"
              value={watch('purchase_date')}
              onChange={(date) => setValue('purchase_date', date)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
  
          <div>
            <label htmlFor="warranty_expiry_date" className="block text-sm font-medium text-gray-700">
              Срок действия гарантии
            </label>
            <DatePicker
              id="warranty_expiry_date"
              value={watch('warranty_expiry_date')}
              onChange={(date) => setValue('warranty_expiry_date', date)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
  
          <div className="sm:col-span-2">
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
        </div>
  
        {dynamicFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Поля</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dynamicFields.map(field => {
                const currentValue = watch('dynamic_values')?.find(v => v.field_id === field.id)?.value || '';
                
                return (
                  <div key={field.id}>
                    <label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700">
                      {field.name}
                    </label>
                    {field.field_type === 'text' && (
                      <input
                        id={`field-${field.id}`}
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleDynamicValueChange(field.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    )}
                    {field.field_type === 'number' && (
                      <input
                        id={`field-${field.id}`}
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleDynamicValueChange(field.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    )}
                    {field.field_type === 'date' && (
                      <DatePicker
                        id={`field-${field.id}`}
                        value={currentValue}
                        onChange={(date) => handleDynamicValueChange(field.id, date)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    )}
                    {field.field_type === 'select' && (
                      <select
                        id={`field-${field.id}`}
                        value={currentValue}
                        onChange={(e) => handleDynamicValueChange(field.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="Семпл выбора">Семпл выбора</option>
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
            {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </form>
    );
  };