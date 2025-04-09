'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import SafeWorkflowEditor from '@/components/workflow/SafeWorkflowEditor'
import { useRectFlow } from '@/providers/RectFlowProvider'
import axios from 'axios'
import { fetchRagAppBySlug } from '@/lib/api/rag'
import Link from 'next/link'
import SaveAppModal from '@/components/rag-admin/SaveAppModal'

// Define the interface for workflow structure
interface WorkflowData {
  nodes: any[]
  edges: any[]
  [key: string]: any // Allow for other properties
}

export default function EditRagAppPage() {
  // Use useParams hook instead of props to access route params in client components
  const params = useParams()
  const router = useRouter()
  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { nodes, edges, clearWorkflow, onNodesChange, onEdgesChange } = useRectFlow()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get slug from params (it's a string in client components)
  const slug = params?.slug as string

  // Load app data by slug
  useEffect(() => {
    const loadApp = async () => {
      if (!slug) {
        setError('Invalid slug parameter')
        setIsLoading(false)
        return
      }

      try {
        // Use the slug to fetch the app
        const appData = await fetchRagAppBySlug(slug)
        if (!appData) {
          throw new Error('App not found')
        }

        setApp(appData)

        // Load workflow data into editor
        if (appData.workflow) {
          let workflow: WorkflowData

          // Parse workflow if it's a string
          if (typeof appData.workflow === 'string') {
            try {
              workflow = JSON.parse(appData.workflow) as WorkflowData
            } catch (e) {
              console.error('Failed to parse workflow JSON:', e)
              workflow = { nodes: [], edges: [] }
            }
          } else {
            workflow = appData.workflow as WorkflowData
          }

          // First clear the workflow
          clearWorkflow()
          
          // DIFFERENT APPROACH: Instead of using change handlers which have compatibility issues,
          // let's implement direct state setting from the RectFlowProvider context
          
          // Add a short delay to ensure clearWorkflow has completed
          setTimeout(() => {
            try {
              // Try to directly set the nodes and edges using the provider's methods
              // This bypasses the type incompatibility with the reset action
              import('@/providers/RectFlowProvider').then((module) => {
                const { setStateNodes, setStateEdges } = module.useRectFlow();
                if (typeof setStateNodes === 'function' && Array.isArray(workflow.nodes)) {
                  setStateNodes(workflow.nodes);
                }
                if (typeof setStateEdges === 'function' && Array.isArray(workflow.edges)) {
                  setStateEdges(workflow.edges);
                }
              }).catch(err => console.error("Failed to import provider:", err));
            } catch (err) {
              console.error("Failed to set workflow state:", err);
            }
          }, 100);
        }

        setError(null)
      } catch (err) {
        console.error('Failed to load RAG app:', err)
        setError(err instanceof Error ? err.message : 'Failed to load application')
      } finally {
        setIsLoading(false)
      }
    }

    loadApp()
  }, [slug, clearWorkflow])  // Removed the problematic dependencies

  // Save workflow changes
  const handleSave = async (formData: any) => {
    setIsSaving(true)
    setError(null)

    try {
      const workflow = {
        nodes,
        edges,
      }

      const payload = {
        ...formData,
        workflow:
          workflow && typeof workflow === 'object'
            ? JSON.stringify(workflow)
            : JSON.stringify({ nodes: [], edges: [] }),
      }

      // Use app.id for the update if available, otherwise use slug
      if (app?.id) {
        await axios.patch(`/api/rag-apps?where=${JSON.stringify({ id: app.id })}`, payload)
      } else {
        // Fall back to using the slug
        await axios.patch(`/api/rag-apps?where=${JSON.stringify({ slug })}`, payload)
      }

      setIsModalOpen(false)
      router.push('/rag-admin')
    } catch (err) {
      console.error('Failed to save RAG app:', err)
      setError(err instanceof Error ? err.message : 'Failed to save application')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle rendering different states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-lg">Loading application...</span>
      </div>
    )
  }

  if (error && !app) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-medium text-red-600 mb-2">Error Loading Application</h2>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/rag-admin')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Return to Admin
          </button>
        </div>
      </div>
    )
  }

  if (!app) {
    return notFound()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit: {app.title}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/rag-gallery/${app.slug}`}
            target="_blank"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Preview
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="border rounded-lg flex-grow overflow-hidden">
        <SafeWorkflowEditor onSave={() => setIsModalOpen(true)} />
      </div>

      {/* Save App Modal */}
      <SaveAppModal
        isOpen={isModalOpen}
        initialData={{
          title: app.title || '',
          description: app.description || '',
          slug: app.slug || '',
          status: app.status || 'draft',
          apiKeys: app.apiKeys || {},
          uiSettings: app.uiSettings || { theme: 'system', showWorkflow: false },
        }}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}
