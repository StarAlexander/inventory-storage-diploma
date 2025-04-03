'use client'
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";



export default function Navbar() {
    const pathname = usePathname()
    const session = useSession()
    console.log(pathname)
    const removeToken = async (e: React.MouseEvent) => {
        await signOut()
    }

    if (pathname == "/login") return null
    return (
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                <Link href="/">
                  <div className="flex items-center py-4 px-2">
                    <span className="font-semibold text-gray-800 text-lg">Управление оборудованием</span>
                  </div>
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/organizations">
                  <div className="py-4 px-2 text-gray-800 hover:text-blue-500 font-semibold">Организации</div>
                </Link>
                <Link href="/departments">
                  <div className="py-4 px-2 text-gray-800 hover:text-blue-500 font-semibold">Отделы</div>
                </Link>
                <Link href="/users">
                  <div className="py-4 px-2 text-gray-800 hover:text-blue-500 font-semibold">Пользователи</div>
                </Link>
                {(session.status == "unauthenticated" || session.status == "loading") && (
                    <Link href="/login">
                  <div className="py-4 px-2 text-gray-800 hover:text-blue-500 font-semibold">Авторизация</div>
                </Link>
                )}
                {session.status == "authenticated" && (
                    <a onClick={removeToken} href="/login">
                    <div className="py-4 px-2 text-gray-800 hover:text-blue-500 font-semibold">Выход</div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </nav>
      );
}