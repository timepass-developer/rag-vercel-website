'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  addEdge,
  Connection,
  MarkerType,
  NodeChange,
  EdgeChange,
} from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

// Node types for RAG workflow
export type NodeType =
  | 'imageUpload'
  | 'textExtraction'
  | 'translation'
  | 'mistralTranslation'
  | 'simplification'
  | 'memgraphStorage'
  | 'questionAnswering'
  | 'documentSearch'
  | 'audioUpload'
  | 'videoUpload'
  | 'audioTranscription'
  | 'videoTranscription'
  | 'documentUpload'
  | 'documentProcessing'
  | 'documentChunking'
  | 'vectorization'

// Node data structure
export interface RagNodeData {
  label: string
  type: NodeType
  description: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  status: 'idle' | 'processing' | 'success' | 'error'
  message?: string
  error?: string
}

// Custom node definition extending ReactFlow's Node
export interface RagNode extends Node<RagNodeData> {
  type: string
}

interface RectFlowContextType {
  nodes: RagNode[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: NodeType, position: { x: number; y: number }) => void
  updateNodeData: (id: string, data: Partial<RagNodeData>) => void
  deleteNode: (id: string) => void
  getNode: (id: string) => RagNode | undefined
  clearWorkflow: () => void
  executeNode: (id: string) => Promise<unknown>
  executeWorkflow: () => Promise<void>
  isExecuting: boolean
  layoutNodes: () => void
}

const RectFlowContext = createContext<RectFlowContextType>({
  nodes: [],
  edges: [],
  onNodesChange: () => {},
  onEdgesChange: () => {},
  onConnect: () => {},
  addNode: () => {},
  updateNodeData: () => {},
  deleteNode: () => {},
  getNode: () => undefined,
  clearWorkflow: () => {},
  executeNode: async () => {},
  executeWorkflow: async () => {},
  isExecuting: false,
  layoutNodes: () => {},
})

export const useRectFlow = () => useContext(RectFlowContext)

// Wrapped provider component
const InnerRectFlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<RagNodeData>([]) as [RagNode[], React.Dispatch<React.SetStateAction<RagNode[]>>, (changes: NodeChange[]) => void]
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isExecuting, setIsExecuting] = useState(false)

  // Add a new node to the workflow
  const addNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const nodeData = getDefaultNodeData(type)

      const newNode: RagNode = {
        id: `${type}-${uuidv4()}`,
        type: 'ragNode', // Custom node component type
        position,
        data: nodeData,
        dragHandle: '.drag-handle',
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes],
  )

  // Get node by ID
  const getNode = useCallback(
    (id: string) => {
      return nodes.find((node) => node.id === id)
    },
    [nodes],
  )

  // Update node data
  const updateNodeData = useCallback(
    (id: string, data: Partial<RagNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  // Delete a node
  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id))
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
    },
    [setNodes, setEdges],
  )

  // Connect nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            animated: true,
            style: { stroke: '#4F46E5' },
          },
          eds,
        ),
      )
    },
    [setEdges],
  )

  // Clear the workflow
  const clearWorkflow = useCallback(() => {
    setNodes([])
    setEdges([])
  }, [setNodes, setEdges])

  // Execute a single node
  const executeNode = useCallback(
    async (id: string) => {
      const node = getNode(id)
      if (!node) return

      // Set node to processing state
      updateNodeData(id, { status: 'processing' })

      try {
        // This would be replaced with actual implementation based on node type
        // For now, just simulate an async operation
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Set success state
        updateNodeData(id, {
          status: 'success',
          message: 'Execution completed successfully',
        })

        // In a real implementation, return the node's output
        return { success: true, data: node.data.outputs }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        updateNodeData(id, {
          status: 'error',
          error: errorMessage,
        })
        return { success: false, error: errorMessage }
      }
    },
    [getNode, updateNodeData],
  )

  // Process a node and all its dependents recursively
  const processNodeAndDependents = useCallback(
    async (nodeId: string) => {
      // Execute current node
      await executeNode(nodeId)

      // Find all edges that have this node as source
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId)

      // Process all target nodes
      for (const edge of outgoingEdges) {
        await processNodeAndDependents(edge.target)
      }
    },
    [edges, executeNode],
  )

  // Execute the entire workflow
  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)

    try {
      // Reset all nodes to idle state
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, status: 'idle', message: undefined, error: undefined },
        })),
      )

      // Get all nodes without incoming edges (source nodes)
      const sourceNodes = nodes.filter((node) => {
        return !edges.some((edge) => edge.target === node.id)
      })

      // Process nodes in topological order
      // This is a simplified version - a real implementation would use
      // a proper topological sort algorithm
      for (const node of sourceNodes) {
        await processNodeAndDependents(node.id)
      }
    } finally {
      setIsExecuting(false)
    }
  }, [nodes, edges, processNodeAndDependents, setNodes])

  // Auto-layout nodes in a top-to-bottom flow
  const layoutNodes = useCallback(() => {
    // Simple layout algorithm for demonstration
    const nodeMap: Map<string, { node: RagNode; level: number; processed: boolean }> = new Map()

    // Initialize node map
    nodes.forEach((node) => {
      nodeMap.set(node.id, { node: node as RagNode, level: 0, processed: false })
    })

    // Compute node levels based on dependencies
    let changed = true
    while (changed) {
      changed = false
      edges.forEach((edge) => {
        const sourceInfo = nodeMap.get(edge.source)
        const targetInfo = nodeMap.get(edge.target)
        if (sourceInfo && targetInfo) {
          const newLevel = sourceInfo.level + 1
          if (newLevel > targetInfo.level) {
            targetInfo.level = newLevel
            changed = true
          }
        }
      })
    }

    // Group nodes by level
    const levelGroups: RagNode[][] = []
    nodeMap.forEach((info) => {
      if (!levelGroups[info.level]) {
        levelGroups[info.level] = []
      }
      // Now we know levelGroups[info.level] exists
      levelGroups[info.level]!.push(info.node)
    })

    // Position nodes based on their level
    const VERTICAL_SPACING = 150
    const HORIZONTAL_SPACING = 250

    const newNodes = [...nodes]
    levelGroups.forEach((levelNodes, level) => {
      const levelWidth = levelNodes.length * HORIZONTAL_SPACING
      const startX = (1500 - levelWidth) / 2 + HORIZONTAL_SPACING / 2

      levelNodes.forEach((node, index) => {
        const nodeToUpdate = newNodes.find((n) => n.id === node.id)
        if (nodeToUpdate) {
          nodeToUpdate.position = {
            x: startX + index * HORIZONTAL_SPACING,
            y: level * VERTICAL_SPACING + 100,
          }
        }
      })
    })

    setNodes(newNodes)
  }, [nodes, edges, setNodes])

  const value = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    getNode,
    clearWorkflow,
    executeNode,
    executeWorkflow,
    isExecuting,
    layoutNodes,
  }

  return <RectFlowContext.Provider value={value}>{children}</RectFlowContext.Provider>
}

