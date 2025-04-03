"use client"

import { RoleRightTable } from "@/components/RoleRightTable";

export default function RightsPage() {
  return <RoleRightTable url="http://backend:8000/rights" entityName="Право"/>
}