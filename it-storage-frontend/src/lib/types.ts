
export interface FieldValueSchema {
    field_id: number
    value:string
}

export interface ObjectSchema {
    id:number
    category_id:number
    name:string
    description?: string
    inventory_number?:string
    serial_number?:string
    cost?: number
    purchase_date?:string
    warranty_expiry_date?: string
    created_at: string
    updated_at: string
    dynamic_values: FieldValueSchema[] 
}

export interface OrganizationCreate {
    name:string
    email?: string
    phone?: string
    address?: string
    notes?: string
}

export interface OrganizationSchema extends OrganizationCreate {
    id: number
    created_at:string
    updated_at: string
    departments?: DepartmentSchema[]
}


export interface DepartmentCreate {
    organization_id: number
    name: string
    abbreviation:string
    description?: string
}

export interface DepartmentSchema extends DepartmentCreate {
    id: number
    created_at: string
    updated_at: string
}


export interface UserCreate {
    username: string
    email?: string
    first_name?: string
    middle_name?: string
    last_name?: string
    phone?: string
    is_system: boolean,
    password:string
}

export interface RightCreate {
    role_id: number
    name:string
    description?: string
}

export interface RightSchema extends RightCreate {
    id: number
    created_at: string
    updated_at: string
}

export interface RoleCreate {
    name: string
    description?: string
}

export interface RoleSchema extends RoleCreate {
    id: number
    created_at: string
    updated_at: string
    rights: Array<RightSchema>
}


export interface UserSchema extends UserCreate {
    id: number
    created_at: string
    updated_at: string
    department_id?: number
    roles: Array<RoleSchema>
    post_id?: number
}


export interface ObjectCategory {
    id: number
    name:string
    description?: string
    created_at:string
    updated_at:string
}


export interface DynamicField {
    id: number
    category_id: number
    name:string
    field_type: 'text' | 'number' | 'date' | 'select'
    description?: string
    created_at: string
    updated_at: string,
    category: ObjectCategory
}

export interface FieldValue {
    field_id: number
    value:string
}


export interface InventoryObject {
    id: number;
    category_id: number;
    name: string;
    description?: string;
    inventory_number: string;
    serial_number: string;
    cost?: number;
    purchase_date?: string;
    warranty_expiry_date?: string;
    created_at: string;
    updated_at: string;
    dynamic_values: FieldValue[];
  }
  
  export interface ObjectCreateData {
    category_id: number;
    name: string;
    description?: string;
    inventory_number: string;
    serial_number: string;
    cost?: number;
    purchase_date?: string;
    warranty_expiry_date?: string;
    dynamic_values: { field_id: number; value: string }[];
  }


  
  export interface CategoryCreateData {
    name: string;
    description?: string;
  }
  
  export interface FieldCreateData {
    category_id: number;
    name: string;
    field_type: 'text' | 'number' | 'date' | 'select';
    description?: string;
    select_options: any
  }