// Helper function to get default node data based on type
function getDefaultNodeData(type: NodeType): RagNodeData {
  switch (type) {
    case 'imageUpload':
      return {
        label: 'Image Upload',
        type,
        description: 'Upload an image to extract text from',
        inputs: {},
        outputs: { file: null },
        status: 'idle',
      }
    case 'textExtraction':
      return {
        label: 'Text Extraction',
        type,
        description: 'Extract text from uploaded image',
        inputs: { file: null },
        outputs: { text: '', language: '' },
        status: 'idle',
      }
    case 'translation':
      return {
        label: 'Translation',
        type,
        description: 'Translate text to another language (uses default model)',
        inputs: { text: '', sourceLanguage: '' },
        outputs: { translatedText: '', targetLanguage: 'English' },
        status: 'idle',
      }
    case 'mistralTranslation':
      return {
        label: 'Mistral Translation',
        type,
        description: 'High-quality translation specialized for maintaining tone and style',
        inputs: { text: '', sourceLanguage: 'auto', targetLanguage: 'English' },
        outputs: { translatedText: '' },
        status: 'idle',
      }
    case 'simplification':
      return {
        label: 'Simplification',
        type,
        description: 'Explain text in simpler terms',
        inputs: { text: '' },
        outputs: { simplifiedText: '' },
        status: 'idle',
      }
    case 'memgraphStorage':
      return {
        label: 'Knowledge Storage',
        type,
        description: 'Save information to Memgraph',
        inputs: { text: '', metadata: {} },
        outputs: { documentId: '' },
        status: 'idle',
      }
    case 'questionAnswering':
      return {
        label: 'Question Answering',
        type,
        description: 'Answer questions using stored knowledge',
        inputs: { question: '', context: [] },
        outputs: { answer: '' },
        status: 'idle',
      }
    case 'documentSearch':
      return {
        label: 'Document Search',
        type,
        description: 'Search for documents in the knowledge base',
        inputs: { query: '' },
        outputs: { documents: [] },
        status: 'idle',
      }
    case 'audioUpload':
      return {
        label: 'Audio Upload',
        type,
        description: 'Upload an audio file for transcription',
        inputs: {},
        outputs: { file: null },
        status: 'idle',
      }
    case 'videoUpload':
      return {
        label: 'Video Upload',
        type,
        description: 'Upload a video file for transcription',
        inputs: {},
        outputs: { file: null },
        status: 'idle',
      }
    case 'audioTranscription':
      return {
        label: 'Audio Transcription',
        type,
        description: 'Transcribe speech from audio using AssemblyAI',
        inputs: { file: null, speakerDiarization: false, speakers: 2 },
        outputs: { text: '', segments: [], speakers: [] },
        status: 'idle',
      }
    case 'videoTranscription':
      return {
        label: 'Video Transcription',
        type,
        description: 'Extract speech from video and transcribe using AssemblyAI',
        inputs: { file: null, speakerDiarization: false, speakers: 2 },
        outputs: { text: '', segments: [], speakers: [] },
        status: 'idle',
      }
    case 'documentUpload':
      return {
        label: 'Document Upload',
        type,
        description: 'Upload a document (PDF, DOCX, TXT, etc.)',
        inputs: {},
        outputs: { file: null },
        status: 'idle',
      }
    case 'documentProcessing':
      return {
        label: 'Document Processing',
        type,
        description: 'Extract text and metadata from documents',
        inputs: { file: null },
        outputs: { text: '', metadata: {} },
        status: 'idle',
      }
    case 'documentChunking':
      return {
        label: 'Document Chunking',
        type,
        description: 'Split document into manageable chunks',
        inputs: { text: '', chunkSize: 1000, chunkOverlap: 200 },
        outputs: { chunks: [] },
        status: 'idle',
      }
    case 'vectorization':
      return {
        label: 'Text Vectorization',
        type,
        description: 'Generate embeddings for text chunks',
        inputs: { chunks: [] },
        outputs: { vectorizedChunks: [] },
        status: 'idle',
      }
    default:
      return {
        label: 'Unknown Node',
        type: type as NodeType,
        description: 'Unknown node type',
        inputs: {},
        outputs: {},
        status: 'idle',
      }
  }
}

// Export the provider with ReactFlow wrapper
export const RectFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactFlowProvider>
      <InnerRectFlowProvider>{children}</InnerRectFlowProvider>
    </ReactFlowProvider>
  )
}
