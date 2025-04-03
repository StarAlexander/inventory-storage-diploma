import { useEffect, useState } from "react"


interface RoleRightFormProps {
    initialData?: {name:string, description:string} | null
    onSubmit: (data: {name:string, description:string}) => void
}

export default function RoleRightForm({initialData, onSubmit}:RoleRightFormProps) {
    const [name,setName] = useState(initialData?.name || "")
    const [description,setDescription] = useState(initialData?.description || "")


    useEffect(() => {
        setName(initialData?.name || "")
        setDescription(initialData?.description || "")
        console.log(initialData)
    }, [initialData])
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({name,description})
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Сохранить
            </button>
        </form>
    );
}