import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/providers/provider";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Система управления оборудованием",
  description: "Панель управления оборудованием",
};





export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <Provider>
          <AuthProvider>
            <div className="flex h-full">
              <Sidebar />
              <main className="flex-1 overflow-auto bg-gray-50">
                <div className="min-h-full p-6">
                  {children}
                </div>
              </main>
            </div>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}

