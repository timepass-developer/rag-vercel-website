'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Import styles directly - this is important to prevent style flashing
import 'reactflow/dist/style.css'

// Dynamically import WorkflowEditor with SSR disabled
const WorkflowEditor = dynamic(() => import('./WorkflowEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <Loader2 className="animate-spin h-8 w-8 mr-2 text-indigo-500" />
      <span>Loading editor modules...</span>
    </div>
  ),
})

interface SafeWorkflowEditorProps {
  onSave?: (workflow: any) => void
}

const SafeWorkflowEditor: React.FC<SafeWorkflowEditorProps> = ({ onSave }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Add a timeout to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 mr-2 text-indigo-500" />
        <span>Initializing editor environment...</span>
      </div>
    )
  }

  return <WorkflowEditor onSave={onSave} />
}

export default SafeWorkflowEditor
