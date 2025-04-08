import React from 'react'
import { Handle, Position } from 'reactflow'

interface StartNodeProps {
  data: {
    label: string
    description?: string
    isExecuting?: boolean
    status?: 'idle' | 'processing' | 'success' | 'error'
    executeNode?: () => void
  }
}

const StartNode: React.FC<StartNodeProps> = ({ data }) => {
  return (
    <div className="relative bg-white dark:bg-gray-800 border rounded-md p-3 shadow-sm min-w-[180px]">
      <div className="drag-handle cursor-move mb-2 text-center font-semibold text-sm">
        {data.label || 'Start'}
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.description}</div>
      )}

      <div className="flex justify-center mt-2">
        <button
          onClick={data.executeNode}
          disabled={data.isExecuting}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs"
        >
          {data.isExecuting ? 'Starting...' : 'Start Workflow'}
        </button>
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Bottom} id="out" className="w-2 h-2 !bg-green-500" />
    </div>
  )
}

export default StartNode
