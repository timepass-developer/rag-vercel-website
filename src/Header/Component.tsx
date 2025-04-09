import React from 'react'
import { HeaderThemeProvider } from './HeaderTheme'
import { HeaderClient } from './Component.client'
import Link from 'next/link'

// Add any other imports you need for your header

export const Header: React.FC = () => {
  return (
    <HeaderThemeProvider>
      {/* Safely initialize theme */}
      <HeaderClient defaultTheme="system" />

      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                RAG Builder
              </Link>
            </div>

            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link
                    href="/rag-gallery"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                  >
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rag-admin"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                  >
                    Builder
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutorials"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                  >
                    Tutotrials
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </HeaderThemeProvider>
  )
}
