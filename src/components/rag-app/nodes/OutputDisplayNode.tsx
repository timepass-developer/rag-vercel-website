import React from 'react'
import { Handle, Position } from 'reactflow'

interface OutputDisplayNodeProps {
  data: {
    label: string
    description?: string
    nodeData?: {
      format?: 'text' | 'json' | 'markdown'
    }
    executionResult?: any
    isExecuting?: boolean
    status?: 'idle' | 'processing' | 'success' | 'error'
    updateNodeData?: (data: any) => void
    executeNode?: () => void
  }
}

const OutputDisplayNode: React.FC<OutputDisplayNodeProps> = ({ data }) => {
  const format = data.nodeData?.format || 'text'

  // Format the output based on what we received and the selected format
  const formatOutput = () => {
    if (!data.executionResult) return 'No data available'

    if (data.executionResult.error) {
      return `Error: ${data.executionResult.error}`
    }

    // Try to find the most appropriate content to display
    const output =
      data.executionResult.response ||
      data.executionResult.text ||
      data.executionResult.translatedText ||
      data.executionResult.transcript ||
      data.executionResult

    if (typeof output === 'string') {
      return output
    }

    try {
      return JSON.stringify(output, null, 2)
    } catch (err) {
      return 'Unable to display output'
    }
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 border rounded-md p-3 shadow-sm min-w-[220px]">
      {/* Input handle */}
      <Handle type="target" position={Position.Top} id="in" className="w-2 h-2 !bg-gray-500" />

      <div className="drag-handle cursor-move mb-2 font-semibold text-sm">
        {data.label || 'Output Display'}
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.description}</div>
      )}

      <div className="mb-2 text-xs">
        <label className="block font-medium mb-1">Format</label>
        <select
          value={format}
          onChange={(e) => data.updateNodeData?.({ format: e.target.value })}
          className="w-full p-1 border rounded"
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Output</label>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded min-h-[100px] max-h-[200px] overflow-auto text-xs whitespace-pre-wrap">
          {formatOutput()}
        </div>
      </div>

      {/* No output handle as this is a terminal node */}
    </div>
  )
}

export default OutputDisplayNode
