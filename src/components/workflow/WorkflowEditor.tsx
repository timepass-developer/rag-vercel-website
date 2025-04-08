import React, { useCallback, useRef, useState } from 'react'
import ReactFlow, { Background, Controls, Panel } from 'reactflow'
import { useRectFlow, NodeType } from '@/providers/RectFlowProvider'
import RagNode from './RagNode'
import 'reactflow/dist/style.css'
import { Plus, PlayCircle, Save, LayoutGrid, Trash, FileDown, FileUp } from 'lucide-react'

// Define available node types
const NODE_TYPES = [
  { type: 'imageUpload', label: 'Image Upload' },
  { type: 'textExtraction', label: 'Text Extraction' },
  { type: 'translation', label: 'Translation' },
  { type: 'simplification', label: 'Simplification' },
  { type: 'memgraphStorage', label: 'Knowledge Storage' },
  { type: 'documentSearch', label: 'Document Search' },
  { type: 'questionAnswering', label: 'Question Answering' },
]

// Custom node types map
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

  // Add a node at a specific position in the canvas
  const handleAddNode = useCallback(
    (type: NodeType) => {
      const position = reactFlowInstance
        ? reactFlowInstance.project({ x: 100, y: 100 })
        : { x: 100, y: 100 }

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

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
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
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center space-x-1 px-3 py-2 bg-white text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              onClick={() => setShowNodeMenu(!showNodeMenu)}
            >
              <Plus size={16} />
              <span>Add Node</span>
            </button>

            <button
              className={`flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-sm text-white rounded-md shadow-sm ${
                isExecuting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
              }`}
              onClick={executeWorkflow}
              disabled={isExecuting}
            >
              <PlayCircle size={16} />
              <span>{isExecuting ? 'Running...' : 'Run Workflow'}</span>
            </button>

            {onSave && (
              <button
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-sm text-white rounded-md shadow-sm hover:bg-green-700"
                onClick={handleSaveToDatabase}
              >
                <Save size={16} />
                <span>Save</span>
              </button>
            )}

            <button
              className="flex items-center space-x-1 px-3 py-2 bg-white text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              onClick={layoutNodes}
            >
              <LayoutGrid size={16} />
              <span>Auto Layout</span>
            </button>
          </div>

          {showNodeMenu && <NodeMenu />}
        </Panel>

        <Panel position="top-right">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 px-3 py-2 bg-white text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer">
              <FileUp size={16} />
              <span>Load</span>
              <input type="file" accept=".json" onChange={handleLoadWorkflow} className="hidden" />
            </label>

            <button
              className="flex items-center space-x-1 px-3 py-2 bg-white text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              onClick={handleSaveWorkflow}
            >
              <FileDown size={16} />
              <span>Save</span>
            </button>

            <button
              className="flex items-center space-x-1 px-3 py-2 bg-white text-sm text-red-600 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              onClick={clearWorkflow}
            >
              <Trash size={16} />
              <span>Clear</span>
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default WorkflowEditor
