'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchRagApps } from '@/lib/api/rag'
import { useRectFlow } from '@/providers/RectFlowProvider'

export default function RagAdminPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { clearWorkflow } = useRectFlow()

  useEffect(() => {
    const loadApps = async () => {
      setLoading(true)
      try {
        const result = await fetchRagApps({ limit: 100 })
        if (result && result.docs) {
          setApps(result.docs)
        }
      } catch (error) {
        console.error('Error loading RAG apps:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApps()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">RAG Application Dashboard</h1>
        <Link
          href="/rag-admin/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={() => clearWorkflow()}
        >
          Create New App
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-3">
            No applications yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first RAG application to get started
          </p>
          <Link
            href="/rag-admin/new"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={() => clearWorkflow()}
          >
            Create New App
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{app.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      app.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {app.description}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    href={`/rag-admin/edit/${app.id}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/rag-gallery/${app.slug}`}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
