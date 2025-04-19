"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert } from "@/components/Alert";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronRight } from "lucide-react";

enum EntityType {
  ORGANIZATIONS = "organizations",
  DEPARTMENTS = "departments",
  CATEGORIES = "categories",
  DYNAMIC_FIELDS = "dynamic_fields",
  OBJECTS = "objects",
  ROLES = "roles",
  PERMISSIONS = "permissions",
  USERS = "users",
  POSITIONS = "positions"
}

enum PermissionType {
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete"
}

interface Permission {
  entity_type: EntityType;
  right_type: PermissionType;
}

interface Role {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  permissions: Permission[];
}

export function createRoleRightForm(url: string) {
  return function RoleFormWithPermissions() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const isEditing = id !== "create";

    const [formData, setFormData] = useState({
      name: "",
      description: "",
      parent_id: null as number | null
    });
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedEntities, setExpandedEntities] = useState<EntityType[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [rolesRes, roleRes] = await Promise.all([
            fetchWithAuth(url),
            isEditing ? fetchWithAuth(`${url}/${id}`) : Promise.resolve(null)
          ]);

          if (!rolesRes.ok) throw new Error("Failed to fetch roles");
          setAllRoles(await rolesRes.json());

          if (isEditing && roleRes) {
            if (!roleRes.ok) throw new Error("Failed to fetch role");
            const roleData = await roleRes.json();
            
            setFormData({
              name: roleData.name,
              description: roleData.description || "",
              parent_id: roleData.parent_id
            });

            if (roleData.rights) {
              setPermissions(roleData.rights);
            }
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [id, isEditing, url]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
        const method = isEditing ? "PUT" : "POST";
        const fetchUrl = isEditing ? `${url}/${id}` : url;
        
        const response = await fetchWithAuth(fetchUrl, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            rights:permissions
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to save role");
        }

        router.back();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'parent_id' ? (value ? parseInt(value) : null) : value 
      }));
    };

    const toggleEntity = (entity: EntityType) => {
      setExpandedEntities(prev => 
        prev.includes(entity)
          ? prev.filter(e => e !== entity)
          : [...prev, entity]
      );
    };

    const hasPermission = (entity: EntityType, permission: PermissionType) => {
      return permissions.some(p => 
        p.entity_type === entity && p.right_type === permission
      );
    };

    const handlePermissionChange = (entity: EntityType, permission: PermissionType, checked: boolean) => {
      setPermissions(prev => 
        checked
          ? [...prev, { entity_type: entity, right_type: permission }]
          : prev.filter(p => !(p.entity_type === entity && p.right_type === permission))
      );
    };

    const toggleAllPermissions = (entity: EntityType, grant: boolean) => {
      setPermissions(prev => {
        const newPermissions = prev.filter(p => p.entity_type !== entity);
        if (grant) {
          Object.values(PermissionType).forEach(permission => {
            newPermissions.push({ entity_type: entity, right_type: permission });
          });
        }
        return newPermissions;
      });
    };

    if (isLoading) return <LoadingSpinner />;

    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditing ? "Редактировать роль" : "Создать новую роль"}
          </h1>
        </div>

        {error && <Alert type="error" message={error} className="mb-4" />}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Название роли *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Родительская роль
                </label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Без родительской роли --</option>
                  {allRoles
                    .filter(role => !isEditing || role.id !== parseInt(id as string))
                    .map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Описание роли
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Настройка прав доступа</h2>
              
              <div className="space-y-2">
                {Object.values(EntityType).map(entity => (
                  <div key={entity} className="border rounded-md overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEntity(entity)}
                          className="h-6 w-6 p-0"
                        >
                          {expandedEntities.includes(entity) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="font-medium capitalize">{entity}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllPermissions(entity, true)}
                        >
                          Все
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllPermissions(entity, false)}
                        >
                          Ничего
                        </Button>
                      </div>
                    </div>
                    
                    {expandedEntities.includes(entity) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                        {Object.values(PermissionType).map(permission => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${entity}-${permission}`}
                              checked={hasPermission(entity, permission)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(entity, permission, checked as boolean)
                              }
                            />
                            <label 
                              htmlFor={`${entity}-${permission}`}
                              className="text-sm font-medium capitalize"
                            >
                              {permission}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Назад
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить роль'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
}