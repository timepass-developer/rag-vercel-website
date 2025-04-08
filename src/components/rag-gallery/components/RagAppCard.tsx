import React from 'react'
import Link from 'next/link'
import { formatDate } from '@/utilities/formatDate'

interface RagAppCardProps {
  app: {
    id: string
    title: string
    description: string
    slug: string
    image?: { url: string }
    tags?: string[]
    author?: { name: string }
    updatedAt: string
  }
  featured?: boolean
}

export const RagAppCard: React.FC<RagAppCardProps> = ({ app, featured = false }) => {
  // Ensure the app has valid data to prevent rendering errors
  const safeApp = {
    id: app?.id || 'unknown',
    title: app?.title || 'Untitled App',
    description: app?.description || 'No description available',
    slug: app?.slug || 'unknown',
    image: app?.image,
    tags: Array.isArray(app?.tags) ? app.tags : [],
    author: { name: app?.author?.name || 'Unknown' },
    updatedAt: app?.updatedAt || new Date().toISOString(),
  }

  // Generate a gradient color based on the app name for visual distinction
  const generateGradient = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Use the hash to generate a hue between 0 and 359
    const hue = hash % 360

    return `linear-gradient(135deg, hsl(${hue}, 65%, 70%), hsl(${(hue + 40) % 360}, 80%, 60%))`
  }

  return (
    <Link href={`/rag-gallery/${safeApp.slug}`} className="block">
      <div
        className={`overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 ${
          featured ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
        }`}
      >
        {/* Card Header with Image or Gradient */}
        <div
          className="h-40 bg-cover bg-center"
          style={{
            background: safeApp.image?.url
              ? `url(${safeApp.image.url})`
              : generateGradient(safeApp.title),
          }}
        >
          {featured && (
            <div className="flex justify-end p-2">
              <span className="bg-indigo-600 text-white px-2 py-1 text-xs font-bold rounded">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            {safeApp.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {safeApp.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {safeApp.tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
            <div>By {safeApp.author?.name || 'Unknown'}</div>
            <div>Updated {formatDate(safeApp.updatedAt)}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
