'use client'

import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

interface Role {
  id: number;
  name: string;
  children?: Role[];
}

interface Right {
  id: number;
  name: string;
  description?: string;
}

interface RoleRight {
  role_id: number;
  right_id: number;
}

export default function RoleRightsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rights, setRights] = useState<Right[]>([]);
  const [roleRights, setRoleRights] = useState<RoleRight[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkOperation, setBulkOperation] = useState<{
    roleId: number;
    rightId: number;
    action: 'add' | 'remove';
  } | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rolesRes, rightsRes, roleRightsRes] = await Promise.all([
          fetchWithAuth("http://backend:8000/roles/hierarchy"),
          fetchWithAuth("http://backend:8000/rights"),
          fetchWithAuth("http://backend:8000/role-rights")
        ]);

        if (!rolesRes.ok) throw new Error("Failed to fetch roles hierarchy");
        if (!rightsRes.ok) throw new Error("Failed to fetch rights");
        if (!roleRightsRes.ok) throw new Error("Failed to fetch role-rights");

        const rolesData = await rolesRes.json();
        const rightsData = await rightsRes.json();
        const roleRightsData = await roleRightsRes.json();

        if (Array.isArray(rolesData)) setRoles(rolesData);
        if (Array.isArray(rightsData)) setRights(rightsData);
        if (Array.isArray(roleRightsData)) setRoleRights(roleRightsData);
        
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleRole = (roleId: number) => {
    setExpandedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const hasRight = (roleId: number, rightId: number) => {
    return roleRights.some(rr => rr.role_id === roleId && rr.right_id === rightId);
  };

  const handleChange = async (role_id: number, right_id: number, checked: boolean) => {
    try {
      const method = checked ? "POST" : "PUT";
      const response = await fetchWithAuth("http://backend:8000/role-rights", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id, right_id })
      });

      if (!response.ok) throw new Error(await response.text());

      setRoleRights(prev => 
        checked
          ? [...prev, { role_id, right_id }]
          : prev.filter(rr => !(rr.role_id === role_id && rr.right_id === right_id))
      );

      setBulkOperation({
        roleId: role_id,
        rightId: right_id,
        action: checked ? 'add' : 'remove'
      });
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const applyToChildren = async (apply: boolean) => {
    if (!bulkOperation) return;
    
    const { roleId, rightId, action } = bulkOperation;
    const parentRole = findRole(roles, roleId);
    if (!parentRole) return;

    try {
      if (apply) {
        const childRoleIds = getAllChildRoleIds(parentRole);
        if (childRoleIds.length === 0) return;

        const response = await fetchWithAuth(
          'http://backend:8000/role-rights/bulk',
          {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role_ids: childRoleIds,
              right_id: rightId,
              action
            })
          }
        );

        if (!response.ok) throw new Error(await response.text());

        setRoleRights(prev => {
          if (action === 'add') {
            const newRights = [...prev];
            childRoleIds.forEach(childId => {
              if (!prev.some(rr => rr.role_id === childId && rr.right_id === rightId)) {
                newRights.push({ role_id: childId, right_id: rightId });
              }
            });
            return newRights;
          } else {
            return prev.filter(rr => 
              !(childRoleIds.includes(rr.role_id) && rr.right_id === rightId)
            );
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Bulk operation failed");
    } finally {
      setBulkOperation(null);
    }
  };

  // Helper functions remain the same
  function findRole(roleList: Role[], id: number): Role | null {
    for (const role of roleList) {
      if (role.id === id) return role;
      if (role.children) {
        const found = findRole(role.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function getAllChildRoleIds(role: Role): number[] {
    let ids: number[] = [];
    if (role.children) {
      role.children.forEach(child => {
        ids.push(child.id);
        ids = [...ids, ...getAllChildRoleIds(child)];
      });
    }
    return ids;
  }

  const renderRoleRow = (role: Role, level = 0): React.ReactElement => {
    const isExpanded = expandedRoles.includes(role.id);
    const hasChildren = role.children && role.children.length > 0;

    return (
      <>
        <tr key={role.id} className="hover:bg-gray-50">
          <td className="py-3 px-4 border-b" style={{ paddingLeft: `${level * 24}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRole(role.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6" /> // Spacer for alignment
              )}
              <span className="font-medium">{role.name}</span>
              {level === 0 && (
                <Badge variant="outline" className="ml-2">
                  Root
                </Badge>
              )}
            </div>
          </td>
          {rights.map(right => (
            <td key={right.id} className="py-3 px-4 border-b text-center">
              <Checkbox
                checked={hasRight(role.id, right.id)}
                onCheckedChange={(checked) => 
                  handleChange(role.id, right.id, checked as boolean)
                }
                className="h-5 w-5"
              />
            </td>
          ))}
        </tr>
        {isExpanded && hasChildren && role.children?.map(child => renderRoleRow(child, level + 1))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role Rights Management</h1>
        <div className="text-sm text-muted-foreground">
          {roleRights.length} assignments
        </div>
      </div>

      {bulkOperation && (
        <Alert className="mb-4">
          <AlertTitle>Apply to child roles?</AlertTitle>
          <AlertDescription>
            Do you want to {bulkOperation.action} this right for all child roles?
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => applyToChildren(true)}>
                Yes, apply to all
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => applyToChildren(false)}
              >
                No, just this role
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border overflow-hidden">
        <div className="relative overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left min-w-[300px]">Role</th>
                {rights.map(right => (
                  <th key={right.id} className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{right.name}</span>
                      {right.description && (
                        <span className="text-xs text-muted-foreground">
                          {right.description}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => renderRoleRow(role))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}