'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { fetchWithAuth } from '@/app/utils/fetchWithAuth'

interface Right {
  id: number
  name: string
}

interface PageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page?: {
    id: number
    path: string
    name: string
    description: string | null
    required_rights: { id: number; name: string }[]
  }
  onSuccess: (page: any) => void
}

export function PageDialog({ open, onOpenChange, page, onSuccess }: PageDialogProps) {
  const [path, setPath] = useState(page?.path || '')
  const [name, setName] = useState(page?.name || '')
  const [description, setDescription] = useState(page?.description || '')
  const [selectedRights, setSelectedRights] = useState<number[]>(
    page?.required_rights.map(r => r.id) || []
  )
  const [allRights, setAllRights] = useState<Right[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRights = async () => {
      const response = await fetchWithAuth('http://backend:8000/rights')
      if (response.ok) {
        const data = await response.json()
        setAllRights(data)
      }
    }
    fetchRights()
  }, [open])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const url = page ? `http://backend:8000/admin/pages/${page.id}` : 'http://backend:8000/admin/pages'
      const method = page ? 'PUT' : 'POST'
      
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          name,
          description,
          right_ids: selectedRights
        })
      })

      if (!response.ok) throw new Error('Failed to save page')

      const savedPage = await response.json()
      console.log(`saved page: ${savedPage}`)
      onSuccess(savedPage)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{page ? 'Изменить доступ' : 'Добавить новую настройку'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Путь к странице</Label>
            <Input 
              value={path} 
              onChange={(e) => setPath(e.target.value)} 
              placeholder="/protected-path" 
            />
          </div>
          
          <div>
            <Label>Название</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Admin Dashboard" 
            />
          </div>
          
          <div>
            <Label>Описание</Label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Page description" 
            />
          </div>
          
          <div>
            <Label>Требуемые права</Label>
            <MultiSelect
              options={allRights.map(r => ({ value: r.id, label: r.name }))}
              selectedValues={selectedRights}
              onChange={setSelectedRights}
              placeholder="Выберите права..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отменить
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}