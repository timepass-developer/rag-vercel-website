import React from 'react'
import { notFound } from 'next/navigation'
import { fetchRagAppBySlug } from '@/lib/api/rag'
import { RagAppRenderer } from '@/components/rag-app/RagAppRenderer'
import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'


interface PageProps {
  params: { slug: string } | Promise<{ slug: string }>
  searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateStaticParams() {
  // In a production app, you would fetch all slugs here for static generation
  return []
}

// Generate dynamic metadata for better SEO
export async function generateMetadata(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any },
): Promise<Metadata> {
  // Handle params whether it's a Promise or direct object
  const slug = params instanceof Promise ? (await params).slug : params.slug

  const app = await fetchRagAppBySlug(slug)

  if (!app) {
    return {
      title: 'App Not Found',
      description: 'The requested RAG application could not be found.',
    }
  }

  return {
    title: `${app?.title || 'App'} | RAG Application`,
    description: app.description || 'AI-powered RAG application',
    openGraph: {
      title: app.title,
      description: app.description || 'AI-powered RAG application',
      type: 'website',
    },
  }
}

// Define the page component with proper Promise handling
export default async function RagAppPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any },
) {
  // Handle params whether it's a Promise or direct object
  const slug = params instanceof Promise ? (await params).slug : params.slug

  // Use the slug to fetch data
  const app = await fetchRagAppBySlug(slug)

  if (!app) {
    return notFound()
  }

  // Parse the workflow if it's a string
  const parsedWorkflow = (() => {
    if (typeof app.workflow === 'string') {
      try {
        return JSON.parse(app.workflow)
      } catch (e) {
        console.error('Failed to parse workflow JSON:', e)
        return { nodes: [], edges: [] }
      }
    }
    return app.workflow || { nodes: [], edges: [] }
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12 shadow-lg">
        <div className="container mx-auto px-6">
          {/* Breadcrumb navigation */}
          <div className="flex items-center text-indigo-100 mb-6">
            <Link href="/rag-gallery" className="hover:text-white transition">
              Gallery
            </Link>
            <span className="mx-2">›</span>
            <span className="font-medium truncate">{app.title}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white">{app.title}</h1>
          <p className="text-indigo-100 mt-2 max-w-3xl">{app.description}</p>

          {app.author && (
            <div className="mt-4 text-indigo-100">
              <span>
                Created by:{' '}
                {typeof app.author === 'object' ? app.author.name || 'Unknown' : 'Unknown'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* App content */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 transition-all">
          <RagAppRenderer
            workflow={parsedWorkflow}
            config={{
              features: {
                documentProcessing: true,
                imageProcessing: true,
                audioTranscription: true,
                videoProcessing: true, // Added new feature
              },
            }}
            apiKeys={Object.entries(app.apiKeys || {}).reduce(
              (acc, [key, value]) => {
                if (value !== null && value !== undefined) {
                  acc[key] = value
                }
                return acc
              },
              {} as Record<string, string>,
            )}
            uiSettings={{
              theme: app.uiSettings?.theme || 'system',
              showWorkflow: app.uiSettings?.showWorkflow ?? false,
            }}
          />

          {/* Added feature toggles */}
          {app.uiSettings?.showWorkflow && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium mb-4">Workflow Visualization</h2>
              <div className="bg-gray-50 rounded-md p-4 h-64 overflow-auto">
                {/* Placeholder for workflow visualization */}
                <div className="flex items-center justify-center h-full text-gray-500">
                  Workflow visualization would appear here
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
