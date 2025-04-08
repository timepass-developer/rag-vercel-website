import React from 'react'
import { Handle, Position } from 'reactflow'

interface VectorStoreNodeProps {
  data: {
    label: string
    description?: string
    nodeData?: {
      text?: string
      metadata?: Record<string, any>
    }
    executionResult?: {
      documentId?: string
      status?: string
      error?: string
    }
    isExecuting?: boolean
    status?: 'idle' | 'processing' | 'success' | 'error'
    updateNodeData?: (data: any) => void
    executeNode?: () => void
  }
}

const VectorStoreNode: React.FC<VectorStoreNodeProps> = ({ data }) => {
  const hasInputText = !!data.nodeData?.text

  return (
    <div className="relative bg-white dark:bg-gray-800 border rounded-md p-3 shadow-sm min-w-[220px]">
      {/* Input handle */}
      <Handle type="target" position={Position.Top} id="in" className="w-2 h-2 !bg-gray-500" />

      <div className="drag-handle cursor-move mb-2 font-semibold text-sm">
        {data.label || 'Vector Store'}
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.description}</div>
      )}

      <div className="mb-2 text-xs">
        <label className="block font-medium mb-1">Content</label>
        {hasInputText ? (
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded h-16 overflow-auto">
            {data.nodeData?.text?.substring(0, 150)}
            {data.nodeData?.text && data.nodeData.text.length > 150 && '...'}
          </div>
        ) : (
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded text-gray-400">
            No content yet. Connect to a content source node.
          </div>
        )}
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Metadata</label>
        <input
          type="text"
          value={JSON.stringify(data.nodeData?.metadata || {})}
          onChange={(e) => {
            try {
              const metadata = JSON.parse(e.target.value)
              data.updateNodeData?.({ metadata })
            } catch (err) {
              // Invalid JSON, ignore
            }
          }}
          className="w-full text-xs p-1 border rounded"
          placeholder='{"key": "value"}'
        />
      </div>

      <div className="mt-2">
        <button
          onClick={data.executeNode}
          disabled={data.isExecuting || !hasInputText}
          className={`px-3 py-1 rounded-md text-white text-xs ${
            hasInputText ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {data.isExecuting ? 'Storing...' : 'Store in Vector DB'}
        </button>
      </div>

      {data.executionResult?.error && (
        <div className="mt-2 text-xs text-red-500 p-1 bg-red-50 rounded">
          Error: {data.executionResult.error}
        </div>
      )}

      {data.executionResult?.documentId && (
        <div className="mt-2 text-xs">
          <div className="font-medium">Success:</div>
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded">
            Document ID: {data.executionResult.documentId}
          </div>
        </div>
      )}

      {/* Output handle */}
      <Handle type="source" position={Position.Bottom} id="out" className="w-2 h-2 !bg-cyan-500" />
    </div>
  )
}

export default VectorStoreNode
