'use client'
import { useState, useEffect } from 'react'
import { DataTable } from './DataTable'
import { columns } from './Columns'
import { PageDialog } from './PageDialog'
import { Button } from '@/components/ui/Button'
import { fetchWithAuth } from '@/app/utils/fetchWithAuth'

export interface Page {
  id: number
  path: string
  name: string
  description: string | null
  required_rights: {
    id: number
    name: string
  }[]
}

export function PageAccessControl() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  console.log(pages)
  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth('http://backend:8000/admin/pages')
      if (!response.ok) throw new Error('Failed to fetch pages')
      const data = await response.json()
    
      setPages(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (updatedPage: Page) => {
    if (selectedPage) {
      setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p))
    } else {
      setPages([...pages, updatedPage])
    }
    setDialogOpen(false)
    setSelectedPage(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Page Access Control</h1>
        <Button onClick={() => setDialogOpen(true)}>Add New Page</Button>
      </div>

      <DataTable 
        columns={columns(setSelectedPage, setDialogOpen, fetchPages)} 
        data={pages} 
        loading={loading}
      />

      <PageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        page={selectedPage ?? undefined}
        onSuccess={handleSuccess}
      />
    </div>
  )
}