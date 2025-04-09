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

    // Wait for reactFlowInstance to be available
    const checkAndInitialize = () => {
      if (window.reactFlowInstance) {
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

        // After clearing, inject the nodes and edges directly
        if (workflow.nodes && Array.isArray(workflow.nodes)) {
          window.reactFlowInstance.setNodes(workflow.nodes)
        }

        if (workflow.edges && Array.isArray(workflow.edges)) {
          window.reactFlowInstance.setEdges(workflow.edges)
        }

        setInitialized(true)
      } else {
        // Try again in a moment
        setTimeout(checkAndInitialize, 100)
      }
    }

    if (!initialized) {
      checkAndInitialize()
    }
  }, [workflowData, clearWorkflow, initialized])

  // Nothing to render
  return null
}

export default WorkflowInitializer
