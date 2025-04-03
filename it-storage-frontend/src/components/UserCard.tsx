import { UserSchema } from "@/lib/types";
import Link from "next/link";


interface UserCardProps {
    user: UserSchema
    onDelete: (userId:number) => void
}


export default function UserCard({user, onDelete}: UserCardProps) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold mb-2">{user.username}</h2>
          <p className="text-gray-600 mb-4">{user.email}</p>
          <div className="flex justify-between items-center">
            <Link href={`/users/${user.id}`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Редактировать
              </button>
            </Link>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => onDelete(user.id)}
            >
              Удалить
            </button>
          </div>
        </div>
      );
}