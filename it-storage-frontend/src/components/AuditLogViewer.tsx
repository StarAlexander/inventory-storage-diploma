import { fetchWithAuth } from "@/app/utils/fetchWithAuth"
import { format } from "date-fns"
import { useEffect, useState } from "react"

interface AuditLog {
    id: number
    user_id: number
    action: string
    entity_type: string
    entity_id?: string
    old_data?: any
    new_data?: any
    performed_by: number
    ip_address?: string
    user_agent?: string
    reason?: string
    created_at: string
}
  
interface AuditLogViewerProps {
    realtime?: boolean
    initialLogs?: AuditLog[]
}
 
  
export default function AuditLogViewer({realtime = true, initialLogs = []}: AuditLogViewerProps) {
    const [logs,setLogs] = useState<AuditLog[]>(initialLogs)
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState<string | null>(null)
    const [filters, setFilters] = useState({
        action: '',
        entity_type: '',
        user_id: '',
        start_date: '',
        end_date: ''
      })
    
      useEffect(() => {
        if (realtime) {
            const eventSource = new EventSource(`http://backend:8000/audit/realtime`)

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data)
                setLogs(prev => [data, ...prev].slice(0,100))
            }

            return () => eventSource.close()
        }
      },[realtime])
      
      const loadLogs = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (filters.action) params.append('action',filters.action)
            if (filters.entity_type) params.append('entity_type',filters.entity_type)
            if (filters.user_id) params.append('user_id',filters.user_id)
            if (filters.start_date) params.append('start_date',new Date(filters.start_date).toISOString())
            if (filters.end_date) params.append('end_date',new Date(filters.end_date).toISOString())
            
            const response = await fetchWithAuth(`http://backend:8000/user-logs${params.size ? "?" + params.toString() : ""}`)
            if (!response.ok) throw new Error('Failed to fetch logs')
            
            const data = await response.json()
            setLogs(data)

        } catch (err) {
            setError(err instanceof Error? err.message : 'Failed to load logs')

        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name,value} = e.target
        setFilters(prev => ({...prev, [name]:value}))
    }
    
    return (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Логи</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Действие</label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Все действия</option>
                  <option value="CREATE">Создание</option>
                  <option value="UPDATE">Обновление</option>
                  <option value="DELETE">Удаление</option>
                  <option value="LOGIN">Авторизация</option>
                  <option value="LOGOUT">Выход</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип сущности</label>
                <input
                  type="text"
                  name="entity_type"
                  value={filters.entity_type}
                  onChange={handleFilterChange}
                  className="w-full border rounded p-2"
                  placeholder="e.g., user, role"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID пользователя</label>
                <input
                  type="text"
                  name="user_id"
                  value={filters.user_id}
                  onChange={handleFilterChange}
                  className="w-full border rounded p-2"
                  placeholder="Filter by user ID"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Начальная дата</label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  className="w-full border rounded p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Конечная дата</label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
            
            <button
              onClick={loadLogs}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Фильтруем...' : 'Применить фильтры'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.entity_type}{log.entity_id ? ` (${log.entity_id})` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Исполнитель #{log.performed_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

}  