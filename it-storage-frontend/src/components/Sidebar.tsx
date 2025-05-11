"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiLogOut, FiUsers, FiSettings, FiLayers, FiTag, FiGrid, FiKey, FiBriefcase, FiUserCheck, FiAward, FiShield, FiX, FiMenu, FiPenTool, FiBox } from "react-icons/fi";
import {FaChartPie} from "react-icons/fa"
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const navItems = [
  {
    title: "Главная",
    href: "/",
    icon: <FiHome className="w-5 h-5" />,
  },
  {
    title: "Организации",
    href: "/organizations",
    icon: <FiBriefcase className="w-5 h-5" />,
  },
  {
    title: "Отделы",
    href: "/departments",
    icon: <FiUsers className="w-5 h-5" />,
  },
  {
    title: "Категории",
    href: "/categories",
    icon: <FiLayers className="w-5 h-5" />,
  },
  {
    title: "Динамические поля",
    href: "/fields",
    icon: <FiGrid className="w-5 h-5" />,
  },
  {
    title: "Объекты",
    href: "/objects",
    icon: <FiTag className="w-5 h-5" />,
  },
  {
    title: "Роли",
    href: "/roles",
    icon: <FiUserCheck className="w-5 h-5" />,
  },
  {
    title: "Пользователи",
    href: "/users",
    icon: <FiUsers className="w-5 h-5" />,
  },
  {
    title: "Должности",
    href: "/posts",
    icon: <FiAward className="w-5 h-5" />,
  },
  {
    title: "Склад",
    href: "/warehouses",
    icon: <FiBox className="w-5 h-5" />,
  },
  {
    title: "На подпись",
    href: "/to-sign",
    icon: <FiPenTool className="w-5 h-5" />,
  },
  {
  title: "Аналитика",
  href: "/warehouses/analytics",
  icon: <FaChartPie className="w-5 h-5" />,
  }
];

export function Sidebar() {
    const pathname = usePathname();
    const {data:session} = useSession()
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isOpen, setIsOpen] = useState(false);
  
    useEffect(() => {
      if (isMobile) setIsOpen(false);
    }, [pathname, isMobile,session]);
  
    useEffect(() => {
      document.body.style.overflow = isMobile && isOpen ? 'hidden' : 'auto';
      return () => { document.body.style.overflow = 'auto' };
    }, [isOpen, isMobile]);
  
    if (pathname === '/login') return null;
  
    return (
      <>
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed z-40 top-4 left-4 p-2 rounded-md bg-white shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <FiX className="w-6 h-6 text-gray-700" />
            ) : (
              <FiMenu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        )}
  
        {/* Sidebar */}
        <div
          className={`
            ${isMobile ? 'fixed inset-0 z-30' : 'hidden md:flex md:flex-col md:inset-y-0'}
            ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
            w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
          `}
        >
          {/* Overlay for mobile */}
          {isMobile && (
            <div 
              className="absolute inset-0 bg-black/50 md:hidden -z-10"
              onClick={() => setIsOpen(false)}
            />
          )}
  
          {/* Sidebar Content */}
          <div className="relative z-10 h-full flex flex-col bg-white">
            <div className="px-6 py-5 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-800">Система управления</h1>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-700">{session?.user?.username}</p>
                {(session?.user as any)?.is_system && <p className="text-sm text-blue-500">Суперпользователь</p>}
                </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </nav>
  
            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => signOut()}
                className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <FiLogOut className="w-5 h-5 mr-3" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }