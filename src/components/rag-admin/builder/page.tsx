'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import WorkflowEditor from '@/components/workflow/WorkflowEditor'
import { useRectFlow } from '@/providers/RectFlowProvider'
import { fetchRagAppBySlug } from '@/lib/api/rag'
import axios from 'axios'

// Add props interface with mode property
interface RagAppBuilderPageProps {
  mode?: 'create' | 'edit'
}

export default function RagAppBuilderPage({ mode = 'create' }: RagAppBuilderPageProps) {
  const router = useRouter()
  const params = useParams()
  const { slug } = params as { slug?: string }

  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { nodes, edges, clearWorkflow } = useRectFlow()

  // Load existing workflow if editing
  useEffect(() => {
    const loadApp = async () => {
      // Only load app data when in edit mode or when slug is available
      if (mode === 'create' && !slug) {
        setIsLoading(false)
        return
      }

      try {
        const appData = await fetchRagAppBySlug(slug as string)
        if (appData) {
          setApp(appData)

          // Set workflow in RectFlow provider if it exists
          if (appData.workflow) {
            // Clear any existing workflow first
            clearWorkflow()

            // Load the workflow from the app data
            // This would need to update the nodes and edges in the RectFlow provider
            // Implementation would depend on how your RectFlow provider is set up
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load RAG app:', error)
        setIsLoading(false)
      }
    }

    loadApp()
  }, [slug, clearWorkflow, mode])

  // Save workflow
  const handleSave = async (formData: any) => {
    setIsSaving(true)

    try {
      // Prepare the workflow data
      const workflow = {
        nodes,
        edges,
      }

      // Fix: Ensure workflow is a valid object before converting to JSON
      const payload = {
        ...formData,
        workflow:
          workflow && typeof workflow === 'object'
            ? JSON.stringify(workflow)
            : JSON.stringify({ nodes: [], edges: [] }),
      }

      if (app?.id) {
        // Update existing app - use the by-id endpoint with the ID value in the slug parameter
        await axios.patch(`/api/rag-apps/by-id/${app.id}`, payload)
      } else {
        // Create new app
        const response = await axios.post('/api/rag-apps', payload)
        setApp(response.data)
      }

      router.push('/rag-admin')
    } catch (error) {
      console.error('Failed to save RAG app:', error)
      alert('Failed to save your application. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {app ? `Edit: ${app.title}` : 'Create New RAG Application'}
        </h1>
        <button
          onClick={() => {
            const formData = {
              title: prompt('Enter application title:') || 'Untitled RAG App',
              description: prompt('Enter application description:') || 'A RAG application',
              slug: prompt('Enter URL slug (no spaces):') || `rag-app-${Date.now()}`,
            }
            handleSave(formData)
          }}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>

      <div className="border rounded-lg flex-grow overflow-hidden">
        <WorkflowEditor />
      </div>
    </div>
  )
}
