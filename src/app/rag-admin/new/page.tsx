'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import SafeWorkflowEditor from '@/components/workflow/SafeWorkflowEditor'
import { useRectFlow } from '@/providers/RectFlowProvider'
import axios from 'axios'
import SaveAppModal from '@/components/rag-admin/SaveAppModal'

export default function NewRagAppPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { nodes, edges } = useRectFlow()

  // Save workflow changes
  const handleSave = async (formData: any) => {
    setIsLoading(true)
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

      const response = await axios.post('/api/rag-apps', payload)

      if (response.data.id) {
        router.push('/rag-admin')
      } else {
        throw new Error('Failed to create application')
      }
    } catch (err) {
      console.error('Failed to save RAG app:', err)
      setError(err instanceof Error ? err.message : 'Failed to save application')
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Create New RAG Application</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save & Publish'}
        </button>
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
          title: '',
          description: '',
          slug: '',
          status: 'draft',
          apiKeys: {},
          uiSettings: { theme: 'system', showWorkflow: false },
        }}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isLoading}
      />
    </div>
  )
}
