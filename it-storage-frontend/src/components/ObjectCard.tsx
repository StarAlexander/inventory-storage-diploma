import { ObjectSchema } from "@/lib/types";


interface ObjectCardProps {
    object: ObjectSchema
}

export default function ObjectCard({object}: ObjectCardProps) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold mb-2">{object.name}</h2>
          <p className="text-gray-600 mb-4">{object.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Inventory: {object.inventory_number}</span>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              View Details
            </button>
          </div>
        </div>
      );
}