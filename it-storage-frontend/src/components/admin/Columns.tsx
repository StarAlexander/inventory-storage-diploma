// components/columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Page } from './PageAccessControl'
import { fetchWithAuth } from '@/app/utils/fetchWithAuth'

export const columns = (
  setSelectedPage: (page: any) => void,
  setDialogOpen: (open: boolean) => void,
  fetchPages: () => Promise<void>
): ColumnDef<Page>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'path',
    header: 'Path',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description || 'N/A',
  },
  {
    accessorKey: 'required_rights',
    header: 'Required Rights',
    cell: ({ row }) => row.original.required_rights.map(r => r.name).join(', ') || 'None'
      
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedPage(row.original)
            setDialogOpen(true)
          }}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            if (confirm('Are you sure you want to delete this page?')) {
              await fetchWithAuth(`http://backend:8000/admin/pages/${row.original.id}`, {
                method: 'DELETE',
              })
              await fetchPages()
            }
          }}
        >
          Delete
        </Button>
      </div>
    ),
  },
]