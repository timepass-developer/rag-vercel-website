import React from 'react'
import Link from 'next/link'
import { Providers } from '@/providers'

export default function RagAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <header className="bg-indigo-700 text-white">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/rag-gallery" className="text-xl font-bold">
              RAG Application Builder
            </Link>
            <nav className="flex gap-6">
              <Link href="/rag-admin" className="hover:text-indigo-200">
                Dashboard
              </Link>
              <Link href="/rag-admin/new" className="hover:text-indigo-200">
                Create New
              </Link>
              <Link href="/rag-gallery" className="hover:text-indigo-200">
                Gallery
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-6 py-8">{children}</main>

        <footer className="bg-gray-100 dark:bg-gray-800 py-6">
          <div className="container mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} RAG Application Builder. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Providers>
  )
}
