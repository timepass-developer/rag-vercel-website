import React from 'react'
import RagAdminBuilder from '@/components/rag-admin/builder/page'

// In Next.js App Router, page components automatically receive params and searchParams
export default function RagAdminNewPage() {
  // Create a new RAG app workflow using the builder
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Create New RAG App</h1>
      <RagAdminBuilder mode="create" />
    </div>
  )
}
