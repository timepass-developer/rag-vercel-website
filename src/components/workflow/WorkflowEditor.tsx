'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useRectFlow, NodeType } from '@/providers/RectFlowProvider'
import RagNode from './RagNode'
import 'reactflow/dist/style.css'
import { Plus, PlayCircle, Save, LayoutGrid, Trash, FileDown, FileUp } from 'lucide-react'
import ReactFlow, { Background, Controls, Panel, ReactFlowProvider } from 'reactflow'

// Define available node types
const NODE_TYPES = [
  { type: 'imageUpload', label: 'Image Upload' },
  { type: 'textExtraction', label: 'Text Extraction' },
  { type: 'translation', label: 'Translation' },
  { type: 'mistralTranslation', label: 'Mistral Translation' },
  { type: 'simplification', label: 'Simplification' },
  { type: 'memgraphStorage', label: 'Knowledge Storage' },
  { type: 'documentSearch', label: 'Document Search' },
  { type: 'questionAnswering', label: 'Question Answering' },
  { type: 'audioUpload', label: 'Audio Upload' },
  { type: 'videoUpload', label: 'Video Upload' },
  { type: 'audioTranscription', label: 'Audio Transcription' },
  { type: 'videoTranscription', label: 'Video Transcription' },
  { type: 'documentUpload', label: 'Document Upload' },
  { type: 'documentProcessing', label: 'Document Processing' },
  { type: 'documentChunking', label: 'Document Chunking' },
  { type: 'vectorization', label: 'Vectorization' },
]

// Define nodeTypes OUTSIDE the component
const nodeTypes = {
  ragNode: RagNode,
}

// Main workflow editor component
const WorkflowEditor: React.FC<{
  onSave?: (workflow: any) => void
}> = ({ onSave }) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearWorkflow,
    executeWorkflow,
    layoutNodes,
    isExecuting,
  } = useRectFlow()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [showNodeMenu, setShowNodeMenu] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Initialize component
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Listen for workflow-load event to load workflow data
  useEffect(() => {
    const handleWorkflowLoad = (event: any) => {
      if (!reactFlowInstance) return

      const workflow = event.detail?.workflow
      if (!workflow) return

      if (workflow.nodes && Array.isArray(workflow.nodes)) {
        reactFlowInstance.setNodes(workflow.nodes)
      }

      if (workflow.edges && Array.isArray(workflow.edges)) {
        reactFlowInstance.setEdges(workflow.edges)
      }

      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 })
      }, 100)
    }

    document.addEventListener('workflow-load', handleWorkflowLoad)

    // Expose reactFlowInstance to window for WorkflowInitializer to use
    if (reactFlowInstance) {
      // @ts-ignore
      window.reactFlowInstance = reactFlowInstance
    }

    return () => {
      document.removeEventListener('workflow-load', handleWorkflowLoad)
    }
  }, [reactFlowInstance])

  // Add a node at a specific position in the canvas
  const handleAddNode = useCallback(
    (type: NodeType) => {
      if (!reactFlowInstance) return

      const position = reactFlowInstance.project({ x: 100, y: 100 })
      addNode(type, position)
      setShowNodeMenu(false)
    },
    [reactFlowInstance, addNode],
  )

  // Save workflow to database
  const handleSaveToDatabase = useCallback(() => {
    if (!reactFlowInstance || !onSave) return

    const flow = reactFlowInstance.toObject()
    onSave(flow)
  }, [reactFlowInstance, onSave])

  // Save workflow to JSON
  const handleSaveWorkflow = useCallback(() => {
    if (!reactFlowInstance) return

    const flow = reactFlowInstance.toObject()
    const json = JSON.stringify(flow, null, 2)

    // Create download link
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rag-workflow-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [reactFlowInstance])

  // Load workflow from JSON
  const handleLoadWorkflow = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!reactFlowInstance || !event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0] as File
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          if (e.target?.result) {
            const flow = JSON.parse(e.target.result as string)

            // Clear current workflow
            clearWorkflow()

            // Need to use setTimeout to ensure the workflow is properly cleared first
            setTimeout(() => {
              if (reactFlowInstance) {
                reactFlowInstance.setNodes(flow.nodes || [])
                reactFlowInstance.setEdges(flow.edges || [])
                reactFlowInstance.setViewport(flow.viewport || { x: 0, y: 0, zoom: 1 })
              }
            }, 50)
          }
        } catch (err) {
          console.error('Error loading workflow:', err)
          alert('Failed to load workflow: Invalid file format')
        }
      }

      reader.readAsText(file)
    },
    [reactFlowInstance, clearWorkflow],
  )

  // Node menu
  const NodeMenu = () => (
    <div className="absolute top-16 left-4 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-10">
      <div className="mb-2 text-sm font-medium text-gray-700 px-2">Add Node</div>
      <div className="grid gap-1 max-h-96 overflow-y-auto">
        {NODE_TYPES.map((node) => (
          <button
            key={node.type}
            onClick={() => handleAddNode(node.type as NodeType)}
            className="flex items-center p-2 text-sm text-left hover:bg-indigo-50 rounded-md w-full"
          >
            <Plus size={14} className="mr-2" />
            <span>{node.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // Don't render ReactFlow until everything is ready
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3">Initializing workflow editor...</span>
      </div>
    )
  }

  // Wrap ReactFlow with its provider to ensure proper context initialization
  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlowProvider>
        {nodes && edges ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            onInit={setReactFlowInstance}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            className="bg-gray-50"
          >
            <Background color="#aaa" gap={16} size={1} />
            <Controls />

            <Panel position="top-left">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNodeMenu(!showNodeMenu)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm"
                >
                  <Plus size={16} className="mr-1" /> Add Node
                </button>

                <button
                  onClick={executeWorkflow}
                  disabled={isExecuting}
                  className={`px-3 py-2 border rounded-md flex items-center text-sm ${
                    isExecuting
                      ? 'bg-indigo-100 text-indigo-400 border-indigo-200 cursor-not-allowed'
                      : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
                  }`}
                >
                  <PlayCircle size={16} className="mr-1" /> Run
                </button>

                <button
                  onClick={layoutNodes}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm"
                >
                  <LayoutGrid size={16} className="mr-1" /> Auto Layout
                </button>
              </div>
              {showNodeMenu && <NodeMenu />}
            </Panel>

            <Panel position="top-right">
              <div className="flex space-x-2">
                <button
                  onClick={clearWorkflow}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm"
                >
                  <Trash size={16} className="mr-1" /> Clear
                </button>

                <input
                  type="file"
                  id="load-workflow"
                  onChange={handleLoadWorkflow}
                  accept=".json"
                  className="hidden"
                />

                <label
                  htmlFor="load-workflow"
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm cursor-pointer"
                >
                  <FileUp size={16} className="mr-1" /> Load
                </label>

                <button
                  onClick={handleSaveWorkflow}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center text-sm"
                >
                  <FileDown size={16} className="mr-1" /> Export
                </button>

                {onSave && (
                  <button
                    onClick={handleSaveToDatabase}
                    className="px-3 py-2 bg-indigo-600 text-white border border-indigo-700 rounded-md hover:bg-indigo-700 flex items-center text-sm"
                  >
                    <Save size={16} className="mr-1" /> Save
                  </button>
                )}
              </div>
            </Panel>
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full mr-2"></div>
            <span>Loading workflow data...</span>
          </div>
        )}
      </ReactFlowProvider>
    </div>
  )
}

export default WorkflowEditor
