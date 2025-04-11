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
    header: 'Название',
  },
  {
    accessorKey: 'path',
    header: 'Путь',
  },
  {
    accessorKey: 'description',
    header: 'Описание',
    cell: ({ row }) => row.original.description || 'N/A',
  },
  {
    accessorKey: 'required_rights',
    header: 'Требуемые права',
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
          Редактировать
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            if (confirm('Вы уверены, что хотите удалить эту настройку?')) {
              await fetchWithAuth(`http://backend:8000/admin/pages/${row.original.id}`, {
                method: 'DELETE',
              })
              await fetchPages()
            }
          }}
        >
          Удалить
        </Button>
      </div>
    ),
  },
]