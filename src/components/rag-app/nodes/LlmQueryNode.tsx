import React from 'react'
import { Handle, Position } from 'reactflow'

interface LlmQueryNodeProps {
  data: {
    label: string
    description?: string
    nodeData?: {
      query?: string
      context?: string[]
      temperature?: number
    }
    executionResult?: {
      response?: string
      error?: string
    }
    isExecuting?: boolean
    status?: 'idle' | 'processing' | 'success' | 'error'
    updateNodeData?: (data: any) => void
    executeNode?: () => void
  }
}

const LlmQueryNode: React.FC<LlmQueryNodeProps> = ({ data }) => {
  const hasQuery = !!data.nodeData?.query

  return (
    <div className="relative bg-white dark:bg-gray-800 border rounded-md p-3 shadow-sm min-w-[220px]">
      {/* Input handle */}
      <Handle type="target" position={Position.Top} id="in" className="w-2 h-2 !bg-gray-500" />

      <div className="drag-handle cursor-move mb-2 font-semibold text-sm">
        {data.label || 'LLM Query'}
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.description}</div>
      )}

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Query</label>
        <textarea
          value={data.nodeData?.query || ''}
          onChange={(e) => data.updateNodeData?.({ query: e.target.value })}
          className="w-full text-xs p-1 border rounded h-16"
          placeholder="Enter your question or prompt"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">
          Temperature: {data.nodeData?.temperature || 0.7}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={data.nodeData?.temperature || 0.7}
          onChange={(e) => data.updateNodeData?.({ temperature: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      <div className="mt-2">
        <button
          onClick={data.executeNode}
          disabled={data.isExecuting || !hasQuery}
          className={`px-3 py-1 rounded-md text-white text-xs ${
            hasQuery ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {data.isExecuting ? 'Generating...' : 'Generate Response'}
        </button>
      </div>

      {data.executionResult?.error && (
        <div className="mt-2 text-xs text-red-500 p-1 bg-red-50 rounded">
          Error: {data.executionResult.error}
        </div>
      )}

      {data.executionResult?.response && (
        <div className="mt-2 text-xs">
          <div className="font-medium">Response:</div>
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded h-20 overflow-auto">
            {data.executionResult.response}
          </div>
        </div>
      )}

      {/* Output handle */}
      <Handle type="source" position={Position.Bottom} id="out" className="w-2 h-2 !bg-green-500" />
    </div>
  )
}

export default LlmQueryNode
