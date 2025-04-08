'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Dynamically load heavy component with no SSR to avoid hydration issues
const DynamicFileUploader = dynamic(() => import('./components/FileUploader'), { ssr: false })

// Node components for different functionalities
import DocumentProcessingNode from './nodes/DocumentProcessingNode'
import ImageProcessingNode from './nodes/ImageProcessingNode'
import LlmQueryNode from './nodes/LlmQueryNode'
import OutputDisplayNode from './nodes/OutputDisplayNode'
import TranslationNode from './nodes/TranslationNode'
import TranscriptionNode from './nodes/TranscriptionNode'
import VectorStoreNode from './nodes/VectorStoreNode'
import StartNode from './nodes/StartNode'

// Define node types mapping
const nodeTypes = {
  start: StartNode,
  documentProcessing: DocumentProcessingNode,
  imageProcessing: ImageProcessingNode,
  llmQuery: LlmQueryNode,
  outputDisplay: OutputDisplayNode,
  translation: TranslationNode,
  transcription: TranscriptionNode,
  vectorStore: VectorStoreNode,
  ragNode: dynamic(() => import('@/components/workflow/RagNode').then(mod => mod.default), { ssr: false }) as unknown as React.ComponentType<NodeProps>,
}

// Interface for the application props
interface RagAppRendererProps {
  workflow: {
    nodes: Node[]
    edges: Edge[]
  }
  config: any
  apiKeys: any
  uiSettings: any
}

