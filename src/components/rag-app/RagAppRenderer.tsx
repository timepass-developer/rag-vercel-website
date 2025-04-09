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
import { AlertTriangle, Loader } from 'lucide-react'

// Dynamically load heavy components with no SSR to avoid hydration issues
const DynamicFileUploader = dynamic(() => import('./components/FileUploader'), { ssr: false })

// Node components for different functionalities
const DocumentProcessingNode = dynamic(() => import('./nodes/DocumentProcessingNode'), {
  ssr: false,
})
const ImageProcessingNode = dynamic(() => import('./nodes/ImageProcessingNode'), { ssr: false })
const LlmQueryNode = dynamic(() => import('./nodes/LlmQueryNode'), { ssr: false })
const OutputDisplayNode = dynamic(() => import('./nodes/OutputDisplayNode'), { ssr: false })
const TranslationNode = dynamic(() => import('./nodes/TranslationNode'), { ssr: false })
const TranscriptionNode = dynamic(() => import('./nodes/TranscriptionNode'), { ssr: false })
const VectorStoreNode = dynamic(() => import('./nodes/VectorStoreNode'), { ssr: false })
const StartNode = dynamic(() => import('./nodes/StartNode'), { ssr: false })
const RagNode = dynamic(() => import('@/components/workflow/RagNode').then((mod) => mod.default), {
  ssr: false,
})

// Define node types mapping
const nodeTypes = {
  start: StartNode as unknown as React.ComponentType<NodeProps>,
  documentProcessing: DocumentProcessingNode as unknown as React.ComponentType<NodeProps>,
  imageProcessing: ImageProcessingNode as unknown as React.ComponentType<NodeProps>,
  llmQuery: LlmQueryNode as unknown as React.ComponentType<NodeProps>,
  outputDisplay: OutputDisplayNode as unknown as React.ComponentType<NodeProps>,
  translation: TranslationNode as unknown as React.ComponentType<NodeProps>,
  transcription: TranscriptionNode as unknown as React.ComponentType<NodeProps>,
  vectorStore: VectorStoreNode as unknown as React.ComponentType<NodeProps>,
  ragNode: RagNode as unknown as React.ComponentType<NodeProps>,
}

// Interface for the application props
interface RagAppRendererProps {
  workflow:
    | {
        nodes: Node[]
        edges: Edge[]
      }
    | string
  config: {
    features: {
      documentProcessing: boolean
      imageProcessing: boolean
      audioTranscription: boolean
      videoProcessing?: boolean
    }
  }
  apiKeys: Record<string, string>
  uiSettings: {
    theme: 'light' | 'dark' | 'system'
    showWorkflow: boolean
  }
}

