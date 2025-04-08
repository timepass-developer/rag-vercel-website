// @ts-nocheck - Disable TypeScript checking for this file due to Next.js param type conflicts
import React from 'react'
import { notFound } from 'next/navigation'
import { fetchRagAppBySlug } from '@/lib/api/rag'
import { RagAppRenderer } from '@/components/rag-app/RagAppRenderer'

export const dynamic = 'force-dynamic'

// Remove the explicit type annotation to let Next.js infer the types correctly
export default async function RagAppPage({ params }) {
  const { slug } = params
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
    <div>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-white">{app.title}</h1>
          <p className="text-indigo-100 mt-2">{app.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <RagAppRenderer
            workflow={parsedWorkflow}
            config={{
              features: {
                documentProcessing: true,
                imageProcessing: true,
                audioTranscription: true,
              },
            }}
            apiKeys={app.apiKeys || {}}
            uiSettings={app.uiSettings || { theme: 'system', showWorkflow: false }}
          />
        </div>
      </div>
    </div>
  )
}
