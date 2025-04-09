'use client'

import React, { useEffect, useState } from 'react'
import { useRectFlow } from '@/providers/RectFlowProvider'
import { ReactFlowInstance } from 'reactflow'

// Define global reactFlowInstance type
declare global {
  interface Window {
    reactFlowInstance?: ReactFlowInstance
  }
}

interface WorkflowInitializerProps {
  workflowData: any
}

const WorkflowInitializer: React.FC<WorkflowInitializerProps> = ({ workflowData }) => {
  const { clearWorkflow } = useRectFlow()
  const [initialized, setInitialized] = useState(false)

  // Initialize workflow data on component mount
  useEffect(() => {
    if (!workflowData) return

    // First clear any existing workflow
    clearWorkflow()

    // Parse workflow if it's a string
    let workflow: any
    if (typeof workflowData === 'string') {
      try {
        workflow = JSON.parse(workflowData)
      } catch (e) {
        console.error('Failed to parse workflow JSON:', e)
        workflow = { nodes: [], edges: [] }
      }
    } else {
      workflow = workflowData
    }

    // Add a delay to ensure React Flow is initialized
    const timer = setTimeout(() => {
      // Access the reactflow instance via global window object
      if (typeof window !== 'undefined' && window.document) {
        const event = new CustomEvent('workflow-load', {
          detail: {
            workflow,
          },
        })
        window.document.dispatchEvent(event)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [workflowData, clearWorkflow, initialized])

  // Nothing to render
  return null
}

export default WorkflowInitializer
