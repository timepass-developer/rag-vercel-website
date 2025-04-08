import React, { useCallback } from 'react'
import { Handle, Position } from 'reactflow'

interface ImageProcessingNodeProps {
  data: {
    label: string
    description?: string
    nodeData?: {
      files?: File[]
      mode?: 'text' | 'analysis'
    }
    executionResult?: {
      text?: string
      caption?: string
      tags?: string[]
      error?: string
    }
    isExecuting?: boolean
    status?: 'idle' | 'processing' | 'success' | 'error'
    updateNodeData?: (data: any) => void
    executeNode?: () => void
  }
}

const ImageProcessingNode: React.FC<ImageProcessingNodeProps> = ({ data }) => {
  const hasFiles = data.nodeData?.files && data.nodeData.files.length > 0

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        data.updateNodeData?.({ files: Array.from(e.target.files) })
      }
    },
    [data.updateNodeData],
  )

  return (
    <div className="relative bg-white dark:bg-gray-800 border rounded-md p-3 shadow-sm min-w-[220px]">
      {/* Input handle */}
      <Handle type="target" position={Position.Top} id="in" className="w-2 h-2 !bg-gray-500" />

      <div className="drag-handle cursor-move mb-2 font-semibold text-sm">
        {data.label || 'Image Processing'}
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{data.description}</div>
      )}

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Upload Image</label>
        <input
          type="file"
          onChange={handleFileUpload}
          accept="image/*"
          className="text-xs w-full"
        />
      </div>

      {hasFiles && (
        <div className="mb-2 text-xs">
          <div className="font-medium">Selected image:</div>
          <ul className="list-disc pl-4">
            {data.nodeData?.files?.map((file, i) => (
              <li key={i} className="truncate">
                {file.name}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <label className="block text-xs font-medium mb-1">Processing mode:</label>
            <select
              value={data.nodeData?.mode || 'text'}
              onChange={(e) => data.updateNodeData?.({ mode: e.target.value })}
              className="w-full text-xs p-1 border rounded"
            >
              <option value="text">Extract Text</option>
              <option value="analysis">Analyze Content</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-2">
        <button
          onClick={data.executeNode}
          disabled={data.isExecuting || !hasFiles}
          className={`px-3 py-1 rounded-md text-white text-xs ${
            hasFiles ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {data.isExecuting ? 'Processing...' : 'Process Image'}
        </button>
      </div>

      {data.executionResult?.error && (
        <div className="mt-2 text-xs text-red-500 p-1 bg-red-50 rounded">
          Error: {data.executionResult.error}
        </div>
      )}

      {data.executionResult?.text && (
        <div className="mt-2 text-xs">
          <div className="font-medium">Extracted text:</div>
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded h-16 overflow-auto">
            {data.executionResult.text.substring(0, 150)}
            {data.executionResult.text.length > 150 && '...'}
          </div>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="w-2 h-2 !bg-purple-500"
      />
    </div>
  )
}

export default ImageProcessingNode