export const RagAppRenderer: React.FC<RagAppRendererProps> = ({
  workflow,
  config,
  apiKeys,
  uiSettings,
}) => {
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
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeData, setNodeData] = useState<Record<string, any>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('input')

  // Query input state management
  const [queryInput, setQueryInput] = useState('')
  const [files, setFiles] = useState<Record<string, File[]>>({
    documents: [],
    images: [],
    audio: [],
    video: [],
  })

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

  // Handle file selection based on file type
  const handleFileSelected = (
    fileType: 'documents' | 'images' | 'audio' | 'video',
    selectedFiles: File[],
  ) => {
    setFiles((prev) => ({
      ...prev,
      [fileType]: selectedFiles,
    }))

    // Update the corresponding node data
    const nodeTypeMap = {
      documents: 'documentProcessing',
      images: 'imageProcessing',
      audio: 'transcription',
      video: 'videoProcessing', // If you implement a video processing node
    }

    const nodeType = nodeTypeMap[fileType]
    const targetNode = nodes.find((n) => n.data.nodeType === nodeType)

    if (targetNode) {
      updateNodeData(targetNode.id, { files: selectedFiles })
    }
  }

  // Execute a specific node
  const executeNode = async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    setIsExecuting(true)
    setErrorMessage(null)

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
          result = await executeLlmQuery(
            nodeData[nodeId] || { query: queryInput },
            inputData,
            apiKeys,
          )
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

      // After execution completes, switch to results tab for better UX
      if (!uiSettings?.showWorkflow) {
        setActiveTab('results')
      }

      return result
    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error)
      const errorMsg = error instanceof Error ? error.message : 'An error occurred'
      setErrorMessage(errorMsg)
      setExecutionResults((prev) => ({
        ...prev,
        [nodeId]: { error: errorMsg },
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
    } else {
      // If there's no start node, find nodes with no incoming edges
      const nodesWithNoInputs = nodes.filter(
        (node) => !edges.some((edge) => edge.target === node.id),
      )

      // Execute these nodes in sequence
      for (const node of nodesWithNoInputs) {
        await executeNode(node.id)
      }
    }
  }

  // Placeholder implementations for node execution - would be replaced by actual implementations
  const executeDocumentProcessing = async (nodeConfig: any, inputData: any) => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Implementation would go here
    return { text: 'Processed document content...', chunks: ['Chunk 1', 'Chunk 2'] }
  }

  const executeImageProcessing = async (nodeConfig: any, inputData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Implementation would go here
    return { caption: 'Image caption...', tags: ['tag1', 'tag2'] }
  }

  const executeLlmQuery = async (nodeConfig: any, inputData: any, apiKeys: any) => {
    // Simulate LLM processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const query = nodeConfig?.query || 'Default query'

    try {
      // In a production implementation, this would use actual API calls
      // For now just return a mock response
      return {
        response: `This is a simulated response to your query: "${query}". In a real implementation, this would call an LLM API using the provided API keys and context from previous nodes.`,
        sourceDocuments: inputData?.documentProcessing?.chunks || [],
      }
    } catch (error) {
      console.error('LLM query error:', error)
      throw new Error(
        `Failed to process LLM query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  const executeTranslation = async (nodeConfig: any, inputData: any, apiKeys: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // Implementation would go here
    return { translatedText: 'Translated content...' }
  }

  const executeTranscription = async (nodeConfig: any, inputData: any, apiKeys: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // Implementation would go here
    return { transcript: 'Audio transcript...' }
  }

  const executeVectorStore = async (nodeConfig: any, inputData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Implementation would go here
    return { vectorIds: ['id1', 'id2'], status: 'stored' }
  }

  // Determine if we should show the workflow view or just the UI
  const showWorkflowView = uiSettings?.showWorkflow === true

  return (
    <div className="rag-app-renderer">
      {/* Show error message if any */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center text-red-600">
          <AlertTriangle size={18} className="mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}

      {showWorkflowView ? (
        <div className="h-[500px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
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

          <div className="absolute top-4 right-4 z-10">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              onClick={executeWorkflow}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <Loader size={16} className="inline animate-spin mr-2" />
                  Running...
                </>
              ) : (
                'Run Workflow'
              )}
            </button>
          </div>
        </div>
      ) : (
        // Standard UI view for end users
        <div className="standard-view">
          {/* App content based on the nodes and their configuration */}
          <div className="flex flex-col gap-6">
            {/* Tabs navigation for input/results */}
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 ${activeTab === 'input' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('input')}
              >
                Input
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'results' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('results')}
              >
                Results
              </button>
            </div>

            {activeTab === 'input' && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Input</h2>

                {config?.features?.documentProcessing && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Upload Documents</h3>
                    <DynamicFileUploader
                      onFileSelected={(files) => handleFileSelected('documents', files)}
                      acceptedFileTypes={'.pdf,.docx,.txt'}
                    />
                    {files?.documents && files.documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">
                          {files.documents.length} document(s) selected
                        </p>
                        <ul className="text-xs text-gray-500 mt-1">
                          {files.documents.map((file, idx) => (
                            <li key={idx} className="truncate">
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {config?.features?.imageProcessing && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Upload Images</h3>
                    <DynamicFileUploader
                      onFileSelected={(files) => handleFileSelected('images', files)}
                      acceptedFileTypes={'.jpg,.jpeg,.png'}
                    />
                    {files.images && files.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">
                          {files.images.length} image(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {config?.features?.audioTranscription && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Upload Audio</h3>
                    <DynamicFileUploader
                      onFileSelected={(files) => handleFileSelected('audio', files)}
                      acceptedFileTypes={'.mp3,.wav,.m4a'}
                    />
                    {files.audio && files.audio.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">
                          {files.audio.length} audio file(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {config?.features?.videoProcessing && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Upload Video</h3>
                    <DynamicFileUploader
                      onFileSelected={(files) => handleFileSelected('video', files)}
                      acceptedFileTypes={'.mp4,.mov,.avi'}
                    />
                    {files.video && files.video.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">
                          {files.video.length} video file(s) selected
                        </p>
                      </div>
                    )}
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
                      value={queryInput}
                      onChange={(e) => {
                        setQueryInput(e.target.value)
                        // Update LLM node data if it exists
                        const llmNode = nodes.find((n) => n.data.nodeType === 'llmQuery')
                        if (llmNode) {
                          updateNodeData(llmNode.id, { query: e.target.value })
                        }
                      }}
                      disabled={isExecuting}
                    />
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={executeWorkflow}
                      disabled={
                        isExecuting ||
                        (!queryInput.trim() && !Object.values(files).some((arr) => arr.length > 0))
                      }
                    >
                      {isExecuting ? (
                        <>
                          <Loader size={16} className="inline animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Results section - shown by default or when activeTab is 'results' */}
            {(activeTab === 'results' || !['input', 'results'].includes(activeTab)) && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Results</h2>

                {isExecuting && (
                  <div className="flex items-center justify-center p-8">
                    <Loader size={24} className="animate-spin mr-3" />
                    <span>Processing your request...</span>
                  </div>
                )}

                {/* Find the output display node and show its results */}
                {!isExecuting &&
                  nodes.map((node) => {
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
                            val !== null && typeof val === 'object' && 'response' in val,
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

                {/* If no output display nodes found, show the last execution result */}
                {!isExecuting &&
                  !nodes.some((node) => node.data.nodeType === 'outputDisplay') &&
                  Object.keys(executionResults).length > 0 && (
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md overflow-auto">
                        {JSON.stringify(
                          (() => {
                            const keys = Object.keys(executionResults);
                            const lastKey = keys.length > 0 ? keys[keys.length - 1] : null;
                            return lastKey !== null 
                              ? executionResults[lastKey as string]
                              : null;
                          })(),
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  )}
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