export function RagAppRenderer({ workflow, config, apiKeys, uiSettings }: RagAppRendererProps) {
  // Parse the workflow if it's stored as a string
  const parsedWorkflow = useMemo(() => {
    if (typeof workflow === 'string') {
      try {
        return JSON.parse(workflow)
      } catch (e) {
        console.error('Failed to parse workflow:', e)
        return { nodes: [], edges: [] }
      }
    }
    return workflow || { nodes: [], edges: [] }
  }, [workflow])

  // Initialize nodes and edges from the saved workflow
  const initialNodes = useMemo(() => parsedWorkflow?.nodes || [], [parsedWorkflow])
  const initialEdges = useMemo(() => parsedWorkflow?.edges || [], [parsedWorkflow])

  // State for nodes, edges, and workflow execution
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeData, setNodeData] = useState<Record<string, any>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({})

  // Set up the theme based on UI settings
  const [theme, setTheme] = useState(uiSettings?.theme || 'system')

  // Listen for system theme changes if set to 'system'
  useEffect(() => {
    if (theme === 'system') {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }

      updateTheme(darkModeMediaQuery)
      darkModeMediaQuery.addEventListener('change', updateTheme)

      return () => darkModeMediaQuery.removeEventListener('change', updateTheme)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  // Connection handler for visual editor mode (if enabled)
  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds))
  }

  // Update node data (used by node components to store their state)
  const updateNodeData = (nodeId: string, data: any) => {
    setNodeData((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        ...data,
      },
    }))
  }

  // Execute a specific node
  const executeNode = async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    setIsExecuting(true)

    try {
      // Get incoming nodes to determine input data
      const incomingEdges = edges.filter((e) => e.target === nodeId)
      const inputData: Record<string, any> = {}

      // Collect data from incoming nodes
      for (const edge of incomingEdges) {
        const sourceNodeId = edge.source
        inputData[sourceNodeId] = executionResults[sourceNodeId]
      }

      // Based on node type, execute the appropriate function
      let result
      switch (node.data.nodeType) {
        case 'documentProcessing':
          result = await executeDocumentProcessing(nodeData[nodeId], inputData)
          break
        case 'imageProcessing':
          result = await executeImageProcessing(nodeData[nodeId], inputData)
          break
        case 'llmQuery':
          result = await executeLlmQuery(nodeData[nodeId], inputData, apiKeys)
          break
        case 'translation':
          result = await executeTranslation(nodeData[nodeId], inputData, apiKeys)
          break
        case 'transcription':
          result = await executeTranscription(nodeData[nodeId], inputData, apiKeys)
          break
        case 'vectorStore':
          result = await executeVectorStore(nodeData[nodeId], inputData)
          break
        case 'outputDisplay':
          // Output nodes don't need to execute anything, they just display
          result = inputData
          break
        default:
          result = inputData
      }

      // Store result for this node
      setExecutionResults((prev) => ({
        ...prev,
        [nodeId]: result,
      }))

      // Automatically execute downstream nodes if auto-execution is enabled
      const outgoingEdges = edges.filter((e) => e.source === nodeId)
      for (const edge of outgoingEdges) {
        const targetNodeId = edge.target
        const targetNode = nodes.find((n) => n.id === targetNodeId)

        // Only auto-execute if target node has autoExecute flag
        if (targetNode && targetNode.data.autoExecute) {
          await executeNode(targetNodeId)
        }
      }

      return result
    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error)
      setExecutionResults((prev) => ({
        ...prev,
        [nodeId]: { error: error instanceof Error ? error.message : 'An error occurred' },
      }))
    } finally {
      setIsExecuting(false)
    }
  }

  // Start executing the workflow from the start node
  const executeWorkflow = async () => {
    const startNode = nodes.find((node) => node.data.nodeType === 'start')
    if (startNode) {
      await executeNode(startNode.id)
    }
  }

  // These functions would be implemented to handle actual node functionality
  const executeDocumentProcessing = async (nodeConfig: any, inputData: any) => {
    // Implementation would go here
    return { text: 'Processed document content...', chunks: ['Chunk 1', 'Chunk 2'] }
  }

  const executeImageProcessing = async (nodeConfig: any, inputData: any) => {
    // Implementation would go here
    return { caption: 'Image caption...', tags: ['tag1', 'tag2'] }
  }

  const executeLlmQuery = async (nodeConfig: any, inputData: any, apiKeys: any) => {
    // Implementation would go here
    return { response: 'LLM response to query...' }
  }

  const executeTranslation = async (nodeConfig: any, inputData: any, apiKeys: any) => {
    // Implementation would go here
    return { translatedText: 'Translated content...' }
  }

  const executeTranscription = async (nodeConfig: any, inputData: any, apiKeys: any) => {
    // Implementation would go here
    return { transcript: 'Audio transcript...' }
  }

  const executeVectorStore = async (nodeConfig: any, inputData: any) => {
    // Implementation would go here
    return { vectorIds: ['id1', 'id2'], status: 'stored' }
  }

  // Determine if we should show the workflow view or just the UI
  const showWorkflowView = uiSettings?.showWorkflow === true

  return (
    <div className="rag-app-renderer">
      {showWorkflowView ? (
        <div style={{ height: 500 }}>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                nodeData: nodeData[node.id],
                executionResult: executionResults[node.id],
                isExecuting: isExecuting && executionResults[node.id]?.processing,
                updateNodeData: (data: any) => updateNodeData(node.id, data),
                executeNode: () => executeNode(node.id),
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      ) : (
        // Standard UI view for end users
        <div className="standard-view">
          {/* App content based on the nodes and their configuration */}
          <div className="flex flex-col gap-6">
            {/* Input section */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Input</h2>

              {config?.features?.documentProcessing && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Upload Documents</h3>
                  <DynamicFileUploader
                    onFileSelected={(files) => {
                      // Find document processing node and update its data
                      const docNode = nodes.find((n) => n.data.nodeType === 'documentProcessing')
                      if (docNode) {
                        updateNodeData(docNode.id, { files })
                      }
                    }}
                    acceptedFileTypes={'.pdf,.docx,.txt'}
                  />
                </div>
              )}

              {config?.features?.imageProcessing && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Upload Images</h3>
                  <DynamicFileUploader
                    onFileSelected={(files) => {
                      const imgNode = nodes.find((n) => n.data.nodeType === 'imageProcessing')
                      if (imgNode) {
                        updateNodeData(imgNode.id, { files })
                      }
                    }}
                    acceptedFileTypes={'.jpg,.jpeg,.png'}
                  />
                </div>
              )}

              {config?.features?.audioTranscription && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Upload Audio</h3>
                  <DynamicFileUploader
                    onFileSelected={(files) => {
                      const audioNode = nodes.find((n) => n.data.nodeType === 'transcription')
                      if (audioNode) {
                        updateNodeData(audioNode.id, { files })
                      }
                    }}
                    acceptedFileTypes={'.mp3,.wav,.m4a'}
                  />
                </div>
              )}

              {/* Query input field */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Ask a question</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your query..."
                    onChange={(e) => {
                      const llmNode = nodes.find((n) => n.data.nodeType === 'llmQuery')
                      if (llmNode) {
                        updateNodeData(llmNode.id, { query: e.target.value })
                      }
                    }}
                  />
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={executeWorkflow}
                    disabled={isExecuting}
                  >
                    {isExecuting ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </div>
            </section>

            {/* Output section */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Results</h2>

              {/* Find the output display node and show its results */}
              {nodes.map((node) => {
                if (node.data.nodeType === 'outputDisplay') {
                  const result = executionResults[node.id]

                  if (!result) {
                    return (
                      <div key={node.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">
                          No results yet. Submit a query to see results.
                        </p>
                      </div>
                    )
                  }

                  if (result.error) {
                    return (
                      <div key={node.id} className="p-4 bg-red-50 text-red-700 rounded-md">
                        <p>Error: {result.error}</p>
                      </div>
                    )
                  }

                  // Display the response from the LLM
                  const llmResponse =
                    result.response ||
                    Object.values(result).find(
                      (val): val is { response: string } => 
                        val !== null && typeof val === 'object' && 'response' in val
                    )?.response

                  return (
                    <div key={node.id} className="prose dark:prose-invert max-w-none">
                      {llmResponse ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                          {llmResponse}
                        </div>
                      ) : (
                        <pre className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md overflow-auto">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      )}
                    </div>
                  )
                }
                return null
              })}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
