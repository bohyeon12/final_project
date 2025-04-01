// app/providers.tsx (Client Component)
"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { Toaster } from "@/components/ui/sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <I18nextProvider i18n={i18n}>
        <Header />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 p-4 bg-gray-100 overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </div>
        <Toaster position="top-center" />
      </I18nextProvider>
    </ClerkProvider>
  )
}
