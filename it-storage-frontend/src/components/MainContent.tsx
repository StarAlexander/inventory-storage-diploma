"use client"

import { ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden md:pl-64">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}