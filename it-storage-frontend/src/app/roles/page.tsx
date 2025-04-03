"use client"

import { RoleRightTable } from "@/components/RoleRightTable";

export default function RolesPage() {
  return <RoleRightTable url="http://backend:8000/roles" entityName="Роль"/>
}