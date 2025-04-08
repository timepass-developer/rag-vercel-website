import React from 'react'
import { Page } from '@/payload-types'
import { fetchRagApps } from '@/lib/api/rag'
import { fetchRagAppsClient } from '@/lib/api/clientRag'
import { AppPageHero } from './components/AppPageHero'
import { RagAppCard } from './components/RagAppCard'
import { RagBuilderCTA } from './components/RagBuilderCTA'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RagGalleryPage() {
  let ragApps

  try {
    ragApps = await fetchRagApps({ limit: 100 })
  } catch (error) {
    console.error('Error fetching RAG apps:', error)
    // Provide empty placeholder data if server-side fetch fails
    ragApps = { docs: [], totalDocs: 0 }
  }

  if (!ragApps) {
    return notFound()
  }

  // Filter for published apps only
  // Define interfaces for RAG app types
  interface RagApp {
    id: string
    status: 'draft' | 'published'
    featured?: boolean
    title: string
    description: string
    slug: string
    image?: { url: string }
    tags?: string[]
    author?: { name: string }
    updatedAt: string
  }

  interface RagAppResponse {
    docs: RagApp[]
    totalDocs: number
    limit: number
    totalPages: number
    page: number
    pagingCounter: number
    hasPrevPage: boolean
    hasNextPage: boolean
    prevPage: number | null
    nextPage: number | null
  }

  // Sanitize app data to ensure proper types
  const sanitizeApp = (app: any): RagApp => {
    return {
      id: app.id?.toString() || '',
      status: app.status || 'draft',
      featured: !!app.featured,
      title: app.title || 'Untitled App',
      description: app.description || 'No description',
      slug: app.slug || '',
      image: app.image || undefined,
      tags: Array.isArray(app.tags)
        ? app.tags.map((t: any) => (typeof t === 'string' ? t : t?.tag || ''))
        : [],
      author: app.author ? { name: app.author?.name || 'Unknown' } : undefined,
      updatedAt: app.updatedAt || new Date().toISOString(),
    }
  }

  // Process all apps - safely access docs regardless of the returned type
  const allApps = (ragApps?.docs || []).map(sanitizeApp)

  // Filter for published apps only
  const publishedApps = allApps.filter((app) => app.status === 'published')

  // Find featured apps (those marked as featured in the CMS)
  const featuredApps = publishedApps.filter((app) => app.featured === true)

  // Get remaining apps that aren't featured
  const regularApps = publishedApps.filter((app) => app.featured !== true)

  return (
    <main className="min-h-screen">
      <AppPageHero
        title="RAG Application Gallery"
        description="Browse and interact with various RAG (Retrieval-Augmented Generation) applications built by our community. Create your own custom RAG workflow in minutes."
      />

      <div className="container mx-auto px-6 py-12">
        {/* RAG Builder CTA - New prominent section */}
        <RagBuilderCTA />

        {featuredApps.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Featured Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredApps.map((app) => (
                <RagAppCard key={app.id} app={app} featured />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-8">All Applications</h2>

          {regularApps.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-600">No applications available</h3>
              <Link
                href="/rag-admin"
                className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
              >
                Create New App
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regularApps.map((app) => (
                <RagAppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </section>

        <section id="learn-more" className="mt-24 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">What is RAG?</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                <strong>Retrieval-Augmented Generation (RAG)</strong> is a technique that enhances
                large language models by providing them with relevant information retrieved from
                external knowledge sources before generating a response.
              </p>
              <p>
                RAG combines the strengths of retrieval-based and generation-based approaches,
                allowing AI models to:
              </p>
              <ul>
                <li>Access the most up-to-date information</li>
                <li>Provide citations and sources for their responses</li>
                <li>Reduce hallucinations by grounding answers in retrieved context</li>
                <li>Answer questions about specialized knowledge domains</li>
              </ul>
              <p>
                With our RAG App Builder, you can create custom RAG workflows without writing any
                code. Simply upload your documents, configure your workflow, and deploy your
                application in minutes.
              </p>
            </div>

            <Link
              href="/rag-admin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 mt-6"
            >
              Build Your Own RAG Application
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
