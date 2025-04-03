export const PAGE_PERMISSIONS = {
    '/': 'view_dashboard',
    '/roles': 'manage_roles',
    '/rights': 'manage_rights',
    '/role-rights': 'manage_role_rights',
    '/users': 'manage_users',
    // Add all other protected routes
  } as const
  
  export type ProtectedPath = keyof typeof PAGE_PERMISSIONS